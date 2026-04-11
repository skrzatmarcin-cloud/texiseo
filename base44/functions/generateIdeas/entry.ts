import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { language = 'en', count = 10, focus = '' } = await req.json();

  const clusters = await base44.entities.Clusters.list();
  const clusterNames = clusters.slice(0, 8).map(c => `"${c.name}" (id: ${c.id}, lang: ${c.language})`).join(', ');

  const prompt = `You are an expert SEO content strategist for Linguatoons — an online language school offering English, Spanish, French, and Polish lessons for children and adults.

Generate ${count} high-quality, strategic content ideas for language: ${language}${focus ? `, focus: ${focus}` : ''}.

Existing clusters available to assign: ${clusterNames}

For each idea provide a complete JSON object with these fields:
- title: compelling, non-generic title
- primary_keyword: specific target keyword (not too broad)
- secondary_keywords: array of 2-3 supporting keywords
- semantic_keywords: array of 3-4 semantic/LSI keywords
- content_type: one of [blog_post, service_support, comparison, faq_page, pillar_page, commercial_investigation, trust_building, parent_guide, conversion_assist]
- language: "${language}"
- audience: one of [children, adults, parents, all]
- search_intent: one of [informational, commercial, transactional, navigational]
- funnel_stage: one of [awareness, consideration, decision, retention]
- cluster_id: pick the most relevant cluster id from the list above, or null
- priority_score: 0-100 based on business value for Linguatoons
- conversion_score: 0-100
- topical_value_score: 0-100
- business_relevance_score: 0-100
- difficulty_score: 0-100 (how hard to rank)
- freshness_score: 0-100 (how time-sensitive)
- status: "idea"
- notes: 1-sentence strategic rationale

Rules:
- No generic filler ideas
- Every idea must directly support Linguatoons' business goals
- Mix of awareness, consideration, and decision content
- Include trust-building and comparison content
- No duplicates with existing well-known language school content

Return ONLY a JSON object: { "ideas": [...] }`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        ideas: {
          type: 'array',
          items: { type: 'object', additionalProperties: true }
        }
      }
    }
  });

  const ideas = result?.ideas || [];
  const created = [];
  for (const idea of ideas) {
    const record = await base44.asServiceRole.entities.ContentIdeas.create(idea);
    created.push(record);
  }

  return Response.json({ success: true, created: created.length, ideas: created });
});