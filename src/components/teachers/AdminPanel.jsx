import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Shield, Users, BookOpen, DollarSign, TrendingUp, AlertTriangle,
  CheckCircle2, Clock, Percent, BarChart3, Star, Loader2,
  UserCheck, UserX, Trash2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const APPROVAL_STATUSES = {
  active: { label: "Aktywny", bg: "bg-emerald-50", text: "text-emerald-700" },
  inactive: { label: "Nieaktywny", bg: "bg-gray-100", text: "text-gray-500" },
  trial: { label: "Oczekuje weryfikacji", bg: "bg-amber-50", text: "text-amber-700" },
  on_leave: { label: "Urlop", bg: "bg-blue-50", text: "text-blue-700" },
};

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", color.replace("text", "bg") + "/10")}>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
      </div>
      <p className={cn("text-2xl font-black", color)}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminPanel() {
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    const [t, l, c, p] = await Promise.all([
      base44.entities.Teachers.list("-created_date"),
      base44.entities.TeacherLessons.list("-lesson_date", 500),
      base44.entities.TeacherCourses.list("-enrolled_count"),
      base44.entities.TeacherPayments.list("-created_date"),
    ]);
    setTeachers(t); setLessons(l); setCourses(c); setPayments(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateTeacherStatus = async (id, status) => {
    setUpdating(id);
    await base44.entities.Teachers.update(id, { status });
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    setUpdating(null);
  };

  const deleteCourse = async (id) => {
    if (!confirm("Usunąć kurs?")) return;
    await base44.entities.TeacherCourses.delete(id);
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  // Analytics
  const last6Months = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const mLessons = lessons.filter(l => l.lesson_date?.startsWith(key) && l.status === "completed");
      months.push({
        name: d.toLocaleDateString("pl", { month: "short" }),
        lekcje: mLessons.length,
        przychod: mLessons.reduce((s, l) => s + (l.amount_due || 0), 0),
      });
    }
    return months;
  }, [lessons]);

  const totalRevenue = lessons.filter(l => l.status === "completed").reduce((s, l) => s + (l.amount_due || 0), 0);
  const platformCommission = totalRevenue * 0.15;
  const awaitingApproval = teachers.filter(t => t.status === "trial").length;
  const topTeacher = teachers.reduce((best, t) => {
    const count = lessons.filter(l => l.teacher_id === t.id && l.status === "completed").length;
    return count > (best.count || 0) ? { teacher: t, count } : best;
  }, {});

  const SECTIONS = [
    { id: "overview", label: "Przegląd", icon: BarChart3 },
    { id: "teachers", label: "Zarządzanie nauczycielami", icon: Users },
    { id: "courses", label: "Zarządzanie kursami", icon: BookOpen },
    { id: "financials", label: "Finanse", icon: DollarSign },
  ];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-5">
      {/* Admin nav */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
              activeSection === s.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>
            <s.icon className="h-3.5 w-3.5" />
            {s.label}
            {s.id === "teachers" && awaitingApproval > 0 && (
              <span className="bg-amber-500 text-white text-[9px] rounded-full px-1.5 py-0.5 font-bold">{awaitingApproval}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeSection === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Nauczyciele" value={teachers.length} icon={Users} color="text-primary" sub={`${teachers.filter(t => t.status === "active").length} aktywnych`} />
            <StatCard label="Kursy" value={courses.length} icon={BookOpen} color="text-violet-600" sub={`${courses.filter(c => c.status === "active").length} aktywnych`} />
            <StatCard label="Łączny przychód" value={`${totalRevenue.toFixed(0)} PLN`} icon={DollarSign} color="text-emerald-600" sub="wszystkie lekcje" />
            <StatCard label="Prowizja platformy" value={`${platformCommission.toFixed(0)} PLN`} icon={TrendingUp} color="text-amber-600" sub="~15% avg" />
          </div>

          {awaitingApproval > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">{awaitingApproval} nauczyciel(i) oczekuje na weryfikację</p>
                <p className="text-xs text-amber-700">Przejdź do sekcji "Zarządzanie nauczycielami", aby zatwierdzić profile.</p>
              </div>
              <button onClick={() => setActiveSection("teachers")} className="ml-auto px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg hover:bg-amber-600">
                Przejdź
              </button>
            </div>
          )}

          {/* Revenue chart */}
          <div className="bg-card border border-border rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">Przychód z lekcji — ostatnie 6 miesięcy (PLN)</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={last6Months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `${v} PLN`} />
                <Line type="monotone" dataKey="przychod" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} name="Przychód" />
                <Line type="monotone" dataKey="lekcje" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Lekcje" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top performers */}
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-bold mb-3">Top 5 nauczycieli (lekcje)</p>
              {teachers
                .map(t => ({ t, count: lessons.filter(l => l.teacher_id === t.id && l.status === "completed").length }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(({ t, count }, i) => (
                  <div key={t.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <span className={cn("text-xs font-black w-5", i === 0 ? "text-amber-500" : "text-muted-foreground")}>#{i+1}</span>
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {t.first_name?.[0]}{t.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{t.first_name} {t.last_name}</p>
                      <div className="h-1.5 bg-secondary rounded-full mt-1">
                        <div className="h-1.5 bg-primary rounded-full" style={{ width: `${Math.min((count / (topTeacher.count || 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-primary">{count}</span>
                  </div>
                ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-bold mb-3">Top kursy (zapisani)</p>
              {courses
                .sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0))
                .slice(0, 5)
                .map(c => (
                  <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{c.course_title}</p>
                      <p className="text-[10px] text-muted-foreground">{c.language} · {c.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600">{c.price} PLN</p>
                      <p className="text-[10px] text-muted-foreground">{c.enrolled_count || 0} uczniów</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Teachers management */}
      {activeSection === "teachers" && (
        <div className="space-y-3">
          {teachers.map(teacher => {
            const lessonCount = lessons.filter(l => l.teacher_id === teacher.id && l.status === "completed").length;
            const earnings = lessons.filter(l => l.teacher_id === teacher.id && l.status === "completed").reduce((s, l) => s + (l.amount_due || 0), 0);
            const info = APPROVAL_STATUSES[teacher.status] || APPROVAL_STATUSES.inactive;
            return (
              <div key={teacher.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{teacher.first_name} {teacher.last_name}</p>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", info.bg, info.text)}>
                        {info.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span>{lessonCount} lekcji</span>
                      <span>{earnings.toFixed(0)} PLN</span>
                      {teacher.rating > 0 && <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{teacher.rating?.toFixed(1)}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {teacher.status === "trial" && (
                      <>
                        <button
                          disabled={updating === teacher.id}
                          onClick={() => updateTeacherStatus(teacher.id, "active")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-500 disabled:opacity-50"
                        >
                          {updating === teacher.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserCheck className="h-3 w-3" />}
                          Zatwierdź
                        </button>
                        <button
                          onClick={() => updateTeacherStatus(teacher.id, "inactive")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200"
                        >
                          <UserX className="h-3 w-3" /> Odrzuć
                        </button>
                      </>
                    )}
                    {teacher.status === "active" && (
                      <button onClick={() => updateTeacherStatus(teacher.id, "inactive")} className="px-3 py-1.5 bg-secondary text-muted-foreground text-xs rounded-lg hover:bg-red-50 hover:text-red-600">
                        Dezaktywuj
                      </button>
                    )}
                    {teacher.status === "inactive" && (
                      <button onClick={() => updateTeacherStatus(teacher.id, "active")} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs rounded-lg hover:bg-emerald-100">
                        Aktywuj
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Courses management */}
      {activeSection === "courses" && (
        <div className="space-y-3">
          {courses.map(course => {
            const teacher = teachers.find(t => t.id === course.teacher_id);
            const revenue = (course.price || 0) * (course.enrolled_count || 0);
            const STATUS_STYLES = {
              active: "bg-emerald-50 text-emerald-700",
              draft: "bg-gray-100 text-gray-500",
              pending_review: "bg-amber-50 text-amber-700",
              archived: "bg-red-50 text-red-600",
            };
            return (
              <div key={course.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {course.language === "angielski" ? "🇬🇧" : course.language === "hiszpański" ? "🇪🇸" : "📚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{course.course_title}</p>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_STYLES[course.status] || "bg-gray-100")}>
                        {course.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{teacher ? `${teacher.first_name} ${teacher.last_name}` : "—"} · {course.language} · {course.level}</p>
                    <div className="flex items-center gap-4 mt-1 text-[11px] text-muted-foreground">
                      <span>{course.lessons_count || 0} lekcji</span>
                      <span>{course.enrolled_count || 0} uczniów</span>
                      <span className="font-semibold text-foreground">{course.price} PLN</span>
                      <span className="text-emerald-600 font-medium">~{revenue.toFixed(0)} PLN przychód</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.status === "pending_review" && (
                      <button onClick={() => base44.entities.TeacherCourses.update(course.id, { status: "active" }).then(() => setCourses(p => p.map(c => c.id === course.id ? {...c, status: "active"} : c)))}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg">
                        Zatwierdź
                      </button>
                    )}
                    <button onClick={() => deleteCourse(course.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Financials */}
      {activeSection === "financials" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Suma rozliczeń" value={`${payments.reduce((s,p) => s+(p.net_amount||0),0).toFixed(0)} PLN`} icon={DollarSign} color="text-primary" />
            <StatCard label="Wypłacono" value={`${payments.filter(p=>p.status==="paid").reduce((s,p)=>s+(p.net_amount||0),0).toFixed(0)} PLN`} icon={CheckCircle2} color="text-emerald-600" />
            <StatCard label="Do zatwierdzenia" value={payments.filter(p=>p.status==="pending").length} icon={Clock} color="text-amber-600" sub="oczekujące wypłaty" />
            <StatCard label="Prowizja (est.)" value={`${(totalRevenue * 0.15).toFixed(0)} PLN`} icon={Percent} color="text-violet-600" sub="15% avg lekcje" />
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-bold">Historia rozliczeń</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-secondary/40">
                    <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Nauczyciel</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Okres</th>
                    <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground">Kwota</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 20).map(payment => {
                    const teacher = teachers.find(t => t.id === payment.teacher_id);
                    const STATUS_PAY = { pending: "bg-amber-50 text-amber-700", approved: "bg-blue-50 text-blue-700", paid: "bg-emerald-50 text-emerald-700", disputed: "bg-red-50 text-red-600" };
                    return (
                      <tr key={payment.id} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="px-4 py-3 font-medium">{teacher ? `${teacher.first_name} ${teacher.last_name}` : "—"}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{payment.period_start} – {payment.period_end}</td>
                        <td className="px-4 py-3 text-right font-bold">{payment.net_amount?.toFixed(0)} PLN</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("text-[10px] px-2 py-1 rounded-full font-medium", STATUS_PAY[payment.status])}>{payment.status}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {payment.status === "pending" && (
                            <button onClick={() => base44.entities.TeacherPayments.update(payment.id, { status: "approved" }).then(() => setPayments(p => p.map(x => x.id===payment.id ? {...x,status:"approved"}:x)))}
                              className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                              Zatwierdź
                            </button>
                          )}
                          {payment.status === "approved" && (
                            <button onClick={() => base44.entities.TeacherPayments.update(payment.id, { status: "paid", paid_at: new Date().toISOString().split("T")[0] }).then(() => setPayments(p => p.map(x => x.id===payment.id ? {...x,status:"paid"}:x)))}
                              className="text-[10px] px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg">
                              Wypłać
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}