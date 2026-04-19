import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CreditCard, CheckCircle2, Clock, AlertTriangle,
  Plus, Download, Loader2, TrendingUp, DollarSign, FileText
} from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-blue-50 text-blue-700 ring-blue-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  disputed: "bg-red-50 text-red-600 ring-red-200",
};
const STATUS_LABELS = { pending: "Oczekuje", approved: "Zatwierdzone", paid: "Wypłacone", disputed: "W sporze" };

export default function TeacherPayroll() {
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const load = async () => {
    setLoading(true);
    const [p, t, l] = await Promise.all([
      base44.entities.TeacherPayments.list("-created_date", 100),
      base44.entities.Teachers.list(),
      base44.entities.TeacherLessons.list("-lesson_date", 500),
    ]);
    setPayments(p);
    setTeachers(t);
    setLessons(l);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  // Calculate pending unpaid lessons per teacher for the month
  const teacherSummaries = useMemo(() => {
    const [year, month] = selectedPeriod.split("-");
    const periodLessons = lessons.filter(l => {
      if (!l.lesson_date) return false;
      const [y, m] = l.lesson_date.split("-");
      return y === year && m === month && l.status === "completed";
    });

    return teachers.map(t => {
      const tLessons = periodLessons.filter(l => l.teacher_id === t.id);
      const totalHours = tLessons.reduce((s, l) => s + (l.duration_minutes || 50) / 60, 0);
      const totalAmount = tLessons.reduce((s, l) => s + (l.amount_due || 0), 0);
      const unpaid = tLessons.filter(l => !l.paid).length;
      const existingPayment = payments.find(p => p.teacher_id === t.id && p.period_start?.startsWith(selectedPeriod));
      return { teacher: t, lessons: tLessons, totalHours, totalAmount, unpaid, existingPayment };
    }).filter(s => s.lessons.length > 0 || s.existingPayment);
  }, [teachers, lessons, payments, selectedPeriod]);

  const generatePayment = async (summary) => {
    setGenerating(summary.teacher.id);
    const [year, month] = selectedPeriod.split("-");
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const payment = await base44.entities.TeacherPayments.create({
      teacher_id: summary.teacher.id,
      period_start: `${selectedPeriod}-01`,
      period_end: `${selectedPeriod}-${lastDay}`,
      lessons_count: summary.lessons.length,
      total_hours: Math.round(summary.totalHours * 100) / 100,
      gross_amount: summary.totalAmount,
      net_amount: summary.totalAmount,
      currency: "PLN",
      status: "pending",
    });
    // Mark lessons as paid
    await Promise.all(summary.lessons.filter(l => !l.paid).map(l =>
      base44.entities.TeacherLessons.update(l.id, { paid: true })
    ));
    load();
    setGenerating(null);
  };

  const updatePaymentStatus = async (id, status) => {
    await base44.entities.TeacherPayments.update(id, { status, ...(status === "paid" ? { paid_at: new Date().toISOString().split("T")[0] } : {}) });
    setPayments(p => p.map(x => x.id === id ? { ...x, status } : x));
  };

  const totalPending = payments.filter(p => p.status === "pending" || p.status === "approved").reduce((s, p) => s + (p.net_amount || 0), 0);
  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + (p.net_amount || 0), 0);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold">System rozliczeń nauczycieli</h2>
          <p className="text-xs text-muted-foreground">Automatyczne obliczanie wypłat na podstawie przeprowadzonych lekcji</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-transparent text-xs focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Do wypłaty", value: `${totalPending.toFixed(0)} PLN`, icon: Clock, color: "text-amber-600" },
          { label: "Wypłacono", value: `${totalPaid.toFixed(0)} PLN`, icon: CheckCircle2, color: "text-emerald-600" },
          { label: "Nauczycieli", value: teacherSummaries.length, icon: CreditCard, color: "text-primary" },
          { label: "Lekcji w miesiącu", value: lessons.filter(l => l.lesson_date?.startsWith(selectedPeriod) && l.status === "completed").length, icon: TrendingUp, color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon className={cn("h-3.5 w-3.5", s.color)} />
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
            <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Per-teacher breakdown */}
      <div className="space-y-3">
        {teacherSummaries.map(summary => {
          const { teacher, lessons: tl, totalHours, totalAmount, unpaid, existingPayment } = summary;
          return (
            <div key={teacher.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{teacher.first_name} {teacher.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tl.length} lekcji · {totalHours.toFixed(1)} h · stawka: {teacher.hourly_rate} PLN/h
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{totalAmount.toFixed(0)} PLN</p>
                    {unpaid > 0 && <p className="text-[10px] text-amber-600">{unpaid} lekcji nieopłaconych</p>}
                  </div>

                  {existingPayment ? (
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs px-2.5 py-1 rounded-lg ring-1 font-medium", STATUS_STYLES[existingPayment.status])}>
                        {STATUS_LABELS[existingPayment.status]}
                      </span>
                      {existingPayment.status === "pending" && (
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => updatePaymentStatus(existingPayment.id, "approved")}>
                          Zatwierdź
                        </Button>
                      )}
                      {existingPayment.status === "approved" && (
                        <Button size="sm" className="h-7 text-xs gap-1"
                          onClick={() => updatePaymentStatus(existingPayment.id, "paid")}>
                          <CheckCircle2 className="h-3 w-3" /> Oznacz jako wypłacone
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button size="sm" className="h-8 text-xs gap-1"
                      onClick={() => generatePayment(summary)}
                      disabled={generating === teacher.id || tl.length === 0}>
                      {generating === teacher.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Plus className="h-3.5 w-3.5" />
                      }
                      Utwórz rozliczenie
                    </Button>
                  )}
                </div>
              </div>

              {/* Lessons breakdown */}
              {tl.length > 0 && (
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {tl.slice(0, 6).map(l => (
                    <div key={l.id} className={cn(
                      "text-[10px] rounded-lg p-1.5 text-center",
                      l.paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    )}>
                      <p className="font-medium">{l.lesson_date?.slice(5)}</p>
                      <p>{l.student_name?.split(" ")[0]}</p>
                      <p className="font-bold">{l.amount_due} PLN</p>
                    </div>
                  ))}
                  {tl.length > 6 && (
                    <div className="text-[10px] rounded-lg p-1.5 text-center bg-secondary text-muted-foreground flex items-center justify-center">
                      +{tl.length - 6} więcej
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {teacherSummaries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Brak lekcji w wybranym okresie</p>
          </div>
        )}
      </div>
    </div>
  );
}