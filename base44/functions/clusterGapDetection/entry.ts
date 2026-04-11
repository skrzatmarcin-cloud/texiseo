import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { cluster_id } = await req.json();
  if (!cluster_id) return Response.json({ error: 'cluster_id required' }, { status: 400 });

  const [cluster] = await base44.asServiceRole.entities.Clusters.filter({ id: cluster_id });
  if (!cluster) return Response.json({ error: 'Cluster not found' }, { status: 404 });

  const [pages, ideas] = await Promise.all([
    base44.asServiceRole.entities.Pages.filter({ cluster_id }),
    base44.asServiceRole.entities.ContentIdeas.filter({ cluster_id }),
  ]);

  const hasPillar = pages.some(p => p.page_type === 'pillar' || p.page_type === 'blog') ||
    ideas.some(i => i.content_type === 'pillar_page');
  const hasComparison = ideas.some(i => i.content_type === 'comparison') || pages.some(p => p.page_type === 'landing');
  const hasFAQ = ideas.some(i => i.content_type === 'faq_page') || pages.some(p => p.faq_present);
  const hasTrust = ideas.some(i => i.content_type === 'trust_building');
  const supportCount = pages.filter(p => ['support', 'blog'].includes(p.page_type)).length + ideas.filter(i => ['blog_post', 'service_support'].includes(i.content_type)).length;

  const gaps = [];
  if (!hasPillar) gaps.push({ type: 'missing_pillar', priority: 'critical', message: 'No pillar page found for this cluster. Topical authority will be weak without a comprehensive pillar.', action: 'Create a pillar page targeting the cluster\'s primary keyword' });
  if (!hasComparison) gaps.push({ type: 'missing_comparison', priority: 'high', message: 'No comparison content in this cluster. Commercial-intent users have no decision-stage content to find.', action: 'Add a comparison page (e.g., private vs group, online vs in-person)' });
  if (!hasFAQ) gaps.push({ type: 'missing_faq', priority: 'high', message: 'No FAQ page assigned to this cluster. Rich snippet and PAA opportunities are being missed.', action: 'Create an FAQ page for this cluster\'s most-searched questions' });
  if (!hasTrust) gaps.push({ type: 'missing_trust', priority: 'medium', message: 'No trust-building content in this cluster. Hesitant buyers have no content to build confidence.', action: 'Add a trust article (e.g., teacher credentials, methodology, results)' });
  if (supportCount < 3) gaps.push({ type: 'low_support_count', priority: 'medium', message: `Only ${supportCount} support articles in this cluster. Topical depth is insufficient for strong cluster authority.`, action: 'Add 2-3 more support articles targeting long-tail keywords within this cluster' });

  const completeness = Math.round(((hasPillar ? 25 : 0) + (hasComparison ? 15 : 0) + (hasFAQ ? 20 : 0) + (hasTrust ? 15 : 0) + Math.min(supportCount * 5, 25)) );

  await base44.asServiceRole.entities.Clusters.update(cluster_id, {
    completeness_score: completeness,
    missing_topics: gaps.map(g => g.action),
    support_content_count: supportCount
  });

  return Response.json({ success: true, cluster_id, completeness, gaps, pages_count: pages.length, ideas_count: ideas.length });
});