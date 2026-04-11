import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { page_id } = await req.json();
  if (!page_id) return Response.json({ error: 'page_id required' }, { status: 400 });

  const [page] = await base44.asServiceRole.entities.Pages.filter({ id: page_id });
  if (!page) return Response.json({ error: 'Page not found' }, { status: 404 });

  // Clear old pending refresh tasks for this page
  const existing = await base44.asServiceRole.entities.RefreshTasks.filter({ page_id, status: 'pending' });

  const issues = [];

  if ((page.trust_score || 0) < 60) {
    issues.push({
      page_id, task_type: 'add_trust_section', priority: 'high', status: 'pending',
      reason: `Trust score is ${page.trust_score || 0}/100 — below the threshold for a converting service page.`,
      recommendation: 'Add teacher credentials, testimonials, and a trust-building block to lift trust score above 70.',
      effort_estimate: '1-2h'
    });
  }

  if (!page.faq_present) {
    issues.push({
      page_id, task_type: 'add_faq', priority: page.page_type === 'service' ? 'high' : 'medium', status: 'pending',
      reason: `No FAQ section present on this ${page.page_type} page.`,
      recommendation: 'Add 4-5 targeted FAQ items and implement FAQPage schema for rich snippet eligibility.',
      effort_estimate: '1-2h'
    });
  }

  if ((page.conversion_score || 0) < 65) {
    issues.push({
      page_id, task_type: 'update_cta', priority: 'critical', status: 'pending',
      reason: `Conversion score is ${page.conversion_score || 0}/100 — well below target for this page type.`,
      recommendation: 'Strengthen CTA placement, add mid-page CTA, and ensure Pricing page link is present.',
      effort_estimate: '30min'
    });
  }

  if ((page.internal_links_in_count || 0) < 2) {
    issues.push({
      page_id, task_type: 'add_internal_links', priority: 'high', status: 'pending',
      reason: `Only ${page.internal_links_in_count || 0} incoming internal links — orphan risk detected.`,
      recommendation: 'Add at least 3 incoming links from related blog posts and service pages to this page.',
      effort_estimate: '30min'
    });
  }

  if (page.decay_risk === 'high') {
    issues.push({
      page_id, task_type: 'light_refresh', priority: 'critical', status: 'pending',
      reason: `High decay risk detected — content may be losing relevance and search visibility.`,
      recommendation: 'Review all headings, examples, and CTAs for currency. Update statistics and refresh the intro.',
      effort_estimate: '1-2h'
    });
  }

  if ((page.content_depth_score || 0) < 50) {
    issues.push({
      page_id, task_type: 'expansion', priority: 'medium', status: 'pending',
      reason: `Content depth score is ${page.content_depth_score || 0}/100 — insufficient for authority signals.`,
      recommendation: 'Expand thin sections, add examples, and consider adding a comparison or "how it works" block.',
      effort_estimate: 'half_day'
    });
  }

  const created = [];
  for (const issue of issues) {
    const record = await base44.asServiceRole.entities.RefreshTasks.create(issue);
    created.push(record);
  }

  // Update page recommendations if needed
  if (page.decay_risk === 'high' || (page.refresh_score || 50) < 40) {
    await base44.asServiceRole.entities.Pages.update(page_id, {
      orphan_risk: (page.internal_links_in_count || 0) < 2 ? 'high' : page.orphan_risk
    });
  }

  return Response.json({ success: true, tasks_created: created.length, issues: created });
});