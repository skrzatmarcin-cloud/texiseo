import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Users, Calendar, MessageSquare, BookOpen, CreditCard,
  Video, BarChart3, Plus, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import TeacherList from "../components/teachers/TeacherList";
import TeacherPlanner from "../components/teachers/TeacherPlanner";
import TeacherChat from "../components/teachers/TeacherChat";
import TeacherCourseManager from "../components/teachers/TeacherCourseManager";
import TeacherPayroll from "../components/teachers/TeacherPayroll";
import TeacherStats from "../components/teachers/TeacherStats";

const TABS = [
  { id: "teachers", label: "Nauczyciele", icon: Users, desc: "Baza i profile" },
  { id: "planner", label: "Planer lekcji", icon: Calendar, desc: "Harmonogram" },
  { id: "chat", label: "Wiadomości", icon: MessageSquare, desc: "Czat z nauczycielami" },
  { id: "courses", label: "Kursy", icon: BookOpen, desc: "MasterStudy + AI" },
  { id: "payroll", label: "Rozliczenia", icon: CreditCard, desc: "Wypłaty" },
  { id: "stats", label: "Statystyki", icon: BarChart3, desc: "Analityka" },
];

export default function TeacherHub() {
  const [tab, setTab] = useState("teachers");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Video className="h-4 w-4 text-primary" />
              </span>
              Teacher Hub
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Zarządzanie nauczycielami — ClassSpot-style + MasterStudy WordPress
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0.5 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
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
        {tab === "teachers" && <TeacherList />}
        {tab === "planner" && <TeacherPlanner />}
        {tab === "chat" && <TeacherChat />}
        {tab === "courses" && <TeacherCourseManager />}
        {tab === "payroll" && <TeacherPayroll />}
        {tab === "stats" && <TeacherStats />}
      </div>
    </div>
  );
}