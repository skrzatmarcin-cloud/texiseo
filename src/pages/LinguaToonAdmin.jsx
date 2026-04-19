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
  { category: "STRONA WWW", items: [
    { id: "dashboard", label: "Kokpit", icon: LayoutDashboard },
    { id: "content-ideas", label: "Pomysły treści", icon: Lightbulb },
    { id: "clusters", label: "Klastry tematyczne", icon: Network },
    { id: "pages", label: "Strony", icon: FileText },
    { id: "brief-builder", label: "Brief Builder", icon: ClipboardList },
    { id: "content-engine", label: "Content Engine", icon: Sparkles },
    { id: "seo-qa", label: "SEO QA", icon: CheckCircle2 },
    { id: "backlinks", label: "Backlink System", icon: Link2 },
    { id: "analytics", label: "Google Analytics", icon: BarChart3 },
    { id: "competitors", label: "Konkurenci", icon: TrendingUp },
    { id: "seo-autopilot", label: "SEO Autopilot", icon: Zap },
    { id: "refresh", label: "Refresh Center", icon: RefreshCw },
    { id: "execution", label: "Execution Center", icon: Play },
    { id: "faq", label: "FAQ Schema", icon: BookOpen },
    { id: "requests", label: "Zgłoszenia", icon: Bell },
    { id: "automations", label: "Automations", icon: Zap },
    { id: "integrations", label: "Integracje", icon: Sparkles },
    { id: "keywords", label: "Słowa kluczowe", icon: Search },
    { id: "brand-rules", label: "Reguły marki", icon: Shield },
  ]},
  { category: "ADMINISTRACJA", items: [
    { id: "admin-settings", label: "Ustawienia admina", icon: Settings },
    { id: "admin-users", label: "Użytkownicy serwisu", icon: Users },
    { id: "admin-logs", label: "Logi systemu", icon: FileText },
    { id: "help", label: "Pomoc i wsparcie", icon: BookOpen },
  ]},
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
  const [stats, setStats] = useState(null);

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

    // Brand Rules content
    const BRAND_RULES = [
      { title: "Prioritize service page support", priority: "Krytyczny", desc: "All informational content should include clear paths to relevant service pages (English, Spanish, French, Polish lessons)." },
      { title: "Target parent decision-makers", priority: "Wysoki", desc: "Content about children's lessons must address parent concerns: safety, methodology, screen time, and learning outcomes." },
      { title: "Support adult comparison journey", priority: "Wysoki", desc: "Adult-focused content should help compare lesson formats, pricing, and learning methods to drive informed decisions." },
      { title: "Polish for foreigners opportunity", priority: "Wysoki", desc: "Prioritize content for the Polish-for-foreigners niche as it has lower competition and high local demand." },
      { title: "No generic educational fluff", priority: "Krytyczny", desc: "Avoid broad, irrelevant educational content that doesn't connect to Linguatoons services. Every piece must serve business goals." },
      { title: "No keyword stuffing", priority: "Krytyczny", desc: "Maintain natural, reader-first language. Keywords must fit organically within helpful, well-structured content." },
      { title: "Premium expert tone", priority: "Średni", desc: "All content should reflect Linguatoons' warm, professional, expert brand voice. No cheap clickbait or aggressive sales tactics." },
      { title: "Connect to conversion paths", priority: "Wysoki", desc: "Ensure every piece of content guides users toward enrollment, trial lessons, or premium courses." },
    ];

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

    if (selectedOption === "brand-rules") {
      return (
        <div className="space-y-4">
          <div className={commonClasses}>
            <h3 className="text-lg font-bold mb-4">Reguły marki - Wytyczne strategii treści</h3>
            <p className="text-sm text-muted-foreground mb-6">Kierują wszystkimi decyzjami SEO dla LinguaToons</p>
          </div>
          {BRAND_RULES.map((rule, idx) => {
            const priorityColor = rule.priority === "Krytyczny" ? "bg-red-50 text-red-700" : rule.priority === "Wysoki" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
            return (
              <div key={idx} className={`${commonClasses} border-l-4 ${rule.priority === "Krytyczny" ? "border-l-red-500" : rule.priority === "Wysoki" ? "border-l-amber-500" : "border-l-blue-500"}`}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-sm">{rule.title}</h4>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${priorityColor}`}>{rule.priority}</span>
                </div>
                <p className="text-sm text-muted-foreground">{rule.desc}</p>
              </div>
            );
          })}
        </div>
      );
    }

    if (selectedOption === "content-ideas") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Pomysły treści</h3><p className="text-muted-foreground mt-2">Generuj i zarządzaj pomysłami na artykuły SEO</p></div>;
    }
    if (selectedOption === "clusters") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Klastry tematyczne</h3><p className="text-muted-foreground mt-2">Organizuj treść w tematyczne grupy słów kluczowych</p></div>;
    }
    if (selectedOption === "pages") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Strony</h3><p className="text-muted-foreground mt-2">Zarządzaj wszystkimi stronami witryny i ich SEO</p></div>;
    }
    if (selectedOption === "brief-builder") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Brief Builder</h3><p className="text-muted-foreground mt-2">Twórz briefs dla pisarzy i zespołu redakcyjnego</p></div>;
    }
    if (selectedOption === "content-engine") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Content Engine</h3><p className="text-muted-foreground mt-2">Generuj treść AI dla wielu platform jednocześnie</p></div>;
    }
    if (selectedOption === "seo-qa") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">SEO QA Checker</h3><p className="text-muted-foreground mt-2">Sprawdzaj jakość SEO każdej strony przed publikacją</p></div>;
    }
    if (selectedOption === "backlinks") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Backlink System</h3><p className="text-muted-foreground mt-2">Szukaj oportuności backlinks i buduj strategię</p></div>;
    }
    if (selectedOption === "competitors") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Analiza konkurencji</h3><p className="text-muted-foreground mt-2">Monitoruj pozycje i strategie konkurentów</p></div>;
    }
    if (selectedOption === "seo-autopilot") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">SEO Autopilot</h3><p className="text-muted-foreground mt-2">Automatyzuj zadania SEO za pomocą AI</p></div>;
    }
    if (selectedOption === "refresh") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Refresh Center</h3><p className="text-muted-foreground mt-2">Odświeżaj stare artykuły aby utrzymać ranking</p></div>;
    }
    if (selectedOption === "execution") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Execution Center</h3><p className="text-muted-foreground mt-2">Śledź postęp publikacji i realizacji zadań</p></div>;
    }
    if (selectedOption === "faq") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">FAQ Schema</h3><p className="text-muted-foreground mt-2">Twórz struktury FAQ dla bogatszych wyników</p></div>;
    }
    if (selectedOption === "requests") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Zgłoszenia</h3><p className="text-muted-foreground mt-2">Zarządzaj zgłoszeniami i feedback od użytkowników</p></div>;
    }
    if (selectedOption === "automations") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Automations</h3><p className="text-muted-foreground mt-2">Ustaw automatyczne zadania i workflow</p></div>;
    }
    if (selectedOption === "integrations") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Integracje</h3><p className="text-muted-foreground mt-2">Połącz WordPress, GSC, Analytics i inne narzędzia</p></div>;
    }
    if (selectedOption === "keywords") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Słowa kluczowe</h3><p className="text-muted-foreground mt-2">Badaj, planuj i monitoruj słowa kluczowe</p></div>;
    }
    if (selectedOption === "admin-settings") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Ustawienia admina</h3><p className="text-muted-foreground mt-2">Skonfiguruj ogólne parametry systemu</p></div>;
    }
    if (selectedOption === "admin-users") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Użytkownicy serwisu</h3><p className="text-muted-foreground mt-2">Zarządzaj dostępem i uprawnieniami użytkowników</p></div>;
    }
    if (selectedOption === "admin-logs") {
      return <div className={commonClasses}><h3 className="text-lg font-bold">Logi systemu</h3><p className="text-muted-foreground mt-2">Przeglądaj historię działań i zdarzeń</p></div>;
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
        <h3 className="text-lg font-bold mb-2">Sekcja</h3>
        <p className="text-muted-foreground text-sm">Zawartość...</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-700 text-white px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              📚 LinguaToons.com
            </h1>
            <p className="text-xs text-purple-200 mt-0.5">Website & Admin Panel — SEO, Content, Integracje</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
          {ADMIN_SECTIONS.flatMap(c => c.items).map(section => {
            const SectionIcon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedOption(section.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                  selectedOption === section.id
                    ? "border-white text-white"
                    : "border-transparent text-white/60 hover:text-white/80"
                )}
              >
                <SectionIcon className="h-3.5 w-3.5" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-background p-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}