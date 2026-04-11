import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { source_slug, source_title, target_url, anchor_text } = await req.json();

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

    // Extract slug candidates
    const urlPath = (source_slug || "").replace(/^\//, '').replace(/\/$/, '');
    const slugLast = urlPath.split('/').pop();

    // Normalize for fuzzy matching
    const norm = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const titleNorm = norm(source_title);

    // Fetch all posts/pages from WP
    const fetchAll = async (endpoint) => {
      const res = await fetch(`${api}/${endpoint}?per_page=100&_fields=id,content,slug,link,title`, { headers });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    };

    const findInList = (items) => {
      if (!items.length) return null;
      // 1. Exact slug match
      const bySlug = items.find(i => i.slug === slugLast || i.slug === urlPath);
      if (bySlug) return bySlug;
      // 2. Title exact match
      if (titleNorm) {
        const byTitle = items.find(i => norm(i.title?.rendered) === titleNorm);
        if (byTitle) return byTitle;
        // 3. Title contains
        const byTitleContains = items.find(i => norm(i.title?.rendered).includes(titleNorm) || titleNorm.includes(norm(i.title?.rendered)));
        if (byTitleContains) return byTitleContains;
        // 4. First 5 chars
        const prefix = titleNorm.slice(0, 5);
        const byPrefix = items.find(i => norm(i.title?.rendered).startsWith(prefix));
        if (byPrefix) return byPrefix;
      }
      return null;
    };

    const [allPosts, allPages] = await Promise.all([fetchAll('posts'), fetchAll('pages')]);
    const found = findInList(allPosts) || findInList(allPages);

    if (!found) {
      return Response.json({
        success: false,
        error: `Nie znaleziono strony "${source_title || slugLast}" w WordPress. Sprawdź czy strona istnieje i jest opublikowana.`,
        manual: true
      });
    }

    const isPage = allPages.some(p => p.id === found.id);
    const postType = isPage ? 'pages' : 'posts';
    const rawContent = found.content?.rendered || '';
    const wpEditUrl = `${base}/wp-admin/post.php?post=${found.id}&action=edit`;

    // Build link HTML
    const linkHtml = `<a href="${target_url}">${anchor_text}</a>`;

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
    const newContent = rawContent.replace(regex, linkHtml);

    // Update post/page in WP
    const updateRes = await fetch(`${api}/${postType}/${found.id}`, {
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