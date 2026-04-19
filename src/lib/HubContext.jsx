import { createContext, useContext, useState } from "react";

// Hub definitions with their sidebar nav items
export const HUBS_CONFIG = {
  welcome: {
    id: "welcome",
    label: "TexiSEO AI & Enterprise",
    navItems: [],
  },
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
  directory: {
    id: "directory",
    label: "Katalog Firm",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/directory", label: "Katalog Firm", icon: "Building2" },
      { to: "/competitors", label: "Konkurenci", icon: "Crosshair" },
      { to: "/backlinks", label: "Link Exchange", icon: "Link2" },
      { to: "/seo-autopilot", label: "SEO Autopilot", icon: "Sparkles" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },
  teachers: {
    id: "teachers",
    label: "Teachers Hub",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/teachers", label: "Nauczyciele", icon: "Users" },
      { to: "/teachers", label: "Planer lekcji", icon: "Calendar" },
      { to: "/teachers", label: "Lekcje Live", icon: "Video" },
      { to: "/teachers", label: "Wiadomości", icon: "MessageSquare" },
      { to: "/teachers", label: "Kursy", icon: "BookOpen" },
      { to: "/teachers", label: "Rozliczenia", icon: "CreditCard" },
      { to: "/teachers", label: "Statystyki", icon: "BarChart3" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },
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
  business: {
    id: "business",
    label: "Business Hub",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/business", label: "Firmy", icon: "Building2" },
      { to: "/business", label: "Magazyn", icon: "Layers" },
      { to: "/business", label: "Produkcja", icon: "Factory" },
      { to: "/business", label: "Dostawcy", icon: "Users" },
      { to: "/integrations", label: "Integracje", icon: "Plug2" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },
  texiseo_admin: {
    id: "texiseo_admin",
    label: "TexiSEO Admin",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/texiseo-admin", label: "Dashboard", icon: "BarChart3" },
      { to: "/texiseo-admin", label: "Zgłoszenia klientów", icon: "MessageSquare" },
      { to: "/texiseo-admin", label: "Użytkownicy", icon: "Users" },
      { to: "/texiseo-admin", label: "Płatności", icon: "CreditCard" },
      { to: "/self-promotion", label: "SEO Autopromocja", icon: "Sparkles" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },
};

const HubContext = createContext({ activeHub: "welcome", setActiveHub: () => {} });

export function HubProvider({ children }) {
  const [activeHub, setActiveHub] = useState(() => {
    return sessionStorage.getItem("active_hub") || "welcome";
  });

  const setHub = (hubId) => {
    sessionStorage.setItem("active_hub", hubId);
    setActiveHub(hubId);
  };

  return (
    <HubContext.Provider value={{ activeHub, setActiveHub: setHub }}>
      {children}
    </HubContext.Provider>
  );
}

export function useHub() {
  return useContext(HubContext);
}