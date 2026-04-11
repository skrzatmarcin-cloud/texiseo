import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULTS = {
  site_url: "", api_base: "/wp-json/wp/v2", username: "", app_password: "",
  default_post_status: "draft", default_page_status: "draft",
  default_author_id: 1, default_category_id: 1,
  posts_enabled: true, pages_enabled: true, media_enabled: false, sync_active: false,
  slug_controlled_by: "base44",
};

function ToggleField({ label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div>
        <p className="text-xs font-medium">{label}</p>
        {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={cn("h-5 w-9 rounded-full transition-colors flex-shrink-0", value ? "bg-primary" : "bg-secondary border border-border")}>
        <span className={cn("block h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5", value ? "translate-x-4" : "translate-x-0")} />
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 mb-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function WPConnectionSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [settingsId, setSettingsId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    base44.entities.WordPressSettings.list().then(list => {
      if (list[0]) { setSettings({ ...DEFAULTS, ...list[0] }); setSettingsId(list[0].id); }
    });
  }, []);

  const set = (key, val) => setSettings(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    if (settingsId) {
      await base44.entities.WordPressSettings.update(settingsId, settings);
    } else {
      const rec = await base44.entities.WordPressSettings.create(settings);
      setSettingsId(rec.id);
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await base44.functions.invoke("wordpressProxy", { action: "test_connection", settings });
    setTestResult(res.data);
    setTesting(false);
  };

  const checks = testResult?.checks || {};

  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
        <strong>Safe by default:</strong> All publishing operations create <strong>drafts only</strong> unless you explicitly change the status. No content is auto-published or silently overwritten.
      </div>

      <Section title="API Connection">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium block mb-1">WordPress Site URL</label>
            <Input value={settings.site_url} onChange={e => set("site_url", e.target.value)} placeholder="https://linguatoons.com" className="text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">REST API Base Path</label>
            <p className="text-[10px] text-muted-foreground mb-1">Default is correct for standard WordPress installations</p>
            <Input value={settings.api_base} onChange={e => set("api_base", e.target.value)} className="text-xs font-mono" />
          </div>
          <div className="text-[10px] text-muted-foreground space-y-0.5 bg-secondary/50 rounded-lg px-3 py-2">
            <p>Endpoints used: <span className="font-mono">/posts · /pages · /media · /categories · /tags · /users/me</span></p>
          </div>
        </div>
      </Section>

      <Section title="Authentication">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-[11px] text-blue-800">
          Uses WordPress <strong>Application Passwords</strong> (available since WP 5.6). Generate one at: WordPress Admin → Users → Your Profile → Application Passwords.
          <a href="https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 mt-1 hover:underline text-blue-700">
            Setup guide <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium block mb-1">WordPress Username</label>
            <Input value={settings.username} onChange={e => set("username", e.target.value)} placeholder="admin" className="text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Application Password</label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={settings.app_password}
                onChange={e => set("app_password", e.target.value)} placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" className="text-xs pr-8" />
              <button onClick={() => setShowPassword(p => !p)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Connection test results */}
        {testResult && (
          <div className={cn("mt-3 rounded-lg p-3 text-xs border", testResult.status === "connected" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
            <p className="font-semibold mb-2">{testResult.status === "connected" ? "✓ Connection successful" : "✗ Connection issues found"}</p>
            <div className="grid grid-cols-2 gap-1">
              {[
                ["Site reachable", checks.site_reachable],
                ["REST API reachable", checks.api_reachable],
                ["Credentials valid", checks.auth_valid],
                ["Read access", checks.can_read],
                ["Write access", checks.can_write],
              ].map(([label, ok]) => (
                <div key={label} className="flex items-center gap-1.5">
                  {ok ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <XCircle className="h-3 w-3 text-red-500" />}
                  <span className={ok ? "text-emerald-700" : "text-red-700"}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleTest} disabled={testing || !settings.site_url}>
            {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {testing ? "Testing…" : "Test Connection"}
          </Button>
        </div>
      </Section>

      <Section title="Publishing Defaults">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {[
            { label: "Default Post Status", key: "default_post_status" },
            { label: "Default Page Status", key: "default_page_status" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium block mb-1">{f.label}</label>
              <Select value={settings[f.key]} onValueChange={v => set(f.key, v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft (recommended)</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="publish">Publish immediately ⚠</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          <div>
            <label className="text-xs font-medium block mb-1">Slug Controlled By</label>
            <Select value={settings.slug_controlled_by} onValueChange={v => set("slug_controlled_by", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="base44">Base44 (recommended)</SelectItem>
                <SelectItem value="wordpress">WordPress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-0">
          <ToggleField label="Sync Posts" description="Allow importing and pushing blog posts" value={settings.posts_enabled} onChange={v => set("posts_enabled", v)} />
          <ToggleField label="Sync Pages" description="Allow importing and pushing pages" value={settings.pages_enabled} onChange={v => set("pages_enabled", v)} />
          <ToggleField label="Sync Media" description="Enable featured image sync (future)" value={settings.media_enabled} onChange={v => set("media_enabled", v)} />
          <ToggleField label="Active Sync" description="Allow sync operations to run" value={settings.sync_active} onChange={v => set("sync_active", v)} />
        </div>
      </Section>

      <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs">
        {saving ? "Saving…" : "Save Settings"}
      </Button>
    </div>
  );
}