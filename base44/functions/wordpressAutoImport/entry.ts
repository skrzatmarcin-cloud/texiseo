import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const settings = await base44.asServiceRole.entities.WordPressSettings.list();
    const wp = settings[0];
    if (!wp || !wp.site_url || !wp.username || !wp.app_password) {
      return Response.json({ success: false, error: 'WordPress nie jest skonfigurowany.' });
    }

    const base = wp.site_url.replace(/\/$/, '');
    const api = `${base}${wp.api_base || '/wp-json/wp/v2'}`;
    const auth = btoa(`${wp.username}:${wp.app_password}`);
    const headers = { 'Authorization': `Basic ${auth}` };

    // Fetch all posts and pages (up to 100 each)
    const fetchAll = async (endpoint) => {
      const res = await fetch(`${api}/${endpoint}?per_page=100&status=publish,draft&_fields=id,title,slug,link,status,type,modified_gmt,excerpt,categories,tags,date`, { headers });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    };

    const [wpPosts, wpPages] = await Promise.all([fetchAll('posts'), fetchAll('pages')]);
    const allItems = [
      ...wpPosts.map(p => ({ ...p, _type: 'post' })),
      ...wpPages.map(p => ({ ...p, _type: 'page' })),
    ];

    // Get existing ContentMap and Pages
    const [existingMaps, existingPages] = await Promise.all([
      base44.asServiceRole.entities.WordPressContentMap.list(),
      base44.asServiceRole.entities.Pages.list(),
    ]);

    const existingByWpId = Object.fromEntries(existingMaps.map(m => [String(m.wordpress_post_id), m]));
    const existingPagesBySlug = Object.fromEntries(existingPages.map(p => [p.slug || p.url, p]));

    let created = 0, updated = 0, pagesCreated = 0, pagesUpdated = 0;

    for (const item of allItems) {
      const wpStatus = item.status === 'publish' ? 'publish' : item.status;
      const title = item.title?.rendered || item.slug || 'Untitled';
      const slug = item.slug || '';
      const url = `/${slug}`;
      const permalink = item.link || `${base}/${slug}`;
      const pageType = item._type === 'page' ? 'service' : 'blog';

      // 1. Sync WordPressContentMap
      const mapData = {
        base44_entity: 'Pages',
        base44_record_id: `wp_${item.id}`,
        base44_title: title,
        wordpress_post_id: item.id,
        wordpress_post_type: item._type === 'page' ? 'page' : 'post',
        wordpress_status: wpStatus,
        wordpress_permalink: permalink,
        wordpress_slug: slug,
        wordpress_modified_gmt: item.modified_gmt,
        wordpress_last_synced_at: new Date().toISOString(),
        sync_state: 'imported',
        language: 'pl',
      };

      if (existingByWpId[String(item.id)]) {
        await base44.asServiceRole.entities.WordPressContentMap.update(existingByWpId[String(item.id)].id, mapData);
        updated++;
      } else {
        await base44.asServiceRole.entities.WordPressContentMap.create(mapData);
        created++;
      }

      // 2. Sync Pages entity (so all sections show real data)
      const pageData = {
        title,
        url: permalink,
        slug,
        page_type: pageType,
        language: 'pl',
        status: wpStatus === 'publish' ? 'live' : 'draft',
        notes: `WP ID: ${item.id} | Slug: ${slug}`,
      };

      const existingPage = existingPagesBySlug[slug] || existingPagesBySlug[permalink];
      if (existingPage) {
        await base44.asServiceRole.entities.Pages.update(existingPage.id, pageData);
        pagesUpdated++;
      } else {
        await base44.asServiceRole.entities.Pages.create(pageData);
        pagesCreated++;
      }
    }

    // Log
    await base44.asServiceRole.entities.WordPressSyncLog.create({
      action_type: 'bulk_sync',
      result: 'success',
      item_name: `Auto-import: ${allItems.length} items`,
      triggered_by: 'system',
      details: JSON.stringify({ created, updated, pagesCreated, pagesUpdated, total: allItems.length }),
    });

    return Response.json({
      success: true,
      message: `Import zakończony: ${created + updated} WP map, ${pagesCreated} nowych stron, ${pagesUpdated} zaktualizowanych stron.`,
      contentMap: { created, updated },
      pages: { created: pagesCreated, updated: pagesUpdated },
      total: allItems.length,
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});