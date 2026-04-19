import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import {
  Users, CreditCard, MessageSquare, BarChart3, Shield, Bell,
  Check, X, Clock, AlertTriangle, Loader2, Mail, Eye,
  TrendingUp, Zap, BookOpen, Star, ChevronRight, RefreshCw
} from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "requests", label: "Zgłoszenia", icon: MessageSquare },
  { id: "users", label: "Użytkownicy", icon: Users },
  { id: "payments", label: "Płatności", icon: CreditCard },
];

const REQUEST_TYPE_LABELS = {
  question: "Pytanie", feature_request: "Funkcja", lead: "Lead",
  complaint: "Reklamacja", field_request: "Nowe pole", security_issue: "Bezpieczeństwo"
};
const REQUEST_TYPE_COLORS = {
  question: "bg-blue-50 text-blue-700",
  feature_request: "bg-violet-50 text-violet-700",
  lead: "bg-emerald-50 text-emerald-700",
  complaint: "bg-red-50 text-red-700",
  field_request: "bg-amber-50 text-amber-700",
  security_issue: "bg-red-100 text-red-800",
};
const STATUS_COLORS = {
  new: "bg-blue-50 text-blue-700",
  pending_review: "bg-amber-50 text-amber-700",
  implemented: "bg-emerald-50 text-emerald-700",
  escalated: "bg-red-50 text-red-700",
  rejected: "bg-gray-100 text-gray-500",
  resolved: "bg-green-50 text-green-700",
};
const PRIORITY_COLORS = {
  low: "text-gray-400", medium: "text-blue-500", high: "text-amber-500", critical: "text-red-600"
};

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3">
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function TexiSEOAdmin() {
  const [tab, setTab] = useState("dashboard");
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    const [reqs, usrs] = await Promise.all([
      base44.entities.ClientRequests.list("-created_date", 100),
      base44.entities.User.list(),
    ]);
    setRequests(reqs);
    setUsers(usrs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateRequest = async (id, data) => {
    setUpdating(true);
    await base44.entities.ClientRequests.update(id, data);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    if (selectedReq?.id === id) setSelectedReq(r => ({ ...r, ...data }));
    setUpdating(false);
  };

  const sendAdminEmail = async (req) => {
    await base44.integrations.Core.SendEmail({
      to: "skrzatmarcin@gmail.com",
      subject: `[TexiSEO Admin] Eskalacja: ${REQUEST_TYPE_LABELS[req.type]} — ${req.priority?.toUpperCase()}`,
      body: `Zgłoszenie eskalowane do Twojej uwagi:\n\nTyp: ${REQUEST_TYPE_LABELS[req.type]}\nPriorytet: ${req.priority}\nEmail klienta: ${req.client_email || "brak"}\n\nWiadomość:\n${req.message}\n\nOdpowiedź AI:\n${req.ai_response || "brak"}\n\n---\nTexiSEO Admin System`,
    });
    await updateRequest(req.id, { email_sent: true, status: "escalated" });
  };

  // Stats
  const newReqs = requests.filter(r => r.status === "new").length;
  const leads = requests.filter(r => r.type === "lead").length;
  const pending = requests.filter(r => r.status === "pending_review").length;
  const resolved = requests.filter(r => r.status === "resolved" || r.status === "implemented").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 pt-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Panel Admina — TexiSEO.ai
            </h1>
            <p className="text-xs text-white/50 mt-0.5">Zarządzaj platformą, użytkownikami i zgłoszeniami klientów</p>
          </div>
          <button onClick={load} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-colors">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
        <div className="flex gap-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors",
                tab === t.id ? "border-blue-400 text-white" : "border-transparent text-white/40 hover:text-white/70"
              )}>
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
              {t.id === "requests" && newReqs > 0 && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{newReqs}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background p-5">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* ===== DASHBOARD ===== */}
        {!loading && tab === "dashboard" && (
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Nowe zgłoszenia" value={newReqs} icon={Bell} color="bg-blue-50 text-blue-600" sub="do obsługi" />
              <StatCard label="Leady" value={leads} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" sub="potencjalni klienci" />
              <StatCard label="Do weryfikacji" value={pending} icon={AlertTriangle} color="bg-amber-50 text-amber-600" sub="feature requests" />
              <StatCard label="Rozwiązane" value={resolved} icon={Check} color="bg-green-50 text-green-600" sub="łącznie" />
            </div>

            {/* Recent requests */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <p className="text-sm font-bold">Ostatnie zgłoszenia</p>
                <button onClick={() => setTab("requests")} className="text-xs text-primary hover:underline flex items-center gap-1">
                  Wszystkie <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              {requests.slice(0, 5).map(req => (
                <div key={req.id}
                  className="flex items-center gap-3 px-5 py-3 border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                  onClick={() => { setSelectedReq(req); setTab("requests"); }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", REQUEST_TYPE_COLORS[req.type])}>
                        {REQUEST_TYPE_LABELS[req.type]}
                      </span>
                      <span className={cn("text-[10px] font-bold", PRIORITY_COLORS[req.priority])}>
                        ● {req.priority}
                      </span>
                    </div>
                    <p className="text-xs text-foreground truncate">{req.message}</p>
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0", STATUS_COLORS[req.status])}>
                    {req.status}
                  </span>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Brak zgłoszeń</p>
              )}
            </div>

            {/* Users summary */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-sm font-bold mb-3">Użytkownicy systemu</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-primary">{users.length}</p>
                  <p className="text-xs text-muted-foreground">Łącznie</p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-emerald-600">{users.filter(u => u.role === "admin").length}</p>
                  <p className="text-xs text-muted-foreground">Adminów</p>
                </div>
                <div className="bg-secondary/40 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-blue-600">{users.filter(u => u.role === "user").length}</p>
                  <p className="text-xs text-muted-foreground">Użytkowników</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== REQUESTS ===== */}
        {!loading && tab === "requests" && (
          <div className="max-w-5xl mx-auto">
            <div className={cn("gap-4", selectedReq ? "grid grid-cols-1 lg:grid-cols-2" : "")}>
              {/* List */}
              <div className="space-y-2">
                {/* Filter row */}
                <div className="flex gap-2 flex-wrap mb-3">
                  {["all", "new", "pending_review", "lead"].map(f => (
                    <button key={f} onClick={() => setSelectedReq(null)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors">
                      {f === "all" ? "Wszystkie" : f === "new" ? `Nowe (${newReqs})` : f === "pending_review" ? `Do weryfikacji (${pending})` : `Leady (${leads})`}
                    </button>
                  ))}
                </div>

                {requests.map(req => (
                  <div key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={cn(
                      "bg-card border rounded-xl p-4 cursor-pointer hover:shadow-md transition-all",
                      selectedReq?.id === req.id ? "border-primary ring-1 ring-primary/20" : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded font-medium", REQUEST_TYPE_COLORS[req.type])}>
                          {REQUEST_TYPE_LABELS[req.type]}
                        </span>
                        <span className={cn("text-[10px] font-bold", PRIORITY_COLORS[req.priority])}>● {req.priority}</span>
                        {req.email_sent && <Mail className="h-3 w-3 text-blue-400" title="Email wysłany" />}
                        {req.auto_implemented && <Zap className="h-3 w-3 text-emerald-500" title="Auto-wdrożone" />}
                      </div>
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0", STATUS_COLORS[req.status])}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs mt-2 text-foreground line-clamp-2">{req.message}</p>
                    {req.client_email && (
                      <p className="text-[10px] text-muted-foreground mt-1">📧 {req.client_email}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-1">
                      {new Date(req.created_date).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
                {requests.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Brak zgłoszeń</p>
                  </div>
                )}
              </div>

              {/* Detail */}
              {selectedReq && (
                <div className="bg-card border border-border rounded-2xl p-5 space-y-4 h-fit sticky top-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={cn("text-xs px-2 py-1 rounded font-medium", REQUEST_TYPE_COLORS[selectedReq.type])}>
                        {REQUEST_TYPE_LABELS[selectedReq.type]}
                      </span>
                    </div>
                    <button onClick={() => setSelectedReq(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Wiadomość klienta</p>
                    <p className="text-sm leading-relaxed bg-secondary/50 rounded-xl p-3">{selectedReq.message}</p>
                  </div>

                  {selectedReq.ai_response && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Odpowiedź AI</p>
                      <p className="text-xs leading-relaxed bg-primary/5 border border-primary/10 rounded-xl p-3 text-foreground/80">
                        {selectedReq.ai_response.slice(0, 300)}{selectedReq.ai_response.length > 300 ? "…" : ""}
                      </p>
                    </div>
                  )}

                  {/* Risk */}
                  <div className="flex gap-3">
                    <div className="flex-1 bg-secondary/40 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground">Ryzyko</p>
                      <p className={cn("text-sm font-bold",
                        selectedReq.security_risk === "none" || selectedReq.security_risk === "low" ? "text-emerald-600" :
                        selectedReq.security_risk === "medium" ? "text-amber-600" : "text-red-600"
                      )}>{selectedReq.security_risk || "none"}</p>
                    </div>
                    <div className="flex-1 bg-secondary/40 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground">Status</p>
                      <p className="text-sm font-bold">{selectedReq.status}</p>
                    </div>
                    <div className="flex-1 bg-secondary/40 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground">Priorytet</p>
                      <p className={cn("text-sm font-bold", PRIORITY_COLORS[selectedReq.priority])}>{selectedReq.priority}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase">Akcje admina</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateRequest(selectedReq.id, { status: "resolved" })}
                        disabled={updating}
                        className="flex items-center justify-center gap-1.5 h-8 text-xs rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                      >
                        <Check className="h-3.5 w-3.5" /> Rozwiązane
                      </button>
                      <button
                        onClick={() => updateRequest(selectedReq.id, { status: "implemented" })}
                        disabled={updating}
                        className="flex items-center justify-center gap-1.5 h-8 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
                      >
                        <Zap className="h-3.5 w-3.5" /> Wdrożone
                      </button>
                      <button
                        onClick={() => sendAdminEmail(selectedReq)}
                        disabled={updating || selectedReq.email_sent}
                        className="flex items-center justify-center gap-1.5 h-8 text-xs rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 disabled:opacity-50"
                      >
                        <Mail className="h-3.5 w-3.5" /> {selectedReq.email_sent ? "Email wysłany" : "Eskaluj emailem"}
                      </button>
                      <button
                        onClick={() => updateRequest(selectedReq.id, { status: "rejected" })}
                        disabled={updating}
                        className="flex items-center justify-center gap-1.5 h-8 text-xs rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors border border-red-200"
                      >
                        <X className="h-3.5 w-3.5" /> Odrzuć
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== USERS ===== */}
        {!loading && tab === "users" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                <p className="text-sm font-bold">Użytkownicy ({users.length})</p>
                <InviteUserButton onInvited={load} />
              </div>
              <div className="divide-y divide-border/50">
                {users.map(user => (
                  <div key={user.id} className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/20">
                    <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                      {user.full_name?.[0] || user.email?.[0] || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <span className={cn("text-[10px] px-2.5 py-1 rounded-full font-semibold",
                      user.role === "admin" ? "bg-violet-100 text-violet-700" : "bg-secondary text-muted-foreground"
                    )}>
                      {user.role || "user"}
                    </span>
                    <p className="text-[10px] text-muted-foreground hidden sm:block">
                      {new Date(user.created_date).toLocaleDateString("pl-PL")}
                    </p>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center py-8 text-sm text-muted-foreground">Brak użytkowników</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== PAYMENTS ===== */}
        {!loading && tab === "payments" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm font-semibold text-muted-foreground">Moduł płatności</p>
              <p className="text-xs text-muted-foreground/60 mt-1 mb-4">
                Podłącz Stripe aby śledzić płatności i subskrypcje użytkowników TexiSEO.ai
              </p>
              <div className="inline-flex items-center gap-2 bg-secondary rounded-xl px-4 py-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Wymaga integracji Stripe — dostępne wkrótce
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InviteUserButton({ onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handle = async () => {
    if (!email.trim()) return;
    setLoading(true);
    await base44.users.inviteUser(email.trim(), role);
    setLoading(false);
    setDone(true);
    setTimeout(() => { setOpen(false); setDone(false); setEmail(""); onInvited(); }, 1500);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors">
      + Zaproś użytkownika
    </button>
  );

  return (
    <div className="flex items-center gap-2">
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@przykład.pl"
        className="h-8 px-2 rounded-lg border border-input text-xs w-44 focus:outline-none focus:ring-1 focus:ring-primary/30" />
      <select value={role} onChange={e => setRole(e.target.value)}
        className="h-8 px-2 rounded-lg border border-input text-xs bg-background focus:outline-none">
        <option value="user">user</option>
        <option value="admin">admin</option>
      </select>
      <button onClick={handle} disabled={loading || done}
        className="h-8 px-3 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors">
        {done ? <Check className="h-3.5 w-3.5" /> : loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Wyślij"}
      </button>
      <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}