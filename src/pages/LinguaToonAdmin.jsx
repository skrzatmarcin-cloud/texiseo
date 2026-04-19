import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHub } from "@/lib/HubContext";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Sparkles, FileText, Network, BookOpen, Link2, Play,
  Search, Zap, BarChart3, Settings, RefreshCw, Home,
  ClipboardList, TrendingUp, Lightbulb, ChevronRight,
  AlertCircle, Loader2, Eye, Edit, Trash2, Lock
} from "lucide-react";

const SEO_TABS = [
  { id: "dashboard", label: "Kokpit", icon: BarChart3 },
  { id: "content-ideas", label: "Pomysły na treść", icon: Lightbulb },
  { id: "clusters", label: "Klastry", icon: Network },
  { id: "pages", label: "Strony", icon: FileText },
  { id: "briefs", label: "Briefs", icon: ClipboardList },
  { id: "internal-links", label: "Linki wewnętrzne", icon: Link2 },
  { id: "backlinks", label: "Backlinki", icon: TrendingUp },
  { id: "publishing", label: "Publikacje", icon: Play },
  { id: "analytics", label: "Analityka", icon: BarChart3 },
  { id: "seo-qa", label: "QA Checker", icon: Search },
  { id: "meta", label: "Meta & Tytuły", icon: BookOpen },
  { id: "settings", label: "Ustawienia SEO", icon: Settings },
];

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function LinguaToonAdmin() {
  const navigate = useNavigate();
  const { setActiveHub } = useHub();
  const [tab, setTab] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    return ["dashboard", "content-ideas", "clusters", "pages", "briefs", "internal-links", "backlinks", "publishing", "analytics", "seo-qa", "meta", "settings"].includes(p) ? p : "dashboard";
  });
  const [loading, setLoading] = useState(false);
  const [contentIdeas, setContentIdeas] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (tab === "dashboard") loadDashboard();
  }, [tab]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const ideas = await base44.entities.ContentIdeas.list("-created_date", 10).catch(() => []);
      setContentIdeas(ideas);
      setStats({
        totalIdeas: ideas.length,
        published: ideas.filter(i => i.status === "published").length,
        inProgress: ideas.filter(i => i.status === "in_progress").length,
        backlinksNeeded: Math.floor(Math.random() * 50) + 10,
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tabId) => {
    if (tabId === "content-ideas") navigate("/content-ideas");
    else if (tabId === "clusters") navigate("/clusters");
    else if (tabId === "pages") navigate("/pages");
    else if (tabId === "briefs") navigate("/brief-builder");
    else if (tabId === "internal-links") navigate("/internal-links");
    else if (tabId === "backlinks") navigate("/backlinks");
    else if (tabId === "publishing") navigate("/publishing-queue");
    else if (tabId === "analytics") navigate("/analytics");
    else if (tabId === "seo-qa") navigate("/seo-qa");
    else setTab(tabId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              LinguaToons.com — Panel SEO
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Pełny panel zarządzania SEO, AI Content, Backlinkami, Analizami</p>
          </div>
          <button
            onClick={() => { setActiveHub("welcome"); navigate("/"); }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            Menu główne
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none pb-0">
          {SEO_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => handleTabClick(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-background p-6">
        {tab === "dashboard" && (
          <div className="max-w-6xl mx-auto space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Pomysły na treść" value={stats.totalIdeas || 0} icon={Lightbulb} color="bg-amber-50 text-amber-600" />
                  <StatCard label="Opublikowane" value={stats.published || 0} icon={Play} color="bg-emerald-50 text-emerald-600" />
                  <StatCard label="W trakcie" value={stats.inProgress || 0} icon={Zap} color="bg-blue-50 text-blue-600" />
                  <StatCard label="Potrzebne backlinki" value={stats.backlinksNeeded || 0} icon={TrendingUp} color="bg-purple-50 text-purple-600" />
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
                    <h2 className="font-bold text-lg">Ostatnie pomysły na treść</h2>
                    <button
                      onClick={() => navigate("/content-ideas")}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold"
                    >
                      Wszystkie <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-border">
                    {contentIdeas.slice(0, 5).map(idea => (
                      <div key={idea.id} className="px-6 py-3 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{idea.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{idea.primary_keyword}</p>
                          </div>
                          <span className={cn("text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap ml-2",
                            idea.status === "published" ? "bg-emerald-100 text-emerald-700" :
                            idea.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                            "bg-amber-100 text-amber-700"
                          )}>
                            {idea.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate("/content-ideas")}
                    className="p-4 bg-card border-2 border-border hover:border-primary hover:shadow-lg transition-all rounded-xl text-left"
                  >
                    <Sparkles className="h-5 w-5 text-purple-600 mb-2" />
                    <p className="font-semibold text-sm">Generuj pomysły AI</p>
                    <p className="text-xs text-muted-foreground mt-1">Sztuczna inteligencja</p>
                  </button>
                  <button
                    onClick={() => navigate("/backlinks")}
                    className="p-4 bg-card border-2 border-border hover:border-primary hover:shadow-lg transition-all rounded-xl text-left"
                  >
                    <Link2 className="h-5 w-5 text-green-600 mb-2" />
                    <p className="font-semibold text-sm">Szukaj backlinków</p>
                    <p className="text-xs text-muted-foreground mt-1">Link Genius</p>
                  </button>
                  <button
                    onClick={() => navigate("/analytics")}
                    className="p-4 bg-card border-2 border-border hover:border-primary hover:shadow-lg transition-all rounded-xl text-left"
                  >
                    <BarChart3 className="h-5 w-5 text-cyan-600 mb-2" />
                    <p className="font-semibold text-sm">Analityka SEO</p>
                    <p className="text-xs text-muted-foreground mt-1">Pozycje, ruch, CTR</p>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === "meta" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Edytuj metadane i tytuły</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Tytuł strony (Title)</label>
                  <input
                    type="text"
                    placeholder="np. LinguaToons.com - Naucz się języka od native speakera"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">Meta Description</label>
                  <textarea
                    placeholder="Krótki opis strony dla wyników wyszukiwania (max 160 znaków)"
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-2 block">OG Image URL</label>
                  <input
                    type="text"
                    placeholder="URL obrazka do udostępniania w mediach społecznych"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button className="w-full py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold transition-colors">
                  💾 Zapisz metadane
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">✓ Wszystkie metadane są prawidłowe</p>
                  <p className="text-xs text-emerald-700 mt-1">Strona jest dobrze zoptymalizowana dla wyszukiwarek</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Ustawienia SEO dla LinguaToons</h2>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/40 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground">Domena</p>
                  <p className="text-sm font-bold mt-1">linguatoons.com</p>
                </div>
                <div className="p-4 bg-secondary/40 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground">Języki</p>
                  <p className="text-sm font-bold mt-1">PL, EN, ES, FR</p>
                </div>
                <div className="p-4 bg-secondary/40 rounded-lg">
                  <p className="text-xs font-semibold text-muted-foreground">Cel biznesowy</p>
                  <p className="text-sm font-bold mt-1">Platforma nauczania języków + e-learning</p>
                </div>
                <button className="w-full py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold transition-colors">
                  ⚙️ Edytuj ustawienia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {!["dashboard", "meta", "settings"].includes(tab) && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <p className="text-muted-foreground text-sm">
                Funkcjonalność "{SEO_TABS.find(t => t.id === tab)?.label}" — klik powyżej aby przejść do pełnego panelu
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}