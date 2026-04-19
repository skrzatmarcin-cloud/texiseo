import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  DollarSign, TrendingUp, Percent, BarChart3, CheckCircle2, Clock,
  ChevronDown, Download, Loader2, AlertTriangle, BookOpen, Users
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// Default platform commission rate: 20% (Superprof model)
const DEFAULT_COMMISSION_RATE = 20;

const COMMISSION_TIERS = [
  { minLessons: 0, rate: 20, label: "Starter", color: "text-blue-600", bg: "bg-blue-50" },
  { minLessons: 10, rate: 15, label: "Pro", color: "text-violet-600", bg: "bg-violet-50" },
  { minLessons: 30, rate: 10, label: "Expert", color: "text-emerald-600", bg: "bg-emerald-50" },
  { minLessons: 100, rate: 5, label: "Master", color: "text-amber-600", bg: "bg-amber-50" },
];

function getTier(lessons) {
  return COMMISSION_TIERS.slice().reverse().find(t => lessons >= t.minLessons) || COMMISSION_TIERS[0];
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function CommissionPanel() {
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    Promise.all([
      base44.entities.Teachers.list(),
      base44.entities.TeacherLessons.list("-lesson_date", 500),
      base44.entities.TeacherCourses.list(),
    ]).then(([t, l, c]) => { setTeachers(t); setLessons(l); setCourses(c); setLoading(false); });
  }, []);

  const teacherCommissions = useMemo(() => {
    return teachers.map(teacher => {
      const allLessons = lessons.filter(l => l.teacher_id === teacher.id && l.status === "completed");
      const periodLessons = allLessons.filter(l => l.lesson_date?.startsWith(period));
      const tier = getTier(allLessons.length);
      const grossRevenue = periodLessons.reduce((s, l) => s + (l.amount_due || 0), 0);
      const commission = grossRevenue * (tier.rate / 100);
      const teacherEarnings = grossRevenue - commission;
      const teacherCourses = courses.filter(c => c.teacher_id === teacher.id);
      const courseRevenue = teacherCourses.reduce((s, c) => s + ((c.price || 0) * (c.enrolled_count || 0)), 0);
      const courseCommission = courseRevenue * (DEFAULT_COMMISSION_RATE / 100);
      return {
        teacher,
        allLessonsCount: allLessons.length,
        periodLessons: periodLessons.length,
        grossRevenue,
        commission,
        teacherEarnings,
        tier,
        courseRevenue,
        courseCommission,
        totalCommission: commission + courseCommission,
        totalRevenue: grossRevenue + courseRevenue,
      };
    }).filter(c => c.totalRevenue > 0 || c.allLessonsCount > 0);
  }, [teachers, lessons, courses, period]);

  const totalPlatformRevenue = teacherCommissions.reduce((s, c) => s + c.totalCommission, 0);
  const totalTeacherEarnings = teacherCommissions.reduce((s, c) => s + c.teacherEarnings, 0);
  const totalGross = teacherCommissions.reduce((s, c) => s + c.totalRevenue, 0);

  const chartData = teacherCommissions.slice(0, 8).map(c => ({
    name: `${c.teacher.first_name} ${c.teacher.last_name?.[0]}.`,
    lekcje: c.grossRevenue,
    kursy: c.courseRevenue,
    prowizja: c.totalCommission,
  }));

  const pieData = [
    { name: "Zarobki nauczycieli", value: totalTeacherEarnings },
    { name: "Prowizja platformy", value: totalPlatformRevenue },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold">System prowizji platformy</h2>
          <p className="text-xs text-muted-foreground">Model Superprof: progresywne prowizje — im więcej lekcji, tym niższa stawka</p>
        </div>
        <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
          className="h-9 px-3 rounded-lg border border-input bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
      </div>

      {/* Tier system */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {COMMISSION_TIERS.map(tier => (
          <div key={tier.label} className={cn("rounded-xl p-3 border border-border", tier.bg)}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">{tier.label}</span>
              <span className={cn("text-lg font-black", tier.color)}>{tier.rate}%</span>
            </div>
            <p className="text-[10px] text-muted-foreground">od {tier.minLessons} lekcji</p>
            <div className="mt-1 h-1 rounded-full bg-white/50">
              <div className={cn("h-1 rounded-full", tier.color.replace("text", "bg"))} style={{ width: `${100 - tier.rate * 4}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Całkowity przychód", value: `${totalGross.toFixed(0)} PLN`, icon: DollarSign, color: "text-primary", sub: "lekcje + kursy" },
          { label: "Prowizja platformy", value: `${totalPlatformRevenue.toFixed(0)} PLN`, icon: Percent, color: "text-violet-600", sub: `${totalGross > 0 ? ((totalPlatformRevenue/totalGross)*100).toFixed(1) : 0}% avg` },
          { label: "Wypłaty dla nauczycieli", value: `${totalTeacherEarnings.toFixed(0)} PLN`, icon: TrendingUp, color: "text-emerald-600", sub: "po odliczeniu prowizji" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={cn("h-4 w-4", s.color)} />
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
            <p className={cn("text-xl font-black", s.color)}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4 mb-5">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Przychody według nauczyciela (PLN)</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={12}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => `${v} PLN`} />
                <Bar dataKey="lekcje" fill="#6366f1" name="Lekcje" radius={[3,3,0,0]} />
                <Bar dataKey="kursy" fill="#10b981" name="Kursy" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Podział przychodów</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={60} label={false}>
                  {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v.toFixed(0)} PLN`} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Per-teacher table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-bold">Szczegóły prowizji — {period}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-secondary/40 border-b border-border">
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Nauczyciel</th>
                <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Tier</th>
                <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Lekcji</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Przychód lekcji</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Przychód kursów</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Prowizja</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Wypłata</th>
              </tr>
            </thead>
            <tbody>
              {teacherCommissions.map(c => (
                <tr key={c.teacher.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {c.teacher.first_name?.[0]}{c.teacher.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">{c.teacher.first_name} {c.teacher.last_name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.allLessonsCount} lekcji łącznie</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", c.tier.bg, c.tier.color)}>
                      {c.tier.label} {c.tier.rate}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{c.periodLessons}</td>
                  <td className="px-4 py-3 text-right">{c.grossRevenue.toFixed(0)} PLN</td>
                  <td className="px-4 py-3 text-right">{c.courseRevenue.toFixed(0)} PLN</td>
                  <td className="px-4 py-3 text-right font-semibold text-violet-600">{c.totalCommission.toFixed(0)} PLN</td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">{c.teacherEarnings.toFixed(0)} PLN</td>
                </tr>
              ))}
              {teacherCommissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">Brak danych za wybrany okres</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}