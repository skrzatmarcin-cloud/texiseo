import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { Star, Search, Filter, Globe, Clock, Users, ChevronDown, Award, Video, BookOpen, Heart } from "lucide-react";

const LANGUAGE_OPTIONS = ["Wszystkie", "angielski", "hiszpański", "francuski", "inny"];
const LEVEL_OPTIONS = ["Wszystkie", "A1", "A2", "B1", "B2", "C1", "C2"];
const SORT_OPTIONS = [
  { value: "rating", label: "Ocena (najwyższa)" },
  { value: "rate_asc", label: "Cena (rosnąco)" },
  { value: "rate_desc", label: "Cena (malejąco)" },
  { value: "lessons", label: "Liczba lekcji" },
];

function StarRating({ rating, size = "sm" }) {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={cn(
          size === "sm" ? "h-3 w-3" : "h-4 w-4",
          i <= stars ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200"
        )} />
      ))}
    </div>
  );
}

function TeacherCard({ teacher, lessons, courses, onSelect }) {
  const completed = lessons.filter(l => l.teacher_id === teacher.id && l.status === "completed").length;
  const totalCourses = courses.filter(c => c.teacher_id === teacher.id && c.status === "active").length;
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
      onClick={() => onSelect(teacher)}
    >
      {/* Card header with gradient */}
      <div className="relative h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-accent">
        <button
          className={cn("absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center transition-colors",
            liked ? "bg-red-500 text-white" : "bg-white/80 text-muted-foreground hover:text-red-500"
          )}
          onClick={e => { e.stopPropagation(); setLiked(v => !v); }}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-white")} />
        </button>
        {teacher.status === "trial" && (
          <span className="absolute top-3 left-3 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold">
            NOWY
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="px-5 -mt-8 mb-3">
        <div className="relative inline-block">
          {teacher.photo_url
            ? <img src={teacher.photo_url} alt="" className="h-16 w-16 rounded-2xl object-cover border-4 border-card shadow-md" />
            : <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-xl border-4 border-card shadow-md">
                {teacher.first_name?.[0]}{teacher.last_name?.[0]}
              </div>
          }
          {teacher.status === "active" && (
            <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-400 border-2 border-card rounded-full" title="Online" />
          )}
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Name & rating */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-bold text-sm text-foreground">{teacher.first_name} {teacher.last_name}</h3>
            <p className="text-xs text-muted-foreground">{teacher.specializations?.[0] || "Nauczyciel języków"}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-primary">{teacher.hourly_rate || "—"} <span className="text-xs font-normal text-muted-foreground">PLN/h</span></p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={teacher.rating} />
          <span className="text-xs text-muted-foreground">({teacher.rating?.toFixed(1) || "brak ocen"})</span>
        </div>

        {/* Languages */}
        {teacher.languages?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {teacher.languages.slice(0,3).map(l => (
              <span key={l} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{l}</span>
            ))}
          </div>
        )}

        {/* Bio snippet */}
        {teacher.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{teacher.bio}</p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 pt-3 border-t border-border/60">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-primary" />
            <span><strong className="text-foreground">{completed}</strong> lekcji</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Video className="h-3.5 w-3.5 text-violet-500" />
            <span><strong className="text-foreground">{totalCourses}</strong> kursów</span>
          </div>
          {teacher.age_groups?.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              <span>{teacher.age_groups[0]}</span>
            </div>
          )}
        </div>

        {/* First lesson free badge */}
        <div className="mt-3 text-center">
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-3 py-1 rounded-full inline-block">
            🎁 Pierwsza lekcja próbna gratis
          </span>
        </div>
      </div>
    </div>
  );
}

function TeacherProfileModal({ teacher, lessons, courses, onClose }) {
  const completed = lessons.filter(l => l.teacher_id === teacher.id && l.status === "completed").length;
  const teacherCourses = courses.filter(c => c.teacher_id === teacher.id && c.status === "active");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-primary/30 to-violet-500/20 rounded-t-2xl">
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/80 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            {teacher.photo_url
              ? <img src={teacher.photo_url} alt="" className="h-20 w-20 rounded-2xl border-4 border-card shadow-lg object-cover" />
              : <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-2xl border-4 border-card shadow-lg">
                  {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                </div>
            }
            <div className="pb-1">
              <h2 className="text-xl font-bold">{teacher.first_name} {teacher.last_name}</h2>
              <p className="text-sm text-muted-foreground">{teacher.specializations?.join(", ")}</p>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={teacher.rating} size="md" />
                <span className="text-sm font-semibold">{teacher.rating?.toFixed(1)}</span>
              </div>
            </div>
            <div className="ml-auto text-right pb-1">
              <p className="text-2xl font-black text-primary">{teacher.hourly_rate} PLN</p>
              <p className="text-xs text-muted-foreground">za godzinę</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Lekcji", value: completed, icon: "📚" },
              { label: "Kursów", value: teacherCourses.length, icon: "🎓" },
              { label: "Języków", value: teacher.languages?.length || 0, icon: "🌍" },
            ].map(s => (
              <div key={s.label} className="bg-secondary/60 rounded-xl p-3 text-center">
                <p className="text-lg">{s.icon}</p>
                <p className="font-bold text-base">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bio */}
          {teacher.bio && (
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">O mnie</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{teacher.bio}</p>
            </div>
          )}

          {/* Languages & specializations */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {teacher.languages?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Języki</h4>
                <div className="flex flex-wrap gap-1">
                  {teacher.languages.map(l => <span key={l} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{l}</span>)}
                </div>
              </div>
            )}
            {teacher.age_groups?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">Grupy wiekowe</h4>
                <div className="flex flex-wrap gap-1">
                  {teacher.age_groups.map(a => <span key={a} className="text-xs bg-secondary px-2 py-1 rounded-full">{a}</span>)}
                </div>
              </div>
            )}
          </div>

          {/* Courses */}
          {teacherCourses.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold mb-2">Kursy ({teacherCourses.length})</h4>
              <div className="space-y-2">
                {teacherCourses.map(c => (
                  <div key={c.id} className="flex items-center justify-between bg-secondary/40 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs font-medium">{c.course_title}</p>
                      <p className="text-[10px] text-muted-foreground">{c.language} · {c.level} · {c.lessons_count} lekcji</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{c.price} PLN</p>
                      <p className="text-[10px] text-muted-foreground">{c.enrolled_count || 0} uczniów</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-3">
            <button className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors">
              📅 Zarezerwuj lekcję próbną
            </button>
            <button className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-secondary transition-colors">
              💬 Wiadomość
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketplaceView() {
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("Wszystkie");
  const [sortBy, setSortBy] = useState("rating");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Teachers.list("-rating"),
      base44.entities.TeacherLessons.list("-lesson_date", 300),
      base44.entities.TeacherCourses.list(),
    ]).then(([t, l, c]) => { setTeachers(t); setLessons(l); setCourses(c); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = teachers.filter(t => t.status === "active" || t.status === "trial");
    if (search) list = list.filter(t => `${t.first_name} ${t.last_name} ${t.bio || ""} ${(t.languages || []).join(" ")}`.toLowerCase().includes(search.toLowerCase()));
    if (langFilter !== "Wszystkie") list = list.filter(t => t.languages?.includes(langFilter));
    if (sortBy === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === "rate_asc") list = [...list].sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
    else if (sortBy === "rate_desc") list = [...list].sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
    else if (sortBy === "lessons") list = [...list].sort((a, b) => (b.total_lessons || 0) - (a.total_lessons || 0));
    return list;
  }, [teachers, search, langFilter, sortBy]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-5">
      {/* Hero search bar */}
      <div className="bg-gradient-to-r from-primary/10 to-violet-500/10 rounded-2xl p-5 mb-5">
        <h2 className="text-lg font-bold mb-1">Znajdź swojego idealnego nauczyciela</h2>
        <p className="text-xs text-muted-foreground mb-4">Ponad {teachers.length} certyfikowanych nauczycieli · Pierwsza lekcja gratis</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Szukaj po imieniu, języku, specjalizacji…"
              className="w-full bg-card h-10 pl-10 pr-4 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="flex gap-1.5 flex-wrap">
          {LANGUAGE_OPTIONS.map(l => (
            <button key={l} onClick={() => setLangFilter(l)}
              className={cn("px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                langFilter === l ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}>
              {l === "Wszystkie" ? "🌍 Wszystkie języki" : `🗣️ ${l}`}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="h-8 px-3 text-xs border border-border rounded-lg bg-card focus:outline-none">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} nauczycieli</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(teacher => (
          <TeacherCard key={teacher.id} teacher={teacher} lessons={lessons} courses={courses} onSelect={setSelectedTeacher} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Brak nauczycieli spełniających kryteria</p>
          </div>
        )}
      </div>

      {selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          lessons={lessons}
          courses={courses}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </div>
  );
}