import { useState } from "react";
import {
  Users, Calendar, MessageSquare, BookOpen, CreditCard,
  Video, BarChart3, Store, Percent, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import TeacherList from "../components/teachers/TeacherList";
import TeacherPlanner from "../components/teachers/TeacherPlanner";
import TeacherChat from "../components/teachers/TeacherChat";
import TeacherCourseManager from "../components/teachers/TeacherCourseManager";
import TeacherPayroll from "../components/teachers/TeacherPayroll";
import TeacherStats from "../components/teachers/TeacherStats";
import LiveLessonsPanel from "../components/teachers/LiveLessonsPanel";
import MarketplaceView from "../components/teachers/MarketplaceView";
import CourseMarketplace from "../components/teachers/CourseMarketplace";
import CommissionPanel from "../components/teachers/CommissionPanel";
import AdminPanel from "../components/teachers/AdminPanel";

const TABS = [
  { id: "marketplace", label: "Marketplace", icon: Store, desc: "Katalog nauczycieli", badge: null },
  { id: "courses_market", label: "Kursy", icon: BookOpen, desc: "Sprzedaż kursów" },
  { id: "teachers", label: "Nauczyciele", icon: Users, desc: "Baza i profile" },
  { id: "planner", label: "Planer", icon: Calendar, desc: "Harmonogram" },
  { id: "live", label: "Live", icon: Video, desc: "Google Meet" },
  { id: "chat", label: "Wiadomości", icon: MessageSquare, desc: "Czat" },
  { id: "payroll", label: "Rozliczenia", icon: CreditCard, desc: "Wypłaty" },
  { id: "commissions", label: "Prowizje", icon: Percent, desc: "System prowizji" },
  { id: "stats", label: "Statystyki", icon: BarChart3, desc: "Analityka" },
  { id: "admin", label: "Admin", icon: ShieldCheck, desc: "Panel administratora" },
];

export default function TeacherHub() {
  const [tab, setTab] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    const valid = ["marketplace","courses_market","teachers","planner","live","chat","payroll","commissions","stats","admin"];
    return valid.includes(p) ? p : "marketplace";
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="h-4 w-4 text-primary" />
              </span>
              Teacher Marketplace
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Platforma nauczycieli — Superprof + Teachable style · sprzedaż kursów · prowizje · panel admina
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-background">
        {tab === "marketplace" && <MarketplaceView />}
        {tab === "courses_market" && <CourseMarketplace />}
        {tab === "teachers" && <TeacherList />}
        {tab === "planner" && <TeacherPlanner />}
        {tab === "live" && <LiveLessonsPanel />}
        {tab === "chat" && <TeacherChat />}
        {tab === "payroll" && <TeacherPayroll />}
        {tab === "commissions" && <CommissionPanel />}
        {tab === "stats" && <TeacherStats />}
        {tab === "admin" && <AdminPanel />}
      </div>
    </div>
  );
}