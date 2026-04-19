import { useState } from "react";
import { X, Mail, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function RequestsTab({ requests, newReqs, pending, leads, selectedReq, setSelectedReq, updateRequest, sendAdminEmail, updating }) {
  return (
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
  );
}