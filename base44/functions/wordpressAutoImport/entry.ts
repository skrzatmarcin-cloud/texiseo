import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    // Fetch all posts and pages
    const fetchAll = async (endpoint) => {
      const res = await fetch(`${api}/${endpoint}?per_page=100&_fields=id,title,slug,link,status,type,modified_gmt`, { headers });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    };

    const [wpPosts, wpPages] = await Promise.all([fetchAll('posts'), fetchAll('pages')]);
    const allItems = [
      ...wpPosts.map(p => ({ ...p, _type: 'post' })),
      ...wpPages.map(p => ({ ...p, _type: 'page' })),
    ];

    // Get existing maps
    const existingMaps = await base44.asServiceRole.entities.WordPressContentMap.list();
    const existingByWpId = Object.fromEntries(existingMaps.map(m => [m.wordpress_post_id, m]));

    let created = 0;
    let updated = 0;

    for (const item of allItems) {
      const wpStatus = item.status === 'publish' ? 'publish' : item.status;
      const data = {
        base44_entity: 'Pages',
        base44_record_id: `wp_${item.id}`,
        base44_title: item.title?.rendered || item.slug,
        wordpress_post_id: item.id,
        wordpress_post_type: item._type === 'page' ? 'page' : 'post',
        wordpress_status: wpStatus,
        wordpress_permalink: item.link,
        wordpress_slug: item.slug,
        wordpress_modified_gmt: item.modified_gmt,
        wordpress_last_synced_at: new Date().toISOString(),
        sync_state: 'imported',
        language: 'pl',
      };

      if (existingByWpId[item.id]) {
        await base44.asServiceRole.entities.WordPressContentMap.update(existingByWpId[item.id].id, data);
        updated++;
      } else {
        await base44.asServiceRole.entities.WordPressContentMap.create(data);
        created++;
      }
    }

    return Response.json({
      success: true,
      message: `Import zakończony: ${created} nowych, ${updated} zaktualizowanych (łącznie ${allItems.length} stron/postów z WP).`,
      created,
      updated,
      total: allItems.length,
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});