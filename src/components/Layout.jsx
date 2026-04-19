import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Settings, ChevronLeft, Menu, Search,
  Home, ShieldCheck, Globe, ExternalLink, Zap, Plug2,
  Lightbulb, Network, FileText, ClipboardList, Link2, CalendarClock,
  HelpCircle, RefreshCw, Building2, TrendingUp, Sparkles,
  Users, Calendar, Video, CreditCard, MessageSquare, BookOpen, BarChart3,
  Wand2, Share2, Play, Layers, Package, LogOut
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useHub, HUBS_CONFIG } from "@/lib/HubContext";
import LanguageSwitcher from "./LanguageSwitcher";

function handleLogout() {
  sessionStorage.removeItem("lg_auth");
  sessionStorage.removeItem("active_hub");
  window.location.reload();
}

// Map icon string names to components
const ICON_MAP = {
  Home, ShieldCheck, Globe, ExternalLink, Zap, Plug2, Settings,
  Lightbulb, Network, FileText, ClipboardList, Link2, CalendarClock,
  HelpCircle, RefreshCw, Building2, TrendingUp, Sparkles, LayoutDashboard,
  Users, Calendar, Video, CreditCard, MessageSquare, BookOpen, BarChart3,
  Wand2, Share2, Play, Layers, Package, Search,
  Crosshair: TrendingUp, // alias
  Factory: Package, // alias
};

const HUB_COLORS = {
  welcome: "text-primary",
  security: "text-blue-400",
  seo: "text-indigo-400",
  directory: "text-slate-300",
  teachers: "text-blue-300",
  analytics: "text-cyan-400",
  business: "text-blue-200",
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, showLangSwitcher } = useLanguage();
  const { activeHub, setActiveHub } = useHub();

  const hubConfig = HUBS_CONFIG[activeHub] || HUBS_CONFIG["welcome"];
  const navItems = hubConfig.navItems;
  const accentColor = HUB_COLORS[activeHub] || "text-primary";

  const handleGoHome = () => {
    setActiveHub("welcome");
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:relative z-50 h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[220px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div
          className={cn("flex items-center h-16 px-4 border-b border-sidebar-border cursor-pointer hover:opacity-80 transition-opacity", collapsed ? "justify-center" : "gap-3")}
          onClick={handleGoHome}
          title="TexiSEO AI & Enterprise — Strona główna"
        >
          <div className={cn("flex items-center justify-center flex-shrink-0", collapsed ? "h-9 w-9" : "h-10 w-10")}>
            <img
              src="https://media.base44.com/images/public/69da036b1797baa333fdb6c1/f24cb9015_ChatGPTImage11kwi202616_54_09.png"
              alt="TexiSEO AI & Enterprise"
              className="h-full w-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-[11px] font-bold text-sidebar-accent-foreground tracking-tight leading-tight">TexiSEO AI</h1>
              <p className="text-[9px] text-sidebar-foreground/60 truncate">& Enterprise</p>
            </div>
          )}
        </div>

        {/* Hub label */}
        {!collapsed && activeHub !== "welcome" && (
          <div className="px-4 pt-3 pb-1">
            <p className={cn("text-[10px] font-bold uppercase tracking-widest", accentColor)}>
              {hubConfig.label}
            </p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
          {activeHub === "welcome" ? (
            // Welcome state — show just home + settings
            <>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  location.pathname === "/"
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Home className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span>Strona Główna</span>}
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  location.pathname === "/settings"
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Settings className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span>Ustawienia</span>}
              </Link>
              <Link
                to="/integrations"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  location.pathname === "/integrations"
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Plug2 className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span>Integracje</span>}
              </Link>
            </>
          ) : (
            navItems.map((item, idx) => {
              const IconComp = ICON_MAP[item.icon] || Home;
              const isHome = item.label.startsWith("←");
              const isSettings = item.to === "/settings";
              const isActive = !isHome && !isSettings && (
                item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to)
              );

              if (isHome) {
                return (
                  <button
                    key={idx}
                    onClick={() => { handleGoHome(); setMobileOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors mb-2",
                      collapsed && "justify-center px-2",
                      "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                    )}
                  >
                    <IconComp className="h-4 w-4 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              }

              // Separator before settings
              const prevItem = navItems[idx - 1];
              const showSep = isSettings && prevItem && !prevItem.label.startsWith("←") && prevItem.to !== "/settings";

              return (
                <div key={idx}>
                  {showSep && <div className="my-2 border-t border-sidebar-border/50" />}
                  <Link
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                      collapsed && "justify-center px-2",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <IconComp className="h-[18px] w-[18px] flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </div>
              );
            })
          )}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-md hover:bg-secondary">
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.search || "Szukaj..."}
                className="h-9 w-64 pl-9 pr-4 rounded-lg bg-secondary/70 border-none text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showLangSwitcher && <LanguageSwitcher mini />}
            {activeHub !== "welcome" && (
              <span className={cn("text-xs font-semibold hidden sm:block px-2 py-0.5 rounded-md bg-sidebar-accent", accentColor)}>
                {hubConfig.label}
              </span>
            )}
            <span className="text-xs text-muted-foreground font-medium hidden sm:block">linguatoons.com</span>
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[11px] font-semibold text-primary-foreground">T</span>
            </div>
            <button
              onClick={handleLogout}
              title="Wyloguj się"
              className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto flex flex-col">
          {/* Hub back button strip — shown when not on welcome screen and not on "/" */}
          {activeHub !== "welcome" && location.pathname !== "/" && (
            <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border/50 bg-sidebar/30 text-xs">
              <button
                onClick={handleGoHome}
                className="flex items-center gap-1.5 text-sidebar-foreground/60 hover:text-primary transition-colors font-medium"
              >
                <Home className="h-3 w-3" />
                <span>Wróć do menu głównego</span>
              </button>
              <span className="text-border/80 mx-1">·</span>
              <span className="text-muted-foreground font-semibold">{hubConfig.label}</span>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}