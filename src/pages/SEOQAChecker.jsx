import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { runSEOQA, DECISION_LABELS } from "../lib/seoQA";
import { CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import ScoreBar from "../components/ScoreBar";

const DECISION_STYLES = {
  publish: "bg-emerald-50 text-emerald-700 border-emerald-200",
  publish_after_minor_fixes: "bg-blue-50 text-blue-700 border-blue-200",
  hold_for_revision: "bg-amber-50 text-amber-700 border-amber-200",
  not_ready: "bg-red-50 text-red-700 border-red-200",
};

const SEV_ICON = {
  critical: <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />,
  high: <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />,
  medium: <AlertTriangle className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />,
  low: <CheckCircle2 className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />,
};

export default function SEOQAChecker() {
  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    base44.entities.Briefs.list("-created_date").then(b => { setBriefs(b); setLoading(false); if (b.length) setSelected(b[0].id); });
  }, []);

  const activeBrief = useMemo(() => briefs.find(b => b.id === selected), [briefs, selected]);
  const qa = useMemo(() => activeBrief ? runSEOQA(activeBrief) : null, [activeBrief]);

  const checksByCategory = useMemo(() => {
    if (!qa) return {};
    return { seo: qa.checks.filter(c => c.category === "seo"), content: qa.checks.filter(c => c.category === "content"), readiness: qa.checks.filter(c => c.category === "readiness") };
  }, [qa]);

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="SEO QA Checker" description="Pre-publish quality gate — evaluate briefs before sending to production" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Brief selector */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-3 py-2.5 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Briefs</p>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            {briefs.map(b => {
              const result = runSEOQA(b);
              return (
                <button key={b.id} onClick={() => setSelected(b.id)}
                  className={cn("w-full text-left px-3 py-2.5 border-b border-border/50 hover:bg-secondary/30 transition-colors",
                    selected === b.id ? "bg-secondary" : "")}>
                  <p className="text-xs font-medium truncate">{b.brief_title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0",
                      result.overall >= 85 ? "bg-emerald-500" : result.overall >= 70 ? "bg-blue-400" : result.overall >= 50 ? "bg-amber-400" : "bg-red-400")} />
                    <p className="text-[10px] text-muted-foreground">{result.overall}% · {result.critical.length} critical</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* QA results */}
        <div className="lg:col-span-3 space-y-4">
          {qa && activeBrief && (
            <>
              {/* Decision banner */}
              <div className={cn("flex items-center justify-between rounded-xl p-4 border", DECISION_STYLES[qa.decision])}>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5" />
                  <div>
                    <p className="text-sm font-bold">{DECISION_LABELS[qa.decision]}</p>
                    <p className="text-[11px] opacity-80">{activeBrief.brief_title}</p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{qa.overall}%</p>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "SEO Score", value: qa.seo, checks: checksByCategory.seo },
                  { label: "Content Quality", value: qa.content, checks: checksByCategory.content },
                  { label: "Publish Readiness", value: qa.readiness, checks: checksByCategory.readiness },
                ].map(s => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                    <p className="text-[11px] text-muted-foreground mb-2">{s.label}</p>
                    <p className={cn("text-2xl font-bold mb-2", s.value >= 80 ? "text-emerald-600" : s.value >= 60 ? "text-amber-600" : "text-red-500")}>{s.value}%</p>
                    <ScoreBar value={s.value} />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {s.checks?.filter(c => c.pass).length}/{s.checks?.length} checks passed
                    </p>
                  </div>
                ))}
              </div>

              {/* Critical fixes */}
              {qa.critical.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 mb-2">🚫 Critical Issues — Must Fix Before Publishing ({qa.critical.length})</p>
                  <div className="space-y-2">
                    {qa.critical.map((c, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <XCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-red-800">{c.label}</p>
                          <p className="text-[11px] text-red-700">{c.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* High priority */}
              {qa.high.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-800 mb-2">⚠ High Priority Improvements ({qa.high.length})</p>
                  <div className="space-y-1.5">
                    {qa.high.map((c, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800"><span className="font-semibold">{c.label}:</span> {c.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              {qa.passed.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-800 mb-2">✓ Checks Passed ({qa.passed.length})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {qa.passed.map((c, i) => (
                      <div key={i} className="flex items-center gap-1 bg-white border border-emerald-200 rounded-md px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />{c.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full checklist by category */}
              {[
                { key: "seo", label: "SEO Signals", checks: checksByCategory.seo },
                { key: "content", label: "Content Quality", checks: checksByCategory.content },
                { key: "readiness", label: "Publish Readiness", checks: checksByCategory.readiness },
              ].map(cat => (
                <div key={cat.key} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(p => ({ ...p, [cat.key]: !p[cat.key] }))}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <p className="text-xs font-semibold">{cat.label} Checklist</p>
                    {expanded[cat.key] ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {expanded[cat.key] && (
                    <div className="border-t border-border divide-y divide-border/50">
                      {cat.checks.map((c, i) => (
                        <div key={i} className={cn("flex items-start gap-3 px-4 py-2.5", c.pass ? "" : "bg-red-50/30")}>
                          {c.pass ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" /> : SEV_ICON[c.severity]}
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-semibold", c.pass ? "text-emerald-700" : "text-foreground")}>{c.label}</p>
                            <p className="text-[10px] text-muted-foreground">{c.message}</p>
                            {!c.pass && <p className="text-[10px] text-primary mt-0.5">→ {c.tip}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
          {!activeBrief && (
            <div className="bg-card border border-border rounded-xl py-16 text-center">
              <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">Select a brief to run SEO QA</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}