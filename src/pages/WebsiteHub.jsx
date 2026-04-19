import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Globe, Settings, Home, BookOpen, BarChart3, Sparkles, 
  Lightbulb, CalendarClock, AlertCircle, CheckCircle2, 
  Loader2, LogOut
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Moja Domena", icon: Globe },
  { id: "seo", label: "SEO Narzędzia", icon: Sparkles },
  { id: "content", label: "Treść", icon: Lightbulb },
  { id: "publishing", label: "Publikacje", icon: CalendarClock },
  { id: "analytics", label: "Analityka", icon: BarChart3 },
];

function DomainVerificationForm({ user, onSuccess }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const validateUrl = (str) => {
    try {
      new URL(str.startsWith("http") ? str : `https://${str}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!url.trim()) {
      setError("Wpisz adres domeny");
      return;
    }

    if (!validateUrl(url)) {
      setError("Nieprawidłowy format URL (np. example.com lub https://example.com)");
      return;
    }

    setLoading(true);

    // Mock weryfikacji — w realnym świecie można by zrobić DNS check
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Zapisz domenę w user entity
      const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
      const domainName = new URL(normalizedUrl).hostname;

      await base44.auth.updateMe({
        website_url: normalizedUrl,
        domain_name: domainName,
      });

      setSuccess(true);
      setUrl("");

      // Callback — powiadomi parent component
      onSuccess?.({ url: normalizedUrl, domain: domainName });

      // Po 2 sekundach reload, aby zaktualizować state
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setError("Błąd przy zapisywaniu domeny: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-2">🔓 Odbierz dostęp do SEO</h3>
      <p className="text-sm text-slate-300 mb-4">
        Wpisz URL swojej domeny, aby włączyć narzędzia SEO i analitykę
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-slate-300 block mb-1.5">
            URL domeny
          </label>
          <input
            type="text"
            placeholder="example.com lub https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading || success}
            className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-lg animate-pulse">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            ✅ Domena zweryfikowana! Ładuję...
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Weryfikuję...</>
          ) : success ? (
            <><CheckCircle2 className="h-4 w-4" /> Zatwierdzona!</>
          ) : (
            <><Globe className="h-4 w-4" /> Weryfikuj domenę</>
          )}
        </button>
      </form>
    </div>
  );
}

function SEOToolsLockedPlaceholder() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl p-8 text-center">
      <div className="h-16 w-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-300 mb-2">Narzędzia SEO zablokowane</h3>
      <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto">
        Aby uzyskać dostęp do pełnych narzędzi SEO, musisz najpierw zweryfikować swoją domenę.
      </p>
      <p className="text-xs text-slate-500">Przejdź do "Moja Domena" aby rozpocząć</p>
    </div>
  );
}

export default function WebsiteHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [verificationInProgress, setVerificationInProgress] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => {
      // Jeśli użytkownik nie ma domeny, ustaw Linguatoons.com jako domyślną
      if (!u?.website_url) {
        u = {
          ...u,
          website_url: "https://linguatoons.com",
          domain_name: "linguatoons.com"
        };
      }
      setUser(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const isDomainVerified = !!user?.website_url;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold">🌐 Website Hub</h2>
          <p className="text-xs text-slate-400 mt-1">
            {isDomainVerified ? user?.domain_name || "Domena" : "Zweryfikuj domenę"}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!isDomainVerified && tab.id !== "overview"}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                activeTab === tab.id
                  ? "bg-purple-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-3 space-y-2 border-t border-slate-800">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            Wróć
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-red-400 hover:bg-red-900/20 transition-colors"
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
          <h1 className="text-2xl font-bold">
            {activeTab === "overview" && "🌐 Moja Domena"}
            {activeTab === "seo" && "✨ SEO Narzędzia"}
            {activeTab === "content" && "💡 Pomysły treści"}
            {activeTab === "publishing" && "📅 Publikacje"}
            {activeTab === "analytics" && "📊 Analityka"}
          </h1>
          {isDomainVerified && (
            <div className="flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Domena zweryfikowana
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {!isDomainVerified ? (
                  <>
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-200">Domena nie zweryfikowana</p>
                        <p className="text-sm text-amber-300/80 mt-1">
                          Weryfikuj swoją domenę, aby uzyskać dostęp do wszystkich narzędzi SEO
                        </p>
                      </div>
                    </div>

                    <DomainVerificationForm 
                      user={user} 
                      onSuccess={() => setVerificationInProgress(true)}
                    />
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-card border border-border rounded-xl p-5">
                      <h3 className="text-lg font-bold mb-3">✅ Twoja Domena</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-muted-foreground">Domena:</span>
                          <span className="font-bold">{user?.domain_name}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-muted-foreground">URL:</span>
                          <a href={user?.website_url} target="_blank" rel="noopener noreferrer" className="font-bold text-primary hover:underline">
                            {user?.website_url}
                          </a>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <span className="text-emerald-300">Status:</span>
                          <span className="font-bold text-emerald-300">🟢 Zweryfikowana</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setActiveTab("seo")}
                        className="p-4 bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 rounded-xl hover:border-purple-500/60 transition-all text-left"
                      >
                        <Sparkles className="h-6 w-6 text-purple-300 mb-2" />
                        <p className="font-semibold text-sm">SEO Narzędzia</p>
                        <p className="text-xs text-slate-400 mt-1">Zacznij optymalizację</p>
                      </button>
                      <button
                        onClick={() => setActiveTab("content")}
                        className="p-4 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border border-blue-500/30 rounded-xl hover:border-blue-500/60 transition-all text-left"
                      >
                        <Lightbulb className="h-6 w-6 text-blue-300 mb-2" />
                        <p className="font-semibold text-sm">Pomysły treści</p>
                        <p className="text-xs text-slate-400 mt-1">Generuj artykuły</p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SEO TOOLS — LOCKED IF NO DOMAIN */}
            {activeTab === "seo" && (
              isDomainVerified ? (
                <div className="space-y-4">
                  <div className="text-center text-slate-400 py-8">
                    <Sparkles className="h-12 w-12 text-slate-400/30 mx-auto mb-3" />
                    <p>SEO Tools będą dostępne wkrótce</p>
                  </div>
                </div>
              ) : (
                <SEOToolsLockedPlaceholder />
              )
            )}

            {/* OTHER TABS LOCKED */}
            {["content", "publishing", "analytics"].includes(activeTab) && (
              isDomainVerified ? (
                <div className="text-center text-slate-400 py-8">
                  <p>Ta sekcja będzie dostępna wkrótce</p>
                </div>
              ) : (
                <SEOToolsLockedPlaceholder />
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}