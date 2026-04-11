import ScoreBar from "../ScoreBar";
import { cn } from "@/lib/utils";
import { ShieldCheck, TrendingUp, FileText, Star } from "lucide-react";

function HealthGauge({ score, label }) {
  const color = score >= 68 ? "text-emerald-600" : score >= 48 ? "text-amber-600" : "text-red-600";
  const ring = score >= 68 ? "ring-emerald-200" : score >= 48 ? "ring-amber-200" : "ring-red-200";
  const bg = score >= 68 ? "bg-emerald-50" : score >= 48 ? "bg-amber-50" : "bg-red-50";
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl p-4 ring-1", bg, ring)}>
      <span className={cn("text-3xl font-bold", color)}>{score}</span>
      <span className={cn("text-xs font-semibold mt-0.5 capitalize", color)}>{label}</span>
      <span className="text-[10px] text-muted-foreground mt-0.5">Overall Health</span>
    </div>
  );
}

const METRICS = [
  { key: "trust_score", label: "Trust Signals", Icon: ShieldCheck, weight: "20%" },
  { key: "conversion_score", label: "Conversion Readiness", Icon: TrendingUp, weight: "20%" },
  { key: "content_depth_score", label: "Content Depth", Icon: FileText, weight: "20%" },
  { key: "refresh_score", label: "Content Freshness", Icon: Star, weight: "10%" },
];

export default function PageHealthPanel({ page, healthScore, healthLabel }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold mb-4">Page Health Scorecard</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">
        <HealthGauge score={healthScore} label={healthLabel} />
        <div className="col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2 space-y-3">
          {METRICS.map(({ key, label, Icon, weight }) => (
            <div key={key} className="flex items-center gap-3">
              <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1">
                <ScoreBar value={page[key]} label={label} />
              </div>
              <span className="text-[10px] text-muted-foreground w-8 text-right">{weight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Boolean signals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/50">
        {[
          { label: "FAQ", value: page.faq_present },
          { label: "Schema", value: page.schema_present },
          { label: "Has Cluster", value: !!page.cluster_id },
          { label: "Has CTA", value: !!page.cta_type },
        ].map(({ label, value }) => (
          <div key={label} className={cn("text-center p-2 rounded-lg", value ? "bg-emerald-50 ring-1 ring-emerald-200" : "bg-red-50 ring-1 ring-red-200")}>
            <p className={cn("text-[11px] font-semibold", value ? "text-emerald-700" : "text-red-600")}>{value ? "✓" : "✗"} {label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}