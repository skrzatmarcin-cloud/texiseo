import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Google Search Console via API Key (simple queries) or Service Account JSON
// Uses the Search Console API with API key for public data

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, site_url, api_key, service_account_json, start_date, end_date, row_limit = 25 } = body;

    if (!site_url) return Response.json({ error: 'site_url required' }, { status: 400 });
    if (!api_key && !service_account_json) return Response.json({ error: 'api_key or service_account_json required' }, { status: 400 });

    // For API key based access (limited but works for many cases)
    if (api_key) {
      const endDate = end_date || new Date().toISOString().split('T')[0];
      const startDate = start_date || (() => { const d = new Date(); d.setDate(d.getDate() - 28); return d.toISOString().split('T')[0]; })();

      if (action === 'test') {
        // Test by listing sites
        const res = await fetch(`https://www.googleapis.com/webmasters/v3/sites?key=${api_key}`);
        const data = await res.json();
        if (res.ok) {
          return Response.json({ success: true, sites: data.siteEntry || [], message: 'Connected!' });
        }
        return Response.json({ success: false, error: data.error?.message || 'API key invalid', details: data });
      }

      if (action === 'query_pages') {
        const res = await fetch(
          `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site_url)}/searchAnalytics/query?key=${api_key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate,
              endDate,
              dimensions: ['page'],
              rowLimit: row_limit,
              orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) return Response.json({ success: false, error: data.error?.message || `HTTP ${res.status}`, details: data });
        return Response.json({ success: true, rows: data.rows || [], period: { startDate, endDate } });
      }

      if (action === 'query_keywords') {
        const res = await fetch(
          `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site_url)}/searchAnalytics/query?key=${api_key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate,
              endDate,
              dimensions: ['query'],
              rowLimit: row_limit,
              orderBy: [{ fieldName: 'clicks', sortOrder: 'DESCENDING' }],
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) return Response.json({ success: false, error: data.error?.message || `HTTP ${res.status}`, details: data });
        return Response.json({ success: true, rows: data.rows || [], period: { startDate, endDate } });
      }

      if (action === 'query_summary') {
        const res = await fetch(
          `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site_url)}/searchAnalytics/query?key=${api_key}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate, endDate, dimensions: ['date'], rowLimit: 90 }),
          }
        );
        const data = await res.json();
        if (!res.ok) return Response.json({ success: false, error: data.error?.message || `HTTP ${res.status}`, details: data });
        return Response.json({ success: true, rows: data.rows || [], period: { startDate, endDate } });
      }
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});