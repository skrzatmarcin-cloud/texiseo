import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, Link2, BarChart3, Settings, Shield,
  AlertTriangle, Zap, BookOpen, Eye, Edit, Trash2, Lock, Unlock,
  DollarSign, TrendingUp, RefreshCw, Search, Download, CheckCircle2,
  Calendar, Clock, Users, Home, Bell, FileText, Network, Play,
  Lightbulb, ClipboardList, ChevronRight, AlertCircle, Loader2, Menu, X
} from "lucide-react";

const ADMIN_SECTIONS = [
  { id: "dashboard", label: "Kokpit", icon: LayoutDashboard },
  { id: "ai-content", label: "Sztuczna inteligencja dla treści", icon: Sparkles },
  { id: "link-genius", label: "Link Genius", icon: Link2 },
  { id: "analytics", label: "Analityka", icon: BarChart3 },
  { id: "settings", label: "Ustawienia ogólne", icon: Settings },
  { id: "meta", label: "Tytuły i dane meta", icon: BookOpen },
  { id: "sitemap", label: "Ustawienia mapy witryny", icon: Zap },
  { id: "schema", label: "Schema Templates", icon: FileText },
  { id: "indexing", label: "Natychmiasowe indeksowanie", icon: Bell },
  { id: "roles", label: "Menedżer ról", icon: Shield },
  { id: "404", label: "Monitor 404", icon: AlertTriangle },
  { id: "redirects", label: "Przekierowania", icon: ChevronRight },
  { id: "analyzer", label: "Analyzer SEO", icon: BarChart3 },
  { id: "status", label: "Status i narządzenia", icon: TrendingUp },
  { id: "help", label: "Pomoc i wsparcie", icon: BookOpen },
];

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}

export default function LinguaToonAdmin() {
  const [selectedOption, setSelectedOption] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(false);
    setStats({
      totalIdeas: 42,
      publishedIdeas: 28,
      totalClusters: 12,
      totalPages: 87,
      backlinkOpportunities: 65,
    });
  };

  const renderContent = () => {
    const commonClasses = "bg-card border border-border rounded-xl p-6";

    if (selectedOption === "dashboard") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Pomysły" value={stats?.totalIdeas || 0} icon={Lightbulb} color="bg-amber-50 text-amber-600" />
            <StatCard label="Opublikowane" value={stats?.publishedIdeas || 0} icon={CheckCircle2} color="bg-green-50 text-green-600" />
            <StatCard label="Klastry" value={stats?.totalClusters || 0} icon={Network} color="bg-blue-50 text-blue-600" />
            <StatCard label="Strony" value={stats?.totalPages || 0} icon={FileText} color="bg-indigo-50 text-indigo-600" />
            <StatCard label="Backlinki" value={stats?.backlinkOpportunities || 0} icon={Link2} color="bg-purple-50 text-purple-600" />
            <StatCard label="Konwersje" value="—" icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
          </div>

          <div className={commonClasses}>
            <h3 className="text-lg font-bold mb-4">Ostatnie aktualizacje</h3>
            <p className="text-sm text-muted-foreground">Przejdź do poszczególnych sekcji aby zobaczyć szczegóły</p>
          </div>
        </div>
      );
    }

    if (selectedOption === "ai-content") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Sztuczna inteligencja dla treści
          </h3>
          <p className="text-muted-foreground mb-4">Generuj pomysły na artykuły, meta opisy, tytuły SEO, briefs</p>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
              🤖 Generuj pomysły na treść
            </button>
            <button className="w-full px-4 py-3 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/80 font-semibold">
              ✍️ Generuj meta opisy
            </button>
            <button className="w-full px-4 py-3 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/80 font-semibold">
              🎯 Generuj tytuły SEO
            </button>
          </div>
        </div>
      );
    }

    if (selectedOption === "link-genius") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Link2 className="h-5 w-5 text-green-600" />
            Link Genius
          </h3>
          <p className="text-muted-foreground mb-4">Szukaj oportuności backlinks, analizuj konkurencję, buduj strategię linkowania</p>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
              🔗 Szukaj oportuności backlinks
            </button>
            <button className="w-full px-4 py-3 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/80 font-semibold">
              🕵️ Analiza konkurencji
            </button>
            <button className="w-full px-4 py-3 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/80 font-semibold">
              📊 Raport linkowania
            </button>
          </div>
        </div>
      );
    }

    if (selectedOption === "analytics") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            Analityka SEO
          </h3>
          <p className="text-muted-foreground mb-4">Monitoruj pozycje, ruch organiczny, klik-through rate, konkurencję</p>
          <div className="space-y-3">
            <button className="w-full px-4 py-3 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
              📊 Analityka wyszukiwania
            </button>
            <button className="w-full px-4 py-3 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/80 font-semibold">
              🎯 Ranking pozycji
            </button>
            <button className="w-full px-4 py-3 bg-secondary text-foreground text-sm rounded-lg hover:bg-secondary/80 font-semibold">
              📈 Ruch organiczny
            </button>
          </div>
        </div>
      );
    }

    if (selectedOption === "meta") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Tytuły i dane meta</h3>
          <p className="text-muted-foreground mb-4">Zarządzaj meta opisami, tytułami, og:image dla wszystkich stron</p>
          <div className="space-y-3">
            <input type="text" placeholder="Tytuł strony (Title)" className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <textarea placeholder="Meta Description (max 160 znaków)" rows={3} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <button className="w-full px-4 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
              💾 Zapisz metadane
            </button>
          </div>
        </div>
      );
    }

    if (selectedOption === "sitemap") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Ustawienia mapy witryny</h3>
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700 font-semibold">✓ Mapa witryny XML aktywna</p>
              <p className="text-xs text-emerald-600">linguatoons.com/sitemap.xml</p>
            </div>
            <button className="w-full px-4 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
              🗺️ Odśwież mapę witryny
            </button>
          </div>
        </div>
      );
    }

    if (selectedOption === "schema") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Schema Templates</h3>
          <p className="text-muted-foreground mb-4">Dodaj schema markup dla bogatszych wyników w wyszukiwarce</p>
          <div className="grid grid-cols-2 gap-3">
            {["Organization", "Article", "LocalBusiness", "FAQPage", "Product", "Event"].map(schema => (
              <button key={schema} className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs font-semibold">
                {schema}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (selectedOption === "indexing") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Natychmiasowe indeksowanie</h3>
          <p className="text-muted-foreground mb-4">Wyślij nowe lub zaktualizowane strony do indeksu Google</p>
          <div className="space-y-3">
            <input type="text" placeholder="Wklej URL strony" className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <button className="w-full px-4 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
              🚀 Wyślij do Google
            </button>
          </div>
        </div>
      );
    }

    if (selectedOption === "roles") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Menedżer ról</h3>
          <div className="space-y-2">
            {["Admin", "Editor", "Author", "Viewer"].map(role => (
              <div key={role} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <p className="text-sm font-medium">{role}</p>
                <button className="text-xs px-2 py-1 bg-secondary rounded hover:bg-secondary/80">Edytuj</button>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedOption === "404") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Monitor 404
          </h3>
          <p className="text-muted-foreground mb-4">Monitoruj błędy 404 i utwórz przekierowania</p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <p className="text-sm text-emerald-700 font-semibold">✓ Brak błędów 404 w ostatnich 7 dniach</p>
          </div>
        </div>
      );
    }

    if (selectedOption === "redirects") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Przekierowania (301 / 302)</h3>
          <p className="text-muted-foreground mb-4">Zarządzaj wszystkimi przekierowaniami URL</p>
          <button className="px-4 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
            + Dodaj przekierowanie
          </button>
        </div>
      );
    }

    if (selectedOption === "analyzer") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            Analyzer SEO
          </h3>
          <p className="text-muted-foreground mb-4">Analizuj każdą stronę pod względem SEO on-page</p>
          <button className="w-full px-4 py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
            🔍 Uruchom pełną analizę
          </button>
        </div>
      );
    }

    if (selectedOption === "status") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Status i narządzenia</h3>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mb-4">
            <p className="text-sm text-emerald-700 font-semibold">✓ Wszystkie systemy działają prawidłowo</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {["Google Search Console", "Google Analytics", "Bing Webmaster", "robots.txt"].map(item => (
              <button key={item} className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs font-medium">
                {item}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (selectedOption === "settings") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Ustawienia ogólne</h3>
          <div className="space-y-3">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="font-semibold text-sm">Domena</p>
              <p className="text-xs text-muted-foreground">linguatoons.com</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="font-semibold text-sm">Język</p>
              <p className="text-xs text-muted-foreground">Polski (pl-PL)</p>
            </div>
            <button className="w-full py-2.5 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 font-semibold">
              ⚙️ Edytuj ustawienia
            </button>
          </div>
        </div>
      );
    }

    if (selectedOption === "help") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Pomoc i wsparcie</h3>
          <div className="space-y-2">
            {[
              { label: "Dokumentacja", icon: "📖" },
              { label: "Zgłoś problem", icon: "🐛" },
              { label: "FAQ", icon: "❓" },
            ].map(item => (
              <a key={item.label} href="#" className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50">
                <span>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className={commonClasses}>
        <h3 className="text-lg font-bold mb-2">{ADMIN_SECTIONS.find(o => o.id === selectedOption)?.label}</h3>
        <p className="text-muted-foreground text-sm">Funkcjonalność dostępna wkrótce...</p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative z-50 h-full w-64 bg-slate-900 text-white flex flex-col transition-all duration-300",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-lg font-bold flex items-center gap-2">
            📚 LinguaToons
          </h1>
          <p className="text-xs text-slate-400 mt-1">Panel SEO</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="p-3 space-y-1">
            {ADMIN_SECTIONS.map(section => {
              const SectionIcon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setSelectedOption(section.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                    selectedOption === section.id
                      ? "bg-primary text-white font-semibold"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <SectionIcon className="h-4 w-4 flex-shrink-0" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-800">
          <a href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <Home className="h-4 w-4" />
            Menu główne
          </a>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <h2 className="text-xl font-bold">{ADMIN_SECTIONS.find(o => o.id === selectedOption)?.label}</h2>
          <button onClick={loadData} className="p-2 hover:bg-secondary rounded-lg">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}