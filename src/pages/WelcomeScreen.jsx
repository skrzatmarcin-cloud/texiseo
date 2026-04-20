import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useHub } from "@/lib/HubContext";
import { base44 } from "@/api/base44Client";
import EnterpriseModuleViewer from "../components/enterprise/EnterpriseModuleViewer";
import {
  GraduationCap, Briefcase, Globe, Settings, Plug2,
  BookOpen, Users, CreditCard, BarChart3, Building2, Layers,
  Sparkles, Lightbulb, Lock, TrendingUp, CalendarClock
} from "lucide-react";

const ALL_HUBS = [
  {
    id: "teachers",
    label: "👨‍🏫 Panel Nauczyciela",
    sublabel: "Kursy • Uczniowie • Zarobki",
    to: "/teacher-dashboard",
    gradient: "from-blue-600 to-indigo-700",
    glowColor: "shadow-blue-900/60",
    Icon: GraduationCap,
    iconColor: "text-blue-200",
    sublinks: [
      { label: "Kursy", icon: BookOpen },
      { label: "Uczniowie", icon: Users },
      { label: "Zarobki", icon: CreditCard },
      { label: "Statystyki", icon: BarChart3 },
    ],
  },

  {
    id: "business",
    label: "🏢 Business Hub",
    sublabel: "Firmy • Magazyn • Produkcja",
    to: "/business",
    gradient: "from-slate-700 to-slate-900",
    glowColor: "shadow-slate-900/60",
    Icon: Briefcase,
    iconColor: "text-slate-300",
    sublinks: [
      { label: "CRM (Firmy)", icon: Building2, tab: "companies" },
      { label: "WMS (Magazyn)", icon: Layers, tab: "inventory" },
      { label: "MES (Produkcja)", icon: Building2, tab: "production" },
      { label: "ERP (Raporty)", icon: BarChart3, tab: "reports" },
    ],
  },

  {
    id: "website",
    label: "🌐 Website & SEO",
    sublabel: "Domena • SEO • Analityka",
    to: "/website",
    gradient: "from-purple-600 to-pink-700",
    glowColor: "shadow-purple-900/60",
    Icon: Globe,
    iconColor: "text-purple-200",
    frozenReason: "Weryfikuj domenę aby aktywować",
    sublinks: [
      { label: "Domena", icon: Globe },
      { label: "SEO Narzędzia", icon: Sparkles },
      { label: "Treść", icon: Lightbulb },
      { label: "Analityka", icon: BarChart3 },
    ],
  },

  // ADMIN ONLY HUBS
  {
    id: "security",
    label: "🔒 Bezpieczeństwo",
    sublabel: "Security • WordPress • Backlinki",
    to: "/security",
    gradient: "from-blue-700 to-blue-900",
    glowColor: "shadow-blue-900/60",
    Icon: GraduationCap,
    iconColor: "text-blue-300",
    adminOnly: true,
    sublinks: [
      { label: "Security", icon: Users },
      { label: "WordPress", icon: Globe },
      { label: "Backlinki", icon: Sparkles },
    ],
  },

  {
    id: "seo",
    label: "🎯 SEO Narzędzia",
    sublabel: "Content • Klastry • Publikacje",
    to: "/content-ideas",
    gradient: "from-indigo-600 to-purple-700",
    glowColor: "shadow-purple-900/60",
    Icon: Sparkles,
    iconColor: "text-indigo-200",
    adminOnly: true,
    sublinks: [
      { label: "Content", icon: Lightbulb },
      { label: "Klastry", icon: Building2 },
      { label: "Publikacje", icon: CalendarClock },
    ],
  },

  {
    id: "directory",
    label: "📚 Katalog Firm",
    sublabel: "Direktoria • Konkurenci • Links",
    to: "/directory",
    gradient: "from-slate-600 to-slate-800",
    glowColor: "shadow-slate-900/60",
    Icon: Building2,
    iconColor: "text-slate-300",
    adminOnly: true,
    sublinks: [
      { label: "Katalog", icon: Building2 },
      { label: "Konkurenci", icon: TrendingUp },
      { label: "Link Exchange", icon: Sparkles },
    ],
  },

  {
    id: "analytics",
    label: "📊 Analityka",
    sublabel: "Analytics • Content Engine",
    to: "/analytics",
    gradient: "from-cyan-600 to-blue-700",
    glowColor: "shadow-cyan-900/60",
    Icon: BarChart3,
    iconColor: "text-cyan-200",
    adminOnly: true,
    sublinks: [
      { label: "Analytics", icon: BarChart3 },
      { label: "Content Engine", icon: Sparkles },
      { label: "Social Media", icon: Users },
    ],
  },

  {
    id: "self_promotion",
    label: "✨ SEO Autopromocja",
    sublabel: "Generator • Konkurenci • AI",
    to: "/self-promotion",
    gradient: "from-violet-600 to-purple-700",
    glowColor: "shadow-purple-900/60",
    Icon: Sparkles,
    iconColor: "text-violet-200",
    adminOnly: true,
    sublinks: [
      { label: "Generator", icon: Sparkles },
      { label: "Konkurenci", icon: TrendingUp },
      { label: "Keywords", icon: Building2 },
    ],
  },
];

function HubIcon({ Icon, iconColor, gradient, frozen }) {
  return (
    <div className="relative flex-shrink-0">
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} ${frozen ? "opacity-10" : "opacity-30"} blur-lg scale-110`} />
      <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${gradient} border ${frozen ? "border-white/5" : "border-white/10"} flex items-center justify-center shadow-xl`}>
        <div className="absolute top-1 left-1 right-1 h-1/3 rounded-t-xl bg-white/10" />
        <Icon className={`h-8 w-8 ${iconColor} ${frozen ? "opacity-40" : ""} relative z-10 drop-shadow-lg`} strokeWidth={1.5} />
        {frozen && <Lock className="absolute h-5 w-5 text-white/40 z-20" />}
      </div>
    </div>
  );
}

function HubCard({ hub, onSelect, user }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isFrozen = hub.id === "website" && !isAdmin && !user?.website_url;

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isFrozen) {
      onSelect(hub.id);
      navigate(hub.to);
    }
  };

  const handleSublinkClick = (e, sub) => {
    e.stopPropagation();
    if (!isFrozen) {
      onSelect(hub.id);
      const url = sub.tab ? `${hub.to}?tab=${sub.tab}` : hub.to;
      navigate(url);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative overflow-hidden rounded-2xl border
        bg-gradient-to-br from-[#0f1c3a] to-[#0a1628]
        transition-all duration-200 p-5
        ${isFrozen 
          ? "border-white/5 opacity-60 cursor-not-allowed" 
          : "border-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
        }
        ${hub.glowColor}
      `}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${hub.gradient}`} />
      <div className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${hub.gradient} ${isFrozen ? "opacity-5" : "opacity-10"} blur-2xl pointer-events-none`} />

      <div className="flex items-center gap-4 mb-4">
        <HubIcon Icon={hub.Icon} iconColor={hub.iconColor} gradient={hub.gradient} frozen={isFrozen} />
        <div>
          <h3 className={`font-bold text-lg leading-tight transition-colors ${isFrozen ? "text-white/50" : "text-white hover:text-blue-200"}`}>
            {hub.label}
          </h3>
          <p className={`text-xs font-medium mt-0.5 ${isFrozen ? "text-blue-300/30" : "text-blue-300/70"}`}>
            {hub.sublabel}
          </p>
          {isFrozen && hub.frozenReason && (
            <p className="text-[10px] text-amber-300/70 mt-1.5 flex items-center gap-1">
              <Lock className="h-3 w-3" /> {hub.frozenReason}
            </p>
          )}
        </div>
      </div>

      {!isFrozen && (
        <div className="grid grid-cols-2 gap-1.5">
          {hub.sublinks.map((sub) => (
            <div
              key={sub.label}
              onClick={(e) => handleSublinkClick(e, sub)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors text-left cursor-pointer"
            >
              <sub.icon className="h-3 w-3 text-blue-300/70 flex-shrink-0" />
              <span className="text-[11px] text-blue-100/70 font-medium truncate">
                {sub.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="absolute -bottom-5 -right-5 opacity-[0.06] pointer-events-none">
        <hub.Icon className="h-24 w-24 text-white" />
      </div>
    </div>
  );
}

export default function WelcomeScreen() {
  const { setActiveHub } = useHub();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) {
        // If no user, auto-logout
        sessionStorage.removeItem("lg_auth");
        window.location.reload();
        return;
      }
      setUser(u);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleSelect = (hubId) => {
    setActiveHub(hubId);
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userDisplay = user?.full_name || user?.email?.split('@')[0] || "TexiSEO";
  const userInitial = userDisplay.charAt(0).toUpperCase();

  // Show module viewer if selected
  if (selectedModule) {
    return <EnterpriseModuleViewer module={selectedModule} onClose={() => setSelectedModule(null)} />;
  }

  return (
    <div
      className="min-h-full p-6 space-y-6"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Witaj, {userDisplay}! 🚀
          </h1>
          <p className="text-blue-300/70 text-sm mt-0.5">
            Zarządzaj swoim biznesem, kurami i stronami
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-blue-300/70 bg-white/5 border border-white/10 px-3 py-2 rounded-full">
          <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-primary-foreground">{userInitial}</span>
          </div>
          <span>{user?.role === "admin" ? "👑 ADMIN" : user?.role || "Użytkownik"}</span>
        </div>
      </div>

      {/* Role-based hub filtering */}
      {(() => {
        let visibleHubs = ALL_HUBS;
        
        if (user?.role === "teacher") {
          // Teachers see only teacher panel
          visibleHubs = ALL_HUBS.filter(h => h.id === "teachers");
        } else if (user?.role === "student") {
          // Students see limited hubs
          visibleHubs = ALL_HUBS.filter(h => !h.adminOnly && h.id !== "business");
        } else if (user?.role === "enterprise") {
          // Enterprise see business hub + limited SEO
          visibleHubs = ALL_HUBS.filter(h => h.id === "business" || h.id === "website");
        } else if (user?.role === "admin") {
          // Admins see all hubs
          visibleHubs = ALL_HUBS;
        }
        
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleHubs.map(hub => (
              <HubCard key={hub.id} hub={hub} onSelect={handleSelect} user={user} />
            ))}
          </div>
        );
      })()}

      {/* Admin Button (for admins only) */}
      {user?.role === "admin" && (
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={() => {
              setActiveHub("texiseo_admin");
              navigate("/texiseo-admin");
            }}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-700 hover:from-yellow-500 hover:to-amber-600 text-white font-bold flex items-center justify-center gap-2 transition-all"
          >
            🔐 Panel TexiSEO SUPERADMIN
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10 flex-wrap">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-1.5 text-xs text-blue-300/60 hover:text-blue-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <Settings className="h-3.5 w-3.5" />
          Ustawienia
        </button>
        <button
          onClick={() => navigate("/integrations")}
          className="flex items-center gap-1.5 text-xs text-blue-300/60 hover:text-blue-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <Plug2 className="h-3.5 w-3.5" />
          Integracje
        </button>
        <div className="h-5 w-px bg-white/10" />
        <button
          onClick={() => {
            sessionStorage.removeItem("lg_auth");
            sessionStorage.removeItem("lg_demo_mode");
            sessionStorage.removeItem("lg_demo_type");
            sessionStorage.removeItem("active_hub");
            localStorage.clear();
            window.location.reload();
          }}
          className="flex items-center gap-1.5 text-xs text-emerald-300/60 hover:text-emerald-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 font-medium"
        >
          🎬 Spróbuj Demo
        </button>
      </div>
    </div>
  );
}