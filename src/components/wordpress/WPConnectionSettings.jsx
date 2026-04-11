import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, ExternalLink, AlertTriangle, Info } from "lucide-react";
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

  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testError, setTestError] = useState(null);

  const handleTest = async () => {
    if (!settings.site_url) {
      setTestResult(null);
      setTestError("Wpisz adres URL strony WordPress przed testem połączenia.");
      setShowTestDialog(true);
      return;
    }
    if (!settings.username || !settings.app_password) {
      setTestResult(null);
      setTestError("Wpisz nazwę użytkownika i hasło aplikacji przed testem połączenia.");
      setShowTestDialog(true);
      return;
    }
    setTesting(true);
    setTestResult(null);
    setTestError(null);
    try {
      const res = await base44.functions.invoke("wordpressProxy", { action: "test_connection", settings });
      setTestResult(res.data || res);
    } catch (err) {
      setTestError(err?.message || "Nie udało się wywołać funkcji testowej. Sprawdź czy backend jest aktywny.");
    }
    setTesting(false);
    setShowTestDialog(true);
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

        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleTest} disabled={testing}>
            {testing ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {testing ? "Testuję połączenie…" : "Test Connection"}
          </Button>
        </div>

        {/* Test Result Dialog */}
        <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {testError ? (
                  <><AlertTriangle className="h-5 w-5 text-amber-500" />Błąd konfiguracji</>
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
                  <p className="font-semibold flex items-center gap-1"><Info className="h-3.5 w-3.5" />Gdzie znaleźć dane?</p>
                  <p>Panel WordPress Linguatoons jest dostępny pod adresem:</p>
                  <a href="https://linguatoons.com/logowanie" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 font-mono text-blue-700 hover:underline">
                    https://linguatoons.com/logowanie <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="mt-1">Po zalogowaniu: <strong>Użytkownicy → Twój profil → Hasła aplikacji</strong></p>
                </div>
              </div>
            )}

            {!testError && testResult && (() => {
              const c = testResult.checks || {};
              const checks_list = [
                { label: "Strona WordPress osiągalna", ok: c.site_reachable, hint: "Sprawdź czy URL jest poprawny (np. https://linguatoons.com)" },
                { label: "REST API osiągalne (/wp-json/wp/v2)", ok: c.api_reachable, hint: "Upewnij się że REST API nie jest zablokowane przez plugin lub .htaccess" },
                { label: "Dane uwierzytelniające poprawne", ok: c.auth_valid, hint: "Sprawdź login i hasło aplikacji — nie używaj hasła do konta, tylko hasło aplikacji!" },
                { label: "Dostęp do odczytu", ok: c.can_read, hint: "Konto nie ma uprawnień do odczytu postów" },
                { label: "Dostęp do zapisu", ok: c.can_write, hint: "Konto nie ma uprawnień Edytora lub Admina" },
              ];
              const failed = checks_list.filter(ch => !ch.ok);
              return (
                <div className="space-y-3">
                  <div className={cn("rounded-lg p-3 text-xs border", testResult.status === "connected" ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
                    {testResult.status === "connected"
                      ? <p className="text-emerald-800">Wszystkie testy przeszły pomyślnie. System może komunikować się z WordPress.</p>
                      : <p className="text-red-800">Wykryto problemy z połączeniem. Sprawdź szczegóły poniżej.</p>
                    }
                  </div>
                  <div className="space-y-2">
                    {checks_list.map(ch => (
                      <div key={ch.label} className={cn("flex items-start gap-2 rounded-lg px-3 py-2 text-xs", ch.ok ? "bg-emerald-50" : "bg-red-50")}>
                        {ch.ok
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          : <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        }
                        <div>
                          <p className={ch.ok ? "text-emerald-800 font-medium" : "text-red-800 font-medium"}>{ch.label}</p>
                          {!ch.ok && <p className="text-red-600 mt-0.5">{ch.hint}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {failed.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-[11px] text-blue-800 space-y-1.5">
                      <p className="font-semibold flex items-center gap-1"><Info className="h-3.5 w-3.5" />Jak naprawić?</p>
                      <p>1. Zaloguj się do WordPress: <a href="https://linguatoons.com/logowanie" target="_blank" rel="noopener noreferrer" className="font-mono underline">linguatoons.com/logowanie</a></p>
                      <p>2. Przejdź: <strong>Użytkownicy → Twój profil → Hasła aplikacji</strong></p>
                      <p>3. Utwórz nowe hasło aplikacji o nazwie np. <em>"Base44 SEO OS"</em></p>
                      <p>4. Wklej wygenerowane hasło w pole <strong>Application Password</strong> powyżej</p>
                      <p>5. Upewnij się, że REST API jest aktywne (sprawdź plugin bezpieczeństwa)</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
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