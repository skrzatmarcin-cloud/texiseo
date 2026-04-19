import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Loader2, TrendingUp, Users, BookOpen, CreditCard } from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

export default function TeacherStats() {
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Teachers.list(),
      base44.entities.TeacherLessons.list("-lesson_date", 500),
    ]).then(([t, l]) => { setTeachers(t); setLessons(l); setLoading(false); });
  }, []);

  const stats = useMemo(() => {
    const completed = lessons.filter(l => l.status === "completed");
    const byTeacher = teachers.map(t => ({
      name: `${t.first_name} ${t.last_name?.[0]}.`,
      lekcje: lessons.filter(l => l.teacher_id === t.id && l.status === "completed").length,
      zarobki: lessons.filter(l => l.teacher_id === t.id && l.status === "completed").reduce((s, l) => s + (l.amount_due || 0), 0),
    })).sort((a, b) => b.lekcje - a.lekcje);

    // By language
    const langMap = {};
    completed.forEach(l => { langMap[l.language || "inny"] = (langMap[l.language || "inny"] || 0) + 1; });
    const byLang = Object.entries(langMap).map(([name, value]) => ({ name, value }));

    // Last 8 weeks
    const weeklyData = [];
    for (let i = 7; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i * 7);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const label = `${weekStart.getDate()}.${weekStart.getMonth() + 1}`;
      const count = completed.filter(l => {
        if (!l.lesson_date) return false;
        const d = new Date(l.lesson_date);
        return d >= weekStart && d <= weekEnd;
      }).length;
      weeklyData.push({ week: label, lekcje: count });
    }

    return {
      totalLessons: completed.length,
      totalEarnings: completed.reduce((s, l) => s + (l.amount_due || 0), 0),
      avgPerTeacher: teachers.length ? Math.round(completed.length / teachers.length) : 0,
      cancelRate: lessons.length ? Math.round(lessons.filter(l => l.status === "cancelled" || l.status === "no_show").length / lessons.length * 100) : 0,
      byTeacher, byLang, weeklyData,
    };
  }, [teachers, lessons]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-5 space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Lekcji łącznie", value: stats.totalLessons, icon: BookOpen, color: "text-primary" },
          { label: "Przychód łączny", value: `${stats.totalEarnings.toFixed(0)} PLN`, icon: CreditCard, color: "text-emerald-600" },
          { label: "Śr. lekcji / nauczyciel", value: stats.avgPerTeacher, icon: Users, color: "text-blue-600" },
          { label: "Współczynnik odwołań", value: `${stats.cancelRate}%`, icon: TrendingUp, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={cn("h-4 w-4", s.color)} />
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Weekly trend */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold mb-3">Tygodniowy trend lekcji</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={stats.weeklyData}>
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="lekcje" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* By teacher */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold mb-3">Lekcje per nauczyciel</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.byTeacher.slice(0, 6)}>
              <XAxis dataKey="name" tick={{ fontSize: 9 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="lekcje" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* By language (pie) */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold mb-3">Podział lekcji wg języka</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={stats.byLang} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }) => `${Math.round(percent * 100)}%`} labelLine={false}>
                  {stats.byLang.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5">
              {stats.byLang.map((l, i) => (
                <div key={l.name} className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <p className="text-xs">{l.name}: <span className="font-semibold">{l.value}</span></p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top earners */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-sm font-semibold mb-3">Zarobki per nauczyciel (PLN)</p>
          <div className="space-y-2">
            {stats.byTeacher.slice(0, 5).map((t, i) => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <p className="text-xs flex-1 truncate">{t.name}</p>
                <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${stats.byTeacher[0]?.zarobki ? t.zarobki / stats.byTeacher[0].zarobki * 100 : 0}%` }} />
                </div>
                <span className="text-xs font-semibold text-emerald-600 w-16 text-right">{t.zarobki} PLN</span>
              </div>
            ))}
            {stats.byTeacher.length === 0 && <p className="text-xs text-muted-foreground">Brak danych</p>}
          </div>
        </div>
      </div>
    </div>
  );
}