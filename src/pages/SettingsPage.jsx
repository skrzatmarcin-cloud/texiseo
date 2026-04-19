import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Shield, AlertCircle, Globe, Eye } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang, setLang, showLangSwitcher, setShowLangSwitcher, t } = useLanguage();

  useEffect(() => {
    base44.entities.BrandRules.list().then(r => { setRules(r); setLoading(false); });
  }, []);

  const toggleRule = async (rule) => {
    await base44.entities.BrandRules.update(rule.id, { active: !rule.active });
    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, active: !r.active } : r));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[900px] mx-auto">
      <PageHeader
        title={t.settings || "Ustawienia"}
        description={t.settings_desc || "Język systemu, reguły marki i konfiguracja"}
      />

      {/* Language Settings */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t.language || "Język"} / Language</h3>
        </div>

        {/* Language selector */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">{t.system_language || "Język systemu"}</p>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                  lang === l.code
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary"
                )}
              >
                <span className="text-base">{l.flag}</span>
                {l.label}
                {lang === l.code && <span className="text-[10px] bg-primary text-primary-foreground rounded px-1">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Show/hide mini lang switcher */}
        <div className="flex items-center justify-between py-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium">{t.show_lang_switcher || "Pokaż ikonkę zmiany języka"}</p>
              <p className="text-[11px] text-muted-foreground">{t.show_lang_switcher_desc || "Mała ikonka flagi widoczna w nagłówku systemu"}</p>
            </div>
          </div>
          <Switch checked={showLangSwitcher} onCheckedChange={setShowLangSwitcher} />
        </div>
      </div>

      {/* Brand */}
      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Marka</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-1">Linguatoons.com</p>
        <p className="text-xs text-muted-foreground">Online language school for children and adults — English, Spanish, French, Polish for foreigners</p>
      </div>

      {/* Brand Rules */}
      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Reguły marki</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Wytyczne strategii treści kierujące wszystkimi decyzjami SEO</p>
        </div>
        <div className="divide-y divide-border/50">
          {rules.map(rule => (
            <div key={rule.id} className="flex items-start gap-4 px-5 py-4">
              <Switch checked={rule.active} onCheckedChange={() => toggleRule(rule)} className="mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold">{rule.rule_name}</span>
                  <StatusBadge status={rule.severity} />
                </div>
                {rule.description && (
                  <p className="text-[11px] text-muted-foreground">{rule.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}