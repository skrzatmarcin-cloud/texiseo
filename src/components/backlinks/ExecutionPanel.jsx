import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Zap, Hand, Copy, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORM_URLS = {
  medium: "https://medium.com/new-story",
  pinterest: "https://pinterest.com/pin/create/button/",
  reddit: "https://www.reddit.com/submit",
  quora: "https://www.quora.com/answer",
  blogger: "https://draft.blogger.com/",
};

export default function ExecutionPanel({ opportunities, materials, onRefresh }) {
  const [publishing, setPublishing] = useState(null);
  const [copied, setCopied] = useState(null);

  const autoQueue = opportunities.filter(o => o.status === "scheduled" && o.execution_mode === "auto");
  const manualQueue = opportunities.filter(o => o.status === "ready_manual" && o.execution_mode === "manual");
  const materialMap = Object.fromEntries(materials.map(m => [m.opportunity_id, m]));

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAutoPublish = async (opp) => {
    setPublishing(opp.id);
    // Simulate API publish with delay
    await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    await base44.entities.BacklinkOpportunities.update(opp.id, { status: "published_auto" });
    await base44.entities.Backlinks.filter({ opportunity_id: opp.id }).then(async ([bl]) => {
      if (bl) await base44.entities.Backlinks.update(bl.id, {
        status: "published_auto",
        published_at: new Date().toISOString().split("T")[0],
      });
    });
    setPublishing(null);
    onRefresh();
  };

  const handleMarkPublished = async (opp) => {
    setPublishing(opp.id);
    await base44.entities.BacklinkOpportunities.update(opp.id, { status: "published_manual" });
    await base44.entities.Backlinks.filter({ opportunity_id: opp.id }).then(async ([bl]) => {
      if (bl) await base44.entities.Backlinks.update(bl.id, {
        status: "published_manual",
        published_at: new Date().toISOString().split("T")[0],
      });
    });
    setPublishing(null);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Auto Queue */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-semibold">Auto-publikacja — bezpieczne platformy</h3>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{autoQueue.length} w kolejce</span>
        </div>
        {autoQueue.length === 0 ? (
          <p className="text-xs text-muted-foreground bg-card border border-border rounded-xl p-4">Brak okazji do auto-publikacji.</p>
        ) : (
          <div className="space-y-2">
            {autoQueue.map(opp => {
              const mat = materialMap[opp.id];
              return (
                <div key={opp.id} className="bg-card border border-emerald-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold">{opp.title}</p>
                      <p className="text-[11px] text-muted-foreground">{opp.platform_type} · Bezp: {opp.safety_score}/100</p>
                    </div>
                    <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 flex-shrink-0"
                      onClick={() => handleAutoPublish(opp)} disabled={publishing === opp.id}>
                      <Zap className="h-3 w-3" />{publishing === opp.id ? "Publikuję…" : "Opublikuj automatycznie"}
                    </Button>
                  </div>
                  {mat?.short_snippet && (
                    <p className="text-[11px] text-muted-foreground bg-secondary/50 rounded-lg p-2 line-clamp-2">{mat.short_snippet}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Queue */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Hand className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Ręczna publikacja</h3>
          <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">{manualQueue.length} gotowych</span>
        </div>
        {manualQueue.length === 0 ? (
          <p className="text-xs text-muted-foreground bg-card border border-border rounded-xl p-4">Brak okazji do ręcznej publikacji.</p>
        ) : (
          <div className="space-y-3">
            {manualQueue.map(opp => {
              const mat = materialMap[opp.id];
              const content = mat ? `${mat.title_suggestion || opp.title}\n\n${mat.medium_article || mat.short_snippet || ""}\n\n${mat.natural_backlink_sentence || ""}\n\n${mat.cta || ""}` : "";
              const url = opp.platform_url || PLATFORM_URLS[opp.platform_type] || "#";
              return (
                <div key={opp.id} className="bg-card border border-amber-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{opp.title}</p>
                      <p className="text-[11px] text-muted-foreground">{opp.platform_type}</p>
                    </div>
                  </div>
                  {mat && (
                    <div className="bg-secondary/40 rounded-lg p-3 space-y-2">
                      {mat.short_snippet && <p className="text-xs text-foreground leading-relaxed">{mat.short_snippet}</p>}
                      {mat.natural_backlink_sentence && (
                        <p className="text-[11px] text-primary font-medium">{mat.natural_backlink_sentence}</p>
                      )}
                      {mat.cta && <p className="text-[11px] text-muted-foreground italic">{mat.cta}</p>}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {content && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                        onClick={() => handleCopy(content, opp.id + "_content")}>
                        <Copy className="h-3 w-3" />{copied === opp.id + "_content" ? "Skopiowano!" : "Kopiuj treść"}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => handleCopy(opp.target_url || "https://linguatoons.com", opp.id + "_link")}>
                      <Copy className="h-3 w-3" />{copied === opp.id + "_link" ? "Skopiowano!" : "Kopiuj link"}
                    </Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" asChild>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />Otwórz platformę
                      </a>
                    </Button>
                    <Button size="sm" className="h-7 text-xs gap-1 bg-teal-600 hover:bg-teal-700"
                      onClick={() => handleMarkPublished(opp)} disabled={publishing === opp.id}>
                      <CheckCircle2 className="h-3 w-3" />{publishing === opp.id ? "…" : "Oznacz jako opublikowany"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}