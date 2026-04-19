import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { Search, BookOpen, Users, Clock, Star, Play, Filter, TrendingUp, Award } from "lucide-react";

const LEVEL_COLORS = { A1: "bg-green-100 text-green-700", A2: "bg-green-100 text-green-700", B1: "bg-blue-100 text-blue-700", B2: "bg-blue-100 text-blue-700", C1: "bg-purple-100 text-purple-700", C2: "bg-purple-100 text-purple-700", mixed: "bg-gray-100 text-gray-600" };
const LANG_COLORS = { angielski: "🇬🇧", hiszpański: "🇪🇸", francuski: "🇫🇷", inny: "🌍" };

function CourseCard({ course, teacher, onBuy }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all group">
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-primary/20 to-violet-500/10 flex items-center justify-center">
        {course.thumbnail_url
          ? <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
          : <div className="text-4xl">{LANG_COLORS[course.language] || "📚"}</div>
        }
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="h-12 w-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <Play className="h-5 w-5 text-primary fill-primary" />
          </div>
        </div>
        {course.enrolled_count > 0 && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Bestseller
          </div>
        )}
        {course.level && (
          <span className={cn("absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full", LEVEL_COLORS[course.level] || "bg-gray-100")}>
            {course.level}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm mb-1 line-clamp-2 leading-snug">{course.course_title}</h3>
        
        {/* Teacher */}
        {teacher && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
              {teacher.first_name?.[0]}{teacher.last_name?.[0]}
            </div>
            <p className="text-[11px] text-muted-foreground">{teacher.first_name} {teacher.last_name}</p>
            {teacher.rating > 0 && (
              <div className="flex items-center gap-0.5 ml-auto">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[10px] font-medium">{teacher.rating?.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}

        {course.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.lessons_count || 0} lekcji</span>
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {course.enrolled_count || 0}</span>
          {course.duration_weeks && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.duration_weeks} tyg.</span>}
        </div>

        {/* Age group & lang */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">{course.age_group}</span>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{LANG_COLORS[course.language]} {course.language}</span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <div>
            <span className="text-lg font-black text-primary">{course.price} PLN</span>
          </div>
          <button
            onClick={() => onBuy(course)}
            className="bg-primary text-primary-foreground px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Zapisz się
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CourseMarketplace() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [enrolling, setEnrolling] = useState(null);
  const [enrolled, setEnrolled] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.TeacherCourses.list("-enrolled_count"),
      base44.entities.Teachers.list(),
    ]).then(([c, t]) => { setCourses(c); setTeachers(t); setLoading(false); });
  }, []);

  const teacherMap = useMemo(() => Object.fromEntries(teachers.map(t => [t.id, t])), [teachers]);

  const filtered = useMemo(() => {
    let list = courses.filter(c => c.status === "active");
    if (search) list = list.filter(c => c.course_title?.toLowerCase().includes(search.toLowerCase()));
    if (langFilter !== "all") list = list.filter(c => c.language === langFilter);
    if (levelFilter !== "all") list = list.filter(c => c.level === levelFilter);
    return list;
  }, [courses, search, langFilter, levelFilter]);

  const langs = [...new Set(courses.map(c => c.language).filter(Boolean))];
  const levels = [...new Set(courses.map(c => c.level).filter(Boolean))];

  const handleBuy = async (course) => {
    setEnrolling(course.id);
    // Simulate enrollment — in real app this would go to payment
    await base44.entities.TeacherCourses.update(course.id, { enrolled_count: (course.enrolled_count || 0) + 1 });
    setCourses(prev => prev.map(c => c.id === course.id ? { ...c, enrolled_count: (c.enrolled_count || 0) + 1 } : c));
    setEnrolled(prev => [...prev, course.id]);
    setEnrolling(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { label: "Aktywnych kursów", value: courses.filter(c => c.status === "active").length, icon: "🎓" },
    { label: "Nauczycieli", value: new Set(courses.map(c => c.teacher_id)).size, icon: "👨‍🏫" },
    { label: "Łącznie uczniów", value: courses.reduce((s, c) => s + (c.enrolled_count || 0), 0), icon: "👥" },
    { label: "Języków", value: langs.length, icon: "🌍" },
  ];

  return (
    <div className="p-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-xl mb-1">{s.icon}</p>
            <p className="text-xl font-black text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Szukaj kursu…"
            className="w-full bg-card h-9 pl-9 pr-4 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={langFilter} onChange={e => setLangFilter(e.target.value)}
          className="h-9 px-3 text-xs border border-border rounded-xl bg-card focus:outline-none">
          <option value="all">Wszystkie języki</option>
          {langs.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
          className="h-9 px-3 text-xs border border-border rounded-xl bg-card focus:outline-none">
          <option value="all">Wszystkie poziomy</option>
          {levels.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <p className="text-xs text-muted-foreground mb-4">{filtered.length} kursów dostępnych</p>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(course => (
          <CourseCard key={course.id} course={course} teacher={teacherMap[course.teacher_id]} onBuy={handleBuy} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-4 text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Brak kursów — dodaj pierwszy kurs w panelu nauczycieli</p>
          </div>
        )}
      </div>
    </div>
  );
}