import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Competitor Super-Agent v2
// 1. Fetches competitor site + Linguatoons site
// 2. Deep AI analysis of competitor
// 3. Direct comparison: what competitor has that Linguatoons lacks
// 4. Actionable gap report saved to CompetitorAnalysis

const MY_URL = 'https://linguatoons.com';

async function fetchSite(url, maxChars = 12000) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)' },
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) return (await res.text()).slice(0, maxChars);
  } catch (_e) { /* silent */ }
  return '(nie udało się pobrać strony)';
}

async function fetchAdditionalPages(baseUrl, slugs = ['/blog', '/oferta', '/kursy', '/about', '/cennik']) {
  const results = [];
  for (const slug of slugs.slice(0, 3)) {
    try {
      const res = await fetch(baseUrl.replace(/\/$/, '') + slug, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) results.push(`\n\n--- ${slug} ---\n` + (await res.text()).slice(0, 4000));
    } catch (_e) { /* skip */ }
  }
  return results.join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, competitor_id, competitor_url, competitor_name } = body;

    // --- SHARED: run full analysis for one competitor ---
    async function analyzeOne(comp) {
      // Fetch both sites in parallel
      const [competitorMain, myMain, competitorExtra, myExtra] = await Promise.all([
        fetchSite(comp.url),
        fetchSite(MY_URL),
        fetchAdditionalPages(comp.url, ['/blog', '/oferta', '/kursy', '/cennik', '/o-nas']),
        fetchAdditionalPages(MY_URL, ['/blog', '/oferta', '/kursy', '/cennik', '/o-nas']),
      ]);

      // Also fetch Linguatoons pages from DB for full picture
      const myPages = await base44.asServiceRole.entities.Pages.list('-created_date', 100);
      const myPagesSummary = myPages
        .slice(0, 60)
        .map(p => `- [${p.page_type?.toUpperCase() || 'PAGE'}] ${p.title} | slug: ${p.slug || p.url} | keywords: ${p.primary_keyword || '?'}`)
        .join('\n');

      const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        prompt: `Jesteś ekspertem SEO i analitykiem konkurencji. Twoim zadaniem jest PEŁNA analiza konkurenta ORAZ bezpośrednie porównanie z Linguatoons.

=== DANE KONKURENTA: ${comp.url} ===
${competitorMain}
${competitorExtra}

=== DANE LINGUATOONS (${MY_URL}) ===
${myMain}
${myExtra}

=== STRONY LINGUATOONS W BAZIE (lista) ===
${myPagesSummary}

---

Przeprowadź PEŁNĄ analizę w 2 częściach:

## CZĘŚĆ 1 — ANALIZA KONKURENTA (${comp.url})
1. **SEO Overview** — struktura URL, H1/H2, meta tagi, schema markup, mobile, Core Web Vitals (szacunki)
2. **Słowa kluczowe** — TOP 15 fraz, na które się pozycjonują (Google PL + EN)
3. **Strategia treści** — jak piszą artykuły, długość, tematy, częstotliwość, format
4. **Typy treści** — blog, wideo, podcast, infografiki, case studies, testimonials, porównania
5. **Freebies / Lead magnety** — PDF, ebooki, darmowe próbne lekcje, checklisty, materiały do pobrania, "ręczniki" (wszelkie prezenty), mini-kursy
6. **Webinary i eventy** — czy organizują, jak często, tematy, czy nagrywają
7. **Narzędzia i technologie** — jakie narzędzia SEO/marketing widać (pixel, GTM, chatboty, CRM, narzędzia rezerwacji, quizy, kalkulatory)
8. **Backlinki** — skąd prawdopodobnie mają linki (katalogi edukacyjne, portale rodziców, fora)
9. **Obecność w mediach / PR** — artykuły w prasie, nagrody, certyfikaty, partnerstwa
10. **Social media** — kanały, styl treści, szacunkowy zasięg
11. **Widoczność w AI** — czy są wymieniani jako polecana szkoła przez ChatGPT/Gemini/Perplexity

## CZĘŚĆ 2 — PORÓWNANIE: KONKURENT vs LINGUATOONS
Dla każdego obszaru wskaż: ✅ Linguatoons ma | ❌ Linguatoons brakuje | ⚠️ Linguatoons ma słabiej

12. **Luki treści** — jakie tematy/artykuły ma konkurent, których Linguatoons nie ma wcale lub ma słabiej
13. **Luki funkcjonalne** — narzędzia, funkcje, freebies, webinary, które ma konkurent a Linguatoons nie
14. **Luki SEO techniczne** — gdzie konkurent jest lepszy technicznie
15. **Luki w widoczności AI** — co konkurent robi żeby być wymieniany przez ChatGPT/Gemini
16. **Szanse dla Linguatoons** — TOP 10 konkretnych rzeczy do skopiowania/ulepszenia (priorytetyzowanych)
17. **Zagrożenia** — gdzie konkurent jest wyraźnie silniejszy
18. **Plan działania** — 10 konkretnych kroków dla Linguatoons z priorytetem (critical/high/medium)

Zwróć JSON z polami:
seo_overview, top_keywords(array strings), content_strategy, content_types(array), freebies_lead_magnets(array), webinars_events(array), tools_technologies(array), backlinks_overview, backlink_sources(array), media_presence(array), social_channels(array), ai_visibility, content_gaps(array - czego brakuje Linguatoons), functional_gaps(array), seo_technical_gaps(array), ai_visibility_gaps(array), opportunities_for_us(array TOP 10), threats(array), recommendations(array - 10 kroków z priorytetem), raw_report(pełne Markdown PL min 1000 słów z tabelami porównawczymi)`,
        response_json_schema: {
          type: 'object',
          properties: {
            seo_overview: { type: 'string' },
            top_keywords: { type: 'array', items: { type: 'string' } },
            content_strategy: { type: 'string' },
            content_types: { type: 'array', items: { type: 'string' } },
            freebies_lead_magnets: { type: 'array', items: { type: 'string' } },
            webinars_events: { type: 'array', items: { type: 'string' } },
            tools_technologies: { type: 'array', items: { type: 'string' } },
            backlinks_overview: { type: 'string' },
            backlink_sources: { type: 'array', items: { type: 'string' } },
            media_presence: { type: 'array', items: { type: 'string' } },
            social_channels: { type: 'array', items: { type: 'string' } },
            ai_visibility: { type: 'string' },
            content_gaps: { type: 'array', items: { type: 'string' } },
            functional_gaps: { type: 'array', items: { type: 'string' } },
            seo_technical_gaps: { type: 'array', items: { type: 'string' } },
            ai_visibility_gaps: { type: 'array', items: { type: 'string' } },
            opportunities_for_us: { type: 'array', items: { type: 'string' } },
            threats: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            raw_report: { type: 'string' },
          }
        }
      });

      const today = new Date().toISOString().split('T')[0];

      const record = await base44.asServiceRole.entities.CompetitorAnalysis.create({
        competitor_id: comp.id || 'manual',
        competitor_url: comp.url,
        analysis_date: today,
        seo_overview: analysis.seo_overview,
        top_keywords: analysis.top_keywords || [],
        content_strategy: analysis.content_strategy,
        content_types: analysis.content_types || [],
        freebies_lead_magnets: analysis.freebies_lead_magnets || [],
        webinars_events: analysis.webinars_events || [],
        backlinks_overview: analysis.backlinks_overview,
        backlink_sources: analysis.backlink_sources || [],
        media_presence: analysis.media_presence || [],
        social_channels: analysis.social_channels || [],
        ai_visibility: analysis.ai_visibility,
        opportunities_for_us: analysis.opportunities_for_us || [],
        threats: analysis.threats || [],
        recommendations: analysis.recommendations || [],
        raw_report: analysis.raw_report,
        // NEW comparison fields stored in notes as JSON
        notes: JSON.stringify({
          tools_technologies: analysis.tools_technologies || [],
          content_gaps: analysis.content_gaps || [],
          functional_gaps: analysis.functional_gaps || [],
          seo_technical_gaps: analysis.seo_technical_gaps || [],
          ai_visibility_gaps: analysis.ai_visibility_gaps || [],
        }),
      });

      if (comp.id && comp.id !== 'manual') {
        await base44.asServiceRole.entities.Competitors.update(comp.id, {
          last_analyzed_at: new Date().toISOString(),
        });
      }

      return { success: true, analysis_id: record.id, analysis };
    }

    // ACTION: analyze — one competitor on demand
    if (action === 'analyze') {
      if (!competitor_url) return Response.json({ error: 'competitor_url required' }, { status: 400 });
      const result = await analyzeOne({ id: competitor_id, url: competitor_url, name: competitor_name });
      return Response.json(result);
    }

    // ACTION: daily_scan — all active competitors
    if (action === 'daily_scan') {
      const competitors = await base44.asServiceRole.entities.Competitors.filter({ active: true });
      const results = [];

      for (const comp of competitors) {
        try {
          await analyzeOne(comp);
          results.push({ name: comp.name, url: comp.url, status: 'analyzed' });
        } catch (e) {
          results.push({ name: comp.name, url: comp.url, status: 'failed', error: e.message });
        }
      }

      return Response.json({ success: true, message: `Przeanalizowano ${results.length} konkurentów vs Linguatoons`, results });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});