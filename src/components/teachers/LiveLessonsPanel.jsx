import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Video, Plus, Send, ExternalLink, Copy, CheckCircle2,
  Clock, Users, Loader2, CalendarClock, Zap, BookOpen,
  AlertCircle, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// Generate a Google Meet link via the meet.new shortcut (creates instant meeting)
function generateMeetLink() {
  return `https://meet.google.com/new`;
}

// For pre-scheduled links we create a custom meet URL pattern
function generateScheduledMeetCode() {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const seg = (n) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`;
}

const STATUS_STYLES = {
  scheduled: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  no_show: "bg-gray-100 text-gray-500 border-gray-200",
};

export default function LiveLessonsPanel() {
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);
  const [copied, setCopied] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterTeacher, setFilterTeacher] = useState("all");
  const [showNewForm, setShowNewForm] = useState(false);

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

  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => lessons.filter(l => {
    if (filterDate && l.lesson_date !== filterDate) return false;
    if (filterTeacher !== "all" && l.teacher_id !== filterTeacher) return false;
    return true;
  }).sort((a, b) => (a.lesson_time || "").localeCompare(b.lesson_time || "")), [lessons, filterDate, filterTeacher]);

  const todayLessons = lessons.filter(l => l.lesson_date === today && l.status === "scheduled");
  const withMeetLink = lessons.filter(l => l.meeting_link && l.meeting_link.includes("meet.google.com")).length;

  // Generate & save a Meet link for a lesson
  const generateMeet = async (lesson) => {
    setGenerating(lesson.id);
    const link = generateScheduledMeetCode();
    await base44.entities.TeacherLessons.update(lesson.id, { meeting_link: link });
    setLessons(p => p.map(l => l.id === lesson.id ? { ...l, meeting_link: link } : l));
    setGenerating(null);
  };

  // Copy link to clipboard
  const copyLink = (id, link) => {
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Send Google Meet invitation email to student
  const sendInvite = async (lesson) => {
    if (!lesson.student_email) {
      alert("Uczeń nie ma podanego adresu email!");
      return;
    }
    if (!lesson.meeting_link) {
      alert("Najpierw wygeneruj link Google Meet dla tej lekcji.");
      return;
    }
    setSending(lesson.id);
    const teacher = teachers.find(t => t.id === lesson.teacher_id);

    await base44.integrations.Core.SendEmail({
      to: lesson.student_email,
      subject: `🎓 Zaproszenie na lekcję live — ${lesson.lesson_date} godz. ${lesson.lesson_time}`,
      body: `Cześć ${lesson.student_name}!

Zapraszamy Cię na lekcję online przez Google Meet:

📅 Data: ${lesson.lesson_date}
🕐 Godzina: ${lesson.lesson_time}
👨‍🏫 Nauczyciel: ${teacher?.first_name || ""} ${teacher?.last_name || ""}
🌍 Język: ${lesson.language || ""}  •  Poziom: ${lesson.level || ""}
⏱ Czas trwania: ${lesson.duration_minutes || 50} minut

🎥 Dołącz do spotkania Google Meet:
${lesson.meeting_link}

Kilka wskazówek przed lekcją:
• Sprawdź mikrofon i kamerę 5 minut przed lekcją
• Miej pod ręką zeszyt i długopis
• Wejdź na link kilka minut wcześniej

Do zobaczenia!
Zespół Linguatoons 🦎
linguatoons.com`,
    });

    await base44.entities.TeacherLessons.update(lesson.id, { invitation_sent: true });
    setLessons(p => p.map(l => l.id === lesson.id ? { ...l, invitation_sent: true } : l));
    setSending(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Live dziś", value: todayLessons.length, icon: Zap, color: "text-primary" },
          { label: "Z linkiem Meet", value: withMeetLink, icon: Video, color: "text-emerald-600" },
          { label: "Zaplanowanych", value: lessons.filter(l => l.status === "scheduled").length, icon: CalendarClock, color: "text-blue-600" },
          { label: "Zaproszeń wysłanych", value: lessons.filter(l => l.invitation_sent).length, icon: Send, color: "text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
            <div className="h-8 w-8 bg-secondary rounded-lg flex items-center justify-center">
              <s.icon className={cn("h-4 w-4", s.color)} />
            </div>
            <div>
              <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick-start info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <Video className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          <p className="font-semibold mb-1">Jak działa Google Meet w Linguatoons?</p>
          <ol className="space-y-0.5 list-decimal ml-4">
            <li>Kliknij <strong>„Generuj link Meet"</strong> przy lekcji — system przypisze unikalny link do spotkania</li>
            <li>Kliknij <strong>„Wyślij zaproszenie"</strong> — uczeń dostanie e-mail z linkiem, datą i wskazówkami</li>
            <li>W chwili lekcji kliknij <strong>„Dołącz"</strong> — otwiera się Google Meet bezpośrednio</li>
          </ol>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="h-8 w-40 text-xs"
        />
        <Select value={filterTeacher} onValueChange={setFilterTeacher}>
          <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue placeholder="Wszyscy" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszyscy nauczyciele</SelectItem>
            {teachers.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setFilterDate("")}>
          Wszystkie daty
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 ml-auto" onClick={load}>
          <RefreshCw className="h-3 w-3" /> Odśwież
        </Button>
      </div>

      {/* Lessons list */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Video className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Brak lekcji dla wybranych filtrów</p>
          </div>
        )}

        {filtered.map(lesson => {
          const teacher = teachers.find(t => t.id === lesson.teacher_id);
          const hasMeet = lesson.meeting_link && lesson.meeting_link.includes("meet.google.com");
          const isToday = lesson.lesson_date === today;

          return (
            <div key={lesson.id} className={cn(
              "bg-card border rounded-xl p-4 transition-all",
              isToday && lesson.status === "scheduled" ? "border-primary/40 shadow-sm" : "border-border"
            )}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                {/* Left: lesson info */}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-[10px] font-bold",
                    isToday ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                  )}>
                    <span>{lesson.lesson_time?.slice(0, 5)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{lesson.student_name}</p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", STATUS_STYLES[lesson.status] || STATUS_STYLES.scheduled)}>
                        {lesson.status}
                      </span>
                      {isToday && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Dziś</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lesson.lesson_date} · {teacher?.first_name} {teacher?.last_name} · {lesson.language} {lesson.level}
                      {lesson.duration_minutes && ` · ${lesson.duration_minutes} min`}
                    </p>
                    {lesson.student_email && (
                      <p className="text-[11px] text-muted-foreground">{lesson.student_email}</p>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex flex-wrap items-center gap-2">

                  {/* Meet link display + copy */}
                  {hasMeet ? (
                    <div className="flex items-center gap-1.5">
                      <code className="text-[10px] bg-secondary px-2 py-1 rounded max-w-[160px] truncate block">
                        {lesson.meeting_link.replace("https://", "")}
                      </code>
                      <button
                        onClick={() => copyLink(lesson.id, lesson.meeting_link)}
                        className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-secondary transition-colors"
                        title="Kopiuj link"
                      >
                        {copied === lesson.id
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          : <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        }
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs gap-1.5"
                      onClick={() => generateMeet(lesson)}
                      disabled={generating === lesson.id}
                    >
                      {generating === lesson.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <Video className="h-3 w-3 text-blue-500" />
                      }
                      Generuj link Meet
                    </Button>
                  )}

                  {/* Send invite */}
                  {hasMeet && (
                    <Button
                      size="sm"
                      variant={lesson.invitation_sent ? "outline" : "secondary"}
                      className={cn("h-8 text-xs gap-1.5", lesson.invitation_sent && "text-emerald-600 border-emerald-200")}
                      onClick={() => sendInvite(lesson)}
                      disabled={sending === lesson.id}
                    >
                      {sending === lesson.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : lesson.invitation_sent
                          ? <CheckCircle2 className="h-3 w-3" />
                          : <Send className="h-3 w-3" />
                      }
                      {lesson.invitation_sent ? "Wysłano" : "Wyślij zaproszenie"}
                    </Button>
                  )}

                  {/* Join button */}
                  {hasMeet && lesson.status === "scheduled" && (
                    <a href={lesson.meeting_link} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700">
                        <Video className="h-3 w-3" />
                        Dołącz
                        <ExternalLink className="h-2.5 w-2.5 opacity-70" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* Topic / notes preview */}
              {lesson.topic_covered && (
                <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-2">
                  <BookOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <p className="text-[11px] text-muted-foreground truncate">{lesson.topic_covered}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Meet link button */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-900">Natychmiastowe spotkanie</p>
            <p className="text-xs text-blue-700 mt-0.5">Otwórz Google Meet bez harmonogramu — np. dla konsultacji ad-hoc</p>
          </div>
          <a href="https://meet.new" target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Video className="h-4 w-4" />
              Nowe spotkanie Meet
              <ExternalLink className="h-3 w-3 opacity-70" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}