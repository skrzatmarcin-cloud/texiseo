import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Loader2, RefreshCw, CheckCircle2, XCircle, Info, Lock, Eye, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES = {
  critical: { bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", icon: XCircle, color: "text-red-600" },
  high:     { bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700", icon: AlertTriangle, color: "text-orange-600" },
  medium:   { bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700", icon: AlertTriangle, color: "text-amber-600" },
  low:      { bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700", icon: Info, color: "text-blue-600" },
  info:     { bg: "bg-slate-50 border-slate-200", badge: "bg-slate-100 text-slate-600", icon: Info, color: "text-slate-500" },
};

const TYPE_LABELS = {
  brute_force: "Brute Force",
  sql_injection: "SQL Injection",
  xss_attempt: "XSS",
  suspicious_traffic: "Podejrzany ruch",
  malware_detected: "Malware",
  outdated_plugin: "Przestarzały plugin",
  ssl_issue: "SSL / HTTPS",
  headers_missing: "Brakujące nagłówki",
  file_change: "Plik wrażliwy",
  spam_bot: "Spam Bot",
  ddos_pattern: "DDoS",
  open_redirect: "Open Redirect",
};

export default function SecurityMonitor() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const loadAlerts = async () => {
    const data = await base44.entities.SecurityAlerts.list("-created_date", 100);
    setAlerts(data);
    setLoading(false);
  };

  useEffect(() => { loadAlerts(); }, []);

  const runScan = async () => {
    setScanning(true);
    setScanResult(null);
    const res = await base44.functions.invoke("securityAgent", {});
    setScanResult(res.data);
    setScanning(false);
    loadAlerts();
  };

  const updateStatus = async (id, status) => {
    await base44.entities.SecurityAlerts.update(id, { status });
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.severity === filter || a.status === filter);

  const stats = {
    critical: alerts.filter(a => a.severity === "critical" && a.status === "open").length,
    high: alerts.filter(a => a.severity === "high" && a.status === "open").length,
    open: alerts.filter(a => a.status === "open").length,
    resolved: alerts.filter(a => a.status === "resolved").length,
  };

  // Try to get latest risk score
  const latestAI = alerts.find(a => a.raw_data && a.raw_data.includes("overall_risk_score"));
  let riskScore = null;
  let aiData = null;
  if (latestAI?.raw_data) {
    try { aiData = JSON.parse(latestAI.raw_data); riskScore = aiData.overall_risk_score; } catch { /* skip */ }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Security Monitor" description="Automatyczne skanowanie bezpieczeństwa WordPress + AI analiza zagrożeń">
        <button onClick={runScan} disabled={scanning} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50">
          {scanning ? <><Loader2 className="h-4 w-4 animate-spin" />Skanuje…</> : <><Shield className="h-4 w-4" />Uruchom skan</>}
        </button>
      </PageHeader>

      {scanResult && (
        <div className={cn("border rounded-xl px-4 py-3 mb-4 flex items-center gap-3 text-sm",
          scanResult.risk_level === "critical" || scanResult.risk_level === "high" ? "bg-red-50 border-red-200 text-red-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
        )}>
          <Shield className="h-4 w-4 flex-shrink-0" />
          <span><strong>Skan zakończony</strong> — Ryzyko: <strong>{scanResult.risk_score}/100</strong> ({scanResult.risk_level}) · {scanResult.alerts_found} alertów</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Krytyczne (otwarte)", value: stats.critical, icon: ShieldAlert, color: "text-red-600", bg: "bg-red-50" },
          { label: "Wysokie (otwarte)", value: stats.high, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Wszystkie otwarte", value: stats.open, icon: Eye, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Rozwiązane", value: stats.resolved, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(s => (
          <div key={s.label} className={cn("rounded-xl p-4 border border-border", s.bg)}>
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={cn("h-4 w-4", s.color)} />
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Risk score + AI tips */}
      {riskScore !== null && aiData && (
        <div className="grid lg:grid-cols-2 gap-4 mb-5">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Ogólna ocena ryzyka</p>
            <div className="flex items-center gap-4">
              <div className={cn("h-16 w-16 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0",
                riskScore >= 70 ? "bg-red-100 text-red-700" : riskScore >= 40 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
              )}>{riskScore}</div>
              <div>
                <p className="font-bold text-base">{aiData.overall_risk_level?.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">{riskScore >= 70 ? "Pilne działanie wymagane" : riskScore >= 40 ? "Zalecane ulepszenia" : "Dobry stan bezpieczeństwa"}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Polecane wtyczki bezpieczeństwa</p>
            <div className="space-y-1">
              {(aiData.plugin_recommendations || []).slice(0, 4).map((p, i) => (
                <p key={i} className="text-xs text-foreground flex items-start gap-1.5">
                  <Lock className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />{p}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Protection tips */}
      {aiData?.ai_protection_tips?.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-purple-800 mb-2 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" />Ochrona przed AI / scrapowaniem</p>
          <div className="space-y-1">
            {aiData.ai_protection_tips.map((t, i) => <p key={i} className="text-xs text-purple-900">• {t}</p>)}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap mb-4">
        {["all", "critical", "high", "medium", "low", "open", "resolved"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          )}>{f === "all" ? "Wszystkie" : f}</button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Brak alertów — uruchom skan by sprawdzić bezpieczeństwo</p>
          </div>
        ) : filtered.map(alert => {
          const s = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info;
          const Icon = s.icon;
          const isOpen = expanded === alert.id;
          return (
            <div key={alert.id} className={cn("border rounded-xl overflow-hidden", s.bg)}>
              <button className="w-full text-left px-4 py-3 flex items-start gap-3" onClick={() => setExpanded(isOpen ? null : alert.id)}>
                <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", s.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", s.badge)}>{alert.severity?.toUpperCase()}</span>
                    <span className="text-[11px] font-medium bg-white/70 px-2 py-0.5 rounded">{TYPE_LABELS[alert.alert_type] || alert.alert_type}</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded",
                      alert.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
                      alert.status === "false_positive" ? "bg-gray-100 text-gray-500" :
                      "bg-white/70 text-slate-600"
                    )}>{alert.status}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{alert.detected_at}</span>
                  </div>
                  <p className="text-xs mt-1 text-foreground line-clamp-2">{alert.description}</p>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/50 pt-3">
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1">OPIS</p>
                    <p className="text-xs text-foreground">{alert.description}</p>
                  </div>
                  {alert.recommendation && (
                    <div className="bg-white/70 rounded-lg p-3">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-1">✅ REKOMENDACJA</p>
                      <p className="text-xs text-foreground whitespace-pre-line">{alert.recommendation}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {alert.status === "open" && (
                      <>
                        <button onClick={() => updateStatus(alert.id, "resolved")} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-500">
                          Oznacz rozwiązany
                        </button>
                        <button onClick={() => updateStatus(alert.id, "false_positive")} className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300">
                          False positive
                        </button>
                        <button onClick={() => updateStatus(alert.id, "in_progress")} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded-lg hover:bg-blue-200">
                          W trakcie
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}