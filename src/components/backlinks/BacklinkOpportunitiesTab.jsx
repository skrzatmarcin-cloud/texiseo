import { useState } from "react";
import { base44 } from "@/api/base44Client";
import ScoreBadge from "../ScoreBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Hand, CheckCircle2, XCircle, Wand2, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORM_LABELS = {
  medium: "Medium", pinterest: "Pinterest", blogger: "Blogger",
  wordpress_external: "WordPress (ext.)", reddit: "Reddit",
  quora: "Quora", forum: "Forum", directory: "Katalog", community: "Społeczność"
};

const STATUS_STYLES = {
  idea: "bg-slate-100 text-slate-600",
  generated: "bg-blue-50 text-blue-700",
  ready_for_review: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  scheduled: "bg-purple-50 text-purple-700",
  published_auto: "bg-emerald-100 text-emerald-800",
  ready_manual: "bg-orange-50 text-orange-700",
  published_manual: "bg-teal-50 text-teal-700",
};

const STATUS_LABELS = {
  idea: "Pomysł", generated: "Wygenerowany", ready_for_review: "Do recenzji",
  approved: "Zatwierdzony", rejected: "Odrzucony", scheduled: "Zaplanowany",
  published_auto: "Auto-opublikowany", ready_manual: "Gotowy (ręczny)", published_manual: "Opublikowany ręcznie",
};

export default function BacklinkOpportunitiesTab({ opportunities, onRefresh }) {
  const [generating, setGenerating] = useState(null);
  const [approving, setApproving] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanTopic, setScanTopic] = useState("");
  const [scanLang, setScanLang] = useState("pl");
  const [scanCount, setScanCount] = useState("5");

  const handleAIScan = async () => {
    setScanning(true);
    const res = await base44.functions.invoke("backlinkAgent", {
      action: "find_opportunities",
      language: scanLang,
      count: parseInt(scanCount),
      topic: scanTopic || undefined,
    });
    setScanning(false);
    onRefresh();
  };

  const handleApprove = async (opp) => {
    setApproving(opp.id);
    const nextStatus = opp.execution_mode === "auto" ? "scheduled" : "ready_manual";
    await base44.entities.BacklinkOpportunities.update(opp.id, { status: nextStatus });
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
    setApproving(null);
    onRefresh();
  };

  const handleReject = async (id) => {
    await base44.entities.BacklinkOpportunities.update(id, { status: "rejected" });
    onRefresh();
  };

  const handleGenerate = async (opp) => {
    setGenerating(opp.id);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate backlink content for Linguatoons (online language school at linguatoons.com) for platform: ${opp.platform_type}.
Topic: ${opp.topic || "online language learning for children and adults"}.
Language: ${opp.language || "en"}.
Return JSON with fields: title_suggestion, short_snippet, medium_article, pinterest_description, educational_description, natural_backlink_sentence, anchor_branded, anchor_natural, anchor_soft_keyword, cta.
Content must be human-like, educational, non-spammy, naturally mentioning Linguatoons.`,
      response_json_schema: {
        type: "object",
        properties: {
          title_suggestion: { type: "string" },
          short_snippet: { type: "string" },
          medium_article: { type: "string" },
          pinterest_description: { type: "string" },
          educational_description: { type: "string" },
          natural_backlink_sentence: { type: "string" },
          anchor_branded: { type: "string" },
          anchor_natural: { type: "string" },
          anchor_soft_keyword: { type: "string" },
          cta: { type: "string" },
        }
      }
    });
    await base44.entities.BacklinkMaterials.create({
      opportunity_id: opp.id,
      ...result,
      backlink_url: opp.target_url || "https://linguatoons.com",
      status: "ready",
    });
    await base44.entities.BacklinkOpportunities.update(opp.id, { status: "ready_for_review" });
    setGenerating(null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* AI Agent Scanner */}
      <div className="bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Agent AI — Wyszukiwarka okazji backlinków</h3>
        </div>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] text-muted-foreground block mb-1">Temat (opcjonalnie)</label>
            <Input value={scanTopic} onChange={e => setScanTopic(e.target.value)} placeholder="np. nauka angielskiego dla dzieci" className="h-8 text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Język</label>
            <Select value={scanLang} onValueChange={setScanLang}>
              <SelectTrigger className="h-8 w-20 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pl">PL</SelectItem>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Ilość</label>
            <Select value={scanCount} onValueChange={setScanCount}>
              <SelectTrigger className="h-8 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="h-8 gap-1.5" onClick={handleAIScan} disabled={scanning}>
            {scanning ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Szukam…</> : <><Bot className="h-3.5 w-3.5" />Znajdź okazje AI</>}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Agent AI wyszuka miejsca w internecie i wygeneruje gotowe teksty SEO z linkiem do linguatoons.com</p>
      </div>

      {opportunities.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-muted-foreground">Brak okazji backlinkowych</p>
          <p className="text-xs text-muted-foreground mt-1">Kliknij "Znajdź okazje AI" żeby agent wyszukał miejsca i wygenerował treści.</p>
        </div>
      ) : (
      <div className="space-y-2">
      {opportunities.map(opp => (
        <div key={opp.id} className="bg-card border border-border rounded-xl px-4 py-3.5 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-sm font-semibold truncate">{opp.title}</p>
              <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md", STATUS_STYLES[opp.status] || "bg-secondary text-secondary-foreground")}>
                {STATUS_LABELS[opp.status] || opp.status}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
              <span className="bg-secondary px-1.5 py-0.5 rounded">{PLATFORM_LABELS[opp.platform_type] || opp.platform_type}</span>
              {opp.execution_mode === "auto"
                ? <span className="flex items-center gap-1 text-emerald-600 font-medium"><Zap className="h-3 w-3" />Auto</span>
                : <span className="flex items-center gap-1 text-amber-600 font-medium"><Hand className="h-3 w-3" />Ręczny</span>
              }
              {opp.topic && <span className="italic truncate max-w-[200px]">{opp.topic}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <ScoreBadge score={opp.safety_score} label="Bezp." />
            <ScoreBadge score={opp.relevance_score} label="Trafność" />
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {opp.status === "idea" && (
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => handleGenerate(opp)} disabled={generating === opp.id}>
                <Wand2 className="h-3 w-3" />{generating === opp.id ? "Generuję…" : "Generuj"}
              </Button>
            )}
            {opp.status === "ready_for_review" && (
              <>
                <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(opp)} disabled={approving === opp.id}>
                  <CheckCircle2 className="h-3 w-3" />{approving === opp.id ? "…" : "Zatwierdź"}
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500 border-red-200" onClick={() => handleReject(opp.id)}>
                  <XCircle className="h-3 w-3" />Odrzuć
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
      </div>
      )}
    </div>
  );
}