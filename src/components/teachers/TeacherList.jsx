import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Plus, Search, Star, Video, Edit3, Trash2, Loader2, Users
} from "lucide-react";
import TeacherForm from "./TeacherForm";

const STATUS_STYLES = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-gray-100 text-gray-500",
  on_leave: "bg-amber-50 text-amber-700",
  trial: "bg-blue-50 text-blue-700",
};
const STATUS_LABELS = { active: "Aktywny", inactive: "Nieaktywny", on_leave: "Urlop", trial: "Próbny" };

export default function TeacherList() {
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);

  const load = async () => {
    setLoading(true);
    const [t, l] = await Promise.all([
      base44.entities.Teachers.list("-created_date"),
      base44.entities.TeacherLessons.list("-lesson_date", 200),
    ]);
    setTeachers(t);
    setLessons(l);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = teachers.filter(t =>
    `${t.first_name} ${t.last_name} ${t.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const getTeacherStats = (id) => {
    const tl = lessons.filter(l => l.teacher_id === id);
    const completed = tl.filter(l => l.status === "completed").length;
    const upcoming = tl.filter(l => l.status === "scheduled").length;
    const earnings = tl.filter(l => l.status === "completed").reduce((s, l) => s + (l.amount_due || 0), 0);
    return { completed, upcoming, earnings };
  };

  const deleteTeacher = async (id) => {
    if (!confirm("Usunąć nauczyciela?")) return;
    await base44.entities.Teachers.delete(id);
    setTeachers(p => p.filter(t => t.id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj nauczyciela…" className="pl-9 h-9" />
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditTeacher(null); setShowForm(true); }}>
          <Plus className="h-3.5 w-3.5" /> Dodaj nauczyciela
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Wszyscy", value: teachers.length, color: "text-primary" },
          { label: "Aktywni", value: teachers.filter(t => t.status === "active").length, color: "text-emerald-600" },
          { label: "Lekcji dziś", value: lessons.filter(l => l.lesson_date === new Date().toISOString().split("T")[0]).length, color: "text-blue-600" },
          { label: "Do rozliczenia", value: lessons.filter(l => l.status === "completed" && !l.paid).length, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Teacher cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(teacher => {
          const stats = getTeacherStats(teacher.id);
          return (
            <div key={teacher.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {teacher.photo_url
                  ? <img src={teacher.photo_url} alt="" className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                  : <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                      {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm truncate">{teacher.first_name} {teacher.last_name}</p>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0", STATUS_STYLES[teacher.status])}>
                      {STATUS_LABELS[teacher.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{teacher.email}</p>
                  {teacher.rating > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium">{teacher.rating?.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              {teacher.languages?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {teacher.languages.map(l => (
                    <span key={l} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mt-3 bg-secondary/40 rounded-xl p-2.5">
                <div className="text-center">
                  <p className="text-xs font-bold text-emerald-600">{stats.completed}</p>
                  <p className="text-[10px] text-muted-foreground">Lekcje</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-blue-600">{stats.upcoming}</p>
                  <p className="text-[10px] text-muted-foreground">Zaplan.</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-amber-600">{stats.earnings} zł</p>
                  <p className="text-[10px] text-muted-foreground">Zarobki</p>
                </div>
              </div>

              {/* Rate */}
              {teacher.hourly_rate && (
                <p className="text-xs text-muted-foreground mt-2">
                  Stawka: <span className="font-semibold text-foreground">{teacher.hourly_rate} {teacher.currency || "PLN"}/h</span>
                </p>
              )}

              {/* Zoom link */}
              {teacher.zoom_link && (
                <a href={teacher.zoom_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 hover:underline">
                  <Video className="h-3.5 w-3.5" /> Link do wideokonferencji
                </a>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1"
                  onClick={() => { setEditTeacher(teacher); setShowForm(true); }}>
                  <Edit3 className="h-3 w-3" /> Edytuj
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => deleteTeacher(teacher.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Brak nauczycieli — dodaj pierwszego</p>
          </div>
        )}
      </div>

      {showForm && (
        <TeacherForm
          teacher={editTeacher}
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}