// SEO QA scoring engine — evaluates a Brief record and returns a structured QA result

export function runSEOQA(brief) {
  const checks = [];
  let seoScore = 0, contentScore = 0, readinessScore = 0;
  const maxSeo = 10, maxContent = 10, maxReadiness = 10;
  let seoTotal = 0, contentTotal = 0, readinessTotal = 0;

  const push = (category, label, pass, severity, message, tip) => {
    checks.push({ category, label, pass, severity, message, tip });
    const pts = pass ? 1 : 0;
    if (category === "seo") { seoScore += pts; seoTotal++; }
    else if (category === "content") { contentScore += pts; contentTotal++; }
    else { readinessScore += pts; readinessTotal++; }
  };

  // SEO checks
  push("seo", "H1 present", !!brief.h1, "critical", brief.h1 ? `H1: "${brief.h1}"` : "H1 is missing", "Add a keyword-rich, compelling H1");
  push("seo", "H1 contains primary keyword", brief.h1?.toLowerCase().includes((brief.primary_keyword || "").toLowerCase().split(" ")[0]), "high",
    brief.h1 && brief.primary_keyword ? "Check H1 / keyword alignment" : "Cannot verify without H1 and keyword",
    "H1 should naturally contain the primary keyword");
  push("seo", "Meta title present", !!brief.meta_title, "critical", brief.meta_title ? `"${brief.meta_title}"` : "Meta title missing", "Write a meta title under 60 characters");
  push("seo", "Meta title length ≤60", (brief.meta_title?.length || 0) <= 60, "high",
    brief.meta_title ? `${brief.meta_title.length} chars` : "N/A", "Keep meta title under 60 characters to avoid truncation");
  push("seo", "Meta description present", !!brief.meta_description, "critical", brief.meta_description ? `${brief.meta_description.length} chars` : "Missing", "Write a compelling meta description under 160 characters");
  push("seo", "Meta description length ≤160", (brief.meta_description?.length || 0) <= 160 && (brief.meta_description?.length || 0) > 0, "high",
    brief.meta_description ? `${brief.meta_description.length} chars` : "N/A", "Stay within 160 characters");
  push("seo", "Primary keyword defined", !!brief.primary_keyword, "critical", brief.primary_keyword || "Missing", "Define a clear primary keyword");
  push("seo", "Slug defined", !!brief.slug, "high", brief.slug || "Missing", "Define a clean, keyword-rich URL slug");
  push("seo", "Schema type defined", !!brief.schema_type, "medium", brief.schema_type || "No schema recommended", "Add a schema type — at minimum Article or FAQPage");
  push("seo", "FAQ section present", !!(brief.faq_json && brief.faq_json !== "[]"), "medium", brief.faq_json && brief.faq_json !== "[]" ? "FAQ section found" : "No FAQ section", "Add FAQ section for rich snippet eligibility");

  // Content quality checks
  push("content", "H2 structure defined", !!(brief.h2_structure_json && brief.h2_structure_json !== "[]"), "critical", "Content outline quality", "Define a clear H2 outline before writing");
  push("content", "Search intent summary", !!brief.search_intent_summary, "high", brief.search_intent_summary ? "Defined" : "Missing", "Summarise the search intent to guide writer");
  push("content", "Audience profile", !!brief.audience_summary, "high", brief.audience_summary ? "Defined" : "Missing", "Define the target audience for the writer");
  push("content", "Business goal", !!brief.business_goal, "high", brief.business_goal ? "Defined" : "Missing", "Every piece must have a clear business objective");
  push("content", "CTA goal defined", !!brief.cta_goal, "high", brief.cta_goal ? "Defined" : "Missing", "Define what action the reader should take");
  push("content", "Tone guidance", !!brief.tone_notes, "medium", brief.tone_notes ? "Provided" : "Missing", "Give the writer tone and voice guidance");
  push("content", "E-E-A-T guidance", !!brief.eeat_notes, "medium", brief.eeat_notes ? "Provided" : "Missing", "Include E-E-A-T signals to build authority");
  push("content", "Objection handling", !!brief.objection_handling, "medium", brief.objection_handling ? "Provided" : "Missing", "Address reader objections proactively");
  push("content", "Trust blocks defined", !!brief.trust_blocks, "medium", brief.trust_blocks ? "Provided" : "Missing", "Specify trust-building elements for the writer");
  push("content", "Who this is for", !!brief.who_for, "low", brief.who_for ? "Defined" : "Missing", "Help writer understand the ideal reader profile");

  // Publish readiness checks
  push("readiness", "Internal links planned", !!(brief.internal_links_json && brief.internal_links_json !== "[]"), "high", "Internal link strategy", "Plan at least 2 internal links before writing");
  push("readiness", "Target word count set", !!brief.target_word_count, "medium", brief.target_word_count ? `${brief.target_word_count} words` : "Not set", "Set a realistic target word count");
  push("readiness", "Mid-content CTA", !!brief.mid_cta, "medium", brief.mid_cta ? "Defined" : "Missing", "Add a mid-content CTA to capture engaged readers");
  push("readiness", "Bottom CTA", !!brief.bottom_cta, "medium", brief.bottom_cta ? "Defined" : "Missing", "Add a bottom CTA with clear next step");
  push("readiness", "Funnel stage", !!brief.funnel_stage, "high", brief.funnel_stage || "Missing", "Confirm funnel stage to align tone and CTA");
  push("readiness", "Brief status is ready", ["ready", "approved"].includes(brief.status), "critical",
    `Current status: ${brief.status}`, "Brief must be marked 'Ready' before publishing");
  push("readiness", "Mistakes to avoid", !!brief.mistakes_to_avoid, "low", brief.mistakes_to_avoid ? "Provided" : "Missing", "List common mistakes to avoid");
  push("readiness", "Editor notes", !!brief.editor_notes, "low", brief.editor_notes ? "Provided" : "Missing", "Add editorial notes for the review stage");
  push("readiness", "QA notes", !!brief.qa_notes, "low", brief.qa_notes ? "Provided" : "Missing", "Add a QA checklist for the final review");
  push("readiness", "Secondary keywords", (brief.secondary_keywords?.length || 0) > 0, "medium",
    brief.secondary_keywords?.length ? `${brief.secondary_keywords.length} defined` : "None defined", "Define 2-3 secondary keywords for semantic coverage");

  const seo = seoTotal ? Math.round((seoScore / seoTotal) * 100) : 0;
  const content = contentTotal ? Math.round((contentScore / contentTotal) * 100) : 0;
  const readiness = readinessTotal ? Math.round((readinessScore / readinessTotal) * 100) : 0;
  const overall = Math.round((seo + content + readiness) / 3);

  let decision, decisionColor;
  if (overall >= 85) { decision = "publish"; decisionColor = "emerald"; }
  else if (overall >= 70) { decision = "publish_after_minor_fixes"; decisionColor = "blue"; }
  else if (overall >= 50) { decision = "hold_for_revision"; decisionColor = "amber"; }
  else { decision = "not_ready"; decisionColor = "red"; }

  const critical = checks.filter(c => !c.pass && c.severity === "critical");
  const high = checks.filter(c => !c.pass && c.severity === "high");
  const passed = checks.filter(c => c.pass);

  return { checks, seo, content, readiness, overall, decision, decisionColor, critical, high, passed };
}

export const DECISION_LABELS = {
  publish: "✓ Publish",
  publish_after_minor_fixes: "Publish After Minor Fixes",
  hold_for_revision: "Hold for Revision",
  not_ready: "Not Ready",
};