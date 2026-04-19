import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function getSettings(base44) {
  const settings = await base44.asServiceRole.entities.WordPressSettings.list();
  return settings[0] || null;
}

async function wpFetch(settings, path, options = {}) {
  const creds = btoa(`${settings.username}:${settings.app_password}`);
  const base = (settings.api_base || '/wp-json/wp/v2').replace(/\/$/, '');
  const url = `${settings.site_url.replace(/\/$/, '')}${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function logAction(base44, action_type, result, extra = {}) {
  await base44.asServiceRole.entities.WordPressSyncLog.create({
    action_type, result, ...extra,
    triggered_by: extra.triggered_by || 'system',
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { action } = body;

  // TEST CONNECTION
  if (action === 'test_connection') {
    const settings = body.settings || await getSettings(base44);
    if (!settings?.site_url) return Response.json({ error: 'No settings found' }, { status: 400 });

    const checks = { site_reachable: false, api_reachable: false, auth_valid: false, can_read: false, can_write: false };
    let errorMsg = null;

    try {
      // Check site reachable
      const siteRes = await fetch(settings.site_url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
      checks.site_reachable = !!(siteRes && (siteRes.ok || siteRes.status < 500));

      if (!checks.site_reachable) {
        const allGood = false;
        const existingSettings = await getSettings(base44);
        if (existingSettings?.id) {
          await base44.asServiceRole.entities.WordPressSettings.update(existingSettings.id, {
            connection_status: 'failed', last_tested_at: new Date().toISOString(),
          });
        }
        await logAction(base44, 'connection_test', 'failed', { item_name: settings.site_url, triggered_by: user.email, error_message: 'Site not reachable', details: JSON.stringify(checks) });
        return Response.json({ success: false, status: 'failed', checks, error_detail: 'Strona WordPress nie jest osiągalna. Sprawdź URL lub czy serwer działa.' });
      }

      // Check API reachable
      const apiRes = await wpFetch(settings, '/', { method: 'GET' });
      checks.api_reachable = apiRes.ok || apiRes.status === 401; // 401 means API exists but needs auth

      // Check auth by trying to read posts
      const postsRes = await wpFetch(settings, '/posts?per_page=1');
      checks.auth_valid = postsRes.ok || postsRes.status === 401;
      checks.can_read = postsRes.ok;

      // Check write by getting posts with edit context
      if (checks.can_read) {
        const writeRes = await wpFetch(settings, '/posts?context=edit&per_page=1');
        checks.can_write = writeRes.ok;
      }

      const allGood = Object.values(checks).every(Boolean);
      const status = allGood ? 'connected' : checks.auth_valid ? 'partial' : 'failed';

      // Update stored status
      const existingSettings = await getSettings(base44);
      if (existingSettings?.id) {
        await base44.asServiceRole.entities.WordPressSettings.update(existingSettings.id, {
          connection_status: allGood ? 'connected' : 'failed',
          last_tested_at: new Date().toISOString(),
        });
      }

      await logAction(base44, 'connection_test', allGood ? 'success' : 'failed', {
        item_name: settings.site_url, triggered_by: user.email,
        error_message: allGood ? null : 'One or more checks failed',
        details: JSON.stringify(checks),
      });

      return Response.json({ success: true, status, checks });
    } catch (err) {
      await logAction(base44, 'connection_test', 'failed', { item_name: settings.site_url, error_message: err.message, triggered_by: user.email });
      return Response.json({ success: false, status: 'failed', error: err.message, checks, error_detail: `Błąd połączenia: ${err.message}` });
    }
  }

  // IMPORT POSTS / PAGES
  if (action === 'import_posts' || action === 'import_pages') {
    const settings = await getSettings(base44);
    if (!settings) return Response.json({ error: 'No WordPress settings found' }, { status: 400 });
    const endpoint = action === 'import_posts' ? '/posts' : '/pages';
    const logAction_type = action === 'import_posts' ? 'import_posts' : 'import_pages';

    const { per_page = 20, page = 1, status = 'any' } = body;
    const res = await wpFetch(settings, `${endpoint}?per_page=${per_page}&page=${page}&status=${status}&context=edit`);

    if (!res.ok) {
      await logAction(base44, logAction_type, 'failed', { error_message: `HTTP ${res.status}`, triggered_by: user.email });
      return Response.json({ success: false, error: `WP API error: ${res.status}` });
    }

    const items = Array.isArray(res.data) ? res.data : [];
    const imported = [];

    for (const item of items) {
      // Check if already mapped
      const existing = await base44.asServiceRole.entities.WordPressContentMap.filter({ wordpress_post_id: item.id });
      if (existing.length > 0) {
        // Update sync state
        const modified = new Date(item.modified_gmt);
        const lastSync = existing[0].wordpress_last_synced_at ? new Date(existing[0].wordpress_last_synced_at) : null;
        const state = lastSync && modified > lastSync ? 'changed_in_wordpress' : 'synced';
        await base44.asServiceRole.entities.WordPressContentMap.update(existing[0].id, {
          wordpress_modified_gmt: item.modified_gmt,
          wordpress_status: item.status,
          sync_state: state,
        });
        imported.push({ id: item.id, title: item.title?.rendered, action: 'updated' });
        continue;
      }

      // Create new map entry
      await base44.asServiceRole.entities.WordPressContentMap.create({
        base44_entity: 'Pages',
        base44_record_id: '',
        base44_title: item.title?.rendered || 'Untitled',
        base44_content_type: action === 'import_posts' ? 'blog_post' : 'service_support',
        wordpress_post_id: item.id,
        wordpress_post_type: action === 'import_posts' ? 'post' : 'page',
        wordpress_status: item.status,
        wordpress_permalink: item.link,
        wordpress_slug: item.slug,
        wordpress_modified_gmt: item.modified_gmt,
        wordpress_last_synced_at: new Date().toISOString(),
        wordpress_author_id: item.author,
        wordpress_category_ids: item.categories || [],
        wordpress_tag_ids: item.tags || [],
        wordpress_featured_media_id: item.featured_media || null,
        sync_state: 'imported',
      });
      imported.push({ id: item.id, title: item.title?.rendered, action: 'imported' });
    }

    await logAction(base44, logAction_type, 'success', {
      item_name: `${imported.length} items`, triggered_by: user.email,
      details: JSON.stringify({ count: imported.length }),
    });

    return Response.json({ success: true, imported: imported.length, items: imported });
  }

  // PUSH DRAFT TO WORDPRESS
  if (action === 'push_draft' || action === 'update_draft') {
    const settings = await getSettings(base44);
    if (!settings) return Response.json({ error: 'No WordPress settings configured' }, { status: 400 });

    const { payload, map_id, wp_post_id, post_type = 'post' } = body;
    if (!payload) return Response.json({ error: 'No payload provided' }, { status: 400 });

    const wpPayload = {
      title: payload.title,
      slug: payload.slug,
      excerpt: payload.excerpt || '',
      status: payload.status || 'draft',
      content: payload.content || '',
      categories: payload.category_ids || [],
      tags: payload.tag_ids || [],
    };

    const endpoint = post_type === 'page' ? '/pages' : '/posts';
    let res, logType;

    if (action === 'update_draft' && wp_post_id) {
      res = await wpFetch(settings, `${endpoint}/${wp_post_id}`, { method: 'POST', body: JSON.stringify(wpPayload) });
      logType = post_type === 'page' ? 'update_page' : 'update_draft';
    } else {
      res = await wpFetch(settings, endpoint, { method: 'POST', body: JSON.stringify(wpPayload) });
      logType = 'create_draft';
    }

    if (!res.ok) {
      await logAction(base44, logType, 'failed', {
        item_name: payload.title, error_message: JSON.stringify(res.data), triggered_by: user.email,
      });
      return Response.json({ success: false, error: res.data?.message || `HTTP ${res.status}` });
    }

    const wpItem = res.data;

    // Update map record
    if (map_id) {
      await base44.asServiceRole.entities.WordPressContentMap.update(map_id, {
        wordpress_post_id: wpItem.id,
        wordpress_status: wpItem.status,
        wordpress_permalink: wpItem.link,
        wordpress_slug: wpItem.slug,
        last_push_at: new Date().toISOString(),
        last_push_result: 'success',
        sync_state: 'synced',
        wordpress_last_synced_at: new Date().toISOString(),
      });
    }

    await logAction(base44, logType, 'success', {
      item_name: payload.title, wordpress_id: wpItem.id, triggered_by: user.email,
      details: JSON.stringify({ link: wpItem.link, status: wpItem.status }),
    });

    return Response.json({ success: true, wordpress_id: wpItem.id, wordpress_link: wpItem.link, status: wpItem.status });
  }

  // GET STATS for health dashboard
  if (action === 'get_stats') {
    const [maps, logs] = await Promise.all([
      base44.asServiceRole.entities.WordPressContentMap.list(),
      base44.asServiceRole.entities.WordPressSyncLog.list('-created_date', 50),
    ]);
    const settings = await getSettings(base44);

    return Response.json({
      success: true,
      total_mapped: maps.length,
      imported_posts: maps.filter(m => m.wordpress_post_type === 'post').length,
      imported_pages: maps.filter(m => m.wordpress_post_type === 'page').length,
      synced: maps.filter(m => m.sync_state === 'synced').length,
      conflicts: maps.filter(m => m.sync_state === 'conflict').length,
      failed: maps.filter(m => m.sync_state === 'failed').length,
      changed_in_wp: maps.filter(m => m.sync_state === 'changed_in_wordpress').length,
      connection_status: settings?.connection_status || 'untested',
      last_successful_sync: settings?.last_successful_sync || null,
      last_tested: settings?.last_tested_at || null,
      recent_logs: logs.slice(0, 10),
    });
  }

  return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
});