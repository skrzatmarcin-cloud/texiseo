import { Link } from "react-router-dom";
import {
  Search, Shield, GraduationCap, Building2, Briefcase,
  ArrowRight, Sparkles, TrendingUp, BookOpen, Globe,
  Zap, BarChart3, Network, FileText, RefreshCw,
  Link2, ShieldCheck, Users, Layers, Play
} from "lucide-react";

const HUBS = [
  {
    id: "seo",
    label: "SEO Hub",
    sublabel: "Centrum strategii organicznej",
    description: "Zarządzaj treścią, klastrami, linkami wewnętrznymi, briefami i kolejką publikacji — wszystko w jednym miejscu.",
    to: "/content-ideas",
    gradient: "from-violet-600 to-indigo-600",
    lightBg: "bg-violet-50",
    iconBg: "bg-violet-600",
    textAccent: "text-violet-600",
    borderAccent: "border-violet-200",
    Icon: Search,
    badge: "AI-powered",
    badgeColor: "bg-violet-100 text-violet-700",
    features: [
      { icon: Network, label: "Klastry tematyczne", to: "/clusters" },
      { icon: FileText, label: "Strony & audyt", to: "/pages" },
      { icon: Link2, label: "Linki wewnętrzne", to: "/internal-links" },
      { icon: BookOpen, label: "Brief Builder", to: "/brief-builder" },
      { icon: RefreshCw, label: "Refresh Center", to: "/refresh-center" },
      { icon: Play, label: "Kolejka publikacji", to: "/publishing-queue" },
    ],
  },
  {
    id: "security",
    label: "Bezpieczeństwo",
    sublabel: "Monitor & ochrona",
    description: "Monitoruj WordPress, wykrywaj zagrożenia, zarządzaj alertami bezpieczeństwa i śledź stan backlinków 24/7.",
    to: "/security",
    gradient: "from-red-500 to-rose-600",
    lightBg: "bg-red-50",
    iconBg: "bg-red-500",
    textAccent: "text-red-600",
    borderAccent: "border-red-200",
    Icon: Shield,
    badge: "Real-time",
    badgeColor: "bg-red-100 text-red-700",
    features: [
      { icon: ShieldCheck, label: "Security Monitor", to: "/security" },
      { icon: Globe, label: "WordPress Health", to: "/wordpress" },
      { icon: TrendingUp, label: "Backlinki", to: "/backlinks" },
      { icon: Zap, label: "Automations", to: "/automations" },
    ],
  },
  {
    id: "teachers",
    label: "Teachers Hub",
    sublabel: "Zarządzanie nauczycielami",
    description: "Planuj lekcje, zarządzaj nauczycielami, prowadź live przez Google Meet, kursy i rozliczenia w jednym systemie.",
    to: "/teachers",
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50",
    iconBg: "bg-emerald-500",
    textAccent: "text-emerald-600",
    borderAccent: "border-emerald-200",
    Icon: GraduationCap,
    badge: "Live Meet",
    badgeColor: "bg-emerald-100 text-emerald-700",
    features: [
      { icon: Users, label: "Nauczyciele", to: "/teachers" },
      { icon: BarChart3, label: "Statystyki", to: "/teachers" },
      { icon: BookOpen, label: "Kursy", to: "/teachers" },
      { icon: Zap, label: "Lekcje Live", to: "/teachers" },
    ],
  },
  {
    id: "directory",
    label: "Katalog Firm",
    sublabel: "Business Directory",
    description: "Zarządzaj wpisami szkół językowych i firm edukacyjnych, monitoruj opinie i buduj sieć partnerów.",
    to: "/directory",
    gradient: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    iconBg: "bg-amber-500",
    textAccent: "text-amber-600",
    borderAccent: "border-amber-200",
    Icon: Building2,
    badge: "Directory",
    badgeColor: "bg-amber-100 text-amber-700",
    features: [
      { icon: Building2, label: "Katalog", to: "/directory" },
      { icon: Globe, label: "Weryfikacja", to: "/directory" },
      { icon: TrendingUp, label: "Link Exchange", to: "/backlinks" },
      { icon: Sparkles, label: "SEO Autopilot", to: "/seo-autopilot" },
    ],
  },
  {
    id: "business",
    label: "Business Hub",
    sublabel: "Operacje & magazyn",
    description: "Zarządzaj firmami, zapasami magazynowymi, produkcją i dostawcami — pełne centrum operacyjne.",
    to: "/business",
    gradient: "from-blue-500 to-cyan-600",
    lightBg: "bg-blue-50",
    iconBg: "bg-blue-500",
    textAccent: "text-blue-600",
    borderAccent: "border-blue-200",
    Icon: Briefcase,
    badge: "ERP",
    badgeColor: "bg-blue-100 text-blue-700",
    features: [
      { icon: Building2, label: "Firmy", to: "/business" },
      { icon: Layers, label: "Magazyn", to: "/business" },
      { icon: BarChart3, label: "Produkcja", to: "/business" },
      { icon: Network, label: "Dostawcy", to: "/business" },
    ],
  },
];

export default function HomeHub({ stats = {} }) {
  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">
            Witaj w LinguaSEO OS 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Wybierz moduł — lub korzystaj z menu bocznego
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          linguatoons.com — system aktywny
        </div>
      </div>

      {/* Main hub grid: 2 large + 3 medium */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* SEO Hub — large card */}
        <HubCard hub={HUBS[0]} large />

        {/* Security — large card */}
        <HubCard hub={HUBS[1]} large />

        {/* Teachers Hub — medium */}
        <HubCard hub={HUBS[2]} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Directory */}
        <HubCard hub={HUBS[3]} wide />
        {/* Business */}
        <HubCard hub={HUBS[4]} wide />
      </div>
    </div>
  );
}

function HubCard({ hub, large = false, wide = false }) {
  return (
    <Link to={hub.to} className="group block">
      <div className={`
        relative overflow-hidden rounded-2xl border ${hub.borderAccent} bg-card
        hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer
        ${large ? "h-full min-h-[260px]" : wide ? "min-h-[160px]" : "min-h-[220px]"}
      `}>
        {/* Gradient top strip */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${hub.gradient}`} />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className={`
                h-12 w-12 rounded-2xl bg-gradient-to-br ${hub.gradient}
                flex items-center justify-center shadow-lg flex-shrink-0
                group-hover:scale-110 transition-transform duration-200
              `}>
                <hub.Icon className="h-6 w-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">{hub.label}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${hub.badgeColor}`}>
                    {hub.badge}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{hub.sublabel}</p>
              </div>
            </div>
            <ArrowRight className={`h-4 w-4 ${hub.textAccent} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200`} />
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            {hub.description}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-1.5">
            {hub.features.slice(0, large ? 6 : 4).map((feat) => (
              <Link
                key={feat.label}
                to={feat.to}
                onClick={e => e.stopPropagation()}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium
                  ${hub.lightBg} ${hub.textAccent} border ${hub.borderAccent}
                  hover:opacity-80 transition-opacity
                `}
              >
                <feat.icon className="h-2.5 w-2.5" />
                {feat.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative background icon */}
        <div className="absolute -bottom-4 -right-4 opacity-[0.04] pointer-events-none">
          <hub.Icon className="h-32 w-32" />
        </div>
      </div>
    </Link>
  );
}