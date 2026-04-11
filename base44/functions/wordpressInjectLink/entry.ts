import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { source_slug, target_url, anchor_text, context_note } = await req.json();

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

    // Find post by slug
    const slug = source_slug.replace(/^\//, '').replace(/\/$/, '').split('/').pop();
    const searchRes = await fetch(`${api}/posts?slug=${slug}&_fields=id,content,slug,link`, { headers });
    let posts = await searchRes.json();

    // Try pages if not found in posts
    if (!posts || posts.length === 0) {
      const pagesRes = await fetch(`${api}/pages?slug=${slug}&_fields=id,content,slug,link`, { headers });
      posts = await pagesRes.json();
    }

    if (!posts || posts.length === 0) {
      return Response.json({
        success: false,
        error: `Nie znaleziono posta ze slug "${slug}" w WordPress. Sprawdź czy strona źródłowa istnieje.`,
        manual: true
      });
    }

    const post = posts[0];
    const rawContent = post.content?.rendered || '';

    // Build the link HTML
    const linkHtml = `<a href="${target_url}">${anchor_text}</a>`;

    // Try to find anchor_text in content (case-insensitive)
    const regex = new RegExp(`(?<![<"'>])${anchor_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![^<]*>)`, 'i');
    
    if (!regex.test(rawContent)) {
      return Response.json({
        success: false,
        error: `Fraza "${anchor_text}" nie została znaleziona w treści posta "${slug}". Link musisz wstawić ręcznie.`,
        manual: true,
        wp_edit_url: `${base}/wp-admin/post.php?post=${post.id}&action=edit`
      });
    }

    // Check if already linked
    const alreadyLinked = new RegExp(`href=["']${target_url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`).test(rawContent);
    if (alreadyLinked) {
      return Response.json({ success: true, already_existed: true, message: 'Link już istnieje w treści.' });
    }

    // Replace first occurrence
    const newContent = rawContent.replace(regex, linkHtml);

    // Update post
    const updateRes = await fetch(`${api}/${searchRes.url.includes('/pages') ? 'pages' : 'posts'}/${post.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ content: newContent })
    });

    if (!updateRes.ok) {
      const err = await updateRes.text();
      return Response.json({ success: false, error: `Błąd aktualizacji WP: ${err}`, manual: true, wp_edit_url: `${base}/wp-admin/post.php?post=${post.id}&action=edit` });
    }

    return Response.json({ success: true, message: `Link "${anchor_text}" → ${target_url} został wstawiony w post "${slug}".`, wp_url: post.link });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});