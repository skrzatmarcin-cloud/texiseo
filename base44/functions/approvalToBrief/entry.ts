import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const body = await req.json();

  // Called from entity automation OR directly with { idea_id }
  const ideaId = body?.idea_id || body?.data?.id || body?.event?.entity_id;
  if (!ideaId) return Response.json({ error: 'No idea_id provided' }, { status: 400 });

  const [idea] = await base44.asServiceRole.entities.ContentIdeas.filter({ id: ideaId });
  if (!idea) return Response.json({ error: 'Idea not found' }, { status: 404 });
  if (idea.status !== 'approved') return Response.json({ skipped: true, reason: 'Idea not approved' });

  // Check if brief already exists
  const existingBriefs = await base44.asServiceRole.entities.Briefs.filter({ content_idea_id: ideaId });
  if (existingBriefs.length > 0) return Response.json({ skipped: true, reason: 'Brief already exists', brief_id: existingBriefs[0].id });

  const PAGE_TYPE_MAP = {
    blog_post: 'informational_blog', service_support: 'service_support',
    comparison: 'comparison_page', faq_page: 'faq_page',
    pillar_page: 'pillar_page', commercial_investigation: 'commercial_investigation',
    trust_building: 'informational_blog', parent_guide: 'informational_blog',
    conversion_assist: 'landing_page'
  };

  const WORD_COUNT_MAP = {
    pillar_page: 3000, comparison_page: 1800, faq_page: 1200,
    commercial_investigation: 1600, landing_page: 1000,
    service_support: 1400, informational_blog: 1500
  };

  const pageType = PAGE_TYPE_MAP[idea.content_type] || 'informational_blog';
  const wordCount = WORD_COUNT_MAP[pageType] || 1400;

  const prompt = `You are an expert SEO content strategist for Linguatoons — an online language school.

Generate a complete, writer-ready SEO content brief for this approved content idea:

Title: ${idea.title}
Primary keyword: ${idea.primary_keyword}
Secondary keywords: ${(idea.secondary_keywords || []).join(', ')}
Semantic keywords: ${(idea.semantic_keywords || []).join(', ')}
Content type: ${idea.content_type}
Language: ${idea.language}
Audience: ${idea.audience}
Search intent: ${idea.search_intent}
Funnel stage: ${idea.funnel_stage}
Notes: ${idea.notes || ''}

Generate a comprehensive brief. Return ONLY a JSON object with these fields:
- h1: compelling recommended H1 (include primary keyword naturally)
- meta_title: under 60 chars, compelling
- meta_description: under 160 chars, action-oriented
- slug: SEO-friendly URL slug (start with /)
- search_intent_summary: 2-sentence summary of what this reader needs
- audience_summary: who this is for (2 sentences)
- business_goal: what Linguatoons gains from this piece
- cta_goal: what action the reader should take
- schema_type: most appropriate schema type(s)
- tone_notes: tone and voice guidance for writer (3-4 sentences)
- eeat_notes: E-E-A-T signals to include (3-4 sentences)
- objection_handling: key objections to address (list as text)
- trust_blocks: trust-building elements to include (list as text)
- who_for: who this piece is for (2 sentences)
- who_not_for: who this is not for (1-2 sentences)
- mistakes_to_avoid: common mistakes to avoid (list as text)
- mid_cta: suggested mid-content CTA
- bottom_cta: bottom CTA suggestion
- editor_notes: notes for editor/reviewer
- qa_notes: QA checklist items (list as text)
- h2_structure_json: JSON string of array of {h2, purpose, h3s:[]} objects (6-10 sections)
- faq_json: JSON string of array of {q, a} objects (4-6 questions)
- internal_links_json: JSON string of array of {page, reason} objects (3-4 links)
- anchor_suggestions_json: JSON string of array of anchor text strings (4-5 anchors)
- comparison_blocks: comparison block suggestions if relevant (or empty string)
- completeness_score: 85`;

  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: 'object',
      properties: {
        h1: { type: 'string' }, meta_title: { type: 'string' }, meta_description: { type: 'string' },
        slug: { type: 'string' }, search_intent_summary: { type: 'string' }, audience_summary: { type: 'string' },
        business_goal: { type: 'string' }, cta_goal: { type: 'string' }, schema_type: { type: 'string' },
        tone_notes: { type: 'string' }, eeat_notes: { type: 'string' }, objection_handling: { type: 'string' },
        trust_blocks: { type: 'string' }, who_for: { type: 'string' }, who_not_for: { type: 'string' },
        mistakes_to_avoid: { type: 'string' }, mid_cta: { type: 'string' }, bottom_cta: { type: 'string' },
        editor_notes: { type: 'string' }, qa_notes: { type: 'string' },
        h2_structure_json: { type: 'string' }, faq_json: { type: 'string' },
        internal_links_json: { type: 'string' }, anchor_suggestions_json: { type: 'string' },
        comparison_blocks: { type: 'string' }, completeness_score: { type: 'number' }
      }
    }
  });

  const brief = await base44.asServiceRole.entities.Briefs.create({
    content_idea_id: ideaId,
    brief_title: idea.title,
    page_type: pageType,
    language: idea.language,
    audience: idea.audience,
    cluster_id: idea.cluster_id || null,
    status: 'draft',
    target_word_count: wordCount,
    primary_keyword: idea.primary_keyword,
    secondary_keywords: idea.secondary_keywords || [],
    semantic_keywords: idea.semantic_keywords || [],
    funnel_stage: idea.funnel_stage,
    ...result
  });

  // Place in Publishing Queue
  await base44.asServiceRole.entities.PublishingQueue.create({
    content_idea_id: ideaId,
    brief_id: brief.id,
    title: idea.title,
    language: idea.language,
    audience: idea.audience,
    page_type: pageType,
    cluster_id: idea.cluster_id || null,
    current_status: 'brief_ready',
    priority: idea.priority_score >= 80 ? 'high' : idea.priority_score >= 60 ? 'medium' : 'low',
    word_count_target: wordCount,
  });

  return Response.json({ success: true, brief_id: brief.id });
});