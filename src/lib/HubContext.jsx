import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Hub definitions with their sidebar nav items
export const HUBS_CONFIG = {
  welcome: {
    id: "welcome",
    label: "TexiSEO AI & Enterprise",
    navItems: [],
  },

  // ===== SECURITY =====
  security: {
    id: "security",
    label: "Bezpieczeństwo",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/security", label: "Security Monitor", icon: "ShieldCheck" },
      { to: "/wordpress", label: "WordPress Health", icon: "Globe" },
      { to: "/backlinks", label: "Backlinki", icon: "ExternalLink" },
      { to: "/automations", label: "Automations", icon: "Zap" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== SEO TOOLS =====
  seo: {
    id: "seo",
    label: "SEO Narzędzia",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/content-ideas", label: "Pomysły treści", icon: "Lightbulb" },
      { to: "/clusters", label: "Klastry", icon: "Network" },
      { to: "/pages", label: "Strony", icon: "FileText" },
      { to: "/brief-builder", label: "Brief Builder", icon: "ClipboardList" },
      { to: "/internal-links", label: "Linki wewnętrzne", icon: "Link2" },
      { to: "/publishing-queue", label: "Publikacje", icon: "CalendarClock" },
      { to: "/faq-schema", label: "FAQ Schema", icon: "HelpCircle" },
      { to: "/refresh-center", label: "Refresh Center", icon: "RefreshCw" },
      { to: "/seo-qa", label: "SEO QA", icon: "ShieldCheck" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== DIRECTORY =====
  directory: {
    id: "directory",
    label: "Katalog Firm",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/directory", label: "Katalog Firm", icon: "Building2" },
      { to: "/competitors", label: "Konkurenci", icon: "TrendingUp" },
      { to: "/backlinks", label: "Link Exchange", icon: "Link2" },
      { to: "/seo-autopilot", label: "SEO Autopilot", icon: "Sparkles" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== TEACHERS =====
  teachers: {
    id: "teachers",
    label: "Teachers Hub",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/teachers?tab=marketplace", label: "Marketplace", icon: "Users" },
      { to: "/teachers?tab=planner", label: "Planer lekcji", icon: "Calendar" },
      { to: "/teachers?tab=live", label: "Lekcje Live", icon: "Video" },
      { to: "/teachers?tab=chat", label: "Wiadomości", icon: "MessageSquare" },
      { to: "/teachers?tab=courses_market", label: "Kursy", icon: "BookOpen" },
      { to: "/teachers?tab=payroll", label: "Rozliczenia", icon: "CreditCard" },
      { to: "/teachers?tab=stats", label: "Statystyki", icon: "BarChart3" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== ANALYTICS =====
  analytics: {
    id: "analytics",
    label: "Analityka",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/analytics", label: "Analytics", icon: "BarChart3" },
      { to: "/content-engine", label: "Content Engine", icon: "Wand2" },
      { to: "/social-media", label: "Social Media", icon: "Share2" },
      { to: "/execution-center", label: "Exec. Center", icon: "Play" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== BUSINESS =====
  business: {
    id: "business",
    label: "Business Hub",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/business?tab=companies", label: "Firmy", icon: "Building2" },
      { to: "/business?tab=inventory", label: "Magazyn", icon: "Layers" },
      { to: "/business?tab=production", label: "Produkcja", icon: "Factory" },
      { to: "/business?tab=suppliers", label: "Dostawcy", icon: "Users" },
      { to: "/integrations", label: "Integracje", icon: "Plug2" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== SELF-PROMOTION =====
  self_promotion: {
    id: "self_promotion",
    label: "SEO Autopromocja",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/self-promotion?tab=generator", label: "Generator treści", icon: "Sparkles" },
      { to: "/self-promotion?tab=competitors", label: "Analiza konkurencji", icon: "TrendingUp" },
      { to: "/self-promotion?tab=keywords", label: "Mapa słów kluczowych", icon: "Search" },
      { to: "/self-promotion?tab=agent", label: "Agent SEO AI", icon: "Wand2" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== WEBSITE HUB =====
  website: {
    id: "website",
    label: "Website & SEO",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/website?tab=overview", label: "Moja Domena", icon: "Globe" },
      { to: "/website?tab=seo", label: "SEO Narzędzia", icon: "Sparkles" },
      { to: "/website?tab=content", label: "Treść", icon: "Lightbulb" },
      { to: "/website?tab=publishing", label: "Publikacje", icon: "CalendarClock" },
      { to: "/website?tab=analytics", label: "Analityka", icon: "BarChart3" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== ADMIN SUPERADMIN =====
  texiseo_admin: {
    id: "texiseo_admin",
    label: "🔐 TexiSEO SUPERADMIN",
    navItems: [
      { to: "/texiseo-admin?tab=dashboard", label: "📊 Dashboard", icon: "BarChart3" },
      { to: "/texiseo-admin?tab=users", label: "👥 Użytkownicy", icon: "Users" },
      { to: "/texiseo-admin?tab=teachers", label: "👨‍🏫 Nauczyciele", icon: "BookOpen" },
      { to: "/texiseo-admin?tab=payments", label: "💳 Płatności", icon: "CreditCard" },
      { to: "/texiseo-admin?tab=requests", label: "💬 Zgłoszenia", icon: "MessageSquare" },
      { to: "/settings", label: "⚙️ Ustawienia", icon: "Settings" },
      { to: "/", label: "← Wróć", icon: "Home" },
    ],
  },
};

const HubContext = createContext({ activeHub: "welcome", setActiveHub: () => {}, userRole: null });

export function HubProvider({ children }) {
  const [activeHub, setActiveHubState] = useState(() => {
    return sessionStorage.getItem("active_hub") || "welcome";
  });
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    base44.auth.me().then(user => {
      setUserRole(user?.role || "user");
    }).catch(() => setUserRole("user"));
  }, []);

  const setHub = (hubId) => {
    // ADMIN — pełny dostęp do WSZYSTKICH hubów
    // TEACHER — tylko teachers + website
    // USER — business + website
    
    if (userRole === "admin") {
      // Admin widzi ALL
      sessionStorage.setItem("active_hub", hubId);
      setActiveHubState(hubId);
    } else if (userRole === "teacher" && ["teachers", "website"].includes(hubId)) {
      sessionStorage.setItem("active_hub", hubId);
      setActiveHubState(hubId);
    } else if (["welcome", "business"].includes(hubId)) {
      sessionStorage.setItem("active_hub", hubId);
      setActiveHubState(hubId);
    }
  };

  return (
    <HubContext.Provider value={{ activeHub, setActiveHub: setHub, userRole }}>
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  return useContext(HubContext);
}