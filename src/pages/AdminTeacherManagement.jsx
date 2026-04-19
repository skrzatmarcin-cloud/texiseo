import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Users, DollarSign, BarChart3, TrendingUp, AlertCircle,
  CheckCircle2, X, Eye, Edit, Trash2, Loader2
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Przegląd nauczycieli", icon: Users },
  { id: "earnings", label: "Zarobki i rozliczenia", icon: DollarSign },
  { id: "subscriptions", label: "Subskrypcje nauczycieli", icon: BarChart3 },
  { id: "payments", label: "Płatności i faktury", icon: TrendingUp },
];

export default function AdminTeacherManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [teachers, setTeachers] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Pobranie wszystkich nauczycieli (tylko admini widzą wszystkie)
      const allTeachers = await base44.entities.Teachers.list("-created_date");
      setTeachers(allTeachers);

      // Pobranie zarobków wszystkich nauczycieli
      const allEarnings = await base44.entities.TeacherEarnings.list("-period_end");
      setEarnings(allEarnings);

      // Pobranie subskrypcji
      const allSubscriptions = await base44.entities.TeacherSettings.list("-created_at");
      setSubscriptions(allSubscriptions);

      // Pobranie płatności
      const allPayments = await base44.entities.TeacherSubscriptionPayment.list("-payment_date");
      setPayments(allPayments);

      setLoading(false);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoading(false);
    }
  };

  const getTotalEarnings = (teacherId) => {
    return earnings
      .filter(e => e.teacher_id === teacherId)
      .reduce((sum, e) => sum + (e.net_amount || 0), 0);
  };

  const getTotalCommission = (teacherId) => {
    return earnings
      .filter(e => e.teacher_id === teacherId)
      .reduce((sum, e) => sum + (e.platform_commission_amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-2xl p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Zarządzanie nauczycielami
        </h1>
        <p className="text-slate-300 text-sm mt-1">
          Admin — przegląd wszystkich nauczycieli, zarobków, subskrypcji i płatności
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-primary text-white"
                : "bg-card border border-border hover:border-primary/50"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Łączna liczba nauczycieli</p>
              <p className="text-3xl font-bold mt-1">{teachers.length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Aktywne subskrypcje</p>
              <p className="text-3xl font-bold mt-1">{subscriptions.filter(s => s.subscription_status === "active").length}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Łączne zarobki nauczycieli</p>
              <p className="text-3xl font-bold mt-1">{earnings.reduce((sum, e) => sum + (e.net_amount || 0), 0)} PLN</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Łączna prowizja</p>
              <p className="text-3xl font-bold mt-1">{earnings.reduce((sum, e) => sum + (e.platform_commission_amount || 0), 0)} PLN</p>
            </div>
          </div>

          {/* Teachers Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold">Lista nauczycieli</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Nauczyciel</th>
                    <th className="px-6 py-3 text-left font-semibold">Email</th>
                    <th className="px-6 py-3 text-left font-semibold">Subskrypcja</th>
                    <th className="px-6 py-3 text-left font-semibold">Zarobki (PLN)</th>
                    <th className="px-6 py-3 text-left font-semibold">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(teacher => (
                    <tr key={teacher.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-6 py-4 font-medium">{teacher.first_name} {teacher.last_name}</td>
                      <td className="px-6 py-4 text-muted-foreground">{teacher.email}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          subscriptions.find(s => s.teacher_email === teacher.email)?.subscription_status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {subscriptions.find(s => s.teacher_email === teacher.email)?.subscription_plan || "free"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">{getTotalEarnings(teacher.id)} PLN</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* EARNINGS TAB */}
      {activeTab === "earnings" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold">Rozliczenia nauczycieli</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Nauczyciel</th>
                    <th className="px-6 py-3 text-left font-semibold">Okres</th>
                    <th className="px-6 py-3 text-left font-semibold">Lekcji</th>
                    <th className="px-6 py-3 text-left font-semibold">Brutto</th>
                    <th className="px-6 py-3 text-left font-semibold">Prowizja</th>
                    <th className="px-6 py-3 text-left font-semibold">Netto</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map(earning => (
                    <tr key={earning.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-6 py-4 font-medium">{earning.teacher_email}</td>
                      <td className="px-6 py-4 text-muted-foreground">{earning.period_start} - {earning.period_end}</td>
                      <td className="px-6 py-4">{earning.lessons_completed}</td>
                      <td className="px-6 py-4 font-medium">{earning.gross_amount} PLN</td>
                      <td className="px-6 py-4 text-red-600">-{earning.platform_commission_amount} PLN</td>
                      <td className="px-6 py-4 font-bold text-green-600">{earning.net_amount} PLN</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          earning.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : earning.status === "approved"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-700"
                        )}>
                          {earning.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {activeTab === "subscriptions" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold">Subskrypcje nauczycieli</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Nauczyciel</th>
                    <th className="px-6 py-3 text-left font-semibold">Plan</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Studenci</th>
                    <th className="px-6 py-3 text-left font-semibold">Koniec</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(sub => (
                    <tr key={sub.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-6 py-4 font-medium">{sub.teacher_email}</td>
                      <td className="px-6 py-4 capitalize font-medium">{sub.subscription_plan}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          sub.subscription_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {sub.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{sub.total_students}</td>
                      <td className="px-6 py-4 text-muted-foreground">{sub.subscription_end_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENTS TAB */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold">Historia płatności</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Nauczyciel</th>
                    <th className="px-6 py-3 text-left font-semibold">Plan</th>
                    <th className="px-6 py-3 text-left font-semibold">Kwota</th>
                    <th className="px-6 py-3 text-left font-semibold">Status</th>
                    <th className="px-6 py-3 text-left font-semibold">Data płatności</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-6 py-4 font-medium">{payment.teacher_email}</td>
                      <td className="px-6 py-4 capitalize">{payment.subscription_plan}</td>
                      <td className="px-6 py-4 font-bold">{payment.plan_price_pln} PLN</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          payment.payment_status === "completed"
                            ? "bg-green-100 text-green-700"
                            : payment.payment_status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        )}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{payment.payment_date || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}