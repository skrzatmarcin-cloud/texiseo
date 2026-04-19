import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Search, BarChart3, Settings, Lightbulb, Network, FileText, Zap,
  Home, LogOut, AlertCircle, CheckCircle2, Loader2, ArrowRight
} from "lucide-react";

export default function ClientSEODashboard() {
  const navigate = useNavigate();
  const { websiteId } = useParams();
  const [user, setUser] = useState(null);
  const [website, setWebsite] = useState(null);
  const [seoSettings, setSeoSettings] = useState(null);
  const [contentIdeas, setContentIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadClientSEOData();
  }, [websiteId]);

  const loadClientSEOData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate("/");
        return;
      }
      setUser(currentUser);

      // Pobranie strony - TYLKO dla tego użytkownika
      const websites = await base44.entities.ClientWebsite.filter({
        client_email: currentUser.email,
        id: websiteId
      }, "-created_date", 1);
      
      if (websites.length === 0) {
        navigate("/business"); // Brak dostępu
        return;
      }

      const siteData = websites[0];
      setWebsite(siteData);

      // Pobranie ustawień SEO - TYLKO dla tej strony
      const settings = await base44.entities.ClientSEOSettings.filter({
        client_id: currentUser.id,
        website_id: websiteId
      }, "-created_date", 1);
      setSeoSettings(settings[0] || null);

      // Pobranie pomysłów na treść - TYLKO dla tej strony
      const ideas = await base44.entities.ClientContentIdea.filter({
        client_id: currentUser.id,
        website_id: websiteId
      }, "-created_date");
      setContentIdeas(ideas);

      setLoading(false);
    } catch (error) {
      console.error("Error loading SEO data:", error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Brak dostępu do tej strony</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold truncate">🌐 {website.domain_name}</h2>
          <p className="text-xs text-slate-400 mt-1">SEO Admin</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: "overview", label: "Przegląd", icon: Home },
            { id: "content", label: "Pomysły treści", icon: Lightbulb },
            { id: "pages", label: "Strony", icon: FileText },
            { id: "clusters", label: "Klastry", icon: Network },
            { id: "analytics", label: "Analityka", icon: BarChart3 },
            { id: "settings", label: "Ustawienia SEO", icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                activeTab === item.id
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-800"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-2 border-t border-slate-800">
          <button
            onClick={() => navigate("/business")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Wróć
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {activeTab === "overview" && "Przegląd SEO"}
              {activeTab === "content" && "Pomysły na treść"}
              {activeTab === "pages" && "Moje strony"}
              {activeTab === "clusters" && "Klastry tematyczne"}
              {activeTab === "analytics" && "Analityka"}
              {activeTab === "settings" && "Ustawienia SEO"}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{website.domain_name}</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Pomysły treści</p>
                    <p className="text-3xl font-bold mt-1">{contentIdeas.length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Opublikowano</p>
                    <p className="text-3xl font-bold mt-1">{contentIdeas.filter(c => c.status === "published").length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Klastry</p>
                    <p className="text-3xl font-bold mt-1">{seoSettings?.active_clusters || 0}</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">SEO Score</p>
                    <p className="text-3xl font-bold mt-1">{seoSettings?.seo_score || "-"}</p>
                  </div>
                </div>

                {/* Domain Info */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl p-6">
                  <h3 className="text-lg font-bold mb-4">Informacje o domenie</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Domena</p>
                      <p className="font-bold text-lg">{website.domain_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Typ strony</p>
                      <p className="font-bold capitalize">{website.website_type}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status</p>
                      <p className="font-bold">{website.status === "active" ? "🟢 Aktywna" : "🔴 Nieaktywna"}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Integracje</p>
                      <p className="text-sm">{website.gsc_connected ? "✓ GSC" : ""} {website.analytics_connected ? "✓ Analytics" : ""}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-colors text-left">
                    <Lightbulb className="h-6 w-6 text-amber-500 mb-2" />
                    <p className="font-semibold text-sm">Nowy pomysł na treść</p>
                    <p className="text-xs text-muted-foreground mt-1">Wygeneruj pomysł za pomocą AI</p>
                  </button>
                  <button className="bg-card border border-border rounded-xl p-4 hover:border-primary transition-colors text-left">
                    <Network className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="font-semibold text-sm">Nowy klaster</p>
                    <p className="text-xs text-muted-foreground mt-1">Utwórz klaster słów kluczowych</p>
                  </button>
                </div>
              </div>
            )}

            {/* CONTENT IDEAS TAB */}
            {activeTab === "content" && (
              <div className="space-y-4">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">
                  + Nowy pomysł
                </button>
                {contentIdeas.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Lightbulb className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Brak pomysłów na treść</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contentIdeas.map(idea => (
                      <div key={idea.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-sm">{idea.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">Słowo kluczowe: {idea.primary_keyword}</p>
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <span className={cn(
                                "text-[10px] px-2 py-1 rounded-full",
                                idea.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                              )}>
                                {idea.status}
                              </span>
                              <span className="text-[10px] px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                                {idea.content_type}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Potencjał</p>
                            <p className="text-lg font-bold text-primary">{idea.potential_score || "-"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="max-w-2xl">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Główne słowo kluczowe</p>
                    <p className="text-lg font-bold">{seoSettings?.primary_keyword || "Nie ustawiono"}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-1">Budżet SEO</p>
                    <p className="text-lg font-bold">{seoSettings?.monthly_budget_pln || 0} PLN/miesiąc</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-1">Grupa docelowa</p>
                    <p className="capitalize text-lg">{seoSettings?.target_audience || "Nie ustawiono"}</p>
                  </div>
                  <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium mt-4">
                    Edytuj ustawienia
                  </button>
                </div>
              </div>
            )}

            {/* OTHER TABS - PLACEHOLDER */}
            {["pages", "clusters", "analytics"].includes(activeTab) && (
              <div className="bg-card border border-border rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Ta sekcja będzie dostępna wkrótce</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}