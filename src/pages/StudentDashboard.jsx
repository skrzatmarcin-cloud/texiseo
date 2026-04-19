import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Search, BookOpen, BarChart3, Settings, Users, Star, MessageSquare,
  Home, LogOut, Clock, CheckCircle2, Loader2, Award
} from "lucide-react";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("find-teacher");
  const [loading, setLoading] = useState(true);
  const [enrolledCourses] = useState([
    { id: 1, title: "Angielski B1 Conversational", teacher: "Maria K.", progress: 65, lessons: "12/18" },
    { id: 2, title: "Business English", teacher: "John D.", progress: 40, lessons: "8/20" }
  ]);
  const [availableTeachers] = useState([
    { id: 1, name: "Maria Kowalski", language: "Angielski", level: "B1-C1", rating: 4.9, students: 42, hourlyRate: 75 },
    { id: 2, name: "John Davis", language: "Angielski", level: "A1-B2", rating: 4.7, students: 28, hourlyRate: 65 },
    { id: 3, name: "Carlos Rodriguez", language: "Hiszpański", level: "A1-C1", rating: 4.8, students: 35, hourlyRate: 70 },
  ]);
  const [availableCourses] = useState([
    { id: 1, title: "English Grammar Masterclass", instructor: "Sarah Mitchell", duration: "8 weeks", price: 199, level: "B1" },
    { id: 2, title: "Conversational Spanish", instructor: "Carlos R.", duration: "6 weeks", price: 149, level: "A2" },
    { id: 3, title: "Business French", instructor: "Pierre Laurent", duration: "10 weeks", price: 249, level: "B2" },
  ]);

  useEffect(() => {
    (async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setLoading(false);
    })();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-emerald-900 to-emerald-950 text-white flex flex-col">
        <div className="p-4 border-b border-emerald-800">
          <h2 className="text-sm font-bold truncate">👨‍🎓 Moja nauka</h2>
          <p className="text-xs text-emerald-400 mt-1">{user?.full_name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: "find-teacher", label: "Znajdź nauczyciela", icon: Search },
            { id: "courses", label: "Kursy online", icon: BookOpen },
            { id: "my-learning", label: "Moja nauka", icon: Award },
            { id: "messages", label: "Wiadomości", icon: MessageSquare },
            { id: "progress", label: "Postęp", icon: BarChart3 },
            { id: "settings", label: "Ustawienia", icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                activeTab === item.id
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-200 hover:bg-emerald-800"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-emerald-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-emerald-200 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4">
          <h1 className="text-2xl font-bold">
            {activeTab === "find-teacher" && "🔍 Znajdź idealnego nauczyciela"}
            {activeTab === "courses" && "📚 Kursy online"}
            {activeTab === "my-learning" && "🎓 Moja nauka"}
            {activeTab === "messages" && "💬 Wiadomości"}
            {activeTab === "progress" && "📊 Mój postęp"}
            {activeTab === "settings" && "⚙️ Ustawienia"}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* FIND TEACHER TAB */}
            {activeTab === "find-teacher" && (
              <div className="space-y-6">
                {/* Search Filter */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Szukaj nauczyciela..."
                      className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <select className="px-4 py-2 border border-border rounded-lg focus:outline-none">
                    <option>Wszystkie języki</option>
                    <option>Angielski</option>
                    <option>Hiszpański</option>
                    <option>Francuski</option>
                  </select>
                </div>

                {/* Teachers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTeachers.map(teacher => (
                    <div key={teacher.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-sm">{teacher.name}</h3>
                          <p className="text-xs text-muted-foreground">{teacher.language} • {teacher.level}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold">{teacher.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mb-3">{teacher.students} studentów</p>

                      <div className="flex items-center justify-between mb-4 pb-4 border-t border-border">
                        <span className="text-sm font-bold">{teacher.hourlyRate} PLN/h</span>
                        <button className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors">
                          Umów lekcję
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COURSES TAB */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Szukaj kursu..."
                    className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <select className="px-4 py-2 border border-border rounded-lg focus:outline-none">
                    <option>Wszystkie poziomy</option>
                    <option>A1-A2</option>
                    <option>B1-B2</option>
                    <option>C1-C2</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableCourses.map(course => (
                    <div key={course.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all">
                      <h3 className="font-bold text-sm mb-2">{course.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{course.instructor}</p>
                      <div className="space-y-2 text-xs mb-4">
                        <p><span className="text-muted-foreground">Czas:</span> {course.duration}</p>
                        <p><span className="text-muted-foreground">Poziom:</span> {course.level}</p>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="font-bold">{course.price} PLN</span>
                        <button className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90 transition-colors">
                          Zapisz się
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MY LEARNING TAB */}
            {activeTab === "my-learning" && (
              <div className="space-y-4">
                {enrolledCourses.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nie zapisałeś się jeszcze na żaden kurs</p>
                  </div>
                ) : (
                  enrolledCourses.map(course => (
                    <div key={course.id} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-sm">{course.title}</h3>
                          <p className="text-xs text-muted-foreground">Nauczyciel: {course.teacher}</p>
                        </div>
                        <span className="text-xs font-bold text-primary">{course.lessons}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span className="text-xs font-bold">{course.progress}%</span>
                        </div>
                        <button className="text-xs text-primary hover:underline">
                          ➜ Kontynuuj naukę
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* PROGRESS TAB */}
            {activeTab === "progress" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Lekcji ukończono</p>
                    <p className="text-3xl font-bold mt-1">20</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Średni postęp</p>
                    <p className="text-3xl font-bold mt-1">52%</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xs text-muted-foreground">Łączny czas nauki</p>
                    <p className="text-3xl font-bold mt-1">42h</p>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="max-w-2xl">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-1">Języki zainteresowania</p>
                    <p className="text-sm text-muted-foreground">Angielski, Hiszpański</p>
                  </div>
                  <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium mt-4">
                    Edytuj profil
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}