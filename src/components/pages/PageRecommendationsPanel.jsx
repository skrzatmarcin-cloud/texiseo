import { useState } from "react";
import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_CONFIG = {
  critical: { label: "Krytyczny", color: "text-red-700", bg: "bg-red-50", ring: "ring-red-200", dot: "bg-red-500" },
  high: { label: "Wysoki", color: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200", dot: "bg-amber-500" },
  medium: { label: "Średni", color: "text-blue-700", bg: "bg-blue-50", ring: "ring-blue-200", dot: "bg-blue-500" },
  low: { label: "Niski", color: "text-slate-600", bg: "bg-slate-50", ring: "ring-slate-200", dot: "bg-slate-400" },
};

function RecommendationCard({ rec, index }) {
  const [open, setOpen] = useState(false);
  const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.low;
  return (
    <div className={cn("rounded-lg border ring-1 overflow-hidden", cfg.ring)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-secondary/30 transition-colors"
      >
        <span className="text-[10px] font-bold text-muted-foreground w-5 text-center">{index + 1}</span>
        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", cfg.dot)} />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold">{rec.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded ring-1", cfg.bg, cfg.color, cfg.ring)}>{cfg.label}</span>
          {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border/40">
          <p className="text-[11px] text-foreground leading-relaxed mb-3">{rec.full_text}</p>
          <div className="bg-secondary/50 rounded-lg p-3 mb-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Dlaczego to ważne</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{rec.why}</p>
          </div>
          <div className="flex gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground">Wartość SEO</p>
              <p className="text-[11px] font-semibold">{rec.seo_value}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Wartość biznesowa</p>
              <p className="text-[11px] font-semibold">{rec.business_value}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PageRecommendationsPanel({ recommendations }) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-2">Rekomendacje</h3>
        <p className="text-xs text-muted-foreground">Brak rekomendacji w tej chwili. Strona działa dobrze we wszystkich analizowanych obszarach.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Rekomendacje działań</h3>
        </div>
        <span className="text-[11px] text-muted-foreground">{recommendations.length} działań — posortowanych wg priorytetu</span>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec, i) => (
          <RecommendationCard key={`${rec.type}-${i}`} rec={rec} index={i} />
        ))}
      </div>
    </div>
  );
}