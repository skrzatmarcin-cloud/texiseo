import { Link } from "react-router-dom";
import {
  Shield, Search, Building2, GraduationCap, Briefcase, BarChart3,
  TrendingUp, Network, FileText, Link2, BookOpen, RefreshCw,
  Play, ShieldCheck, Globe, Zap, Users, Layers, Sparkles,
  Video, CreditCard, MessageSquare, Calendar
} from "lucide-react";

const HUBS = [
  {
    id: "security",
    label: "Bezpieczeństwo",
    sublabel: "Security Center",
    to: "/security",
    gradient: "from-blue-700 to-blue-900",
    glowColor: "shadow-blue-900/60",
    Icon: Shield,
    iconColor: "text-blue-300",
    sublinks: [
      { label: "Security Monitor", to: "/security", icon: ShieldCheck },
      { label: "WordPress Health", to: "/wordpress", icon: Globe },
      { label: "Backlinki", to: "/backlinks", icon: TrendingUp },
      { label: "Automations", to: "/automations", icon: Zap },
    ],
  },
  {
    id: "seo",
    label: "SEO Narzędzia",
    sublabel: "SEO Tools",
    to: "/content-ideas",
    gradient: "from-indigo-600 to-blue-700",
    glowColor: "shadow-indigo-900/60",
    Icon: Search,
    iconColor: "text-indigo-300",
    sublinks: [
      { label: "Pomysły treści", to: "/content-ideas", icon: Sparkles },
      { label: "Klastry", to: "/clusters", icon: Network },
      { label: "Strony", to: "/pages", icon: FileText },
      { label: "Brief Builder", to: "/brief-builder", icon: BookOpen },
      { label: "Linki wewn.", to: "/internal-links", icon: Link2 },
      { label: "Publikacje", to: "/publishing-queue", icon: Play },
    ],
  },
  {
    id: "directory",
    label: "Katalog Firm",
    sublabel: "Business Directory",
    to: "/directory",
    gradient: "from-slate-600 to-slate-800",
    glowColor: "shadow-slate-900/60",
    Icon: Building2,
    iconColor: "text-slate-300",
    sublinks: [
      { label: "Katalog", to: "/directory", icon: Building2 },
      { label: "Konkurenci", to: "/competitors", icon: TrendingUp },
      { label: "Link Exchange", to: "/backlinks", icon: Link2 },
      { label: "SEO Autopilot", to: "/seo-autopilot", icon: Sparkles },
    ],
  },
  {
    id: "teachers",
    label: "Teachers Hub",
    sublabel: "Centrum Nauczycieli",
    to: "/teachers",
    gradient: "from-blue-600 to-indigo-700",
    glowColor: "shadow-blue-900/60",
    Icon: GraduationCap,
    iconColor: "text-blue-200",
    sublinks: [
      { label: "Nauczyciele", to: "/teachers", icon: Users },
      { label: "Planer lekcji", to: "/teachers", icon: Calendar },
      { label: "Lekcje Live", to: "/teachers", icon: Video },
      { label: "Rozliczenia", to: "/teachers", icon: CreditCard },
    ],
  },
  {
    id: "analytics",
    label: "Analityka",
    sublabel: "Analytics",
    to: "/analytics",
    gradient: "from-blue-500 to-cyan-700",
    glowColor: "shadow-cyan-900/60",
    Icon: BarChart3,
    iconColor: "text-cyan-200",
    sublinks: [
      { label: "Analytics", to: "/analytics", icon: BarChart3 },
      { label: "Content Engine", to: "/content-engine", icon: Sparkles },
      { label: "Social Media", to: "/social-media", icon: MessageSquare },
      { label: "Exec. Center", to: "/execution-center", icon: Play },
    ],
  },
  {
    id: "business",
    label: "Business Hub",
    sublabel: "Operacje & Magazyn",
    to: "/business",
    gradient: "from-blue-800 to-slate-800",
    glowColor: "shadow-slate-900/60",
    Icon: Briefcase,
    iconColor: "text-blue-200",
    sublinks: [
      { label: "Firmy", to: "/business", icon: Building2 },
      { label: "Magazyn", to: "/business", icon: Layers },
      { label: "Produkcja", to: "/business", icon: Network },
      { label: "Dostawcy", to: "/business", icon: Users },
    ],
  },
];

// Big 3D-style icon component
function HubIcon({ Icon, iconColor, gradient }) {
  return (
    <div className={`relative flex-shrink-0`}>
      {/* Outer glow ring */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} opacity-30 blur-lg scale-110`} />
      <div className={`relative h-16 w-16 rounded-2xl bg-gradient-to-br ${gradient} border border-white/10 flex items-center justify-center shadow-xl`}>
        {/* Inner shine */}
        <div className="absolute top-1 left-1 right-1 h-1/3 rounded-t-xl bg-white/10" />
        <Icon className={`h-8 w-8 ${iconColor} relative z-10 drop-shadow-lg`} strokeWidth={1.5} />
      </div>
    </div>
  );
}

function HubCard({ hub }) {
  return (
    <Link to={hub.to} className="group block">
      <div className={`
        relative overflow-hidden rounded-2xl border border-white/10
        bg-gradient-to-br from-[#0f1c3a] to-[#0a1628]
        hover:border-white/20 hover:shadow-2xl hover:-translate-y-1
        transition-all duration-200 cursor-pointer p-5
        ${hub.glowColor}
      `}>
        {/* Top gradient accent */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${hub.gradient}`} />

        {/* Subtle background glow */}
        <div className={`absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gradient-to-br ${hub.gradient} opacity-10 blur-2xl pointer-events-none`} />

        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <HubIcon Icon={hub.Icon} iconColor={hub.iconColor} gradient={hub.gradient} />
          <div>
            <h3 className="text-white font-bold text-lg leading-tight group-hover:text-blue-200 transition-colors">
              {hub.label}
            </h3>
            <p className="text-blue-300/70 text-xs font-medium mt-0.5">{hub.sublabel}</p>
          </div>
        </div>

        {/* Sub-links grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {hub.sublinks.map((sub) => (
            <Link
              key={sub.label}
              to={sub.to}
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 transition-all group/sub"
            >
              <sub.icon className="h-3 w-3 text-blue-300/70 flex-shrink-0 group-hover/sub:text-blue-200" />
              <span className="text-[11px] text-blue-100/70 font-medium truncate group-hover/sub:text-white">
                {sub.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom decorative bg icon */}
        <div className="absolute -bottom-5 -right-5 opacity-[0.06] pointer-events-none">
          <hub.Icon className="h-24 w-24 text-white" />
        </div>
      </div>
    </Link>
  );
}

export default function HomeHub() {
  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{ background: "linear-gradient(135deg, #0a1628 0%, #0d1f3c 50%, #0a1628 100%)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Witaj w LinguaSEO OS!
          </h2>
          <p className="text-blue-300/70 text-sm mt-0.5">
            Wybierz interesującą Cię sekcję:
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-blue-300/70 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          linguatoons.com — aktywny
        </div>
      </div>

      {/* 3×2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {HUBS.map(hub => (
          <HubCard key={hub.id} hub={hub} />
        ))}
      </div>

      {/* Bottom nav strip */}
      <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/10">
        {[
          { label: "Strona Główna", icon: Globe, to: "/" },
          { label: "Ustawienia", icon: Zap, to: "/settings" },
          { label: "Integracje", icon: Network, to: "/integrations" },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className="flex items-center gap-1.5 text-xs text-blue-300/60 hover:text-blue-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}