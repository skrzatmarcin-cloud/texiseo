import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useHub } from "@/lib/HubContext";
import { cn } from "@/lib/utils";
import {
  Sparkles, FileText, Network, BookOpen, Link2, Play,
  Search, Zap, BarChart3, Settings, RefreshCw, Home,
  ClipboardList, TrendingUp, Lightbulb
} from "lucide-react";

const SEO_TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "content-ideas", label: "Pomysły", icon: Lightbulb },
  { id: "clusters", label: "Klastry", icon: Network },
  { id: "pages", label: "Strony", icon: FileText },
  { id: "briefs", label: "Briefs", icon: ClipboardList },
  { id: "internal-links", label: "Linki wewn.", icon: Link2 },
  { id: "publishing", label: "Publikacje", icon: Play },
  { id: "backlinks", label: "Backlinki", icon: TrendingUp },
  { id: "analytics", label: "Analityka", icon: BarChart3 },
  { id: "settings", label: "Ustawienia", icon: Settings },
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
  const navigate = useNavigate();
  const { setActiveHub } = useHub();
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);

  const handleTabClick = (tabId) => {
    if (tabId === "content-ideas") navigate("/content-ideas");
    else if (tabId === "clusters") navigate("/clusters");
    else if (tabId === "pages") navigate("/pages");
    else if (tabId === "briefs") navigate("/brief-builder");
    else if (tabId === "internal-links") navigate("/internal-links");
    else if (tabId === "publishing") navigate("/publishing-queue");
    else if (tabId === "backlinks") navigate("/backlinks");
    else if (tabId === "analytics") navigate("/analytics");
    else if (tabId === "settings") navigate("/settings");
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
              LinguaToons.com SEO
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Panel SEO — Content Ideas, Clusters, Pages, Backlinks</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
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
        <div className="max-w-6xl mx-auto">
          {tab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Pomysły" value="—" icon={Lightbulb} color="bg-amber-50 text-amber-600" />
                <StatCard label="Klastry" value="—" icon={Network} color="bg-blue-50 text-blue-600" />
                <StatCard label="Strony" value="—" icon={FileText} color="bg-indigo-50 text-indigo-600" />
                <StatCard label="Backlinki" value="—" icon={TrendingUp} color="bg-emerald-50 text-emerald-600" />
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground">
                <p className="text-sm">Dashboard SEO — Przejdź do sekcji powyżej aby zarządzać treścią</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}