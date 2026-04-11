import { AlertTriangle, AlertCircle, Info, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG = {
  critical: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", ring: "ring-red-200", label: "Krytyczny" },
  high: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200", label: "Wysoki" },
  medium: { icon: Info, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-200", label: "Średni" },
  low: { icon: Minus, color: "text-slate-500", bg: "bg-slate-50", ring: "ring-slate-200", label: "Niski" },
};

export default function PageWeaknessPanel({ weaknesses }) {
  if (weaknesses.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-emerald-200 p-5">
        <div className="flex items-center gap-2 text-emerald-600">
          <AlertTriangle className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Brak krytycznych słabości</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Strona przechodzi wszystkie automatyczne kontrole zdrowia. Monitoruj dezaktualizację treści i jakość linków wewnętrznych.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Podsumowanie słabości</h3>
        <span className="text-[11px] text-muted-foreground">{weaknesses.length} {weaknesses.length === 1 ? "problem" : "problemów"} znalezionych</span>
      </div>
      <div className="space-y-2">
        {weaknesses.map(w => {
          const cfg = SEVERITY_CONFIG[w.severity] || SEVERITY_CONFIG.low;
          const Icon = cfg.icon;
          return (
            <div key={w.id} className={cn("rounded-lg p-3 ring-1", cfg.bg, cfg.ring)}>
              <div className="flex items-start gap-2">
                <Icon className={cn("h-3.5 w-3.5 mt-0.5 flex-shrink-0", cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{w.title}</span>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", cfg.bg, cfg.color)}>{cfg.label}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{w.detail}</p>
                  <div className="flex gap-3 mt-1.5">
                    <span className="text-[10px] text-muted-foreground">SEO: <span className="font-medium">{w.seo_value}</span></span>
                    <span className="text-[10px] text-muted-foreground">Business: <span className="font-medium">{w.business_value}</span></span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}