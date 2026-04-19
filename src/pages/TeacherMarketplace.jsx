import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Star, MapPin, BookOpen, Users, Clock, DollarSign, Heart,
  Search, Filter, ChevronRight, MessageCircle, Calendar, GraduationCap
} from "lucide-react";

export default function TeacherMarketplace() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, coursesData] = await Promise.all([
        base44.entities.Teachers.list("-rating", 50).catch(() => []),
        base44.entities.TeacherCourses.list("-created_date", 50).catch(() => [])
      ]);
      setTeachers(teachersData.filter(t => t.status === "active"));
      setCourses(coursesData.filter(c => c.status === "active"));
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = teachers.filter(t => {
    if (searchTerm && !t.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !t.last_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterLanguage !== "all" && !t.languages?.includes(filterLanguage)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🎓 LinguaToons Marketplace</h1>
          <p className="text-purple-100">Znajdź idealnego nauczyciela do nauki języków</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Szukaj nauczyciela..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select value={filterLanguage} onChange={e => setFilterLanguage(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="all">Wszystkie języki</option>
              <option value="angielski">Angielski</option>
              <option value="hiszpański">Hiszpański</option>
              <option value="francuski">Francuski</option>
              <option value="niemiecki">Niemiecki</option>
            </select>
            <select value={filterLevel} onChange={e => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50">
              <option value="all">Wszystkie poziomy</option>
              <option value="A1">A1 (Początkujący)</option>
              <option value="B1">B1 (Średniozaawansowany)</option>
              <option value="C1">C1 (Zaawansowany)</option>
            </select>
            <button onClick={loadData} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">
              Szukaj
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Teachers Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Nauczyciele ({filtered.length})</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(teacher => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>
            </div>

            {/* Courses Section */}
            {courses.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Popularne kursy</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.slice(0, 6).map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TeacherCard({ teacher }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
      {teacher.photo_url && (
        <img src={teacher.photo_url} alt={teacher.first_name} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg">{teacher.first_name} {teacher.last_name}</h3>
            <p className="text-xs text-muted-foreground">{teacher.specializations?.join(", ")}</p>
          </div>
          <button className="text-muted-foreground hover:text-destructive">
            <Heart className="h-4 w-4" />
          </button>
        </div>

        {teacher.bio && <p className="text-sm text-foreground/80 line-clamp-2 mb-3">{teacher.bio}</p>}

        <div className="space-y-2 mb-3 text-xs">
          {teacher.languages && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3 w-3 text-muted-foreground" />
              <span>{teacher.languages.join(", ")}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span>{teacher.hourly_rate} PLN/h</span>
          </div>
          {teacher.total_lessons > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{teacher.total_lessons} lekcji ukończonych</span>
            </div>
          )}
        </div>

        {teacher.rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className={cn("h-3 w-3", i < Math.round(teacher.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({teacher.rating.toFixed(1)})</span>
          </div>
        )}

        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 font-medium">
            Zarezerwuj
          </button>
          <button className="p-2 border border-border rounded-lg hover:bg-secondary">
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
      <div className="h-32 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
        <BookOpen className="h-12 w-12 text-white opacity-50" />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm mb-1 line-clamp-2">{course.course_title}</h3>
        <p className="text-xs text-muted-foreground mb-3">{course.description?.slice(0, 60)}...</p>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{course.level}</span>
          <span className="text-muted-foreground">{course.lessons_count} lekcji</span>
        </div>
        {course.price && (
          <div className="flex items-center justify-between">
            <span className="font-bold">{course.price} PLN</span>
            <button className="text-xs text-primary hover:underline">Szczegóły →</button>
          </div>
        )}
      </div>
    </div>
  );
}