import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// AI Backlink Agent - finds opportunities and generates SEO content with linguatoons.com links

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, language = 'pl', count = 5, topic, target_url = 'https://linguatoons.com' } = body;

    // ACTION: find_opportunities — AI generates backlink opportunity ideas
    if (action === 'find_opportunities') {
      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `You are an SEO backlink strategist for Linguatoons (${target_url}), an online language school for children and adults.

Find ${count} specific backlink opportunities for the language: ${language}.
Topic focus: ${topic || 'online language learning for children'}

For each opportunity, provide:
1. A specific website/platform type (e.g., "Polish parenting blog", "English learning forum", "Education subreddit r/languagelearning")
2. A realistic platform URL pattern
3. A content angle that would naturally include a link to ${target_url}
4. Platform type (reddit, quora, forum, blog_comment, directory, guest_post)
5. Safety score (1-100, how natural/safe for SEO)
6. A full ready-to-use text snippet (150-300 words) with a natural link to ${target_url}
7. Anchor text suggestion

Return JSON array "opportunities" with fields: title, platform, platform_type, platform_url, topic, safety_score, content_snippet, anchor_text, language, notes`,
        response_json_schema: {
          type: 'object',
          properties: {
            opportunities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  platform: { type: 'string' },
                  platform_type: { type: 'string' },
                  platform_url: { type: 'string' },
                  topic: { type: 'string' },
                  safety_score: { type: 'number' },
                  content_snippet: { type: 'string' },
                  anchor_text: { type: 'string' },
                  language: { type: 'string' },
                  notes: { type: 'string' },
                }
              }
            }
          }
        }
      });

      // Save opportunities to database
      const saved = [];
      for (const opp of (result.opportunities || [])) {
        const record = await base44.asServiceRole.entities.BacklinkOpportunities.create({
          title: opp.title,
          platform: opp.platform,
          platform_type: opp.platform_type || 'forum',
          platform_url: opp.platform_url,
          topic: opp.topic,
          target_url,
          safety_score: opp.safety_score || 70,
          execution_mode: 'manual',
          language: opp.language || language,
          status: 'generated',
          notes: opp.notes,
        });

        // Save generated content as BacklinkMaterial
        await base44.asServiceRole.entities.BacklinkMaterials.create({
          opportunity_id: record.id,
          title_suggestion: opp.title,
          natural_backlink_sentence: opp.content_snippet,
          anchor_branded: 'Linguatoons',
          anchor_natural: opp.anchor_text,
          anchor_soft_keyword: opp.anchor_text,
          cta: `Sprawdź ${target_url}`,
          backlink_url: target_url,
          status: 'ready',
        });

        saved.push({ id: record.id, title: opp.title, platform: opp.platform });
      }

      return Response.json({ success: true, count: saved.length, opportunities: saved });
    }

    // ACTION: generate_content — generate content for existing opportunity
    if (action === 'generate_content') {
      const { opportunity_id } = body;
      if (!opportunity_id) return Response.json({ error: 'opportunity_id required' }, { status: 400 });

      const opps = await base44.asServiceRole.entities.BacklinkOpportunities.filter({ id: opportunity_id });
      const opp = opps[0];
      if (!opp) return Response.json({ error: 'Opportunity not found' }, { status: 404 });

      const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `Write backlink content for this opportunity:
Platform: ${opp.platform} (${opp.platform_type})
Topic: ${opp.topic}
Target URL: ${target_url}
Language: ${opp.language || 'pl'}

Generate:
1. A full article/post (400-600 words) naturally linking to ${target_url} with anchor text about language learning
2. A short snippet (2-3 sentences) for forums/comments
3. A Pinterest description (150 chars max)
4. 3 anchor text variations

Make it valuable, educational, not spammy. The link must feel natural.

Return JSON: { medium_article, short_snippet, pinterest_description, anchor_branded, anchor_natural, anchor_soft_keyword }`,
        response_json_schema: {
          type: 'object',
          properties: {
            medium_article: { type: 'string' },
            short_snippet: { type: 'string' },
            pinterest_description: { type: 'string' },
            anchor_branded: { type: 'string' },
            anchor_natural: { type: 'string' },
            anchor_soft_keyword: { type: 'string' },
          }
        }
      });

      // Update or create material
      const existing = await base44.asServiceRole.entities.BacklinkMaterials.filter({ opportunity_id });
      const matData = {
        opportunity_id,
        medium_article: result.medium_article,
        short_snippet: result.short_snippet,
        pinterest_description: result.pinterest_description,
        anchor_branded: result.anchor_branded || 'Linguatoons',
        anchor_natural: result.anchor_natural,
        anchor_soft_keyword: result.anchor_soft_keyword,
        backlink_url: target_url,
        status: 'ready',
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.BacklinkMaterials.update(existing[0].id, matData);
      } else {
        await base44.asServiceRole.entities.BacklinkMaterials.create(matData);
      }

      await base44.asServiceRole.entities.BacklinkOpportunities.update(opportunity_id, { status: 'ready_for_review' });

      return Response.json({ success: true, material: result });
    }

    // ACTION: daily_scan — automated daily run (called by scheduler)
    if (action === 'daily_scan') {
      // Generate 3 opportunities per language
      const languages = ['pl', 'en'];
      let total = 0;
      for (const lang of languages) {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: 'gemini_3_flash',
          prompt: `Generate 3 backlink opportunity ideas for Linguatoons (${target_url}), online language school. Language focus: ${lang}. 
          Return JSON: { opportunities: [{ title, platform, platform_type, platform_url, topic, safety_score, content_snippet, anchor_text, language, notes }] }`,
          response_json_schema: {
            type: 'object',
            properties: {
              opportunities: {
                type: 'array',
                items: { type: 'object', properties: {
                  title: { type: 'string' }, platform: { type: 'string' },
                  platform_type: { type: 'string' }, platform_url: { type: 'string' },
                  topic: { type: 'string' }, safety_score: { type: 'number' },
                  content_snippet: { type: 'string' }, anchor_text: { type: 'string' },
                  language: { type: 'string' }, notes: { type: 'string' },
                }}
              }
            }
          }
        });

        for (const opp of (result.opportunities || [])) {
          const record = await base44.asServiceRole.entities.BacklinkOpportunities.create({
            title: opp.title, platform: opp.platform,
            platform_type: opp.platform_type || 'forum',
            platform_url: opp.platform_url, topic: opp.topic,
            target_url, safety_score: opp.safety_score || 70,
            execution_mode: 'manual', language: opp.language || lang,
            status: 'generated', notes: opp.notes,
          });
          await base44.asServiceRole.entities.BacklinkMaterials.create({
            opportunity_id: record.id, natural_backlink_sentence: opp.content_snippet,
            anchor_natural: opp.anchor_text, anchor_branded: 'Linguatoons',
            backlink_url: target_url, status: 'ready',
          });
          total++;
        }
      }

      return Response.json({ success: true, message: `Daily scan: wygenerowano ${total} nowych okazji backlink`, total });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});