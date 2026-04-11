import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Globe, BarChart3, Search, Calendar, Radio, CheckCircle2, AlertCircle, Clock, ExternalLink, Loader2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "wordpress", label: "WordPress", icon: Globe },
  { id: "gsc", label: "Search Console", icon: Search },
  { id: "analytics", label: "Analityka", icon: BarChart3 },
  { id: "serp", label: "Śledzenie SERP", icon: Radio },
  { id: "calendar", label: "Kalendarz treści", icon: Calendar },
];

const STATUS_BADGE = {
  connected: { label: "Połączony", color: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  ready: { label: "Gotowy do połączenia", color: "bg-blue-50 text-blue-700", icon: Clock },
  planned: { label: "Planowane", color: "bg-slate-100 text-slate-500", icon: Clock },
  error: { label: "Błąd", color: "bg-red-50 text-red-600", icon: AlertCircle },
};

const INTEGRATION_STATUS = {
  wordpress: "ready", gsc: "ready", analytics: "planned", serp: "planned", calendar: "planned",
};

function Section({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, description, children }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium block mb-0.5">{label}</label>
      {description && <p className="text-[10px] text-muted-foreground mb-1">{description}</p>}
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.planned;
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded", s.color)}>
      <s.icon className="h-3 w-3" />{s.label}
    </span>
  );
}

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("wordpress");
  const [wpSettings, setWpSettings] = useState({ site_url: "", api_endpoint: "/wp-json/wp/v2", auth_method: "application_password", username: "", password: "", default_status: "draft", post_type: "post" });
  const [gscSettings, setGscSettings] = useState({ property_url: "", auth_method: "oauth", data_range: "28" });
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    base44.entities.WordPressSettings.list().then(list => {
      if (list[0]) {
        setSettingsId(list[0].id);
        setWpSettings(p => ({
          ...p,
          site_url: list[0].site_url || "",
          api_endpoint: list[0].api_base || "/wp-json/wp/v2",
          username: list[0].username || "",
          password: list[0].app_password || "",
          default_status: list[0].default_post_status || "draft",
        }));
      }
    });
  }, []);
  const [testDialog, setTestDialog] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  const handleTest = async () => {
    if (!wpSettings.site_url) {
      setTestResult(null);
      setTestError("Wpisz adres URL strony WordPress przed testem połączenia.");
      setTestDialog(true);
      return;
    }
    if (!wpSettings.username || !wpSettings.password) {
      setTestResult(null);
      setTestError("Wpisz nazwę użytkownika i hasło aplikacji przed testem.");
      setTestDialog(true);
      return;
    }
    setTesting(true);
    setTestResult(null);
    setTestError(null);
    try {
      const res = await base44.functions.invoke("wordpressProxy", {
        action: "test_connection",
        settings: {
          site_url: wpSettings.site_url,
          api_base: wpSettings.api_endpoint,
          username: wpSettings.username,
          app_password: wpSettings.password,
        },
      });
      setTestResult(res.data || res);
    } catch (err) {
      setTestError(err?.message || "Nie udało się wywołać funkcji testowej.");
    }
    setTesting(false);
    setTestDialog(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      site_url: wpSettings.site_url,
      api_base: wpSettings.api_endpoint,
      username: wpSettings.username,
      app_password: wpSettings.password,
      default_post_status: wpSettings.default_status,
      default_page_status: wpSettings.default_status,
    };
    if (settingsId) {
      await base44.entities.WordPressSettings.update(settingsId, data);
    } else {
      const rec = await base44.entities.WordPressSettings.create(data);
      setSettingsId(rec.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1000px] mx-auto">
      <PageHeader title="Integracje" description="Połączenia z zewnętrznymi serwisami i ustawienia synchronizacji danych" />

      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit mb-5 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
            <StatusBadge status={INTEGRATION_STATUS[t.id]} />
          </button>
        ))}
      </div>

      {activeTab === "wordpress" && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-xs text-blue-800">
            <strong>WordPress REST API Integration</strong> — Connect Linguatoons' WordPress site to push content directly from briefs and the Publishing Queue. Requires the Application Passwords feature enabled on WordPress (included since WP 5.6).
          </div>
          <Section title="Connection Settings">
            <Field label="WordPress Site URL" description="The root URL of your WordPress installation">
              <Input value={wpSettings.site_url} onChange={e => setWpSettings(p => ({ ...p, site_url: e.target.value }))} placeholder="https://linguatoons.com" className="text-xs" />
            </Field>
            <Field label="API Endpoint" description="REST API base path (default is correct for standard WP installs)">
              <Input value={wpSettings.api_endpoint} onChange={e => setWpSettings(p => ({ ...p, api_endpoint: e.target.value }))} className="text-xs font-mono" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="WordPress Username">
                <Input value={wpSettings.username} onChange={e => setWpSettings(p => ({ ...p, username: e.target.value }))} placeholder="admin" className="text-xs" />
              </Field>
              <Field label="Application Password" description="Generate in WP Admin → Users → Your Profile">
                <Input type="password" value={wpSettings.password} onChange={e => setWpSettings(p => ({ ...p, password: e.target.value }))} placeholder="xxxx xxxx xxxx xxxx" className="text-xs" />
              </Field>
            </div>
          </Section>

          <Section title="Publishing Rules">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Default Post Status">
                <Select value={wpSettings.default_status} onValueChange={v => setWpSettings(p => ({ ...p, default_status: v }))}>
                  <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (recommended)</SelectItem>
                    <SelectItem value="publish">Publish immediately</SelectItem>
                    <SelectItem value="pending">Pending review</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Default Post Type">
                <Select value={wpSettings.post_type} onValueChange={v => setWpSettings(p => ({ ...p, post_type: v }))}>
                  <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post (Blog)</SelectItem>
                    <SelectItem value="page">Page</SelectItem>
                    <SelectItem value="custom">Custom Post Type</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="Content Mapping">
            <div className="space-y-2 text-xs">
              {[
                { from: "brief.brief_title", to: "post.title", note: "Direct mapping" },
                { from: "brief.meta_description", to: "post.excerpt", note: "Direct mapping" },
                { from: "brief.slug", to: "post.slug", note: "Stripped of leading slash" },
                { from: "brief.language", to: "post.lang (WPML/Polylang)", note: "Requires multilingual plugin" },
                { from: "brief.page_type", to: "post.category", note: "Mapped via category rules below" },
                { from: "brief.primary_keyword", to: "Yoast SEO focus keyword", note: "Requires Yoast plugin" },
                { from: "brief.meta_title", to: "Yoast SEO title", note: "Requires Yoast plugin" },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary/40 rounded px-3 py-1.5">
                  <span className="font-mono text-primary flex-shrink-0">{m.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono flex-shrink-0">{m.to}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{m.note}</span>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs gap-1.5" onClick={handleTest} disabled={testing}>
              {testing && <Loader2 className="h-3 w-3 animate-spin" />}
              {testing ? "Testuję połączenie…" : "Test Connection"}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className={`text-xs ${saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}>{saving ? "Zapisuję…" : saved ? "✓ Zapisano" : "Save Settings"}</Button>
          </div>

          <Dialog open={testDialog} onOpenChange={setTestDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {testError ? (
                    <><AlertCircle className="h-5 w-5 text-amber-500" />Błąd konfiguracji</>
                  ) : testResult?.status === "connected" ? (
                    <><CheckCircle2 className="h-5 w-5 text-emerald-500" />Połączono pomyślnie!</>
                  ) : (
                    <><XCircle className="h-5 w-5 text-red-500" />Połączenie nieudane</>
                  )}
                </DialogTitle>
              </DialogHeader>

              {testError && (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">{testError}</div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1"><Info className="h-3.5 w-3.5" />Panel WordPress Linguatoons:</p>
                    <a href="https://linguatoons.com/logowanie" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-blue-700 hover:underline">
                      linguatoons.com/logowanie <ExternalLink className="h-3 w-3" />
                    </a>
                    <p className="mt-1">Po zalogowaniu: <strong>Użytkownicy → Twój profil → Hasła aplikacji</strong></p>
                  </div>
                </div>
              )}

              {!testError && testResult && (() => {
                const c = testResult.checks || {};
                const checks_list = [
                  { label: "Strona WordPress osiągalna", ok: c.site_reachable, hint: "Sprawdź czy URL jest poprawny" },
                  { label: "REST API osiągalne", ok: c.api_reachable, hint: "REST API może być zablokowane przez plugin bezpieczeństwa" },
                  { label: "Dane uwierzytelniające poprawne", ok: c.auth_valid, hint: "Użyj Hasła Aplikacji, nie hasła do konta WP!" },
                  { label: "Dostęp do odczytu", ok: c.can_read, hint: "Konto nie ma wystarczających uprawnień" },
                  { label: "Dostęp do zapisu", ok: c.can_write, hint: "Wymagana rola Edytora lub Admina" },
                ];
                const failed = checks_list.filter(ch => !ch.ok);
                return (
                  <div className="space-y-3">
                    <div className={`rounded-lg p-3 text-xs border ${testResult.status === "connected" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}>
                      {testResult.status === "connected"
                        ? "Wszystkie testy przeszły. System może komunikować się z WordPress."
                        : "Wykryto problemy. Sprawdź szczegóły poniżej."}
                    </div>
                    <div className="space-y-2">
                      {checks_list.map(ch => (
                        <div key={ch.label} className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${ch.ok ? "bg-emerald-50" : "bg-red-50"}`}>
                          {ch.ok
                            ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            : <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />}
                          <div>
                            <p className={`font-medium ${ch.ok ? "text-emerald-800" : "text-red-800"}`}>{ch.label}</p>
                            {!ch.ok && <p className="text-red-600 mt-0.5">{ch.hint}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                    {failed.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-800 space-y-1">
                        <p className="font-semibold flex items-center gap-1"><Info className="h-3.5 w-3.5" />Jak naprawić?</p>
                        <p>1. Zaloguj się: <a href="https://linguatoons.com/logowanie" target="_blank" rel="noopener noreferrer" className="font-mono underline">linguatoons.com/logowanie</a></p>
                        <p>2. Przejdź: <strong>Użytkownicy → Twój profil → Hasła aplikacji</strong></p>
                        <p>3. Utwórz nowe hasło o nazwie <em>"Base44 SEO OS"</em> i wklej powyżej</p>
                        <p>4. Upewnij się że REST API nie jest blokowane</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </DialogContent>
          </Dialog>
        </>
      )}

      {activeTab === "gsc" && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-xs text-blue-800">
            <strong>Google Search Console Integration</strong> — Pull real impressions, clicks, average position, and CTR data per page. Match live performance data to your Pages and Content Ideas for data-driven decisions.
          </div>
          <Section title="Property Settings">
            <Field label="Property URL" description="The verified GSC property URL for Linguatoons">
              <Input value={gscSettings.property_url} onChange={e => setGscSettings(p => ({ ...p, property_url: e.target.value }))} placeholder="https://linguatoons.com" className="text-xs" />
            </Field>
            <Field label="Default Data Range (days)">
              <Select value={gscSettings.data_range} onValueChange={v => setGscSettings(p => ({ ...p, data_range: v }))}>
                <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="28">Last 28 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </Section>
          <Section title="Planned Metrics Mapping">
            <div className="space-y-2 text-xs">
              {[
                { metric: "impressions", target: "Pages.impressions_count", status: "planned" },
                { metric: "clicks", target: "Pages.clicks_count", status: "planned" },
                { metric: "average_position", target: "Pages.avg_position", status: "planned" },
                { metric: "ctr", target: "Pages.ctr", status: "planned" },
                { metric: "top_queries", target: "ContentIdeas.primary_keyword matching", status: "planned" },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 bg-secondary/40 rounded px-3 py-1.5">
                  <span className="font-mono text-blue-700">{m.metric}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono text-xs">{m.target}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-auto">{m.status}</span>
                </div>
              ))}
            </div>
          </Section>
          <div className="flex items-center gap-2 mt-1">
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1">
              Open Search Console <ExternalLink className="h-3 w-3" />
            </a>
            <Button size="sm" className="text-xs ml-auto" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Settings"}</Button>
          </div>
        </>
      )}

      {activeTab === "analytics" && (
        <Section title="Analytics Integration (Planned)">
          <p className="text-xs text-muted-foreground mb-4">Connect Google Analytics 4 or a compatible analytics provider to pull page-level performance data into TexiSEO.</p>
          <div className="space-y-2">
            {[
              { capability: "Page-level traffic trends", use: "Feed into Pages.refresh_score decay signals", status: "planned" },
              { capability: "Conversion event tracking", use: "Map trial lesson bookings to content attribution", status: "planned" },
              { capability: "Audience demographic data", use: "Validate ContentIdeas.audience assignments", status: "planned" },
              { capability: "Landing page performance", use: "Surface in Dashboard top opportunities widget", status: "planned" },
              { capability: "Exit rate by page", use: "Flag high-exit pages for CTA refresh tasks", status: "planned" },
            ].map((c, i) => (
              <div key={i} className="bg-secondary/40 rounded px-3 py-2 flex items-start gap-3 text-xs">
                <div className="flex-1">
                  <p className="font-semibold">{c.capability}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{c.use}</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex-shrink-0">{c.status}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {activeTab === "serp" && (
        <Section title="SERP Tracking (Planned)">
          <p className="text-xs text-muted-foreground mb-4">Future integration with a rank tracking provider (e.g., SERP API, DataForSEO, or SE Ranking) to pull real position data into the Pages and Clusters modules.</p>
          <div className="space-y-2">
            {[
              { item: "Keyword rank tracking per Page", note: "Feeds Pages.trust_score and decay signals" },
              { item: "Cluster keyword coverage map", note: "Feeds Clusters.authority_score" },
              { item: "Competitor gap detection", note: "Identifies new ContentIdeas from SERP gaps" },
              { item: "SERP feature presence (FAQs, snippets)", note: "Validates schema recommendations" },
              { item: "Position trend alerts", note: "Triggers RefreshTasks when position drops" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-secondary/40 rounded px-3 py-2 text-xs">
                <span className="text-primary font-bold mt-0.5">→</span>
                <div><p className="font-medium">{item.item}</p><p className="text-[10px] text-muted-foreground">{item.note}</p></div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {activeTab === "calendar" && (
        <Section title="Content Calendar Sync (Planned)">
          <p className="text-xs text-muted-foreground mb-4">Future sync with Google Calendar, Notion, or a custom calendar to map publishing due dates and review deadlines from the Publishing Queue.</p>
          <div className="space-y-2">
            {[
              { item: "PublishingQueue.due_date → Calendar event", note: "Create draft-due reminders" },
              { item: "PublishingQueue.publish_date → Calendar event", note: "Create publish-target markers" },
              { item: "Status change → Calendar update", note: "Reflect workflow progress in calendar" },
              { item: "Refresh task due dates → Calendar", note: "Surface refresh urgency in planning view" },
              { item: "Cluster sprint planning view", note: "Group queue items by cluster for sprint planning" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 bg-secondary/40 rounded px-3 py-2 text-xs">
                <span className="text-primary font-bold mt-0.5">→</span>
                <div><p className="font-medium">{item.item}</p><p className="text-[10px] text-muted-foreground">{item.note}</p></div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}