import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TARGET_URL = 'https://linguatoons.com';

const SECURITY_CHECKS = [
  { id: 'ssl', name: 'SSL Certificate', path: '/' },
  { id: 'headers', name: 'Security Headers', path: '/' },
  { id: 'robots', name: 'Robots.txt exposed', path: '/robots.txt' },
  { id: 'sitemap', name: 'Sitemap', path: '/sitemap.xml' },
  { id: 'wp_login', name: 'WP Login exposed', path: '/wp-login.php' },
  { id: 'wp_admin', name: 'WP Admin exposed', path: '/wp-admin/' },
  { id: 'xmlrpc', name: 'XMLRPC exposed', path: '/xmlrpc.php' },
  { id: 'wp_json', name: 'WP REST API users', path: '/wp-json/wp/v2/users' },
  { id: 'env', name: '.env file exposed', path: '/.env' },
  { id: 'git', name: '.git exposed', path: '/.git/HEAD' },
  { id: 'backup', name: 'Backup file exposed', path: '/backup.zip' },
  { id: 'phpinfo', name: 'phpinfo exposed', path: '/phpinfo.php' },
];

async function checkUrl(path) {
  try {
    const res = await fetch(TARGET_URL + path, {
      method: 'GET',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'SecurityBot/1.0' },
    });
    return { status: res.status, headers: Object.fromEntries(res.headers.entries()), ok: res.ok };
  } catch (e) {
    return { status: 0, error: e.message, ok: false };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const alerts = [];
    const today = new Date().toISOString().split('T')[0];

    // Run all checks in parallel
    const results = await Promise.all(
      SECURITY_CHECKS.map(async (check) => ({ check, result: await checkUrl(check.path) }))
    );

    for (const { check, result } of results) {
      // WP Login / Admin — should return 403 or redirect, not 200
      if (['wp_login', 'wp_admin'].includes(check.id)) {
        if (result.status === 200) {
          alerts.push({ type: 'brute_force', severity: 'high', desc: `${check.name} is publicly accessible (HTTP 200). Risk of brute-force attacks.`, rec: 'Restrict access to /wp-login.php and /wp-admin/ by IP or add 2FA.' });
        }
      }

      // XMLRPC — should be disabled
      if (check.id === 'xmlrpc' && result.status === 200) {
        alerts.push({ type: 'brute_force', severity: 'high', desc: 'xmlrpc.php is enabled. Can be used for brute-force amplification attacks.', rec: 'Disable XMLRPC via .htaccess or security plugin. Add: deny from all in .htaccess for /xmlrpc.php' });
      }

      // WP JSON users — exposes usernames
      if (check.id === 'wp_json' && result.status === 200) {
        alerts.push({ type: 'suspicious_traffic', severity: 'medium', desc: 'WordPress REST API exposes user list (/wp-json/wp/v2/users). Usernames are publicly visible.', rec: 'Disable user endpoint in REST API or use a security plugin to hide usernames.' });
      }

      // Sensitive files exposed
      if (['.env', 'git', 'backup', 'phpinfo'].includes(check.id) && result.status === 200) {
        alerts.push({ type: 'file_change', severity: 'critical', desc: `Sensitive file exposed: ${check.path}. Could leak credentials or source code.`, rec: `Immediately restrict access to ${check.path}. Add deny rule in .htaccess or server config.` });
      }

      // SSL check — must be HTTPS
      if (check.id === 'ssl') {
        if (result.status === 0) {
          alerts.push({ type: 'ssl_issue', severity: 'critical', desc: 'Site is unreachable or SSL handshake failed.', rec: 'Check SSL certificate validity and server uptime.' });
        }
        // Check security headers
        const h = result.headers || {};
        const missing = [];
        if (!h['strict-transport-security']) missing.push('Strict-Transport-Security (HSTS)');
        if (!h['x-frame-options'] && !h['content-security-policy']) missing.push('X-Frame-Options (clickjacking protection)');
        if (!h['x-content-type-options']) missing.push('X-Content-Type-Options');
        if (!h['referrer-policy']) missing.push('Referrer-Policy');
        if (!h['permissions-policy'] && !h['feature-policy']) missing.push('Permissions-Policy');
        if (missing.length > 0) {
          alerts.push({ type: 'headers_missing', severity: missing.length >= 3 ? 'high' : 'medium', desc: `Missing HTTP security headers: ${missing.join(', ')}`, rec: `Add these headers via .htaccess, Nginx config, or WordPress security plugin (e.g. Wordfence, iThemes Security):\n${missing.join('\n')}` });
        }
      }
    }

    // AI deep analysis of all findings + additional recommendations
    const aiAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt: `You are a WordPress security expert. Analyze this security scan report for ${TARGET_URL}:

SCAN RESULTS:
${JSON.stringify(results.map(r => ({ check: r.check.name, status: r.result.status, path: r.check.path })), null, 2)}

ALERTS FOUND:
${alerts.map(a => `- [${a.severity.toUpperCase()}] ${a.desc}`).join('\n') || 'No critical alerts from scan.'}

Please provide:
1. Additional security risks for a WordPress language school website (not covered by the scan)
2. Top 5 most likely attack vectors for this type of site (education/kids)
3. Specific WordPress plugin recommendations for security
4. Monthly security checklist
5. AI visibility attacks (prompt injection, scraping protection)

Return JSON with: additional_risks(array), attack_vectors(array), plugin_recommendations(array), monthly_checklist(array), ai_protection_tips(array), overall_risk_score(0-100), overall_risk_level(string)`,
      response_json_schema: {
        type: 'object',
        properties: {
          additional_risks: { type: 'array', items: { type: 'string' } },
          attack_vectors: { type: 'array', items: { type: 'string' } },
          plugin_recommendations: { type: 'array', items: { type: 'string' } },
          monthly_checklist: { type: 'array', items: { type: 'string' } },
          ai_protection_tips: { type: 'array', items: { type: 'string' } },
          overall_risk_score: { type: 'number' },
          overall_risk_level: { type: 'string' },
        }
      }
    });

    // Save all alerts to DB
    const savedAlerts = [];
    for (const a of alerts) {
      const saved = await base44.asServiceRole.entities.SecurityAlerts.create({
        alert_type: a.type,
        severity: a.severity,
        source_url: TARGET_URL,
        description: a.desc,
        recommendation: a.rec,
        status: 'open',
        detected_at: today,
        raw_data: JSON.stringify({ scan_results: results.map(r => ({ check: r.check.name, status: r.result.status })) }),
      });
      savedAlerts.push(saved);
    }

    // Save AI summary as single info alert
    if (aiAnalysis) {
      await base44.asServiceRole.entities.SecurityAlerts.create({
        alert_type: 'suspicious_traffic',
        severity: aiAnalysis.overall_risk_level === 'high' ? 'high' : aiAnalysis.overall_risk_level === 'critical' ? 'critical' : 'info',
        source_url: TARGET_URL,
        description: `AI Security Assessment — Risk Score: ${aiAnalysis.overall_risk_score}/100 (${aiAnalysis.overall_risk_level}). Attack vectors: ${(aiAnalysis.attack_vectors || []).slice(0, 3).join('; ')}`,
        recommendation: (aiAnalysis.plugin_recommendations || []).join('\n'),
        status: 'open',
        detected_at: today,
        raw_data: JSON.stringify(aiAnalysis),
      });
    }

    return Response.json({
      success: true,
      alerts_found: alerts.length,
      risk_score: aiAnalysis?.overall_risk_score,
      risk_level: aiAnalysis?.overall_risk_level,
      ai_analysis: aiAnalysis,
      scan_summary: results.map(r => ({ check: r.check.name, status: r.result.status })),
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});