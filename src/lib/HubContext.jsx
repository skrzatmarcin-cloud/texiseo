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
      { to: "/business?tab=companies", label: "Firmy", icon: "Building2" },
      { to: "/business?tab=inventory", label: "Magazyn", icon: "Layers" },
      { to: "/business?tab=production", label: "Produkcja", icon: "Factory" },
      { to: "/business?tab=suppliers", label: "Dostawcy", icon: "Users" },
      { to: "/integrations", label: "Integracje", icon: "Plug2" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },
  self_promotion: {
    id: "self_promotion",
    label: "SEO Autopromocja",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/self-promotion?tab=content", label: "Generator treści", icon: "Sparkles" },
      { to: "/self-promotion?tab=competitors", label: "Analiza konkurencji", icon: "TrendingUp" },
      { to: "/self-promotion?tab=keywords", label: "Mapa słów kluczowych", icon: "Search" },
      { to: "/self-promotion?tab=agent", label: "Agent SEO AI", icon: "Wand2" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },
  texiseo_admin: {
    id: "texiseo_admin",
    label: "TexiSEO Admin — SUPERADMIN",
    navItems: [
      // ===== SEO & CONTENT =====
      { to: "/content-ideas", label: "📝 Pomysły treści", icon: "Sparkles" },
      { to: "/clusters", label: "🔗 Klastry tematyczne", icon: "Network" },
      { to: "/pages", label: "📄 Strony", icon: "FileText" },
      { to: "/brief-builder", label: "📋 Brief Builder", icon: "ClipboardList" },
      { to: "/publishing-queue", label: "🚀 Publikacje", icon: "CalendarClock" },
      { to: "/content-engine", label: "⚙️ Content Engine", icon: "Wand2" },
      { to: "/seo-qa", label: "✅ SEO QA", icon: "ShieldCheck" },
      
      // ===== LINKI & BACKLINKI =====
      { to: "/backlinks", label: "🔗 Backlink System", icon: "ExternalLink" },
      { to: "/internal-links", label: "🔗 Linki wewnętrzne", icon: "Link2" },
      
      // ===== WORDPRESS & BEZPIECZEŃSTWO =====
      { to: "/wordpress", label: "🖥️ WordPress", icon: "Globe" },
      { to: "/security", label: "🔒 Security Monitor", icon: "ShieldCheck" },
      
      // ===== ANALITYKA & RAPORTOWANIE =====
      { to: "/analytics", label: "📊 Google Analytics", icon: "BarChart3" },
      { to: "/competitors", label: "🏆 Konkurenci", icon: "TrendingUp" },
      { to: "/seo-autopilot", label: "🤖 SEO Autopilot", icon: "Zap" },
      { to: "/refresh-center", label: "🔄 Refresh Center", icon: "RefreshCw" },
      { to: "/faq-schema", label: "❓ FAQ Schema", icon: "HelpCircle" },
      
      // ===== SOCIAL & EXECUTION =====
      { to: "/social-media", label: "📱 Social Media", icon: "Share2" },
      { to: "/execution-center", label: "▶️ Execution Center", icon: "Play" },
      
      // ===== BUSINESS & KATALOG =====
      { to: "/business?tab=companies", label: "🏢 Firmy (Business)", icon: "Building2" },
      { to: "/business?tab=inventory", label: "📦 Magazyn", icon: "Layers" },
      { to: "/business?tab=production", label: "🏭 Produkcja", icon: "Factory" },
      { to: "/business?tab=suppliers", label: "🚚 Dostawcy", icon: "Users" },
      { to: "/directory", label: "📚 Katalog Firm", icon: "Building2" },
      
      // ===== NAUCZYCIELE & KURSY =====
      { to: "/teachers?tab=marketplace", label: "👨‍🏫 Teacher Marketplace", icon: "Users" },
      { to: "/teachers?tab=courses_market", label: "📚 Kursy", icon: "BookOpen" },
      { to: "/teachers?tab=payroll", label: "💰 Rozliczenia lekcji", icon: "CreditCard" },
      
      // ===== ADMIN PANEL =====
      { to: "/texiseo-admin?tab=dashboard", label: "📊 Admin Dashboard", icon: "BarChart3" },
      { to: "/texiseo-admin?tab=requests", label: "💬 Zgłoszenia", icon: "MessageSquare" },
      { to: "/texiseo-admin?tab=users", label: "👥 Użytkownicy", icon: "Users" },
      { to: "/texiseo-admin?tab=payments", label: "💳 Płatności", icon: "CreditCard" },
      { to: "/texiseo-admin?tab=enterprise", label: "🏢 Enterprise Panel", icon: "Building2" },
      
      // ===== AUTOMATIONS & INTEGRACJE =====
      { to: "/automations", label: "⚡ Automations", icon: "Zap" },
      { to: "/integrations", label: "🔌 Integracje", icon: "Plug2" },
      
      // ===== SELF-PROMOTION =====
      { to: "/self-promotion?tab=generator", label: "✍️ Generator treści", icon: "Sparkles" },
      { to: "/self-promotion?tab=competitors", label: "🎯 Analiza konkurencji", icon: "TrendingUp" },
      { to: "/self-promotion?tab=keywords", label: "🔍 Słowa kluczowe", icon: "Search" },
      
      // ===== SETTINGS =====
      { to: "/settings", label: "⚙️ Ustawienia", icon: "Settings" },
      { to: "/", label: "← Wróć do Menu", icon: "Home" },
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