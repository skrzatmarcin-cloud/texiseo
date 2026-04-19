import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Sparkles, Link2, BarChart3, Settings, Shield,
  AlertTriangle, Zap, BookOpen, Eye, Edit, Trash2, Lock, Unlock,
  DollarSign, TrendingUp, RefreshCw, Search, Download, CheckCircle2,
  Calendar, Clock, Users, Home, Bell
} from "lucide-react";

const ADMIN_OPTIONS = [
  { id: "dashboard", label: "Kokpit", icon: LayoutDashboard, color: "bg-blue-50 text-blue-600" },
  { id: "ai-content", label: "Sztuczna inteligencja dla treści", icon: Sparkles, color: "bg-purple-50 text-purple-600" },
  { id: "link-genius", label: "Link Genius", icon: Link2, color: "bg-green-50 text-green-600" },
  { id: "analytics", label: "Analityka", icon: BarChart3, color: "bg-cyan-50 text-cyan-600" },
  { id: "settings", label: "Ustawienia ogólne", icon: Settings, color: "bg-gray-50 text-gray-600" },
  { id: "meta", label: "Tytuły i dane meta", icon: BookOpen, color: "bg-amber-50 text-amber-600" },
  { id: "sitemap", label: "Ustawienia mapy witryny", icon: Zap, color: "bg-indigo-50 text-indigo-600" },
  { id: "schema", label: "Schema Templates", icon: Eye, color: "bg-rose-50 text-rose-600" },
  { id: "indexing", label: "Natychmiasowe indeksowanie", icon: Bell, color: "bg-teal-50 text-teal-600" },
  { id: "roles", label: "Menedżer ról", icon: Shield, color: "bg-blue-50 text-blue-600" },
  { id: "404", label: "Monitor 404", icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  { id: "redirects", label: "Przekierowania", icon: Zap, color: "bg-orange-50 text-orange-600" },
  { id: "analyzer", label: "Analyzer SEO", icon: BarChart3, color: "bg-cyan-50 text-cyan-600" },
  { id: "status", label: "Status i narządzenia", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
  { id: "help", label: "Pomoc i wsparcie", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
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

function OptionGrid({ selectedOption, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
      {ADMIN_OPTIONS.map(opt => {
        const OptIcon = opt.icon;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-left",
              selectedOption === opt.id
                ? `border-primary bg-primary/5`
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", opt.color)}>
              <OptIcon className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-foreground truncate">{opt.label}</p>
          </button>
        );
      })}
    </div>
  );
}

export default function LinguaToonAdmin() {
  const [selectedOption, setSelectedOption] = useState("dashboard");
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, lessonsData] = await Promise.all([
        base44.entities.Teachers.list("-created_date", 100).catch(() => []),
        base44.entities.TeacherLessons.list("-created_date", 100).catch(() => [])
      ]);
      
      setTeachers(teachersData);
      setLessons(lessonsData);
      
      const completedLessons = lessonsData.filter(l => l.status === "completed").length;
      const totalEarnings = lessonsData.reduce((sum, l) => sum + (l.amount_due || 0), 0);
      const activeTeachers = teachersData.filter(t => t.status === "active").length;
      
      setStats({
        totalTeachers: teachersData.length,
        activeTeachers,
        totalLessons: lessonsData.length,
        completedLessons,
        totalEarnings,
        averageRating: (teachersData.reduce((sum, t) => sum + (t.rating || 0), 0) / teachersData.length).toFixed(1) || 0
      });
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    const commonClasses = "bg-card border border-border rounded-xl p-6";

    if (selectedOption === "dashboard") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Nauczyciele" value={stats?.totalTeachers || 0} icon={Users} color="bg-purple-50 text-purple-600" />
            <StatCard label="Aktywni" value={stats?.activeTeachers || 0} icon={CheckCircle2} color="bg-green-50 text-green-600" />
            <StatCard label="Lekcje" value={stats?.totalLessons || 0} icon={Calendar} color="bg-blue-50 text-blue-600" />
            <StatCard label="Ukończone" value={stats?.completedLessons || 0} icon={Clock} color="bg-orange-50 text-orange-600" />
            <StatCard label="Przychód" value={`${stats?.totalEarnings.toLocaleString('pl-PL')} PLN`} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
            <StatCard label="Ocena śr." value={stats?.averageRating} icon={TrendingUp} color="bg-cyan-50 text-cyan-600" />
          </div>

          <div className={commonClasses}>
            <h3 className="text-lg font-bold mb-4">Ostatni nauczyciele</h3>
            {teachers.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{t.first_name} {t.last_name}</p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
                </div>
                <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold",
                  t.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {t.status}
                </span>
              </div>
            ))}
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
          <p className="text-muted-foreground mb-4">Generuj pomysły na artykuły, meta opisy, tytuły SEO za pomocą AI</p>
          <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
            🤖 Otwórz AI Content Generator
          </button>
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
          <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
            🔗 Przejdź do Link Genius
          </button>
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
          <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
            📊 Otwórz Analitykę
          </button>
        </div>
      );
    }

    if (selectedOption === "settings") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Ustawienia ogólne</h3>
          <div className="space-y-4">
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="font-semibold text-sm">Domena</p>
              <p className="text-xs text-muted-foreground">linguatoons.com</p>
            </div>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="font-semibold text-sm">Język</p>
              <p className="text-xs text-muted-foreground">Polski (pl-PL)</p>
            </div>
            <button className="w-full py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
              ⚙️ Edytuj ustawienia
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
          <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
            ✏️ Edytuj meta dane
          </button>
        </div>
      );
    }

    if (selectedOption === "sitemap") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Ustawienia mapy witryny</h3>
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">✓ Mapa witryny XML aktywna</p>
              <p className="text-xs text-emerald-600/70">URL: linguatoons.com/sitemap.xml</p>
            </div>
            <button className="w-full py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
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
            <button className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs">Organization</button>
            <button className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs">Article</button>
            <button className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs">LocalBusiness</button>
            <button className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs">FAQPage</button>
          </div>
        </div>
      );
    }

    if (selectedOption === "indexing") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Natychmiasowe indeksowanie</h3>
          <p className="text-muted-foreground mb-4">Wyślij nowe lub zaktualizowane strony do indeksu Google</p>
          <button className="w-full py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
            🚀 Wyślij stronę do Google
          </button>
        </div>
      );
    }

    if (selectedOption === "roles") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Menedżer ról</h3>
          <div className="space-y-3">
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
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
            <p className="text-sm text-red-700">Brak błędów 404 w ostatnich 7 dniach</p>
          </div>
        </div>
      );
    }

    if (selectedOption === "redirects") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Przekierowania</h3>
          <p className="text-muted-foreground mb-4">Zarządzaj wszystkimi 301 oraz 302 przekierowaniami</p>
          <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
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
          <button className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
            🔍 Uruchom analizę
          </button>
        </div>
      );
    }

    if (selectedOption === "status") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Status i narządzenia</h3>
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm font-semibold text-emerald-700">✓ Wszystkie systemy działają prawidłowo</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs font-medium">Google Search Console</button>
              <button className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs font-medium">Google Analytics</button>
              <button className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs font-medium">Bing Webmaster</button>
              <button className="p-3 border border-border rounded-lg hover:bg-secondary text-left text-xs font-medium">robots.txt</button>
            </div>
          </div>
        </div>
      );
    }

    if (selectedOption === "help") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Pomoc i wsparcie</h3>
          <div className="space-y-3">
            <a href="#" className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Dokumentacja LinguaToons SEO</span>
            </a>
            <a href="#" className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50">
              <Bell className="h-4 w-4" />
              <span className="text-sm">Zgłoś problem</span>
            </a>
            <a href="#" className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg hover:bg-secondary/50">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">FAQ</span>
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className={commonClasses}>
        <h3 className="text-lg font-bold mb-2 capitalize">
          {ADMIN_OPTIONS.find(o => o.id === selectedOption)?.label}
        </h3>
        <p className="text-muted-foreground text-sm">Funkcjonalność dostępna wkrótce...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                📚 LinguaToons.com — Panel Administracyjny
              </h1>
              <p className="text-blue-100 text-sm mt-1">Zarządzaj SEO, nauczycielami, kursami, płatościami i całą platformą</p>
            </div>
            <a href="/" className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <Home className="h-4 w-4" />
              <span className="text-sm">Menu główne</span>
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Szukaj opcji, nauczyciela, lekcji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button onClick={loadData} className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="text-sm">Odśwież</span>
          </button>
        </div>

        {/* Admin Options Grid */}
        <OptionGrid selectedOption={selectedOption} onSelect={setSelectedOption} />

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Ładowanie danych...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}