import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { source_page_id, source_slug, source_title, target_url, anchor_text } = await req.json();

    // Get WP settings
    const settings = await base44.asServiceRole.entities.WordPressSettings.list();
    const wp = settings[0];
    if (!wp || !wp.site_url || !wp.username || !wp.app_password) {
      return Response.json({ success: false, error: 'WordPress nie jest skonfigurowany. Przejdź do Integracje → WordPress i zapisz dane dostępu.' });
    }

    const base = wp.site_url.replace(/\/$/, '');
    const api = `${base}${wp.api_base || '/wp-json/wp/v2'}`;
    const auth = btoa(`${wp.username}:${wp.app_password}`);
    const headers = { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' };

    // --- Step 1: Try to find WP post ID via WordPressContentMap ---
    let wpPostId = null;
    let wpPostType = null;
    if (source_page_id) {
      const maps = await base44.asServiceRole.entities.WordPressContentMap.filter({ base44_record_id: source_page_id });
      const map = maps.find(m => m.wordpress_post_id);
      if (map) {
        wpPostId = map.wordpress_post_id;
        wpPostType = map.wordpress_post_type === 'page' ? 'pages' : 'posts';
      }
    }

    // --- Step 2: If no map, fetch all WP posts/pages and fuzzy match ---
    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const urlPath = (source_slug || '').replace(/^\//, '').replace(/\/$/, '');
    const slugLast = urlPath.split('/').pop();
    const titleNorm = norm(source_title);

    let found = null;
    let allPosts = [];
    let allPages = [];

    if (!wpPostId) {
      const fetchAll = async (endpoint) => {
        const res = await fetch(`${api}/${endpoint}?per_page=100&_fields=id,content,slug,link,title`, { headers });
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      };

      [allPosts, allPages] = await Promise.all([fetchAll('posts'), fetchAll('pages')]);

      const findInList = (items) => {
        if (!items.length) return null;
        // 1. Exact slug
        const bySlug = items.find(i => i.slug === slugLast || i.slug === urlPath);
        if (bySlug) return bySlug;
        // 2. Slug contains (handles partial paths)
        const bySlugContains = items.find(i => slugLast && i.slug.includes(slugLast));
        if (bySlugContains) return bySlugContains;
        // 3. Exact title
        if (titleNorm) {
          const byTitle = items.find(i => norm(i.title?.rendered) === titleNorm);
          if (byTitle) return byTitle;
          // 4. Title cross-contains
          const byContains = items.find(i => {
            const t = norm(i.title?.rendered);
            return t.includes(titleNorm) || titleNorm.includes(t);
          });
          if (byContains) return byContains;
          // 5. First 5-char prefix match
          const prefix = titleNorm.replace(/\s/g, '').slice(0, 5);
          if (prefix.length >= 3) {
            const byPrefix = items.find(i => norm(i.title?.rendered).startsWith(prefix));
            if (byPrefix) return byPrefix;
          }
        }
        return null;
      };

      found = findInList(allPosts) || findInList(allPages);

      if (!found) {
        return Response.json({
          success: false,
          error: `Nie znaleziono strony "${source_title || slugLast}" w WordPress. Upewnij się, że strona jest zsynchronizowana (WordPress → Import) lub dodaj ją ręcznie do Pages.`,
          manual: true
        });
      }

      wpPostType = allPages.some(p => p.id === found.id) ? 'pages' : 'posts';
      wpPostId = found.id;
    }

    // --- Step 3: Fetch actual content if we matched via map (didn't load it yet) ---
    if (!found) {
      const res = await fetch(`${api}/${wpPostType}/${wpPostId}?_fields=id,content,slug,link,title`, { headers });
      found = await res.json();
    }

    const rawContent = found.content?.rendered || '';
    const wpEditUrl = `${base}/wp-admin/post.php?post=${wpPostId}&action=edit`;

    // Check if already linked
    const alreadyLinked = rawContent.includes(`href="${target_url}"`) || rawContent.includes(`href='${target_url}'`);
    if (alreadyLinked) {
      return Response.json({ success: true, already_existed: true, message: 'Link już istnieje w treści.' });
    }

    // Find anchor text in content
    const escapedAnchor = anchor_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![<"'>])${escapedAnchor}(?![^<]*>)`, 'i');

    if (!regex.test(rawContent)) {
      return Response.json({
        success: false,
        error: `Fraza "${anchor_text}" nie została znaleziona w treści strony "${found.title?.rendered || found.slug}". Wstaw link ręcznie.`,
        manual: true,
        wp_edit_url: wpEditUrl
      });
    }

    // Replace first occurrence
    const linkHtml = `<a href="${target_url}">${anchor_text}</a>`;
    const newContent = rawContent.replace(regex, linkHtml);

    const updateRes = await fetch(`${api}/${wpPostType}/${wpPostId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ content: newContent })
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      return Response.json({ success: false, error: `Błąd aktualizacji WP: ${err}`, manual: true, wp_edit_url: wpEditUrl });
    }

    return Response.json({
      success: true,
      message: `Link "${anchor_text}" → ${target_url} wstawiony w "${found.title?.rendered || found.slug}".`,
      wp_url: found.link
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});