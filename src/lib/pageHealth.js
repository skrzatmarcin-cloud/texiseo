/**
 * Computes an overall page health score and label from page data.
 * Also generates weakness list and per-page recommendations.
 */

export function computePageHealth(page) {
  const trust = page.trust_score || 0;
  const conv = page.conversion_score || 0;
  const depth = page.content_depth_score || 0;
  const refresh = page.refresh_score || 0;
  const faq = page.faq_present ? 1 : 0;
  const schema = page.schema_present ? 1 : 0;
  const linksIn = page.internal_links_in_count || 0;
  const linksOut = page.internal_links_out_count || 0;

  // Weighted composite
  const score = Math.round(
    trust * 0.2 +
    conv * 0.2 +
    depth * 0.2 +
    refresh * 0.1 +
    faq * 80 * 0.1 +
    schema * 80 * 0.1 +
    Math.min(linksIn * 5, 80) * 0.05 +
    Math.min(linksOut * 5, 80) * 0.05
  );

  const label = score >= 68 ? "healthy" : score >= 48 ? "fair" : "weak";

  return { score, label };
}

export function detectWeaknesses(page) {
  const weaknesses = [];
  const isService = ["service", "landing", "pricing", "signup"].includes(page.page_type);
  const isBlog = ["blog", "support", "pillar"].includes(page.page_type);

  if (!page.faq_present) {
    weaknesses.push({
      id: "missing_faq",
      severity: isService ? "high" : "medium",
      title: "No FAQ section",
      detail: "FAQ sections improve SERP appearance via rich snippets and answer user questions that reduce bounce rate.",
      seo_value: "High",
      business_value: isService ? "High" : "Medium",
    });
  }

  if (!page.schema_present) {
    weaknesses.push({
      id: "missing_schema",
      severity: "medium",
      title: "No structured data (schema)",
      detail: "Missing Schema markup means this page cannot qualify for rich results in Google, reducing CTR potential.",
      seo_value: "High",
      business_value: "Medium",
    });
  }

  if ((page.trust_score || 0) < 50) {
    weaknesses.push({
      id: "low_trust",
      severity: "high",
      title: "Weak trust signal coverage",
      detail: "Trust score below 50 indicates missing credibility signals: testimonials, certifications, teacher bios, or social proof.",
      seo_value: "Medium",
      business_value: "High",
    });
  }

  if ((page.conversion_score || 0) < 55 && isService) {
    weaknesses.push({
      id: "weak_cta",
      severity: "critical",
      title: "Poor conversion architecture",
      detail: "Service pages with conversion scores below 55 typically lack a prominent CTA, clear value proposition, or urgency triggers.",
      seo_value: "Low",
      business_value: "Critical",
    });
  }

  if ((page.content_depth_score || 0) < 50) {
    weaknesses.push({
      id: "shallow_content",
      severity: isService ? "high" : "medium",
      title: "Shallow content depth",
      detail: "Content depth below 50 suggests thin coverage of the topic. Topical authority requires comprehensive, expert-level content.",
      seo_value: "High",
      business_value: "Medium",
    });
  }

  if ((page.internal_links_in_count || 0) < 3) {
    weaknesses.push({
      id: "low_links_in",
      severity: "medium",
      title: "Too few internal links pointing here",
      detail: "Pages with fewer than 3 inbound internal links receive little PageRank flow and may be effectively orphaned.",
      seo_value: "High",
      business_value: "Low",
    });
  }

  if ((page.internal_links_out_count || 0) < 2) {
    weaknesses.push({
      id: "low_links_out",
      severity: "low",
      title: "Not enough internal links to other pages",
      detail: "Pages should link to relevant support content, service pages, or cluster siblings to strengthen topical authority.",
      seo_value: "Medium",
      business_value: "Low",
    });
  }

  if (page.decay_risk === "high") {
    weaknesses.push({
      id: "decay_risk",
      severity: "high",
      title: "High content decay risk",
      detail: "This page has not been refreshed and may be losing rankings due to freshness signals degrading over time.",
      seo_value: "High",
      business_value: "Medium",
    });
  }

  if (page.orphan_risk === "high") {
    weaknesses.push({
      id: "orphan_risk",
      severity: "high",
      title: "Orphan page risk",
      detail: "This page has very few inbound links from the rest of the site. Orphan pages are difficult for Google to discover and rank.",
      seo_value: "High",
      business_value: "Low",
    });
  }

  if (!page.cluster_id) {
    weaknesses.push({
      id: "no_cluster",
      severity: "medium",
      title: "Not assigned to a topic cluster",
      detail: "Pages without cluster assignment are isolated from topical authority flow. Assign this page to a relevant cluster.",
      seo_value: "High",
      business_value: "Medium",
    });
  }

  if (isService && (page.refresh_score || 0) < 50) {
    weaknesses.push({
      id: "stale_service",
      severity: "medium",
      title: "Service page may be outdated",
      detail: "Service pages should be reviewed quarterly. A low refresh score indicates stale content, pricing, or offers.",
      seo_value: "Medium",
      business_value: "High",
    });
  }

  return weaknesses;
}

export function generateRecommendations(page) {
  const weaknesses = detectWeaknesses(page);
  const isService = ["service", "landing", "pricing", "signup"].includes(page.page_type);

  const recs = weaknesses.map(w => {
    const map = {
      missing_faq: {
        type: "add_faq",
        priority: w.severity,
        title: "Add an FAQ section",
        full_text: `Create a targeted FAQ section with 5–8 questions that address the most common doubts for ${page.audience || "your audience"} on this page. Target question-based search queries. Apply FAQ schema markup.`,
        why: "FAQ sections improve dwell time, reduce bounce, qualify for rich snippets, and often appear directly in Google's People Also Ask boxes.",
        seo_value: "High",
        business_value: isService ? "High — reduces friction before purchase" : "Medium",
      },
      missing_schema: {
        type: "add_schema",
        priority: w.severity,
        title: "Implement structured data markup",
        full_text: `Add appropriate Schema.org markup for this page type (${page.page_type}). For service pages, use Service or LocalBusiness schema. For blog, use Article. For FAQ, use FAQPage schema.`,
        why: "Schema markup enables rich results in Google, improving CTR by 10–30% without changing rank position.",
        seo_value: "High",
        business_value: "Medium — more qualified clicks from SERP",
      },
      low_trust: {
        type: "strengthen_trust",
        priority: w.severity,
        title: "Add trust and credibility elements",
        full_text: `Include at least 3 trust-building elements: verified teacher qualifications, student testimonials with names/photos, lesson count or student count social proof, or partnership/press mentions. Position trust signals above the fold.`,
        why: "Trust signals are the primary decision-making factor for parents and adult learners evaluating language schools online.",
        seo_value: "Medium — reduces pogo-sticking signals",
        business_value: "Critical — directly impacts conversion rate",
      },
      weak_cta: {
        type: "improve_cta",
        priority: w.severity,
        title: "Redesign the primary CTA structure",
        full_text: `The CTA on this page needs to be more prominent and action-oriented. Use a clear value-loaded headline (e.g. "Start your free trial lesson today — no commitment"). Add a secondary CTA in the footer section. Ensure CTA is above the fold.`,
        why: "CTA structure is the single highest-leverage conversion variable on a service page. Weak CTAs kill leads.",
        seo_value: "Low — but improves engagement metrics",
        business_value: "Critical — directly determines lead volume",
      },
      shallow_content: {
        type: "expand_depth",
        priority: w.severity,
        title: "Expand content depth and topical coverage",
        full_text: `This page scores below 50 on content depth, which means it lacks comprehensive coverage. Add sections covering: methodology, teacher profiles, curriculum overview, lesson format, expected outcomes, and student journey. Aim for at least 1,200–1,800 words for service pages.`,
        why: "Content depth directly correlates with topical authority scores. Thin pages rarely rank for competitive terms.",
        seo_value: "High",
        business_value: "Medium — more informed visitors convert better",
      },
      low_links_in: {
        type: "internal_link_building",
        priority: w.severity,
        title: "Build internal links pointing to this page",
        full_text: `Identify 3–5 existing blog posts or cluster pages that are relevant to this topic. Edit those pages to include contextual links to this page using descriptive anchor text. Prioritise high-traffic cluster articles.`,
        why: "Internal links pass PageRank and help Google understand page importance. Pages with few inbound links are systematically underpowered.",
        seo_value: "High",
        business_value: "Low — indirect",
      },
      low_links_out: {
        type: "add_internal_links_out",
        priority: w.severity,
        title: "Add outbound internal links to support content",
        full_text: `Link from this page to at least 3–5 relevant support articles or cluster siblings. Use descriptive anchor text and place links naturally within the body content. Avoid navigation-only linking.`,
        why: "Pages that link out to relevant cluster content reinforce topical authority and help visitors explore your site.",
        seo_value: "Medium",
        business_value: "Low — but improves content discovery",
      },
      decay_risk: {
        type: "refresh_content",
        priority: w.severity,
        title: "Refresh and update this page",
        full_text: `Conduct a full content audit of this page. Update pricing, testimonials, or any time-sensitive information. Add 200–400 new words of expert insight. Update the publication date and re-submit to Google Search Console.`,
        why: "Search engines reward freshness. Pages that have not been updated in 12+ months lose ranking positions to fresher competitors.",
        seo_value: "High",
        business_value: "Medium — outdated info costs credibility",
      },
      orphan_risk: {
        type: "resolve_orphan",
        priority: w.severity,
        title: "Connect this page to the rest of the site",
        full_text: `This page appears isolated. Add it to relevant cluster hubs, include it in related article recommendations, and ensure it appears in at least one category or navigation context. Add it to the sitemap if missing.`,
        why: "Orphan pages are not discovered or indexed efficiently. They receive no authority flow and are invisible in the ranking ecosystem.",
        seo_value: "High",
        business_value: "Low — but critical for discoverability",
      },
      no_cluster: {
        type: "assign_cluster",
        priority: w.severity,
        title: "Assign this page to a topic cluster",
        full_text: `Identify the most relevant topic cluster for this page and assign it. Ensure the cluster's pillar page links to this page and this page links back. This enables topical authority flow across the cluster.`,
        why: "Cluster assignment is foundational for topical SEO. Without it, this page competes alone instead of benefiting from cluster authority.",
        seo_value: "High",
        business_value: "Medium",
      },
      stale_service: {
        type: "refresh_service_page",
        priority: w.severity,
        title: "Audit and refresh this service page",
        full_text: `Review this service page for outdated offers, stale testimonials, or expired promotions. Ensure pricing is current. Add a recent student success story. Verify all CTAs are functional and link to active conversion flows.`,
        why: "Service pages with outdated content lose trust. Visitors who notice stale information leave without converting.",
        seo_value: "Medium",
        business_value: "High — directly affects sales readiness",
      },
    };
    return map[w.id] || null;
  }).filter(Boolean);

  // Service page bonus recommendations
  if (isService) {
    if (!page.notes?.includes("comparison")) {
      recs.push({
        type: "add_comparison",
        priority: "medium",
        title: "Add a comparison section",
        full_text: `Include a comparison section showing how Linguatoons differs from alternatives (apps, other schools, private tutors). Use a clear table or bullet-based comparison with honest, evidence-backed claims.`,
        why: "Visitors in the consideration stage are actively comparing options. A comparison section keeps them on your page and positions you favourably.",
        seo_value: "Medium",
        business_value: "High — captures mid-funnel intent",
      });
    }
    if ((page.audience === "children" || page.audience === "parents") && (page.trust_score || 0) < 75) {
      recs.push({
        type: "parent_trust",
        priority: "high",
        title: "Add parent-specific trust elements",
        full_text: `Parents evaluating online lessons for their children need specific reassurances: teacher DBS/background checks, lesson recording policy, screen time guidelines, and parent feedback mechanisms. Address these explicitly on the page.`,
        why: "Parents are cautious buyers. Without directly addressing their safety concerns, even interested parents abandon without converting.",
        seo_value: "Low",
        business_value: "Critical — removes the #1 conversion barrier for children's lessons",
      });
    }
  }

  // Sort: critical → high → medium → low
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return recs.sort((a, b) => (order[a.priority] ?? 4) - (order[b.priority] ?? 4));
}