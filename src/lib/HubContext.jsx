import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Hub definitions with their sidebar nav items
export const HUBS_CONFIG = {
  welcome: {
    id: "welcome",
    label: "TexiSEO AI & Enterprise",
    navItems: [],
  },
  
  // ===== NAUCZYCIEL — TYLKO SWÓ BIZNES =====
  teachers: {
    id: "teachers",
    label: "Panel Nauczyciela",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/teacher-dashboard?tab=courses", label: "Moje Kursy", icon: "BookOpen" },
      { to: "/teacher-dashboard?tab=overview", label: "Przegląd", icon: "BarChart3" },
      { to: "/teacher-dashboard?tab=earnings", label: "Zarobki", icon: "CreditCard" },
      { to: "/teacher-dashboard?tab=students", label: "Moi Uczniowie", icon: "Users" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== BIZNES — FIRMA, MAGAZYN, PRODUKCJA =====
  business: {
    id: "business",
    label: "Business Hub",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/business?tab=companies", label: "Firmy", icon: "Building2" },
      { to: "/business?tab=inventory", label: "Magazyn", icon: "Layers" },
      { to: "/business?tab=production", label: "Produkcja", icon: "Factory" },
      { to: "/business?tab=suppliers", label: "Dostawcy", icon: "Users" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== WEBSITE & SEO — TYLKO JEŚLI DODAL DOMENĘ =====
  website: {
    id: "website",
    label: "Website & SEO",
    navItems: [
      { to: "/", label: "← Strona Główna", icon: "Home" },
      { to: "/website?tab=overview", label: "Moja Domena", icon: "Globe" },
      { to: "/website?tab=seo", label: "SEO Narzędzia", icon: "Sparkles" },
      { to: "/website?tab=content", label: "Pomysły treści", icon: "Lightbulb" },
      { to: "/website?tab=publishing", label: "Publikacje", icon: "CalendarClock" },
      { to: "/website?tab=analytics", label: "Analityka", icon: "BarChart3" },
      { to: "/wordpress", label: "WordPress", icon: "Globe" },
      { to: "/settings", label: "Ustawienia", icon: "Settings" },
    ],
  },

  // ===== ADMIN — SUPERADMIN TYLKO =====
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
    // ADMIN może wejść w każdy hub
    // TEACHER może wejść TYLKO w teachers + website (jeśli domena)
    // USER może wejść w wszystkie (w przyszłości)
    
    if (userRole === "admin") {
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