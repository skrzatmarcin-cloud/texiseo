import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  DollarSign, TrendingUp, Clock, CheckCircle2, AlertCircle,
  Download, Filter, RefreshCw, Eye, Send, Loader2
} from "lucide-react";

export default function PayoutsDashboard() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const payoutsData = await base44.entities.TeacherPayouts.list("-created_date", 100).catch(() => []);
      setPayouts(payoutsData);

      // Calculate stats
      const pending = payoutsData.filter(p => p.status === "pending").length;
      const totalPending = payoutsData
        .filter(p => p.status === "pending")
        .reduce((sum, p) => sum + (p.net_amount || 0), 0);
      const totalPaid = payoutsData
        .filter(p => p.status === "paid")
        .reduce((sum, p) => sum + (p.net_amount || 0), 0);

      setStats({ pending, totalPending, totalPaid });
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payoutId) => {
    await base44.entities.TeacherPayouts.update(payoutId, { status: "approved" });
    loadData();
  };

  const handleProcess = async (payoutId) => {
    await base44.entities.TeacherPayouts.update(payoutId, { status: "processing" });
    loadData();
  };

  const handlePay = async (payoutId) => {
    // In real scenario, integrate Stripe/PayPal here
    await base44.entities.TeacherPayouts.update(payoutId, {
      status: "paid",
      paid_date: new Date().toISOString().split("T")[0],
      transaction_id: `TXN_${Date.now()}`
    });
    loadData();
  };

  const filtered = filterStatus === "all" ? payouts : payouts.filter(p => p.status === filterStatus);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Zarządzanie wypłatami
          </h1>
          <p className="text-emerald-100 text-sm mt-1">Zatwierdzanie i przetwarzanie wypłat dla nauczycieli</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Oczekujące"
            value={stats?.pending || 0}
            subtext={`${stats?.totalPending.toLocaleString("pl-PL")} PLN`}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
          />
          <StatCard
            label="Łącznie wypłacone"
            value={`${stats?.totalPaid.toLocaleString("pl-PL")} PLN`}
            subtext="wszystkie czasy"
            icon={CheckCircle2}
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            label="Nauczyciele"
            value={new Set(payouts.map(p => p.teacher_id)).size}
            subtext="aktywni"
            icon={TrendingUp}
            color="bg-blue-50 text-blue-600"
          />
        </div>

        {/* Filter & Actions */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-2">
              {["all", "pending", "approved", "processing", "paid"].map(status => (
                <button key={status} onClick={() => setFilterStatus(status)}
                  className={cn("px-3 py-1.5 text-xs rounded-lg font-medium transition-colors",
                    filterStatus === status
                      ? "bg-primary text-white"
                      : "bg-secondary hover:bg-border"
                  )}>
                  {status === "all" ? "Wszystkie" : status === "pending" ? "Oczekujące" : status}
                </button>
              ))}
            </div>
            <button onClick={loadData} className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-border rounded-lg text-xs font-medium">
              <RefreshCw className="h-3.5 w-3.5" /> Odśwież
            </button>
          </div>
        </div>

        {/* Payouts Table */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold">Nauczyciel</th>
                  <th className="px-4 py-3 text-left text-xs font-bold">Okres</th>
                  <th className="px-4 py-3 text-right text-xs font-bold">Kwota netto</th>
                  <th className="px-4 py-3 text-left text-xs font-bold">Prowizja</th>
                  <th className="px-4 py-3 text-left text-xs font-bold">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                      Brak wypłat
                    </td>
                  </tr>
                ) : (
                  filtered.map(payout => (
                    <PayoutRow key={payout.id} payout={payout} onApprove={handleApprove} onProcess={handleProcess} onPay={handlePay} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bulk Actions */}
        {filtered.some(p => p.status === "approved" || p.status === "pending") && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-900">
                {filtered.filter(p => p.status === "approved").length} wypłat gotowe do przetworzenia
              </p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium">
              Przetwórz zaznaczone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, subtext, icon: Icon, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold mt-0.5">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        </div>
      </div>
    </div>
  );
}

function PayoutRow({ payout, onApprove, onProcess, onPay }) {
  const [processing, setProcessing] = useState(false);

  const handleAction = async (action) => {
    setProcessing(true);
    if (action === "approve") await onApprove(payout.id);
    else if (action === "process") await onProcess(payout.id);
    else if (action === "pay") await onPay(payout.id);
    setProcessing(false);
  };

  return (
    <tr className="hover:bg-secondary/30">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-sm">{payout.teacher_email}</p>
          <p className="text-xs text-muted-foreground">ID: {payout.teacher_id.slice(0, 8)}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-sm">
        {new Date(payout.period_start).toLocaleDateString("pl-PL")} - {new Date(payout.period_end).toLocaleDateString("pl-PL")}
      </td>
      <td className="px-4 py-3 text-right">
        <p className="font-bold text-sm">{payout.net_amount?.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} PLN</p>
      </td>
      <td className="px-4 py-3 text-sm">
        <span className="text-muted-foreground">{payout.platform_commission_percent}% ({payout.platform_commission_amount?.toLocaleString("pl-PL", { maximumFractionDigits: 2 })} PLN)</span>
      </td>
      <td className="px-4 py-3">
        <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold",
          payout.status === "pending" ? "bg-blue-100 text-blue-700" :
          payout.status === "approved" ? "bg-amber-100 text-amber-700" :
          payout.status === "processing" ? "bg-purple-100 text-purple-700" :
          payout.status === "paid" ? "bg-green-100 text-green-700" :
          "bg-red-100 text-red-700"
        )}>
          {payout.status}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          {payout.status === "pending" && (
            <button onClick={() => handleAction("approve")} disabled={processing}
              className="p-1.5 hover:bg-secondary rounded-lg text-xs transition-colors"
              title="Zatwierdź">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </button>
          )}
          {payout.status === "approved" && (
            <button onClick={() => handleAction("process")} disabled={processing}
              className="p-1.5 hover:bg-secondary rounded-lg text-xs transition-colors"
              title="Przetwórz">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-blue-600" />}
            </button>
          )}
          {payout.status === "processing" && (
            <button onClick={() => handleAction("pay")} disabled={processing}
              className="p-1.5 hover:bg-secondary rounded-lg text-xs transition-colors"
              title="Zapłać">
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4 text-emerald-600" />}
            </button>
          )}
          {payout.status === "paid" && (
            <span className="text-[10px] text-muted-foreground">Opłacone {payout.paid_date && `• ${new Date(payout.paid_date).toLocaleDateString("pl-PL")}`}</span>
          )}
        </div>
      </td>
    </tr>
  );
}