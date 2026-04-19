import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Lightbulb, Network, FileText, ClipboardList,
  Link2, CalendarClock, Settings, Search, ChevronLeft, Menu,
  HelpCircle, RefreshCw, ShieldCheck, Zap, Plug2, Globe, ExternalLink,
  Wand2, Share2, BarChart3, Play, Crosshair
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Panel główny" },
  { to: "/content-ideas", icon: Lightbulb, label: "Pomysły" },
  { to: "/clusters", icon: Network, label: "Klastry" },
  { to: "/pages", icon: FileText, label: "Strony" },
  { to: "/brief-builder", icon: ClipboardList, label: "Kreator briefów" },
  { to: "/internal-links", icon: Link2, label: "Linkowanie" },
  { to: "/publishing-queue", icon: CalendarClock, label: "Kolejka" },
  { to: "/faq-schema", icon: HelpCircle, label: "FAQ i Schemat" },
  { to: "/refresh-center", icon: RefreshCw, label: "Odświeżanie" },
  { to: "/seo-qa", icon: ShieldCheck, label: "Kontrola SEO" },
  { to: "/wordpress", icon: Globe, label: "WordPress" },
  { to: "/content-engine", icon: Wand2, label: "Silnik Treści" },
  { to: "/social-media", icon: Share2, label: "Social Media" },
  { to: "/analytics", icon: BarChart3, label: "Analityka" },
  { to: "/execution-center", icon: Play, label: "Centrum Wykonania" },
  { to: "/backlinks", icon: ExternalLink, label: "System Backlinków" },
  { to: "/competitors", icon: Crosshair, label: "Konkurenci" },
  { to: "/automations", icon: Zap, label: "Automatyzacje" },
  { to: "/integrations", icon: Plug2, label: "Integracje" },
  { to: "/settings", icon: Settings, label: "Ustawienia" },
];

export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 h-full flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-sidebar-border",
          collapsed ? "justify-center" : "gap-3"
        )}>
          <div className={cn("flex items-center justify-center flex-shrink-0", collapsed ? "h-9 w-9" : "h-10 w-10")}>
            <img
              src="https://media.base44.com/images/public/69da036b1797baa333fdb6c1/f24cb9015_ChatGPTImage11kwi202616_54_09.png"
              alt="TexiSEO Logo"
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

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-10 border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-md hover:bg-secondary"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-64 pl-9 pr-4 rounded-lg bg-secondary/70 border-none text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium hidden sm:block">linguatoons.com</span>
            <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[11px] font-semibold text-primary-foreground">L</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}