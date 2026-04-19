import { useState } from "react";
import {
  Users, Calendar, MessageSquare, BookOpen, CreditCard,
  Video, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import TeacherPlanner from "../components/teachers/TeacherPlanner";
import TeacherChat from "../components/teachers/TeacherChat";
import TeacherCourseManager from "../components/teachers/TeacherCourseManager";
import TeacherPayroll from "../components/teachers/TeacherPayroll";
import TeacherStats from "../components/teachers/TeacherStats";
import LiveLessonsPanel from "../components/teachers/LiveLessonsPanel";

const TABS = [
  { id: "courses", label: "Moje kursy", icon: BookOpen, desc: "Kursy i klastry" },
  { id: "planner", label: "Planer lekcji", icon: Calendar, desc: "Harmonogram" },
  { id: "live", label: "Lekcje live", icon: Video, desc: "Google Meet/Zoom" },
  { id: "chat", label: "Wiadomości", icon: MessageSquare, desc: "Czat ze studentami" },
  { id: "payroll", label: "Rozliczenia", icon: CreditCard, desc: "Zarobki i wypłaty" },
  { id: "stats", label: "Statystyki", icon: BarChart3, desc: "Moje statystyki" },
];

export default function TeacherHub() {
  const [tab, setTab] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    const valid = ["courses","planner","live","chat","payroll","stats"];
    return valid.includes(p) ? p : "courses";
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </span>
              Moja platforma
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Nauczyciel — moje kursy, lekcje, zarobki i statystyki
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
        {tab === "courses" && <TeacherCourseManager />}
        {tab === "planner" && <TeacherPlanner />}
        {tab === "live" && <LiveLessonsPanel />}
        {tab === "chat" && <TeacherChat />}
        {tab === "payroll" && <TeacherPayroll />}
        {tab === "stats" && <TeacherStats />}
      </div>
    </div>
  );
}