import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Sparkles, Zap, TrendingUp, FileText, Target, Globe, Loader2,
  Copy, Check, Plus, ArrowRight, Search, Link2, Megaphone, BarChart3,
  BookOpen, Star, ChevronRight, RefreshCw, Brain
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const BRAND = {
  name: "TexiSEO.ai",
  alias: "LinguaTons",
  url: "https://texiseo.ai",
  niche: "platforma korepetycji językowych online",
  competitors: ["profi-lingua.pl", "e-korepetycje.net", "superprof.pl"],
  primaryKeywords: [
    "korepetycje angielski online",
    "nauka angielskiego dla dzieci online",
    "lektor angielskiego online",
    "kursy językowe online dla dzieci",
    "platforma e-learning języki obce",
    "korepetycje online dla dzieci",
    "angielski dla dzieci online",
    "nauka języków online",
    "szkoła językowa online",
    "korepetycje językowe online"
  ]
};

const QUICK_ACTIONS = [
  { id: "article", label: "Napisz artykuł SEO", icon: FileText, color: "from-violet-500 to-purple-600", prompt: "Napisz pełny artykuł SEO (min. 800 słów) dla TexiSEO.ai na temat: " },
  { id: "keywords", label: "Klaster słów kluczowych", icon: Search, color: "from-blue-500 to-cyan-600", prompt: "Wygeneruj szczegółowy klaster słów kluczowych dla TexiSEO.ai na temat: " },
  { id: "meta", label: "Meta tagi + opis strony", icon: Globe, color: "from-emerald-500 to-teal-600", prompt: "Stwórz zoptymalizowany meta title, meta description i schema.org markup dla strony TexiSEO.ai na temat: " },
  { id: "social", label: "Post social media", icon: Megaphone, color: "from-pink-500 to-rose-600", prompt: "Napisz 3 posty social media (Facebook + Instagram + LinkedIn) promujące TexiSEO.ai na temat: " },
  { id: "landing", label: "Landing page copy", icon: Target, color: "from-amber-500 to-orange-600", prompt: "Napisz persuasywny tekst landing page dla TexiSEO.ai promujący: " },
  { id: "backlinks", label: "Strategia linkbuildingu", icon: Link2, color: "from-slate-600 to-slate-800", prompt: "Zaproponuj strategię linkbuildingu dla TexiSEO.ai skupiając się na: " },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-secondary hover:bg-border transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Skopiowano!" : "Kopiuj"}
    </button>
  );
}

function SaveToContentIdeas({ content, title }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const handle = async () => {
    setSaving(true);
    await base44.entities.ContentIdeas.create({
      title: title || "Treść wygenerowana przez AI",
      content_type: "blog_post",
      language: "pl",
      status: "approved",
      notes: content.slice(0, 500),
    });
    setSaved(true);
    setSaving(false);
  };
  return (
    <button onClick={handle} disabled={saving || saved} className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors",
      saved ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary hover:bg-primary/20"
    )}>
      {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {saved ? "Zapisano!" : "Zapisz do Content Ideas"}
    </button>
  );
}

export default function SelfPromotionHub() {
  const [activeTab, setActiveTab] = useState("generator");
  const [selectedAction, setSelectedAction] = useState(null);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [competitorData, setCompetitorData] = useState(null);
  const [loadingComp, setLoadingComp] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [loadingKw, setLoadingKw] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const resultRef = useRef(null);

  // Load stats
  useEffect(() => {
    base44.entities.ContentIdeas.list().then(items => setSavedCount(items.length));
    // Add e-korepetycje.net competitor if not already in DB
    base44.entities.Competitors.filter({ url: "https://www.e-korepetycje.net" }).then(existing => {
      if (existing.length === 0) {
        base44.entities.Competitors.create({
          name: "e-korepetycje.net",
          url: "https://www.e-korepetycje.net",
          niche: "language_school",
          language: "pl",
          notes: "#2 lider rynku korepetycji w Polsce. Duży katalog korepetytorów (38k+ ogłoszeń z ang.), silny blog edukacyjny, lokalne SEO.",
          active: true,
        });
      }
    });
  }, []);

  const handleGenerate = async () => {
    if (!selectedAction || !topic.trim()) return;
    setGenerating(true);
    setResult("");
    const fullPrompt = `${selectedAction.prompt}${topic}

KONTEKST MARKI:
- Nazwa: TexiSEO.ai / LinguaTons
- URL: https://texiseo.ai
- Nisza: platforma korepetycji językowych online (angielski, hiszpański, francuski dla dzieci i dorosłych)
- Rynek główny: Polska + Europa
- Konkurenci do pobicia: profi-lingua.pl, e-korepetycje.net, superprof.pl
- USP: AI-driven matching, certyfikowani lektorzy, pierwsze zajęcia gratis, system ocen

WYTYCZNE SEO:
- Użyj słów kluczowych naturalnie
- Dodaj meta description jeśli to artykuł
- Użyj nagłówków H2/H3
- Zakończ CTA do TexiSEO.ai
- Język: polski (chyba że proszę o inny)
- Styl: profesjonalny, ciepły, przyjazny rodzicom i uczniom

Wygeneruj kompletną, gotową do publikacji treść.`;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      add_context_from_internet: true,
      model: "claude_sonnet_4_6"
    });
    setResult(res);
    setGenerating(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const analyzeCompetitors = async () => {
    setLoadingComp(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Przeprowadź dogłębną analizę SEO tych konkurentów dla TexiSEO.ai/LinguaTons:
1. profi-lingua.pl
2. e-korepetycje.net (marketplace korepetycji, 38k+ ogłoszeń angielski, silny blog)
3. superprof.pl

Dla każdego podaj:
- Szacowana siła domeny (DA 0-100)
- Główne słowa kluczowe na które rankuje
- Luki contentowe (czego im brakuje)
- Możliwości dla TexiSEO.ai żeby ich pobić
- Strategia: jak zdobyć pozycje wyższe od nich

Na końcu podaj TOP 5 quick wins dla TexiSEO.ai.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                domain_authority: { type: "number" },
                top_keywords: { type: "array", items: { type: "string" } },
                content_gaps: { type: "array", items: { type: "string" } },
                opportunities: { type: "array", items: { type: "string" } },
                beat_strategy: { type: "string" }
              }
            }
          },
          quick_wins: { type: "array", items: { type: "string" } },
          overall_recommendation: { type: "string" }
        }
      }
    });
    setCompetitorData(res);
    setLoadingComp(false);
  };

  const generateKeywordMap = async () => {
    setLoadingKw(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Stwórz pełną mapę słów kluczowych dla TexiSEO.ai (platforma korepetycji językowych online, Polska).
Grupy:
1. Korepetycje językowe online (angielski, hiszpański, francuski, niemiecki)
2. Nauka dla dzieci (angielski dla dzieci, kursy dla dzieci)
3. Lokalne (korepetycje angielski Warszawa, Kraków, etc.)
4. Brand (TexiSEO, LinguaTons)
5. Edukacyjne (jak nauczyć się angielskiego, metody nauki)

Dla każdego słowa: intencja, trudność (0-100), potencjał (0-100), typ treści.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          groups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                group_name: { type: "string" },
                keywords: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      keyword: { type: "string" },
                      intent: { type: "string" },
                      difficulty: { type: "number" },
                      potential: { type: "number" },
                      content_type: { type: "string" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });
    setKeywords(res.groups || []);
    setLoadingKw(false);
  };

  const TABS = [
    { id: "generator", label: "Generator treści", icon: Sparkles },
    { id: "competitors", label: "Analiza konkurencji", icon: BarChart3 },
    { id: "keywords", label: "Mapa słów kluczowych", icon: Search },
    { id: "agent", label: "Agent SEO AI", icon: Brain },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Self-Promotion Hub — TexiSEO.ai
            </h1>
            <p className="text-xs text-white/70 mt-0.5">
              Agent AI pozycjonujący markę · Bije e-korepetycje.net · profi-lingua.pl · Superprof
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white/10 rounded-xl px-3 py-1.5 text-center">
              <p className="text-lg font-black text-white">{savedCount}</p>
              <p className="text-[10px] text-white/60">treści</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn("flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
                activeTab === t.id ? "border-white text-white" : "border-transparent text-white/50 hover:text-white/80"
              )}>
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background p-5">

        {/* ====== GENERATOR ====== */}
        {activeTab === "generator" && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Quick action grid */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Wybierz typ treści</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUICK_ACTIONS.map(action => (
                  <button key={action.id} onClick={() => setSelectedAction(action)}
                    className={cn("p-4 rounded-2xl border-2 text-left transition-all",
                      selectedAction?.id === action.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/30"
                    )}>
                    <div className={cn("h-9 w-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3", action.color)}>
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-xs font-semibold">{action.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic input */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                {selectedAction ? `Temat dla: ${selectedAction.label}` : "Wybierz typ treści powyżej"}
              </label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder={selectedAction ? "np. 'nauka angielskiego online dla dzieci 6-10 lat'" : "Najpierw wybierz typ treści…"}
                disabled={!selectedAction}
                className="w-full h-24 px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
              />

              {/* Keyword suggestions */}
              {selectedAction && (
                <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                  {BRAND.primaryKeywords.slice(0, 5).map(kw => (
                    <button key={kw} onClick={() => setTopic(kw)}
                      className="text-[11px] px-2.5 py-1 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
                      {kw}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!selectedAction || !topic.trim() || generating}
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 disabled:opacity-40 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {generating
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Generuję z Claude AI…</>
                  : <><Sparkles className="h-4 w-4" /> Generuj z AI <span className="text-white/60 text-xs">(Claude Sonnet)</span></>
                }
              </button>
            </div>

            {/* Result */}
            {result && (
              <div ref={resultRef} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/40">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <p className="text-sm font-semibold">Treść wygenerowana</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={result} />
                    <SaveToContentIdeas content={result} title={topic} />
                  </div>
                </div>
                <div className="p-5 prose prose-sm prose-slate max-w-none text-sm leading-relaxed">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== COMPETITOR ANALYSIS ====== */}
        {activeTab === "competitors" && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Competitor cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: "profi-lingua.pl", rank: "#1", desc: "Największa szkoła językowa online w PL", threat: "high", color: "border-red-200 bg-red-50" },
                { name: "e-korepetycje.net", rank: "#2", desc: "Marketplace 38k+ ogłoszeń, silny blog SEO", threat: "high", color: "border-orange-200 bg-orange-50" },
                { name: "superprof.pl", rank: "#3", desc: "Marketplace 22M+ nauczycieli globalnie", threat: "medium", color: "border-amber-200 bg-amber-50" },
              ].map(c => (
                <div key={c.name} className={cn("rounded-2xl border p-4", c.color)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground">{c.rank} lider</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold",
                      c.threat === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {c.threat === "high" ? "⚡ Wysoka groźba" : "⚠️ Średnia"}
                    </span>
                  </div>
                  <p className="font-bold text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={analyzeCompetitors}
              disabled={loadingComp}
              className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loadingComp
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Analizuję konkurencję z AI…</>
                : <><BarChart3 className="h-4 w-4" /> Uruchom analizę konkurencji AI</>
              }
            </button>

            {competitorData && (
              <div className="space-y-4">
                {/* Quick wins */}
                {competitorData.quick_wins?.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <p className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4" /> TOP Quick Wins dla TexiSEO.ai
                    </p>
                    <div className="space-y-2">
                      {competitorData.quick_wins.map((win, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold text-xs mt-0.5">{i + 1}.</span>
                          <p className="text-xs text-emerald-900">{win}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Per-competitor */}
                {competitorData.competitors?.map(comp => (
                  <div key={comp.name} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm">{comp.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">DA</span>
                        <span className="text-lg font-black text-primary">{comp.domain_authority}</span>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="font-semibold text-muted-foreground mb-2">Top keywords</p>
                        <div className="space-y-1">
                          {comp.top_keywords?.slice(0, 4).map((k, i) => (
                            <p key={i} className="text-foreground">• {k}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground mb-2">Luki contentowe</p>
                        <div className="space-y-1">
                          {comp.content_gaps?.slice(0, 3).map((g, i) => (
                            <p key={i} className="text-emerald-700">✓ {g}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-muted-foreground mb-2">Jak ich pobić</p>
                        <p className="text-foreground leading-relaxed">{comp.beat_strategy}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {competitorData.overall_recommendation && (
                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                    <p className="text-xs font-bold text-primary mb-2">Rekomendacja AI</p>
                    <p className="text-sm text-foreground leading-relaxed">{competitorData.overall_recommendation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== KEYWORD MAP ====== */}
        {activeTab === "keywords" && (
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Seed keywords */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-bold mb-3">Priorytetowe słowa kluczowe TexiSEO.ai</p>
              <div className="flex flex-wrap gap-2">
                {BRAND.primaryKeywords.map(kw => (
                  <span key={kw} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                    🔍 {kw}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={generateKeywordMap}
              disabled={loadingKw}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loadingKw
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Generuję mapę słów kluczowych…</>
                : <><Search className="h-4 w-4" /> Generuj pełną mapę słów kluczowych AI</>
              }
            </button>

            {keywords.length > 0 && (
              <div className="space-y-4">
                {keywords.map((group, gi) => (
                  <div key={gi} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 bg-secondary/40 border-b border-border">
                      <p className="text-xs font-bold">{group.group_name}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/50">
                            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Słowo kluczowe</th>
                            <th className="px-4 py-2 text-center text-muted-foreground font-medium">Intencja</th>
                            <th className="px-4 py-2 text-center text-muted-foreground font-medium">Trudność</th>
                            <th className="px-4 py-2 text-center text-muted-foreground font-medium">Potencjał</th>
                            <th className="px-4 py-2 text-left text-muted-foreground font-medium">Typ treści</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.keywords?.map((kw, ki) => (
                            <tr key={ki} className="border-b border-border/30 hover:bg-secondary/20">
                              <td className="px-4 py-2 font-medium text-foreground">{kw.keyword}</td>
                              <td className="px-4 py-2 text-center">
                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium",
                                  kw.intent === "informational" ? "bg-blue-50 text-blue-700" :
                                  kw.intent === "commercial" ? "bg-amber-50 text-amber-700" :
                                  kw.intent === "transactional" ? "bg-emerald-50 text-emerald-700" :
                                  "bg-gray-100 text-gray-600"
                                )}>{kw.intent}</span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <span className={cn("font-bold",
                                  kw.difficulty < 30 ? "text-emerald-600" : kw.difficulty < 60 ? "text-amber-600" : "text-red-600"
                                )}>{kw.difficulty}</span>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <div className="flex items-center gap-1.5">
                                  <div className="h-1.5 flex-1 bg-secondary rounded-full">
                                    <div className="h-1.5 bg-primary rounded-full" style={{ width: `${kw.potential}%` }} />
                                  </div>
                                  <span className="font-medium text-primary">{kw.potential}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-muted-foreground">{kw.content_type}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====== AGENT SEO AI ====== */}
        {activeTab === "agent" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-violet-900 to-slate-900 rounded-2xl p-6 text-white text-center mb-5">
              <div className="h-16 w-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Agent SEO — TexiSEO.ai</h2>
              <p className="text-white/60 text-sm mb-4">
                Inteligentny agent AI specjalizujący się w pozycjonowaniu marki TexiSEO.ai/LinguaTons.
                Pokonuje e-korepetycje.net, profi-lingua.pl i Superprof.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5 text-left">
                {[
                  { icon: "📝", text: "Pisze artykuły SEO gotowe do publikacji" },
                  { icon: "🔍", text: "Generuje klastry słów kluczowych" },
                  { icon: "📣", text: "Tworzy treści social media i landing pages" },
                  { icon: "🔗", text: "Planuje strategię linkbuildingu" },
                  { icon: "🏆", text: "Analizuje i bije konkurencję" },
                  { icon: "💾", text: "Zapisuje treści do bazy Content Ideas" },
                ].map((f, i) => (
                  <div key={i} className="flex items-start gap-2 bg-white/5 rounded-xl p-2.5">
                    <span className="text-base">{f.icon}</span>
                    <p className="text-xs text-white/70">{f.text}</p>
                  </div>
                ))}
              </div>
              <a
                href={base44.agents.getWhatsAppConnectURL("brand_seo_agent")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm"
              >
                <span className="text-lg">💬</span> Otwórz na WhatsApp
              </a>
            </div>

            {/* Instructions */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-bold mb-3">Jak używać agenta SEO</p>
              <div className="space-y-3">
                {[
                  { step: "1", title: "Kliknij \"Otwórz na WhatsApp\"", desc: "Agent uruchamia się na WhatsApp z pełnym kontekstem marki." },
                  { step: "2", title: "Powiedz co chcesz", desc: "Np. 'Napisz artykuł o korepetycjach angielski online dla dzieci' lub 'Analizuj e-korepetycje.net'" },
                  { step: "3", title: "Agent generuje i zapisuje", desc: "Treści są automatycznie zapisywane do bazy Content Ideas w systemie." },
                  { step: "4", title: "Publikuj i pozycjonuj", desc: "Gotowe treści trafiają do Publishing Queue i są gotowe do publikacji na stronie." },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0 mt-0.5">{s.step}</span>
                    <div>
                      <p className="text-xs font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}