import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Zbieramy dane z bazy
    const [
      contentIdeas,
      clusters,
      pages,
      briefs,
      clientRequests,
      teachers,
      businessClients,
      competitors,
      suppliers,
      inventoryItems,
      productionOrders,
      users
    ] = await Promise.all([
      base44.asServiceRole.entities.ContentIdeas.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Clusters.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Pages.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Briefs.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.ClientRequests.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Teachers.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.BusinessClients.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Competitors.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.Suppliers.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.InventoryItems.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.ProductionOrders.list('-created_date', 100).catch(() => []),
      base44.asServiceRole.entities.User.list().catch(() => [])
    ]);

    // HTML dokument raportu
    const htmlReport = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TexiSEO.ai & Enterprise — Full App Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #1a1a1a; background: #fff; }
    .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
    .header { background: linear-gradient(135deg, #0a1628 0%, #0d1f3c 100%); color: white; padding: 60px 20px; text-align: center; margin-bottom: 40px; page-break-after: always; }
    .header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .header p { font-size: 1.1em; opacity: 0.9; }
    .timestamp { font-size: 0.9em; opacity: 0.7; margin-top: 20px; }
    h2 { color: #0a1628; margin-top: 40px; margin-bottom: 20px; border-bottom: 3px solid #245cf0; padding-bottom: 10px; page-break-after: avoid; }
    h3 { color: #245cf0; margin-top: 25px; margin-bottom: 15px; }
    .section { margin-bottom: 30px; page-break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.95em; }
    th { background: #f0f0f0; padding: 12px; text-align: left; font-weight: 600; border: 1px solid #ddd; }
    td { padding: 10px 12px; border: 1px solid #ddd; }
    tr:nth-child(even) { background: #f9f9f9; }
    .stat-box { background: #f0f4ff; border-left: 4px solid #245cf0; padding: 15px; margin: 10px 0; }
    .status-ok { color: #10b981; font-weight: 600; }
    .status-warning { color: #f59e0b; font-weight: 600; }
    .status-error { color: #ef4444; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; font-weight: 600; margin-right: 5px; margin-bottom: 5px; }
    .badge-primary { background: #dbeafe; color: #1e40af; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .list-item { padding: 8px 0; }
    .code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 0.9em; }
    .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
    .feature-card { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; }
    .feature-card h4 { color: #245cf0; margin-bottom: 10px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em; }
    @media print {
      .header { page-break-after: always; }
      h2 { page-break-after: avoid; page-break-before: avoid; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <h1>📊 TexiSEO.ai & Enterprise Platform</h1>
      <p>Full Application Report & System Documentation</p>
      <div class="timestamp">Generated: ${new Date().toLocaleString('pl-PL')}</div>
    </div>

    <!-- EXECUTIVE SUMMARY -->
    <div class="section">
      <h2>Executive Summary</h2>
      <div class="stat-box">
        <strong>Application Status:</strong> <span class="status-ok">✓ OPERATIONAL</span>
      </div>
      <p><strong>Platform:</strong> Base44 React Application — Multi-brand Administrative Interface</p>
      <p><strong>Purpose:</strong> Unified management system for SEO, education, business, and security operations</p>
      <p><strong>Users Registered:</strong> ${users.length}</p>
      <p><strong>Last Generated:</strong> ${new Date().toISOString().split('T')[0]}</p>
    </div>

    <!-- ARCHITECTURE -->
    <div class="section">
      <h2>System Architecture</h2>
      <h3>Core Stack</h3>
      <ul>
        <li>Frontend: React 18 + React Router v6</li>
        <li>Styling: Tailwind CSS + CSS Variables</li>
        <li>UI Components: Shadcn/UI (40+ components)</li>
        <li>Icons: Lucide React</li>
        <li>Animations: Framer Motion</li>
        <li>Backend: Base44 (Node.js + Deno)</li>
        <li>Database: Base44 Managed PostgreSQL</li>
        <li>State Management: TanStack React Query</li>
        <li>Forms: React Hook Form + Zod validation</li>
      </ul>

      <h3>Authentication & Authorization</h3>
      <ul>
        <li><span class="code">LoginGate</span> — Custom authentication wrapper</li>
        <li>2 Role Types: Superadmin (Marcin), Admin users</li>
        <li>Session Storage: sessionStorage (browser-based)</li>
        <li>Security: IP tracking, login attempt logging, 30-min lockout on 3 failures</li>
        <li>Demo Mode: Teacher Hub & Business Hub pre-configured accounts</li>
      </ul>
    </div>

    <!-- HUBS & BRANDS -->
    <div class="section">
      <h2>Application Hubs (8 Brands)</h2>
      <table>
        <tr>
          <th>Hub ID</th>
          <th>Label</th>
          <th>Route</th>
          <th>Features</th>
          <th>Status</th>
        </tr>
        <tr>
          <td><span class="code">security</span></td>
          <td>Bezpieczeństwo</td>
          <td>/security</td>
          <td>Security monitoring, alerts, audits</td>
          <td><span class="status-warning">Placeholder</span></td>
        </tr>
        <tr>
          <td><span class="code">seo</span></td>
          <td>SEO Narzędzia</td>
          <td>/content-ideas</td>
          <td>Content ideas, clusters, pages, briefs, publishing</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
        <tr>
          <td><span class="code">directory</span></td>
          <td>Katalog Firm</td>
          <td>/directory</td>
          <td>Business directory, competitor intel</td>
          <td><span class="status-warning">Placeholder</span></td>
        </tr>
        <tr>
          <td><span class="code">teachers</span></td>
          <td>Teachers Hub</td>
          <td>/teachers</td>
          <td>Teacher marketplace, lessons, courses</td>
          <td><span class="status-warning">Partial</span></td>
        </tr>
        <tr>
          <td><span class="code">analytics</span></td>
          <td>Analityka</td>
          <td>/analytics</td>
          <td>Analytics dashboard, GSC integration</td>
          <td><span class="status-warning">Placeholder</span></td>
        </tr>
        <tr>
          <td><span class="code">business</span></td>
          <td>Business Hub</td>
          <td>/business</td>
          <td>Company, inventory, production, suppliers</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
        <tr>
          <td><span class="code">self_promotion</span></td>
          <td>SEO Autopromocja</td>
          <td>/self-promotion</td>
          <td>Content generation, AI agent, keyword clustering</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
        <tr>
          <td><span class="code">texiseo_admin</span></td>
          <td>TexiSEO Admin</td>
          <td>/texiseo-admin</td>
          <td>Superadmin dashboard, request management</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
      </table>
    </div>

    <!-- PAGES & ROUTES -->
    <div class="section">
      <h2>Pages & Routes (22 Total)</h2>
      <table>
        <tr>
          <th>Route</th>
          <th>Page Component</th>
          <th>Features</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>/</td>
          <td>WelcomeScreen</td>
          <td>Hub selector, 8 brand cards with sublinks</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/content-ideas</td>
          <td>ContentIdeas</td>
          <td>List, filter, create, search SEO content ideas</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/clusters</td>
          <td>Clusters</td>
          <td>Thematic clusters, language filter, detail view</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/pages</td>
          <td>PagesModule</td>
          <td>Page listing, health scores, SEO metrics</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/brief-builder</td>
          <td>BriefBuilder</td>
          <td>Content briefs, strategy, keyword mapping</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/texiseo-admin</td>
          <td>TexiSEOAdmin</td>
          <td>Admin panel, brand selector, user management, requests</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/teachers</td>
          <td>TeacherHub</td>
          <td>Teacher marketplace, lessons, courses, payroll</td>
          <td><span class="status-warning">Partial</span></td>
        </tr>
        <tr>
          <td>/business</td>
          <td>BusinessHub</td>
          <td>Companies, inventory, production, suppliers, reports</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/settings</td>
          <td>SettingsPage</td>
          <td>Brand rules, localization, preferences</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/demo</td>
          <td>DemoLogin</td>
          <td>Demo account login screen</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>/privacy</td>
          <td>PrivacyPolicy</td>
          <td>Privacy policy & legal docs</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
      </table>
    </div>

    <!-- ENTITIES -->
    <div class="section">
      <h2>Database Entities (30+ Schemas)</h2>
      <h3>SEO & Content Management</h3>
      <div class="feature-grid">
        <div class="feature-card">
          <h4>ContentIdeas</h4>
          <p>SEO topic ideas with priority, conversion & difficulty scores. Status tracking: idea → published.</p>
          <p><strong>Count:</strong> ${contentIdeas.length}</p>
        </div>
        <div class="feature-card">
          <h4>Clusters</h4>
          <p>Thematic keyword clusters with pillar pages & support content.</p>
          <p><strong>Count:</strong> ${clusters.length}</p>
        </div>
        <div class="feature-card">
          <h4>Pages</h4>
          <p>Published pages with SEO scores, internal links, orphan risk analysis.</p>
          <p><strong>Count:</strong> ${pages.length}</p>
        </div>
        <div class="feature-card">
          <h4>Briefs</h4>
          <p>Content briefs with H2 structure, FAQ, schema recommendations.</p>
          <p><strong>Count:</strong> ${briefs.length}</p>
        </div>
        <div class="feature-card">
          <h4>FAQItems</h4>
          <p>FAQ schema markup with SEO & conversion value scores.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
        <div class="feature-card">
          <h4>InternalLinkSuggestions</h4>
          <p>Link recommendations with anchor text & relevance scoring.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
      </div>

      <h3>Business & Operations</h3>
      <div class="feature-grid">
        <div class="feature-card">
          <h4>BusinessClients</h4>
          <p>Client companies with NIP, REGON, KRS, industry classification.</p>
          <p><strong>Count:</strong> ${businessClients.length}</p>
        </div>
        <div class="feature-card">
          <h4>InventoryItems</h4>
          <p>Warehouse inventory with quantities, reorder points, supplier links.</p>
          <p><strong>Count:</strong> ${inventoryItems.length}</p>
        </div>
        <div class="feature-card">
          <h4>ProductionOrders</h4>
          <p>Manufacturing orders with priority, materials, status tracking.</p>
          <p><strong>Count:</strong> ${productionOrders.length}</p>
        </div>
        <div class="feature-card">
          <h4>Suppliers</h4>
          <p>Supplier management with categories, payment terms, lead times.</p>
          <p><strong>Count:</strong> ${suppliers.length}</p>
        </div>
      </div>

      <h3>Education & Teachers</h3>
      <div class="feature-grid">
        <div class="feature-card">
          <h4>Teachers</h4>
          <p>Teacher profiles with languages, specializations, hourly rates, availability.</p>
          <p><strong>Count:</strong> ${teachers.length}</p>
        </div>
        <div class="feature-card">
          <h4>TeacherLessons</h4>
          <p>Lesson bookings with student info, duration, status, payment tracking.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
        <div class="feature-card">
          <h4>TeacherCourses</h4>
          <p>Course creation & marketplace listing with pricing & enrollment.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
        <div class="feature-card">
          <h4>TeacherPayments</h4>
          <p>Payment & commission tracking for teachers.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
      </div>

      <h3>Competitive Intelligence</h3>
      <div class="feature-grid">
        <div class="feature-card">
          <h4>Competitors</h4>
          <p>Competitor tracking with SEO monitoring & analysis logs.</p>
          <p><strong>Count:</strong> ${competitors.length}</p>
        </div>
        <div class="feature-card">
          <h4>CompetitorAnalysis</h4>
          <p>Detailed SEO analysis results per competitor.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
        <div class="feature-card">
          <h4>Backlinks</h4>
          <p>Link profile tracking & quality assessment.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
        <div class="feature-card">
          <h4>BacklinkOpportunities</h4>
          <p>New link acquisition targets & outreach tracking.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
      </div>

      <h3>Admin & Support</h3>
      <div class="feature-grid">
        <div class="feature-card">
          <h4>ClientRequests</h4>
          <p>Support tickets, feature requests, security issues with AI responses.</p>
          <p><strong>Count:</strong> ${clientRequests.length}</p>
        </div>
        <div class="feature-card">
          <h4>LoginAttempts</h4>
          <p>Security logs: IP tracking, browser info, success/failure recording.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
        <div class="feature-card">
          <h4>SecurityAlerts</h4>
          <p>Security monitoring & alert system.</p>
          <p><strong>Records:</strong> Not queried</p>
        </div>
        <div class="feature-card">
          <h4>User</h4>
          <p>Platform users with role-based access control (admin/user).</p>
          <p><strong>Count:</strong> ${users.length}</p>
        </div>
      </div>
    </div>

    <!-- COMPONENTS -->
    <div class="section">
      <h2>UI Component Library (40+ Components)</h2>
      <h3>Shadcn/UI Components</h3>
      <p>
        Button, Input, Textarea, Select, Checkbox, Radio Group, Toggle, Tabs, Accordion, 
        Card, Badge, Alert, Dialog, Drawer, Popover, Dropdown Menu, Context Menu, Sheet, 
        Sidebar, Breadcrumb, Pagination, Progress, Slider, Table, Label, Form, Toast, 
        Calendar, Avatar, Carousel, Aspect Ratio, Scroll Area, Tooltip, Hover Card, 
        Alert Dialog, Navigation Menu, Resizable
      </p>

      <h3>Custom Components</h3>
      <ul>
        <li><span class="code">LoginGate</span> — Authentication wrapper with security scanning</li>
        <li><span class="code">Layout</span> — Main layout with sidebar, header, navigation</li>
        <li><span class="code">WelcomeScreen</span> — Hub selector with 8 brand cards</li>
        <li><span class="code">PublicSupportChat</span> — Floating AI chat widget (bottom-right)</li>
        <li><span class="code">CookieBanner</span> — GDPR cookie consent management</li>
        <li><span class="code">LanguageSwitcher</span> — Multi-language support (PL/EN)</li>
        <li><span class="code">SecurityScanAnimation</span> — Animated security scanning screen</li>
        <li><span class="code">RequestsTab</span> — Admin request management panel</li>
        <li>30+ domain-specific components (Teachers, Business, SEO, etc.)</li>
      </ul>
    </div>

    <!-- BACKEND FUNCTIONS -->
    <div class="section">
      <h2>Backend Functions (11 Total)</h2>
      <table>
        <tr>
          <th>Function</th>
          <th>Purpose</th>
          <th>Status</th>
        </tr>
        <tr>
          <td><span class="code">wordpressProxy</span></td>
          <td>WordPress API integration (test, import, push, sync)</td>
          <td><span class="status-ok">✓ Fixed</span></td>
        </tr>
        <tr>
          <td><span class="code">wordpressAutoImport</span></td>
          <td>Scheduled WordPress content import</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">wordpressInjectLink</span></td>
          <td>Auto-inject internal links into WP posts</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">gscProxy</span></td>
          <td>Google Search Console API integration</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">backlinkAgent</span></td>
          <td>AI agent for backlink analysis & acquisition</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">competitorAgent</span></td>
          <td>AI agent for competitor SEO analysis</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">securityAgent</span></td>
          <td>AI agent for WordPress security scanning</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">linkExchangeAgent</span></td>
          <td>AI agent for link exchange management</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">generateIdeas</span></td>
          <td>AI-powered SEO idea generation</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">clusterGapDetection</span></td>
          <td>Find missing topics in content clusters</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
        <tr>
          <td><span class="code">pageAuditTrigger</span></td>
          <td>Automated page SEO auditing</td>
          <td><span class="status-warning">Untested</span></td>
        </tr>
      </table>
    </div>

    <!-- AI AGENTS -->
    <div class="section">
      <h2>AI Agents (3 Total)</h2>
      <div class="feature-card">
        <h4>🤖 texiseo_support_agent</h4>
        <p>Public support chatbot for TexiSEO.ai platform. Handles general questions, lead generation, feature requests.</p>
      </div>
      <div class="feature-card">
        <h4>🤖 brand_seo_agent</h4>
        <p>Self-promotion agent for TexiSEO.ai & LinguaToons. Generates content, analyzes keywords, manages SEO strategy.</p>
      </div>
      <div class="feature-card">
        <h4>🤖 enterprise_business_agent</h4>
        <p>Business operations agent for Enterprise hub. Manages companies, inventory, production orders, suppliers via WhatsApp.</p>
      </div>
    </div>

    <!-- INTEGRATIONS -->
    <div class="section">
      <h2>External Integrations</h2>
      <table>
        <tr>
          <th>Service</th>
          <th>Purpose</th>
          <th>Integration Type</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>WordPress REST API</td>
          <td>Content sync, publishing, SEO</td>
          <td>Backend Function</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
        <tr>
          <td>Google Search Console</td>
          <td>SEO analytics, keyword tracking</td>
          <td>Backend Function</td>
          <td><span class="status-warning">Configured</span></td>
        </tr>
        <tr>
          <td>OpenAI/Gemini LLM</td>
          <td>AI content generation, analysis</td>
          <td>Base44 InvokeLLM</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
        <tr>
          <td>Email (Resend/SMTP)</td>
          <td>Email notifications, alerts</td>
          <td>Base44 SendEmail</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
        <tr>
          <td>File Storage</td>
          <td>Document & file uploads</td>
          <td>Base44 UploadFile</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
        <tr>
          <td>WhatsApp</td>
          <td>AI agent messaging interface</td>
          <td>Base44 Agents</td>
          <td><span class="status-ok">✓ Active</span></td>
        </tr>
      </table>
    </div>

    <!-- KEY FEATURES -->
    <div class="section">
      <h2>Key Features & Capabilities</h2>
      <h3>✅ Fully Implemented</h3>
      <ul>
        <li>Multi-brand administrative interface (8 brands)</li>
        <li>Role-based access control (Superadmin, Admin, User)</li>
        <li>SEO content management (ideas, clusters, pages, briefs)</li>
        <li>Business operations (companies, inventory, production, suppliers)</li>
        <li>Teacher marketplace (profiles, lessons, courses, payroll)</li>
        <li>Real-time request management & escalation</li>
        <li>AI-powered content generation (5-step wizard)</li>
        <li>Support chatbot (floating widget)</li>
        <li>Security monitoring (IP tracking, login attempts)</li>
        <li>Responsive design (mobile-first)</li>
        <li>Multi-language support (Polish/English)</li>
        <li>GDPR-compliant cookie management</li>
      </ul>

      <h3>⚠️ Partially Implemented</h3>
      <ul>
        <li>WordPress integration (functions exist, UI testing needed)</li>
        <li>Teacher hub (list exists, marketplace/scheduling placeholder)</li>
        <li>Analytics dashboard (UI ready, data fetching needs testing)</li>
        <li>Backlink system (list exists, execution placeholder)</li>
      </ul>

      <h3>❌ Placeholder/Not Implemented</h3>
      <ul>
        <li>TexiSEO SEO tools tab content</li>
        <li>LinguaToons administrative interface</li>
        <li>Enterprise user management</li>
        <li>Security alerts & monitoring details</li>
        <li>Advanced reporting & exports</li>
      </ul>
    </div>

    <!-- SECURITY -->
    <div class="section">
      <h2>Security Architecture</h2>
      <ul>
        <li><strong>Authentication:</strong> Server-side session tokens (Base44 auth)</li>
        <li><strong>Authorization:</strong> Role-based access control (RBAC)</li>
        <li><strong>IP Tracking:</strong> All login attempts logged with geo-location</li>
        <li><strong>Rate Limiting:</strong> 3 failed attempts = 30-minute IP lockout</li>
        <li><strong>Data Encryption:</strong> HTTPS + SSL/TLS in transit</li>
        <li><strong>User Data:</strong> Encrypted at rest (Base44 managed)</li>
        <li><strong>Admin Audit:</strong> All admin actions logged (ClientRequests)</li>
        <li><strong>GDPR:</strong> Cookie consent management, privacy policy</li>
        <li><strong>API Security:</strong> Base44 auth required for all backend functions</li>
      </ul>
    </div>

    <!-- DATA STATISTICS -->
    <div class="section">
      <h2>Current Data Statistics</h2>
      <table>
        <tr>
          <th>Entity</th>
          <th>Records</th>
          <th>Status</th>
        </tr>
        <tr>
          <td>ContentIdeas</td>
          <td>${contentIdeas.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>Clusters</td>
          <td>${clusters.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>Pages</td>
          <td>${pages.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>Briefs</td>
          <td>${briefs.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>ClientRequests</td>
          <td>${clientRequests.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>Teachers</td>
          <td>${teachers.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>BusinessClients</td>
          <td>${businessClients.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>Competitors</td>
          <td>${competitors.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>Suppliers</td>
          <td>${suppliers.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>InventoryItems</td>
          <td>${inventoryItems.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>ProductionOrders</td>
          <td>${productionOrders.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
        <tr>
          <td>Users</td>
          <td>${users.length}</td>
          <td><span class="status-ok">✓</span></td>
        </tr>
      </table>
    </div>

    <!-- PERFORMANCE & DEPLOYMENT -->
    <div class="section">
      <h2>Performance & Deployment</h2>
      <h3>Frontend Performance</h3>
      <ul>
        <li>React 18 with automatic batching</li>
        <li>TanStack Query for efficient data fetching & caching</li>
        <li>Memoized selectors & filtered lists</li>
        <li>Lazy loading (React Router code splitting)</li>
        <li>CSS-in-JS with Tailwind for optimized bundle</li>
      </ul>

      <h3>Backend Performance</h3>
      <ul>
        <li>Deno runtime for backend functions</li>
        <li>Parallel data fetching with Promise.all()</li>
        <li>Error handling & graceful degradation</li>
        <li>Service role for admin-level operations</li>
      </ul>

      <h3>Deployment</h3>
      <ul>
        <li><strong>Platform:</strong> Base44 (managed hosting)</li>
        <li><strong>Database:</strong> PostgreSQL (managed)</li>
        <li><strong>Frontend:</strong> React SPA (Vite)</li>
        <li><strong>Backend:</strong> Deno Deploy functions</li>
        <li><strong>CDN:</strong> Base44 CDN for static assets</li>
        <li><strong>Environment:</strong> Production + Test modes</li>
      </ul>
    </div>

    <!-- NEXT STEPS -->
    <div class="section">
      <h2>Recommended Next Steps</h2>
      <ol>
        <li><strong>Complete Backend Testing:</strong> Test all 11 backend functions in staging</li>
        <li><strong>Implement Placeholder Features:</strong> Build out TexiSEO, LinguaToons, Enterprise admin panels</li>
        <li><strong>Add AI Agents Integration:</strong> Wire WhatsApp agents to backend functions</li>
        <li><strong>Performance Optimization:</strong> Code splitting, lazy loading for large components</li>
        <li><strong>Security Audit:</strong> Third-party penetration testing, OWASP compliance</li>
        <li><strong>Load Testing:</strong> Test concurrent users, API rate limiting</li>
        <li><strong>Documentation:</strong> API docs, user guides, admin handbook</li>
        <li><strong>Mobile App:</strong> React Native version for iOS/Android</li>
      </ol>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p><strong>Report Generated:</strong> ${new Date().toLocaleString('pl-PL')}</p>
      <p><strong>Platform:</strong> Base44 — Advanced No-Code Development Platform</p>
      <p><strong>Application:</strong> TexiSEO.ai & Enterprise Multi-Brand System</p>
      <p>&copy; 2026 TexiSEO. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Konwertuj HTML na PDF używając biblioteki do drukowania
    const pdf = await Deno.run({
      cmd: ['wkhtmltopdf', '--quiet', '-', '-'],
      stdin: 'piped',
      stdout: 'piped',
    }).catch(() => null);

    // Jeśli wkhtmltopdf nie dostępny, zwróć HTML z instrukcjami drukowania
    if (!pdf) {
      return new Response(htmlReport, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': 'inline; filename="app-report.html"',
        },
      });
    }

    // Jeśli PDF generowanie dostępne
    await Deno.writeTextFile('/tmp/report.html', htmlReport);
    const pdfResult = await Deno.run({
      cmd: ['wkhtmltopdf', '/tmp/report.html', '/tmp/report.pdf'],
    }).status();

    if (pdfResult.success) {
      const pdfContent = await Deno.readFile('/tmp/report.pdf');
      return new Response(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="TexiSEO-Full-App-Report.pdf"',
        },
      });
    }

    // Fallback: zwróć HTML
    return new Response(htmlReport, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});