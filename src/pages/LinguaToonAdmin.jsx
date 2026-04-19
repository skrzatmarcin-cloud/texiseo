import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Users, Book, Calendar, CreditCard, Percent, BarChart3, Settings,
  Shield, Mail, FileText, CheckCircle2, AlertCircle, Trash2, Edit,
  Plus, Search, Filter, Download, RefreshCw, Eye, Lock, Unlock,
  TrendingUp, DollarSign, GraduationCap, Clock, Home
} from "lucide-react";

const ADMIN_OPTIONS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, color: "bg-blue-50 text-blue-600" },
  { id: "teachers", label: "Nauczyciele", icon: Users, color: "bg-purple-50 text-purple-600" },
  { id: "courses", label: "Kursy", icon: Book, color: "bg-green-50 text-green-600" },
  { id: "lessons", label: "Lekcje", icon: Calendar, color: "bg-orange-50 text-orange-600" },
  { id: "students", label: "Uczniowie", icon: GraduationCap, color: "bg-pink-50 text-pink-600" },
  { id: "payments", label: "Płatności", icon: CreditCard, color: "bg-emerald-50 text-emerald-600" },
  { id: "commissions", label: "Prowizje", icon: Percent, color: "bg-amber-50 text-amber-600" },
  { id: "payouts", label: "Wypłaty", icon: DollarSign, color: "bg-cyan-50 text-cyan-600" },
  { id: "invoices", label: "Faktury", icon: FileText, color: "bg-slate-50 text-slate-600" },
  { id: "messages", label: "Wiadomości", icon: Mail, color: "bg-indigo-50 text-indigo-600" },
  { id: "reviews", label: "Opinie", icon: CheckCircle2, color: "bg-red-50 text-red-600" },
  { id: "disputes", label: "Spory", icon: AlertCircle, color: "bg-yellow-50 text-yellow-600" },
  { id: "access", label: "Zarządzanie dostępem", icon: Lock, color: "bg-violet-50 text-violet-600" },
  { id: "reports", label: "Raporty", icon: TrendingUp, color: "bg-teal-50 text-teal-600" },
  { id: "content", label: "Treść platformy", icon: Edit, color: "bg-lime-50 text-lime-600" },
  { id: "notifications", label: "Powiadomienia", icon: Bell, color: "bg-rose-50 text-rose-600" },
  { id: "analytics", label: "Analityka", icon: BarChart3, color: "bg-sky-50 text-sky-600" },
  { id: "export", label: "Eksport danych", icon: Download, color: "bg-fuchsia-50 text-fuchsia-600" },
  { id: "settings", label: "Ustawienia", icon: Settings, color: "bg-gray-50 text-gray-600" },
  { id: "security", label: "Bezpieczeństwo", icon: Shield, color: "bg-red-50 text-red-600" },
];

import { Bell } from "lucide-react";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}

function OptionGrid({ selectedOption, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
      {ADMIN_OPTIONS.map(opt => {
        const OptIcon = opt.icon;
        const [baseColor, textColor] = opt.color.split(" ");
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={cn(
              "p-4 rounded-xl border-2 transition-all text-left",
              selectedOption === opt.id
                ? `border-primary bg-primary/5`
                : "border-border hover:border-primary/50"
            )}
          >
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center mb-2", opt.color)}>
              <OptIcon className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-foreground truncate">{opt.label}</p>
          </button>
        );
      })}
    </div>
  );
}

export default function LinguaToonAdmin() {
  const [selectedOption, setSelectedOption] = useState("dashboard");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [teachersData, lessonsData] = await Promise.all([
        base44.entities.Teachers.list("-created_date", 100).catch(() => []),
        base44.entities.TeacherLessons.list("-created_date", 100).catch(() => [])
      ]);
      
      setTeachers(teachersData);
      setLessons(lessonsData);
      
      // Calc stats
      const completedLessons = lessonsData.filter(l => l.status === "completed").length;
      const totalEarnings = lessonsData.reduce((sum, l) => sum + (l.amount_due || 0), 0);
      const activeTeachers = teachersData.filter(t => t.status === "active").length;
      
      setStats({
        totalTeachers: teachersData.length,
        activeTeachers,
        totalLessons: lessonsData.length,
        completedLessons,
        totalEarnings,
        averageRating: (teachersData.reduce((sum, t) => sum + (t.rating || 0), 0) / teachersData.length).toFixed(1) || 0
      });
    } catch (err) {
      console.error("Data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    const commonClasses = "bg-card border border-border rounded-xl p-6";

    if (selectedOption === "dashboard") {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Nauczyciele" value={stats?.totalTeachers || 0} icon={Users} color="bg-purple-50 text-purple-600" />
            <StatCard label="Aktywni" value={stats?.activeTeachers || 0} icon={CheckCircle2} color="bg-green-50 text-green-600" />
            <StatCard label="Lekcje" value={stats?.totalLessons || 0} icon={Calendar} color="bg-blue-50 text-blue-600" />
            <StatCard label="Ukończone" value={stats?.completedLessons || 0} icon={Clock} color="bg-orange-50 text-orange-600" />
            <StatCard label="Przychód" value={`${stats?.totalEarnings.toLocaleString('pl-PL')} PLN`} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
            <StatCard label="Ocena śr." value={stats?.averageRating} icon={TrendingUp} color="bg-cyan-50 text-cyan-600" />
          </div>

          <div className={commonClasses}>
            <h3 className="text-lg font-bold mb-4">Ostatni nauczyciele</h3>
            {teachers.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <div>
                  <p className="font-medium text-sm">{t.first_name} {t.last_name}</p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
                </div>
                <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold",
                  t.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedOption === "teachers") {
      return (
        <div className={commonClasses}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Nauczyciele ({teachers.length})</h3>
            <button className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90">
              + Dodaj nauczyciela
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-4 py-2 text-left">Nazwa</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Lekcje</th>
                  <th className="px-4 py-2 text-left">Ocena</th>
                  <th className="px-4 py-2">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(t => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-4 py-3">{t.first_name} {t.last_name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold",
                        t.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{t.total_lessons || 0}</td>
                    <td className="px-4 py-3 text-sm">⭐ {t.rating || "-"}</td>
                    <td className="px-4 py-3 flex gap-2 justify-center">
                      <button className="text-blue-600 hover:text-blue-700"><Eye className="h-4 w-4" /></button>
                      <button className="text-amber-600 hover:text-amber-700"><Edit className="h-4 w-4" /></button>
                      <button className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (selectedOption === "lessons") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Lekcje ({lessons.length})</h3>
          <div className="space-y-3">
            {lessons.slice(0, 20).map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{l.student_name || "Uczeń"}</p>
                  <p className="text-xs text-muted-foreground">{l.lesson_date} o {l.lesson_time}</p>
                </div>
                <span className={cn("text-[10px] px-2 py-1 rounded-full font-bold",
                  l.status === "completed" ? "bg-green-100 text-green-700" :
                  l.status === "scheduled" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                )}>
                  {l.status}
                </span>
                {l.amount_due && <p className="text-sm font-bold ml-4">{l.amount_due} PLN</p>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedOption === "payments") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Płatności & Rozliczenia</h3>
          <div className="space-y-3">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">💰 Łączny przychód: <strong>{stats?.totalEarnings.toLocaleString('pl-PL')} PLN</strong></p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{lessons.filter(l => l.paid).length}</p>
                <p className="text-xs text-muted-foreground">Opłacone</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">{lessons.filter(l => !l.paid).length}</p>
                <p className="text-xs text-muted-foreground">Oczekujące</p>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Zaległy</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedOption === "commissions") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">System Prowizji</h3>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-bold text-amber-900">Standardowe stawki prowizji:</p>
              <ul className="text-xs text-amber-800 mt-2 space-y-1">
                <li>• Indywidualne lekcje: 20%</li>
                <li>• Kursy: 30%</li>
                <li>• Premium nauczyciele: 15%</li>
              </ul>
            </div>
            <button className="w-full py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
              ⚙️ Edytuj stawki prowizji
            </button>
          </div>
        </div>
      );
    }

    if (selectedOption === "access") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Zarządzanie Dostępem</h3>
          <div className="space-y-3">
            {teachers.slice(0, 10).map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{t.first_name} {t.last_name}</p>
                  <p className="text-xs text-muted-foreground">{t.email}</p>
                </div>
                <div className="flex gap-2">
                  {t.status === "active" ? (
                    <button className="px-3 py-1 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100">
                      <Lock className="h-3 w-3 inline mr-1" /> Zablokuj
                    </button>
                  ) : (
                    <button className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded hover:bg-green-100">
                      <Unlock className="h-3 w-3 inline mr-1" /> Odblokuj
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (selectedOption === "export") {
      return (
        <div className={commonClasses}>
          <h3 className="text-lg font-bold mb-4">Eksport Danych</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border-2 border-border rounded-lg hover:bg-secondary transition-all text-left">
              <Download className="h-5 w-5 text-blue-600 mb-2" />
              <p className="font-semibold text-sm">Nauczyciele</p>
              <p className="text-xs text-muted-foreground">CSV/XLSX</p>
            </button>
            <button className="p-4 border-2 border-border rounded-lg hover:bg-secondary transition-all text-left">
              <Download className="h-5 w-5 text-green-600 mb-2" />
              <p className="font-semibold text-sm">Lekcje</p>
              <p className="text-xs text-muted-foreground">CSV/XLSX</p>
            </button>
            <button className="p-4 border-2 border-border rounded-lg hover:bg-secondary transition-all text-left">
              <Download className="h-5 w-5 text-emerald-600 mb-2" />
              <p className="font-semibold text-sm">Płatności</p>
              <p className="text-xs text-muted-foreground">CSV/XLSX</p>
            </button>
            <button className="p-4 border-2 border-border rounded-lg hover:bg-secondary transition-all text-left">
              <Download className="h-5 w-5 text-purple-600 mb-2" />
              <p className="font-semibold text-sm">Raporty</p>
              <p className="text-xs text-muted-foreground">PDF</p>
            </button>
          </div>
        </div>
      );
    }

    // Default placeholder dla pozostałych opcji
    return (
      <div className={commonClasses}>
        <h3 className="text-lg font-bold mb-2 capitalize">{ADMIN_OPTIONS.find(o => o.id === selectedOption)?.label}</h3>
        <p className="text-muted-foreground text-sm">Funkcjonalność dostępna wkrótce...</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Odśwież dane
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <GraduationCap className="h-6 w-6" />
                LinguaToons.com — Panel Administracyjny
              </h1>
              <p className="text-blue-100 text-sm mt-1">Zarządzaj nauczycielami, kursami, płatościami i całą platformą</p>
            </div>
            <a href="/" className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <Home className="h-4 w-4" />
              <span className="text-sm">Menu główne</span>
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search & Filter */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Szukaj nauczyciela, lekcji..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button onClick={loadData} className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors flex items-center gap-2">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="text-sm">Odśwież</span>
          </button>
        </div>

        {/* Admin Options Grid */}
        <OptionGrid selectedOption={selectedOption} onSelect={setSelectedOption} />

        {/* Content Area */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Ładowanie danych...</p>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}