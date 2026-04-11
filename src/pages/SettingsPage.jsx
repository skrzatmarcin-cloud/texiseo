import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <PageHeader title="Settings" description="Brand rules and system configuration" />

      <div className="bg-card rounded-xl border border-border p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Brand</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-1">Linguatoons.com</p>
        <p className="text-xs text-muted-foreground">Online language school for children and adults — English, Spanish, French, Polish for foreigners</p>
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Brand Rules</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Content strategy guardrails that guide all SEO decisions</p>
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