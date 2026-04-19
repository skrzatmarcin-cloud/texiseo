import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus, Bot, Loader2, ExternalLink, RefreshCw, Target, TrendingUp,
  Gift, Mic, Link2, Newspaper, Globe, Lightbulb, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, Search
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const SECTION_ICONS = {
  freebies: Gift,
  webinars: Mic,
  backlinks: Link2,
  media: Newspaper,
  social: Globe,
  opportunities: Lightbulb,
  threats: AlertTriangle,
  recommendations: CheckCircle2,
};

function TagList({ items, color = "bg-secondary text-secondary-foreground" }) {
  if (!items?.length) return <span className="text-xs text-muted-foreground italic">brak danych</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={cn("text-[11px] px-2 py-0.5 rounded-full", color)}>{item}</span>
      ))}
    </div>
  );
}

function AnalysisCard({ analysis, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [tab, setTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Przegląd" },
    { id: "content", label: "Treści" },
    { id: "backlinks", label: "Backlinki" },
    { id: "freebies", label: "Freebies / Events" },
    { id: "opportunities", label: "Szanse & Zagrożenia" },
    { id: "recommendations", label: "Rekomendacje" },
    { id: "report", label: "Pełny raport" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">{analysis.competitor_url}</p>
            <p className="text-[11px] text-muted-foreground">Analiza z {analysis.analysis_date}</p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border">
          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {tab === "overview" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Przegląd SEO</p>
                  <p className="text-sm text-foreground leading-relaxed">{analysis.seo_overview || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Główne słowa kluczowe</p>
                  <TagList items={analysis.top_keywords} color="bg-blue-50 text-blue-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Widoczność AI (ChatGPT/Gemini)</p>
                  <p className="text-sm text-foreground leading-relaxed">{analysis.ai_visibility || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Kanały Social Media</p>
                  <TagList items={analysis.social_channels} color="bg-purple-50 text-purple-700" />
                </div>
              </div>
            )}

            {tab === "content" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Strategia treści</p>
                  <p className="text-sm text-foreground leading-relaxed">{analysis.content_strategy || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Typy treści</p>
                  <TagList items={analysis.content_types} color="bg-emerald-50 text-emerald-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Obecność w mediach / PR</p>
                  <TagList items={analysis.media_presence} color="bg-amber-50 text-amber-700" />
                </div>
              </div>
            )}

            {tab === "backlinks" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Przegląd backlinków</p>
                  <p className="text-sm text-foreground leading-relaxed">{analysis.backlinks_overview || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Źródła backlinków</p>
                  <TagList items={analysis.backlink_sources} color="bg-rose-50 text-rose-700" />
                </div>
              </div>
            )}

            {tab === "freebies" && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Freebies / Lead magnety</p>
                  <TagList items={analysis.freebies_lead_magnets} color="bg-pink-50 text-pink-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Webinary / Eventy</p>
                  <TagList items={analysis.webinars_events} color="bg-indigo-50 text-indigo-700" />
                </div>
              </div>
            )}

            {tab === "opportunities" && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-emerald-600" />
                    <p className="text-xs font-semibold text-emerald-700">Szanse dla Linguatoons</p>
                  </div>
                  <div className="space-y-1.5">
                    {(analysis.opportunities_for_us || []).map((o, i) => (
                      <div key={i} className="flex items-start gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-800">{o}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-xs font-semibold text-red-700">Zagrożenia</p>
                  </div>
                  <div className="space-y-1.5">
                    {(analysis.threats || []).map((t, i) => (
                      <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-800">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === "recommendations" && (
              <div className="space-y-2">
                {(analysis.recommendations || []).map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                    <span className="text-xs font-bold text-primary flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-xs text-foreground leading-relaxed">{r}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "report" && (
              <div className="prose prose-sm max-w-none text-foreground">
                <ReactMarkdown>{analysis.raw_report || "_Brak raportu_"}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompetitorIntel() {
  const [competitors, setCompetitors] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(null);
  const [addForm, setAddForm] = useState(false);
  const [newComp, setNewComp] = useState({ name: "", url: "" });
  const [selectedComp, setSelectedComp] = useState("all");
  const [statusMsg, setStatusMsg] = useState(null);

  const load = async () => {
    setLoading(true);
    const [comps, anal] = await Promise.all([
      base44.entities.Competitors.list("-created_date"),
      base44.entities.CompetitorAnalysis.list("-created_date", 50),
    ]);
    setCompetitors(comps);
    setAnalyses(anal);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addCompetitor = async () => {
    if (!newComp.name || !newComp.url) return;
    const url = newComp.url.startsWith("http") ? newComp.url : `https://${newComp.url}`;
    await base44.entities.Competitors.create({ ...newComp, url, active: true, niche: "language_school", language: "pl" });
    setNewComp({ name: "", url: "" });
    setAddForm(false);
    load();
  };

  const runAnalysis = async (comp) => {
    setAnalyzing(comp.id);
    setStatusMsg(null);
    const res = await base44.functions.invoke("competitorAgent", {
      action: "analyze",
      competitor_id: comp.id,
      competitor_url: comp.url,
      competitor_name: comp.name,
    });
    if (res.data?.success) {
      setStatusMsg(`✓ Analiza ${comp.name} zakończona!`);
    } else {
      setStatusMsg(`✗ Błąd: ${res.data?.error}`);
    }
    setAnalyzing(null);
    load();
  };

  const filteredAnalyses = selectedComp === "all"
    ? analyses
    : analyses.filter(a => a.competitor_id === selectedComp || a.competitor_url.includes(competitors.find(c => c.id === selectedComp)?.url || "___"));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1300px] mx-auto">
      <PageHeader
        title="Competitor Intelligence"
        description="Superagent SEO — śledzi konkurentów, analizuje backlinki, freebies, AI-visibility i sugeruje działania"
      >
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAddForm(a => !a)}>
          <Plus className="h-3.5 w-3.5" />Dodaj konkurenta
        </Button>
      </PageHeader>

      {statusMsg && (
        <div className={cn(
          "rounded-xl px-4 py-2 mb-4 text-xs flex items-center gap-2",
          statusMsg.startsWith("✓") ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"
        )}>
          {statusMsg}
        </div>
      )}

      {/* Add competitor form */}
      {addForm && (
        <div className="bg-card border border-border rounded-xl p-4 mb-5 flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <p className="text-xs font-medium mb-1">Nazwa</p>
            <Input value={newComp.name} onChange={e => setNewComp(p => ({ ...p, name: e.target.value }))} placeholder="np. Profi-Lingua" className="h-8 text-xs" />
          </div>
          <div className="flex-1 min-w-[220px]">
            <p className="text-xs font-medium mb-1">URL strony</p>
            <Input value={newComp.url} onChange={e => setNewComp(p => ({ ...p, url: e.target.value }))} placeholder="profi-lingua.pl" className="h-8 text-xs" />
          </div>
          <Button size="sm" onClick={addCompetitor} className="h-8">Dodaj</Button>
          <Button size="sm" variant="ghost" onClick={() => setAddForm(false)} className="h-8">Anuluj</Button>
        </div>
      )}

      {/* Competitors list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {competitors.map(comp => (
          <div key={comp.id} className={cn(
            "bg-card border rounded-xl p-4 flex flex-col gap-3 transition-all",
            selectedComp === comp.id ? "border-primary shadow-sm" : "border-border"
          )}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{comp.name}</p>
                <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                  {comp.url} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className={cn("h-2 w-2 rounded-full mt-1.5", comp.active ? "bg-emerald-500" : "bg-gray-300")} />
            </div>
            {comp.last_analyzed_at && (
              <p className="text-[10px] text-muted-foreground">
                Ostatnia analiza: {new Date(comp.last_analyzed_at).toLocaleDateString("pl-PL")}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 h-7 text-xs gap-1"
                onClick={() => runAnalysis(comp)}
                disabled={analyzing === comp.id}
              >
                {analyzing === comp.id
                  ? <><Loader2 className="h-3 w-3 animate-spin" />Analizuję…</>
                  : <><Bot className="h-3 w-3" />Analizuj AI</>
                }
              </Button>
              <Button
                size="sm"
                variant={selectedComp === comp.id ? "secondary" : "outline"}
                className="h-7 text-xs px-2"
                onClick={() => setSelectedComp(selectedComp === comp.id ? "all" : comp.id)}
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}

        {competitors.length === 0 && (
          <div className="col-span-3 bg-secondary/30 border border-dashed border-border rounded-xl p-8 text-center">
            <Target className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground mb-3">Brak konkurentów — dodaj pierwszego</p>
            <Button size="sm" onClick={() => setAddForm(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />Dodaj Profi-Lingua
            </Button>
          </div>
        )}
      </div>

      {/* Analysis results */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">
          Wyniki analiz
          {selectedComp !== "all" && <span className="text-primary ml-2">— {competitors.find(c => c.id === selectedComp)?.name}</span>}
        </p>
        <div className="flex items-center gap-2">
          {selectedComp !== "all" && (
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setSelectedComp("all")}>
              Pokaż wszystkie
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={load}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {filteredAnalyses.length === 0 ? (
        <div className="bg-secondary/30 border border-dashed border-border rounded-xl p-10 text-center">
          <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
          <p className="text-sm text-muted-foreground">
            {competitors.length > 0
              ? "Kliknij 'Analizuj AI' na karcie konkurenta aby uruchomić analizę"
              : "Dodaj najpierw konkurenta"}
          </p>
        </div>
      ) : (
        filteredAnalyses.map((analysis, i) => (
          <AnalysisCard key={analysis.id} analysis={analysis} defaultOpen={i === 0} />
        ))
      )}
    </div>
  );
}