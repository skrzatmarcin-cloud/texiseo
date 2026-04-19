import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Lightbulb, Network, FileText, ClipboardList,
  Link2, CalendarClock, Settings, Search, ChevronLeft, Menu,
  HelpCircle, RefreshCw, ShieldCheck, Zap, Plug2, Globe, ExternalLink,
  Wand2, Share2, BarChart3, Play, Crosshair, Sparkles, Shield, Building2,
  GraduationCap, Briefcase
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { LogOut } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

function handleLogout() {
  sessionStorage.removeItem("lg_auth");
  window.location.reload();
}

const NAV_ITEMS = [
  { to: "/", labelKey: "dashboard", icon: LayoutDashboard },
  { to: "/content-ideas", labelKey: "content_ideas", icon: Lightbulb },
  { to: "/clusters", labelKey: "clusters", icon: Network },
  { to: "/pages", labelKey: "pages", icon: FileText },
  { to: "/brief-builder", labelKey: "brief_builder", icon: ClipboardList },
  { to: "/internal-links", labelKey: "internal_links", icon: Link2 },
  { to: "/publishing-queue", labelKey: "publishing_queue", icon: CalendarClock },
  { to: "/faq-schema", labelKey: "faq_schema", icon: HelpCircle },
  { to: "/refresh-center", labelKey: "refresh_center", icon: RefreshCw },
  { to: "/seo-qa", labelKey: "seo_qa", icon: ShieldCheck },
  { to: "/wordpress", labelKey: "wordpress", icon: Globe },
  { to: "/content-engine", labelKey: "content_engine", icon: Wand2 },
  { to: "/social-media", labelKey: "social_media", icon: Share2 },
  { to: "/analytics", labelKey: "analytics", icon: BarChart3 },
  { to: "/execution-center", labelKey: "execution_center", icon: Play },
  { to: "/backlinks", labelKey: "backlinks", icon: ExternalLink },
  { to: "/competitors", labelKey: "competitors", icon: Crosshair },
  { to: "/seo-autopilot", labelKey: "seo_autopilot", icon: Sparkles },
  { to: "/security", labelKey: "security", icon: Shield },
  { to: "/directory", labelKey: "directory", icon: Building2 },
  { to: "/teachers", labelKey: "teacher_hub", icon: GraduationCap },
  { to: "/business", labelKey: "business_hub", icon: Briefcase },
  { to: "/automations", labelKey: "automations", icon: Zap },
  { to: "/integrations", labelKey: "integrations", icon: Plug2 },
  { to: "/settings", labelKey: "settings", icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, showLangSwitcher } = useLanguage();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed lg:relative z-50 h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border", collapsed ? "justify-center" : "gap-3")}>
          <div className={cn("flex items-center justify-center flex-shrink-0", collapsed ? "h-9 w-9" : "h-10 w-10")}>
            <img
              src="https://media.base44.com/images/public/69da036b1797baa333fdb6c1/f24cb9015_ChatGPTImage11kwi202616_54_09.png"
              alt="LinguaSEO OS"
              className="h-full w-full object-contain"
            />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">LinguaSEO OS</h1>
              <p className="text-[10px] text-sidebar-foreground/60 truncate">linguatoons.com</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
            const label = t[item.labelKey] || item.labelKey;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}
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
            <span className="text-xs text-muted-foreground font-medium hidden sm:block">linguatoons.com</span>
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[11px] font-semibold text-primary-foreground">L</span>
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

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}