import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, BarChart3, Search, Calendar, Radio, CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react";
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
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
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
            <Button size="sm" variant="outline" className="text-xs">Test Connection</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs">{saving ? "Saving…" : "Save Settings"}</Button>
          </div>
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