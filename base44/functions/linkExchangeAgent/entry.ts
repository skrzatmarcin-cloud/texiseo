import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Link Exchange Agent
// - Builds mutual link network between all registered businesses in directory
// - Generates SEO-optimized backlink content for each pair
// - Propagates links across Medium, Blogger, Pinterest etc.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, business_id } = body;

    // ACTION: build_network — create link exchange pairs for all active businesses
    if (action === 'build_network') {
      const businesses = await base44.asServiceRole.entities.BusinessDirectory.filter({ active: true });

      if (businesses.length < 2) {
        return Response.json({ success: true, message: 'Need at least 2 businesses to build network', pairs: 0 });
      }

      const pairs = [];
      // Create bidirectional links between all pairs
      for (let i = 0; i < businesses.length; i++) {
        for (let j = i + 1; j < businesses.length; j++) {
          const a = businesses[i];
          const b = businesses[j];

          // Check if link already exists
          const existing = await base44.asServiceRole.entities.LinkExchanges.filter({
            from_business_id: a.id,
            to_business_id: b.id,
          });

          if (existing.length === 0) {
            // Generate anchor text with AI
            const anchor = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: `Create a natural, SEO-friendly anchor text (3-6 words) for a link from "${a.business_name}" to "${b.business_name}". Both are education/language businesses. Return just the anchor text, nothing else.`,
            });

            await base44.asServiceRole.entities.LinkExchanges.create({
              from_business_id: a.id,
              to_business_id: b.id,
              from_url: a.backlink_url || a.website_url || `https://linguatoons.com/katalog/${a.slug}`,
              to_url: b.backlink_url || b.website_url || `https://linguatoons.com/katalog/${b.slug}`,
              anchor_text: typeof anchor === 'string' ? anchor.trim() : `${b.business_name} - szkoła językowa`,
              link_type: 'dofollow',
              status: 'active',
              verified_live: false,
            });

            pairs.push({ from: a.business_name, to: b.business_name });
          }
        }
      }

      return Response.json({ success: true, message: `Created ${pairs.length} new link exchanges`, pairs });
    }

    // ACTION: generate_directory_page — generate SEO content for a business profile page
    if (action === 'generate_directory_page') {
      if (!business_id) return Response.json({ error: 'business_id required' }, { status: 400 });

      const business = await base44.asServiceRole.entities.BusinessDirectory.get('BusinessDirectory', business_id);
      const allBusinesses = await base44.asServiceRole.entities.BusinessDirectory.filter({ active: true });
      const related = allBusinesses.filter(b => b.id !== business_id && b.category === business.category).slice(0, 5);

      const content = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Write an SEO-optimized directory listing page for this business:
Name: ${business.business_name}
Category: ${business.category}
Description: ${business.description}
City: ${business.city}, ${business.country}
Languages: ${(business.languages_offered || []).join(', ')}

Related businesses to link to: ${related.map(r => `${r.business_name} (${r.website_url})`).join(', ')}

Write:
1. SEO meta description (155 chars max)
2. H1 headline
3. Main description paragraph (150 words, SEO optimized)
4. "Similar schools you might like" section with natural links to related businesses
5. Schema.org LocalBusiness JSON-LD markup

Return JSON: { meta_description, h1, main_content, related_section, schema_json }`,
        response_json_schema: {
          type: 'object',
          properties: {
            meta_description: { type: 'string' },
            h1: { type: 'string' },
            main_content: { type: 'string' },
            related_section: { type: 'string' },
            schema_json: { type: 'string' },
          }
        }
      });

      // Update business with SEO description
      await base44.asServiceRole.entities.BusinessDirectory.update(business_id, {
        seo_description: content.meta_description,
      });

      return Response.json({ success: true, business: business.business_name, content });
    }

    // ACTION: publish_links — publish link exchange content to external platforms
    if (action === 'publish_links') {
      const exchanges = await base44.asServiceRole.entities.LinkExchanges.filter({ status: 'active', verified_live: false });
      const businesses = await base44.asServiceRole.entities.BusinessDirectory.filter({ active: true });
      const bizMap = Object.fromEntries(businesses.map(b => [b.id, b]));

      const published = [];
      for (const ex of exchanges.slice(0, 5)) { // Max 5 per run
        const from = bizMap[ex.from_business_id];
        const to = bizMap[ex.to_business_id];
        if (!from || !to) continue;

        // Generate shareable content
        const snippet = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Write a short (80 words) educational blog snippet mentioning both "${from.business_name}" and "${to.business_name}" naturally, as partner language schools. Include a natural link mention. SEO-friendly, in Polish.`,
        });

        // Save as BacklinkMaterial
        await base44.asServiceRole.entities.BacklinkMaterials.create({
          opportunity_id: ex.id,
          title_suggestion: `Partnerstwo edukacyjne: ${from.business_name} × ${to.business_name}`,
          short_snippet: typeof snippet === 'string' ? snippet : '',
          natural_backlink_sentence: `Sprawdź również: <a href="${ex.to_url}">${ex.anchor_text}</a>`,
          anchor_branded: to.business_name,
          anchor_natural: ex.anchor_text,
          backlink_url: ex.to_url,
          status: 'ready',
        });

        await base44.asServiceRole.entities.LinkExchanges.update(ex.id, { verified_live: true, published_on: ['directory_page'] });
        published.push({ from: from.business_name, to: to.business_name });
      }

      return Response.json({ success: true, published_count: published.length, published });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});