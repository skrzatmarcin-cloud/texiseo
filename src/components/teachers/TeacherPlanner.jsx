import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus, Video, CheckCircle2, XCircle, Clock, Send, Loader2,
  ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import LessonForm from "./LessonForm";

const STATUS_STYLES = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  no_show: "bg-gray-100 text-gray-500 border-gray-200",
  rescheduled: "bg-amber-50 text-amber-700 border-amber-200",
};
const STATUS_ICONS = {
  scheduled: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
  no_show: XCircle,
  rescheduled: Clock,
};

function getWeekDays(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const DAYS_PL = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];

export default function TeacherPlanner() {
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedTeacher, setSelectedTeacher] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editLesson, setEditLesson] = useState(null);
  const [sendingInv, setSendingInv] = useState(null);

  const load = async () => {
    setLoading(true);
    const [l, t] = await Promise.all([
      base44.entities.TeacherLessons.list("-lesson_date", 300),
      base44.entities.Teachers.list(),
    ]);
    setLessons(l);
    setTeachers(t);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const weekDays = useMemo(() => getWeekDays(currentWeek), [currentWeek]);

  const filteredLessons = useMemo(() => lessons.filter(l =>
    selectedTeacher === "all" || l.teacher_id === selectedTeacher
  ), [lessons, selectedTeacher]);

  const getLessonsForDay = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return filteredLessons
      .filter(l => l.lesson_date === dateStr)
      .sort((a, b) => (a.lesson_time || "").localeCompare(b.lesson_time || ""));
  };

  const today = new Date().toISOString().split("T")[0];

  const updateStatus = async (id, status) => {
    await base44.entities.TeacherLessons.update(id, { status });
    setLessons(p => p.map(l => l.id === id ? { ...l, status } : l));
  };

  const sendVideoInvite = async (lesson) => {
    setSendingInv(lesson.id);
    const teacher = teachers.find(t => t.id === lesson.teacher_id);
    const meetLink = teacher?.zoom_link || teacher?.google_meet_link || "";
    if (!meetLink) {
      alert("Nauczyciel nie ma ustawionego linku do spotkania!");
      setSendingInv(null);
      return;
    }
    const res = await base44.integrations.Core.SendEmail({
      to: lesson.student_email,
      subject: `Zaproszenie na lekcję — ${lesson.lesson_date} ${lesson.lesson_time}`,
      body: `Cześć ${lesson.student_name}!\n\nZapraszamy Cię na lekcję:\n📅 ${lesson.lesson_date} o ${lesson.lesson_time}\n🎓 Nauczyciel: ${teacher?.first_name} ${teacher?.last_name}\n🌐 Język: ${lesson.language}\n\n🎥 Dołącz przez: ${meetLink}\n\nDo zobaczenia!\nZespół Linguatoons`,
    });
    await base44.entities.TeacherLessons.update(lesson.id, { invitation_sent: true });
    setLessons(p => p.map(l => l.id === lesson.id ? { ...l, invitation_sent: true } : l));
    setSendingInv(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() - 7); setCurrentWeek(d); }}
            className="p-1.5 hover:bg-secondary rounded-md">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-medium px-2">
            {weekDays[0]?.toLocaleDateString("pl-PL", { day: "numeric", month: "short" })} –{" "}
            {weekDays[6]?.toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric" })}
          </span>
          <button onClick={() => { const d = new Date(currentWeek); d.setDate(d.getDate() + 7); setCurrentWeek(d); }}
            className="p-1.5 hover:bg-secondary rounded-md">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
          <SelectTrigger className="h-9 w-[180px] text-xs"><SelectValue placeholder="Wszyscy nauczyciele" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszyscy nauczyciele</SelectItem>
            {teachers.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="gap-1.5 ml-auto" onClick={() => { setEditLesson(null); setShowForm(true); }}>
          <Plus className="h-3.5 w-3.5" /> Dodaj lekcję
        </Button>
      </div>

      {/* Weekly calendar */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const dayStr = day.toISOString().split("T")[0];
          const dayLessons = getLessonsForDay(day);
          const isToday = dayStr === today;
          return (
            <div key={i} className={cn(
              "bg-card border rounded-xl min-h-[200px] flex flex-col",
              isToday ? "border-primary shadow-sm" : "border-border"
            )}>
              <div className={cn(
                "px-2 py-2 border-b text-center",
                isToday ? "bg-primary text-primary-foreground rounded-t-xl" : "bg-secondary/30"
              )}>
                <p className="text-[10px] font-medium">{DAYS_PL[i]}</p>
                <p className={cn("text-sm font-bold", isToday ? "text-primary-foreground" : "text-foreground")}>
                  {day.getDate()}
                </p>
              </div>
              <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
                {dayLessons.map(lesson => {
                  const teacher = teachers.find(t => t.id === lesson.teacher_id);
                  const Icon = STATUS_ICONS[lesson.status] || Clock;
                  return (
                    <div key={lesson.id}
                      className={cn("text-[10px] p-1.5 rounded-lg border cursor-pointer hover:opacity-80", STATUS_STYLES[lesson.status])}
                      onClick={() => { setEditLesson(lesson); setShowForm(true); }}
                    >
                      <div className="flex items-center gap-1 font-semibold">
                        <Icon className="h-2.5 w-2.5 flex-shrink-0" />
                        {lesson.lesson_time}
                      </div>
                      <p className="truncate mt-0.5">{lesson.student_name}</p>
                      <p className="truncate text-[9px] opacity-70">{teacher?.first_name} {teacher?.last_name?.[0]}.</p>
                      {/* Video invite button */}
                      {lesson.status === "scheduled" && lesson.student_email && (
                        <button
                          onClick={e => { e.stopPropagation(); sendVideoInvite(lesson); }}
                          disabled={sendingInv === lesson.id || lesson.invitation_sent}
                          className="mt-1 flex items-center gap-0.5 text-[9px] bg-blue-600 text-white rounded px-1 py-0.5 hover:bg-blue-700 disabled:opacity-50"
                        >
                          {sendingInv === lesson.id ? <Loader2 className="h-2 w-2 animate-spin" /> : <Video className="h-2 w-2" />}
                          {lesson.invitation_sent ? "✓ Wysłano" : "Zaproś"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's upcoming */}
      <div className="mt-5">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" /> Dzisiejsze lekcje
        </h3>
        <div className="space-y-2">
          {getLessonsForDay(new Date()).length === 0 && (
            <p className="text-xs text-muted-foreground">Brak lekcji na dziś</p>
          )}
          {getLessonsForDay(new Date()).map(lesson => {
            const teacher = teachers.find(t => t.id === lesson.teacher_id);
            return (
              <div key={lesson.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{lesson.lesson_time?.slice(0, 5)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{lesson.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {teacher?.first_name} {teacher?.last_name} · {lesson.language} · {lesson.level}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border", STATUS_STYLES[lesson.status])}>
                    {lesson.status}
                  </span>
                  {lesson.status === "scheduled" && (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => updateStatus(lesson.id, "completed")}>
                      <CheckCircle2 className="h-3 w-3" /> Zakończ
                    </Button>
                  )}
                  {(teacher?.zoom_link || teacher?.google_meet_link) && (
                    <a href={teacher.zoom_link || teacher.google_meet_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="h-7 text-xs gap-1">
                        <Video className="h-3 w-3" /> Dołącz
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showForm && (
        <LessonForm
          lesson={editLesson}
          teachers={teachers}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}