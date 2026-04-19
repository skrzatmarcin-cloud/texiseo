import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Competitor Super-Agent
// Analyzes competitor websites: SEO, backlinks, content strategy, freebies, AI visibility

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, competitor_id, competitor_url, competitor_name } = body;

    // ACTION: analyze — full deep analysis of one competitor
    if (action === 'analyze') {
      if (!competitor_url) return Response.json({ error: 'competitor_url required' }, { status: 400 });

      // Step 1: Fetch the competitor website for context
      let siteContent = '';
      try {
        const fetchRes = await fetch(competitor_url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)' },
          signal: AbortSignal.timeout(10000),
        });
        if (fetchRes.ok) {
          siteContent = (await fetchRes.text()).slice(0, 15000);
        }
      } catch (_e) {
        siteContent = '(nie udało się pobrać strony, analizuj na podstawie URL)';
      }

      // Step 2: Deep AI analysis
      const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
        add_context_from_internet: false,
        prompt: `Jesteś ekspertem SEO i analitykiem konkurencji. Przeanalizuj szczegółowo stronę konkurenta: ${competitor_url}

Zawartość strony (fragment HTML):
${siteContent}

Przeprowadź PEŁNĄ analizę obejmującą:

1. **SEO Overview** — struktura URL, H1/H2, meta tagi, schema markup, szybkość (szacowana), mobile-first
2. **Słowa kluczowe** — główne frazy, na które prawdopodobnie pozycjonują się w Google PL/EN
3. **Strategia treści** — jak piszą artykuły, jak długie, jakie tematy poruszają, jak często publikują
4. **Typy treści** — blog, wideo, podcast, infografiki, case studies, testimonials
5. **Freebies / Lead magnety** — materiały do pobrania, PDF, ebooki, checklisty, darmowe próby, ręczniki (freebies), mini-kursy
6. **Webinary i eventy** — czy organizują, jak często, na jakie tematy
7. **Backlinki** — skąd prawdopodobnie mają linki (katalogi edukacyjne, fora, blogi rodziców, portale edukacyjne)
8. **Obecność w mediach / PR** — czy mają artykuły w prasie, nagrody, certyfikaty, cytowania
9. **Social media** — kanały, liczba obserwujących (szacunkowo), co publikują
10. **Widoczność AI** — czy są wymieniani w ChatGPT, Gemini jako polecana szkoła językowa
11. **Szanse dla Linguatoons** — co możemy skopiować/ulepszyć, luki w ich strategii
12. **Zagrożenia** — w czym są silni, co mogą nam zabrać
13. **Rekomendacje** — 5-10 konkretnych działań dla Linguatoons

Zwróć JSON z polami: seo_overview, top_keywords (array), content_strategy, content_types (array), freebies_lead_magnets (array), webinars_events (array), backlinks_overview, backlink_sources (array), media_presence (array), social_channels (array), ai_visibility, opportunities_for_us (array), threats (array), recommendations (array), raw_report (pełne podsumowanie Markdown po polsku, min 800 słów)`,
        response_json_schema: {
          type: 'object',
          properties: {
            seo_overview: { type: 'string' },
            top_keywords: { type: 'array', items: { type: 'string' } },
            content_strategy: { type: 'string' },
            content_types: { type: 'array', items: { type: 'string' } },
            freebies_lead_magnets: { type: 'array', items: { type: 'string' } },
            webinars_events: { type: 'array', items: { type: 'string' } },
            backlinks_overview: { type: 'string' },
            backlink_sources: { type: 'array', items: { type: 'string' } },
            media_presence: { type: 'array', items: { type: 'string' } },
            social_channels: { type: 'array', items: { type: 'string' } },
            ai_visibility: { type: 'string' },
            opportunities_for_us: { type: 'array', items: { type: 'string' } },
            threats: { type: 'array', items: { type: 'string' } },
            recommendations: { type: 'array', items: { type: 'string' } },
            raw_report: { type: 'string' },
          }
        }
      });

      const today = new Date().toISOString().split('T')[0];

      // Save analysis
      const record = await base44.asServiceRole.entities.CompetitorAnalysis.create({
        competitor_id: competitor_id || 'manual',
        competitor_url,
        analysis_date: today,
        seo_overview: analysis.seo_overview,
        top_keywords: analysis.top_keywords || [],
        content_strategy: analysis.content_strategy,
        content_types: analysis.content_types || [],
        backlinks_overview: analysis.backlinks_overview,
        backlink_sources: analysis.backlink_sources || [],
        freebies_lead_magnets: analysis.freebies_lead_magnets || [],
        webinars_events: analysis.webinars_events || [],
        media_presence: analysis.media_presence || [],
        social_channels: analysis.social_channels || [],
        ai_visibility: analysis.ai_visibility,
        opportunities_for_us: analysis.opportunities_for_us || [],
        threats: analysis.threats || [],
        recommendations: analysis.recommendations || [],
        raw_report: analysis.raw_report,
      });

      // Update competitor last_analyzed_at
      if (competitor_id && competitor_id !== 'manual') {
        await base44.asServiceRole.entities.Competitors.update(competitor_id, {
          last_analyzed_at: new Date().toISOString(),
        });
      }

      return Response.json({ success: true, analysis_id: record.id, analysis });
    }

    // ACTION: daily_scan — analyze all active competitors
    if (action === 'daily_scan') {
      const competitors = await base44.asServiceRole.entities.Competitors.filter({ active: true });
      const results = [];

      for (const comp of competitors) {
        try {
          // Fetch site
          let siteContent = '';
          try {
            const fetchRes = await fetch(comp.url, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEO-Analyzer/1.0)' },
              signal: AbortSignal.timeout(8000),
            });
            if (fetchRes.ok) siteContent = (await fetchRes.text()).slice(0, 10000);
          } catch (_e) {
            siteContent = '(fetch failed)';
          }

          const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
            model: 'gemini_3_flash',
            prompt: `SEO competitor analysis for ${comp.url} (${comp.name}).
Site content: ${siteContent}
Return JSON: { seo_overview, top_keywords(array), content_strategy, content_types(array), freebies_lead_magnets(array), webinars_events(array), backlinks_overview, backlink_sources(array), media_presence(array), social_channels(array), ai_visibility, opportunities_for_us(array), threats(array), recommendations(array), raw_report }`,
            response_json_schema: {
              type: 'object',
              properties: {
                seo_overview: { type: 'string' },
                top_keywords: { type: 'array', items: { type: 'string' } },
                content_strategy: { type: 'string' },
                content_types: { type: 'array', items: { type: 'string' } },
                freebies_lead_magnets: { type: 'array', items: { type: 'string' } },
                webinars_events: { type: 'array', items: { type: 'string' } },
                backlinks_overview: { type: 'string' },
                backlink_sources: { type: 'array', items: { type: 'string' } },
                media_presence: { type: 'array', items: { type: 'string' } },
                social_channels: { type: 'array', items: { type: 'string' } },
                ai_visibility: { type: 'string' },
                opportunities_for_us: { type: 'array', items: { type: 'string' } },
                threats: { type: 'array', items: { type: 'string' } },
                recommendations: { type: 'array', items: { type: 'string' } },
                raw_report: { type: 'string' },
              }
            }
          });

          const today = new Date().toISOString().split('T')[0];
          await base44.asServiceRole.entities.CompetitorAnalysis.create({
            competitor_id: comp.id,
            competitor_url: comp.url,
            analysis_date: today,
            ...analysis,
            top_keywords: analysis.top_keywords || [],
            content_types: analysis.content_types || [],
            freebies_lead_magnets: analysis.freebies_lead_magnets || [],
            webinars_events: analysis.webinars_events || [],
            backlink_sources: analysis.backlink_sources || [],
            media_presence: analysis.media_presence || [],
            social_channels: analysis.social_channels || [],
            opportunities_for_us: analysis.opportunities_for_us || [],
            threats: analysis.threats || [],
            recommendations: analysis.recommendations || [],
          });

          await base44.asServiceRole.entities.Competitors.update(comp.id, {
            last_analyzed_at: new Date().toISOString(),
          });

          results.push({ name: comp.name, url: comp.url, status: 'analyzed' });
        } catch (e) {
          results.push({ name: comp.name, url: comp.url, status: 'failed', error: e.message });
        }
      }

      return Response.json({ success: true, message: `Przeanalizowano ${results.length} konkurentów`, results });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});