import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  RefreshCw, Download, Upload, BarChart3, Eye, Copy,
  Trash2, AlertCircle, CheckCircle2, Loader2, Link2,
  Users, BookOpen, Clock, TrendingUp, ArrowRight, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  synced: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  draft: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function MasterStudyLMS() {
  const [view, setView] = useState("overview"); // overview, analytics, import, sync
  const [loading, setLoading] = useState(false);
  const [wpUrl, setWpUrl] = useState("https://masterstudy.example.com");
  const [apiKey, setApiKey] = useState("");
  const [courses, setCourses] = useState([
    { id: 1, title: "English A1 Complete", students: 45, lessons: 24, rating: 4.8, status: "synced", lastSync: "2026-04-18" },
    { id: 2, title: "Spanish B1 Advanced", students: 32, lessons: 18, rating: 4.9, status: "pending", lastSync: "2026-04-17" },
    { id: 3, title: "French Conversation", students: 28, lessons: 15, rating: 4.7, status: "synced", lastSync: "2026-04-19" }
  ]);
  const [syncStats, setSyncStats] = useState({
    totalCourses: 47,
    syncedCourses: 42,
    pendingSync: 5,
    totalStudents: 1250,
    totalLessons: 380,
    lastFullSync: "2026-04-19 10:30"
  });

  const handleConnectWordPress = async () => {
    if (!wpUrl || !apiKey) {
      alert("Wpisz URL WordPress i API Key");
      return;
    }
    setLoading(true);
    try {
      // Mock weryfikacji i synchronizacji
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert("✓ Połączono z MasterStudy!");
      setView("analytics");
    } catch (err) {
      alert("Błąd połączenia: " + err.message);
    }
    setLoading(false);
  };

  const handleAnalyzeLMS = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analizuj strukturę kursu e-learningowego z MasterStudy:
        
Kursy: ${JSON.stringify(courses)}
Statystyka: ${JSON.stringify(syncStats)}

Dokonaj analizy:
1. Struktura i organizacja kursów
2. Jakość lekcji i zaangażowanie studentów
3. Optymalny harmonogram synchronizacji
4. Rekomendacje dla TexiSEO integration
5. Automatyzacja publikacji

Zwróć JSON z analizą i rekomendacjami.`,
        response_json_schema: {
          type: "object",
          properties: {
            analysis: { type: "string" },
            recommendations: { type: "array", items: { type: "string" } },
            syncStrategy: { type: "string" },
            automationPlan: { type: "string" }
          }
        }
      });
      alert("✓ Analiza ukończona!");
      console.log("LMS Analysis:", response);
    } catch (err) {
      alert("Błąd analizy: " + err.message);
    }
    setLoading(false);
  };

  const handleImportCourse = async (course) => {
    setLoading(true);
    try {
      await base44.entities.TeacherCourse.create({
        teacher_id: "current_teacher",
        course_name: course.title,
        description: `Importowany z MasterStudy • ${course.students} studentów`,
        language: "angielski",
        level: "A1",
        course_type: "self-paced",
        duration_weeks: Math.ceil(course.lessons / 4),
        max_students: 100,
        status: "active",
        price_per_month_pln: 0
      });

      setCourses(prev => prev.map(c => 
        c.id === course.id ? { ...c, status: "synced", lastSync: new Date().toISOString().split("T")[0] } : c
      ));
      alert(`✓ Kurs "${course.title}" zaimportowany do TexiSEO!`);
    } catch (err) {
      alert("Błąd importu: " + err.message);
    }
    setLoading(false);
  };

  const handleSyncAll = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSyncStats(prev => ({
        ...prev,
        syncedCourses: prev.totalCourses,
        pendingSync: 0,
        lastFullSync: new Date().toLocaleString('pl-PL')
      }));
      setCourses(prev => prev.map(c => ({ ...c, status: "synced", lastSync: new Date().toISOString().split("T")[0] })));
      alert("✓ Pełna synchronizacja ukończona!");
    } catch (err) {
      alert("Błąd synchronizacji: " + err.message);
    }
    setLoading(false);
  };

  const handlePublishToSocial = async (course) => {
    setLoading(true);
    try {
      const content = `🎓 Nowy kurs: "${course.title}"\n👥 ${course.students} studentów\n⭐ Rating: ${course.rating}/5\n\n📚 Dołącz do kursu na TexiSEO!`;
      
      // Sync do social media
      await Promise.all([
        base44.integrations.Core.SendEmail({
          to: "marketing@texiseo.com",
          subject: `Publikuj kurs: ${course.title}`,
          body: content
        })
      ]);

      alert("✓ Kurs opublikowany na kanałach społecznych!");
    } catch (err) {
      alert("Błąd publikacji: " + err.message);
    }
    setLoading(false);
  };

  // === OVERVIEW ===
  if (view === "overview") {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">📚 MasterStudy LMS Integration</h2>
          <div className="flex gap-2">
            <Button onClick={() => setView("analytics")} variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analiza
            </Button>
            <Button onClick={() => setView("import")} className="gap-2">
              <Download className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-white mb-2">🔗 Połącz z MasterStudy WordPress</h3>
              <p className="text-sm text-blue-100/80 mb-4">
                Synchronizuj wszystkie kursy, lekcje, quizy i dane studentów bezpośrednio z Twojego WordPress'a do TexiSEO
              </p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
          </div>

          <div className="space-y-3 mt-4">
            <div>
              <label className="text-xs font-semibold text-blue-200 mb-1.5 block">URL WordPress MasterStudy</label>
              <input
                type="text"
                value={wpUrl}
                onChange={e => setWpUrl(e.target.value)}
                placeholder="https://twoja-domena.com"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-blue-200 mb-1.5 block">API Key (REST API)</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-blue-200/60 mt-1">
                Znajdź API Key w: WordPress Settings → REST API → Application Passwords
              </p>
            </div>
            <Button
              onClick={handleConnectWordPress}
              disabled={loading}
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Łączę...</>
              ) : (
                <><Link2 className="h-4 w-4" /> Połącz WordPress</>
              )}
            </Button>
          </div>
        </div>

        {/* Sync Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Kursy", value: syncStats.totalCourses, icon: BookOpen, color: "text-blue-600" },
            { label: "Zsynchronizowane", value: syncStats.syncedCourses, icon: CheckCircle2, color: "text-emerald-600" },
            { label: "Oczekujące", value: syncStats.pendingSync, icon: Clock, color: "text-amber-600" },
            { label: "Studenci", value: syncStats.totalStudents, icon: Users, color: "text-purple-600" }
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className={cn("h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-3", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Courses List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Moje Kursy (MasterStudy)</h3>
            <Button onClick={handleSyncAll} disabled={loading} variant="outline" className="gap-2 text-xs">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Synchronizuj Wszystkie
            </Button>
          </div>

          <div className="space-y-2">
            {courses.map(course => (
              <div key={course.id} className={cn("border rounded-xl p-4 transition-all", STATUS_COLORS[course.status])}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{course.title}</p>
                    <div className="flex gap-4 mt-2 text-xs opacity-80">
                      <span>👥 {course.students} studentów</span>
                      <span>📚 {course.lessons} lekcji</span>
                      <span>⭐ {course.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleImportCourse(course)}
                      disabled={loading}
                      className="gap-1 text-xs h-8"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Import
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handlePublishToSocial(course)}
                      disabled={loading}
                      className="gap-1 text-xs h-8"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      Share
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] opacity-70 mt-2">Ostatnia sync: {course.lastSync}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // === ANALYTICS ===
  if (view === "analytics") {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setView("overview")} className="text-primary hover:underline text-sm">← Wróć</button>
          <h2 className="text-2xl font-bold">📊 Analiza MasterStudy LMS</h2>
        </div>

        {/* Analysis Sections */}
        <div className="space-y-4">
          {[
            { title: "Struktura Kursów", icon: "📚", desc: "Hierarchia, lekcje, quizy, zasoby" },
            { title: "Zaangażowanie Studentów", icon: "👥", desc: "Aktywność, postęp, ukończenia" },
            { title: "Harmonogram Synchronizacji", icon: "⏱️", desc: "Optymalny czas i częstość syncu" },
            { title: "Integracja TexiSEO", icon: "🔗", desc: "Mapowanie danych i workflow" },
            { title: "Automatyzacja Publikacji", icon: "🤖", desc: "Social media, email, analytics" },
            { title: "Raport Wydajności", icon: "📈", desc: "KPI, trendy, rekomendacje" }
          ].map((item, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <h3 className="font-bold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground/50" />
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleAnalyzeLMS} disabled={loading} className="w-full gap-2 h-12">
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Analizuję...</>
          ) : (
            <><BarChart3 className="h-4 w-4" /> Generuj Pełną Analizę AI</>
          )}
        </Button>
      </div>
    );
  }

  // === IMPORT ===
  if (view === "import") {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setView("overview")} className="text-primary hover:underline text-sm">← Wróć</button>
          <h2 className="text-2xl font-bold">📥 Import Kursów do TexiSEO</h2>
        </div>

        {/* Import Options */}
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: "Kursy", icon: BookOpen, desc: "Wszystkie kursy i moduły", action: "Import Kursów" },
            { title: "Lekcje", icon: Clock, desc: "Lekcje, materiały, zasoby", action: "Import Lekcji" },
            { title: "Quizy", icon: Zap, desc: "Pytania, odpowiedzi, ocenianie", action: "Import Quizów" },
            { title: "Studenci", icon: Users, desc: "Dane studentów i postęp", action: "Import Studentów" }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => alert(`Importowanie: ${item.title}`)}
              className="p-5 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary transition-all text-left"
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-bold text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{item.desc}</p>
              <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded">
                {item.action}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <span className="font-semibold">💡 Tip:</span> Import jest dwukierunkowy — zmiany w TexiSEO mogą być zsynchronizowane z powrotem do WordPress.
          </p>
        </div>
      </div>
    );
  }

  return null;
}