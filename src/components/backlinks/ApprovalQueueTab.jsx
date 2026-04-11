import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Eye, Zap, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ApprovalQueueTab({ opportunities, materials, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [acting, setActing] = useState(null);

  const pending = opportunities.filter(o => o.status === "ready_for_review");
  const materialMap = Object.fromEntries(materials.map(m => [m.opportunity_id, m]));

  const handleApprove = async (opp) => {
    setActing(opp.id);
    const nextStatus = opp.execution_mode === "auto" ? "scheduled" : "ready_manual";
    await base44.entities.BacklinkOpportunities.update(opp.id, { status: nextStatus });
    const mat = materialMap[opp.id];
    if (mat) await base44.entities.BacklinkMaterials.update(mat.id, { status: "approved" });
    await base44.entities.Backlinks.create({
      opportunity_id: opp.id,
      linguatoons_url: opp.target_url || "https://linguatoons.com",
      platform: opp.platform || opp.platform_type,
      platform_type: opp.platform_type,
      execution_mode: opp.execution_mode,
      status: "approved",
      safety_score: opp.safety_score,
      relevance_score: opp.relevance_score,
      language: opp.language || "en",
    });
    setActing(null);
    setSelected(null);
    onRefresh();
  };

  const handleReject = async (opp) => {
    setActing(opp.id);
    await base44.entities.BacklinkOpportunities.update(opp.id, { status: "rejected" });
    const mat = materialMap[opp.id];
    if (mat) await base44.entities.BacklinkMaterials.update(mat.id, { status: "rejected" });
    setActing(null);
    setSelected(null);
    onRefresh();
  };

  if (pending.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3 opacity-60" />
        <p className="text-sm font-medium text-muted-foreground">Kolejka zatwierdzeń pusta</p>
        <p className="text-xs text-muted-foreground mt-1">Wygeneruj materiały dla okazji ze statusem "Pomysł".</p>
      </div>
    );
  }

  const sel = selected ? pending.find(o => o.id === selected) : null;
  const selMat = sel ? materialMap[sel.id] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* List */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{pending.length} oczekujących</p>
        {pending.map(opp => (
          <button
            key={opp.id}
            onClick={() => setSelected(opp.id)}
            className={cn(
              "w-full text-left bg-card border rounded-xl px-4 py-3 transition-all",
              selected === opp.id ? "border-primary/40 shadow-md" : "border-border hover:border-primary/20"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold truncate">{opp.title}</p>
              {opp.execution_mode === "auto"
                ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium"><Zap className="h-3 w-3" />Auto</span>
                : <span className="flex items-center gap-1 text-[10px] text-amber-600 font-medium"><Hand className="h-3 w-3" />Ręczny</span>
              }
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">{opp.platform_type} · Bezp: {opp.safety_score ?? "—"}</p>
          </button>
        ))}
      </div>

      {/* Detail */}
      <div>
        {sel ? (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold">{sel.title}</h3>
              <div className="flex gap-1.5">
                <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 gap-1" onClick={() => handleApprove(sel)} disabled={acting === sel.id}>
                  <CheckCircle2 className="h-3 w-3" />{acting === sel.id ? "…" : "Zatwierdź"}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs text-red-500 border-red-200 gap-1" onClick={() => handleReject(sel)} disabled={acting === sel.id}>
                  <XCircle className="h-3 w-3" />Odrzuć
                </Button>
              </div>
            </div>
            {selMat ? (
              <div className="space-y-3">
                {[
                  { label: "Fragment", val: selMat.short_snippet },
                  { label: "Zdanie z linkiem", val: selMat.natural_backlink_sentence },
                  { label: "CTA", val: selMat.cta },
                  { label: "Kotwice", val: [selMat.anchor_branded, selMat.anchor_natural, selMat.anchor_soft_keyword].filter(Boolean).join(" · ") },
                ].filter(f => f.val).map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-xs text-foreground leading-relaxed bg-secondary/50 rounded-lg p-2.5">{val}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Brak materiałów — wygeneruj najpierw z zakładki Okazje.</p>
            )}
          </div>
        ) : (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
            <Eye className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-xs text-muted-foreground">Wybierz okazję, aby zobaczyć szczegóły</p>
          </div>
        )}
      </div>
    </div>
  );
}