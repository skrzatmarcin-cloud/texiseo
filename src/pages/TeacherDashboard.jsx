import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  DollarSign, BookOpen, Zap, BarChart3, Clock, AlertCircle,
  CheckCircle2, Home, LogOut, Settings, TrendingUp
} from "lucide-react";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadTeacherData();
  }, []);

  const loadTeacherData = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (!currentUser) {
        navigate("/");
        return;
      }
      setUser(currentUser);

      // Pobranie ustawień nauczyciela
      const teacherSettings = await base44.entities.TeacherSettings.filter({
        teacher_email: currentUser.email
      }, "-created_at", 1);
      setSettings(teacherSettings[0] || null);

      // Pobranie zarobków (bieżący miesiąc)
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const teacherEarnings = await base44.entities.TeacherEarnings.filter({
        teacher_email: currentUser.email,
        period_start: startOfMonth.toISOString().split('T')[0],
        period_end: endOfMonth.toISOString().split('T')[0]
      }, "-created_at", 1);
      setEarnings(teacherEarnings[0] || null);

      // Pobranie kursów nauczyciela
      const teacherCourses = await base44.entities.TeacherCourse.filter({
        teacher_id: currentUser.id
      }, "-created_date");
      setCourses(teacherCourses);

      setLoading(false);
    } catch (error) {
      console.error("Error loading teacher data:", error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold">👨‍🏫 Moja platforma</h2>
          <p className="text-xs text-slate-400">{user?.full_name}</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {[
            { id: "overview", label: "Przegląd", icon: Home },
            { id: "earnings", label: "Moje zarobki", icon: DollarSign },
            { id: "courses", label: "Moje kursy", icon: BookOpen },
            { id: "quizzes", label: "Quizy", icon: Zap },
            { id: "games", label: "Gry/Ćwiczenia", icon: Zap },
            { id: "subscription", label: "Subskrypcja", icon: BarChart3 },
            { id: "settings", label: "Ustawienia", icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                activeTab === item.id
                  ? "bg-primary text-white"
                  : "text-slate-300 hover:bg-slate-800"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {activeTab === "overview" && "Przegląd"}
            {activeTab === "earnings" && "Moje zarobki"}
            {activeTab === "courses" && "Moje kursy"}
            {activeTab === "quizzes" && "Quizy"}
            {activeTab === "games" && "Gry i ćwiczenia"}
            {activeTab === "subscription" && "Subskrypcja"}
            {activeTab === "settings" && "Ustawienia"}
          </h1>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Zarobki (ten miesiąc)</p>
                        <p className="text-2xl font-bold">{earnings?.net_amount || 0} PLN</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Aktywne kursy</p>
                        <p className="text-2xl font-bold">{courses.filter(c => c.status === "active").length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status subskrypcji</p>
                        <p className="text-2xl font-bold capitalize">{settings?.subscription_plan || "free"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subscription Alert */}
                {settings?.subscription_status === "trial" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900">Wersja próbna aktywna</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Twoja subskrypcja wygaśnie {settings.subscription_end_date}. Przejdź do sekcji Subskrypcja aby wybrać plan.
                      </p>
                    </div>
                  </div>
                )}

                {/* Recent Courses */}
                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-lg font-bold mb-4">Ostatnie kursy</h3>
                  {courses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nie masz jeszcze żadnych kursów. Stwórz pierwszy kurs!</p>
                  ) : (
                    <div className="space-y-3">
                      {courses.slice(0, 5).map(course => (
                        <div key={course.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{course.course_name}</p>
                            <p className="text-xs text-muted-foreground">{course.current_students} studentów</p>
                          </div>
                          <span className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            course.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          )}>
                            {course.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* EARNINGS TAB */}
            {activeTab === "earnings" && (
              <div className="space-y-6">
                {earnings ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground mb-1">Łączne zarobki</p>
                        <p className="text-3xl font-bold">{earnings.total_earnings} PLN</p>
                      </div>
                      <div className="bg-card border border-border rounded-xl p-4">
                        <p className="text-xs text-muted-foreground mb-1">Ukończone lekcje</p>
                        <p className="text-3xl font-bold">{earnings.lessons_completed}</p>
                      </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-5">
                      <h3 className="text-lg font-bold mb-4">Szczegóły rozliczenia</h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>Kwota brutto:</span><span className="font-medium">{earnings.gross_amount} PLN</span></div>
                        <div className="flex justify-between"><span>Prowizja platformy ({earnings.platform_commission_percent}%):</span><span className="font-medium text-red-600">-{earnings.platform_commission_amount} PLN</span></div>
                        <div className="flex justify-between"><span>Bonus za kursy:</span><span className="font-medium text-green-600">+{earnings.bonus_courses} PLN</span></div>
                        <div className="flex justify-between font-bold border-t pt-2"><span>Razem do wypłaty:</span><span>{earnings.net_amount} PLN</span></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Brak danych o zarobkach dla tego okresu</p>
                  </div>
                )}
              </div>
            )}

            {/* COURSES TAB */}
            {activeTab === "courses" && (
              <div className="space-y-6">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">
                  + Utwórz nowy kurs
                </button>
                {courses.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Nie masz jeszcze żadnych kursów</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {courses.map(course => (
                      <div key={course.id} className="bg-card border border-border rounded-xl p-4">
                        <h4 className="font-bold mb-2">{course.course_name}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{course.description}</p>
                        <div className="space-y-1 text-xs">
                          <p><span className="font-medium">Język:</span> {course.language}</p>
                          <p><span className="font-medium">Poziom:</span> {course.level}</p>
                          <p><span className="font-medium">Studenci:</span> {course.current_students}/{course.max_students}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUBSCRIPTION TAB */}
            {activeTab === "subscription" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { name: "Starter", price: 49, features: ["Do 5 kursów", "Bez reklam", "Wsparcie email"] },
                    { name: "Pro", price: 99, features: ["Do 20 kursów", "Bez reklam", "Priorytetowe wsparcie"] },
                    { name: "Enterprise", price: 199, features: ["Nieograniczone kursy", "Bez reklam", "Dedykowany opiekun"] }
                  ].map((plan, idx) => (
                    <div key={idx} className={cn("border-2 rounded-xl p-5", 
                      settings?.subscription_plan === plan.name.toLowerCase() ? "border-primary bg-primary/5" : "border-border"
                    )}>
                      <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                      <p className="text-3xl font-bold mb-4">{plan.price} PLN<span className="text-xs text-muted-foreground">/miesiąc</span></p>
                      <ul className="space-y-2 mb-4">
                        {plan.features.map((f, i) => (
                          <li key={i} className="text-xs">✓ {f}</li>
                        ))}
                      </ul>
                      <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium">
                        {settings?.subscription_plan === plan.name.toLowerCase() ? "Aktywny" : "Wybierz plan"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="max-w-2xl">
                <div className="bg-card border border-border rounded-xl p-5 space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-1">Stawka godzinowa</p>
                    <p className="text-lg font-bold">{settings?.hourly_rate_pln || 50} PLN/h</p>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-3">Metoda płatności</p>
                    <p className="text-xs text-muted-foreground">{settings?.payment_method || "Nie ustawiono"}</p>
                  </div>
                  <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">
                    Edytuj ustawienia
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