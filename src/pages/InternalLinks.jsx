import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Link2, AlertTriangle, TrendingUp, ExternalLink, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import StatusBadge from "../components/StatusBadge";
import ScoreBadge from "../components/ScoreBadge";

const ANCHOR_TYPE_LABELS = {
  exact: "Exact", partial_match: "Partial Match", branded: "Branded",
  natural_language: "Natural", cta_anchor: "CTA", support_anchor: "Support",
};

const ANCHOR_TYPE_STYLES = {
  exact: "bg-blue-50 text-blue-700",
  partial_match: "bg-purple-50 text-purple-700",
  branded: "bg-emerald-50 text-emerald-700",
  natural_language: "bg-slate-100 text-slate-700",
  cta_anchor: "bg-amber-50 text-amber-700",
  support_anchor: "bg-rose-50 text-rose-700",
};

const PRIORITY_STYLES = {
  critical: "text-red-600 bg-red-50 ring-red-200",
  high: "text-amber-700 bg-amber-50 ring-amber-200",
  medium: "text-blue-600 bg-blue-50 ring-blue-200",
  low: "text-slate-500 bg-slate-100 ring-slate-200",
};

const STATUS_NEXT = { pending: "implemented", in_review: "implemented", implemented: "dismissed" };

export default function InternalLinks() {
  const [suggestions, setSuggestions] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [updating, setUpdating] = useState(null);
  const [injectResult, setInjectResult] = useState(null); // { success, message, error, manual, wp_edit_url, wp_url }

  useEffect(() => {
    Promise.all([
      base44.entities.InternalLinkSuggestions.list("-created_date", 200),
      base44.entities.Pages.list(),
    ]).then(([s, p]) => { setSuggestions(s); setPages(p); setLoading(false); });
  }, []);

  const pageMap = useMemo(() => Object.fromEntries(pages.map(p => [p.id, p])), [pages]);

  const filtered = useMemo(() => suggestions.filter(s => {
    if (filters.status && filters.status !== "all" && s.status !== filters.status) return false;
    if (filters.priority && filters.priority !== "all" && s.priority !== filters.priority) return false;
    if (filters.anchor_type && filters.anchor_type !== "all" && s.anchor_type !== filters.anchor_type) return false;
    if (search) {
      const q = search.toLowerCase();
      const src = pageMap[s.source_page_id]?.title?.toLowerCase() || "";
      const tgt = pageMap[s.target_page_id]?.title?.toLowerCase() || "";
      if (!src.includes(q) && !tgt.includes(q) && !s.anchor_text?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [suggestions, filters, search, pageMap]);

  const stats = useMemo(() => {
    const pending = suggestions.filter(s => s.status === "pending").length;
    const implemented = suggestions.filter(s => s.status === "implemented").length;
    const critical = suggestions.filter(s => s.priority === "critical" && s.status === "pending").length;
    const orphanPages = pages.filter(p => (p.internal_links_in_count || 0) < 2).length;
    return { pending, implemented, critical, orphanPages };
  }, [suggestions, pages]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await base44.entities.InternalLinkSuggestions.update(id, { status });
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
    setUpdating(null);
  };

  const handleMarkDone = async (s, src, tgt) => {
    setUpdating(s.id);
    const sourceSlug = src?.slug || src?.url || "";
    const targetUrl = tgt?.url
      ? (tgt.url.startsWith("http") ? tgt.url : `https://linguatoons.com${tgt.url}`)
      : "";

    if (!sourceSlug || !targetUrl) {
      // No WP data — just mark done locally
      await updateStatus(s.id, "implemented");
      setInjectResult({ success: true, message: "Oznaczono jako wykonane (brak danych URL do automatycznej iniekcji).", manual: true });
      setUpdating(null);
      return;
    }

    try {
      const res = await base44.functions.invoke("wordpressInjectLink", {
        source_slug: sourceSlug,
        target_url: targetUrl,
        anchor_text: s.anchor_text,
        context_note: s.context_note || "",
      });
      const data = res.data || res;
      if (data.success) {
        await base44.entities.InternalLinkSuggestions.update(s.id, { status: "implemented" });
        setSuggestions(prev => prev.map(x => x.id === s.id ? { ...x, status: "implemented" } : x));
      }
      setInjectResult(data);
    } catch (err) {
      setInjectResult({ success: false, error: err.message, manual: true });
    }
    setUpdating(null);
  };

  const hasActive = search || Object.values(filters).some(v => v && v !== "all");

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Internal Linking Engine" description="Sugestie linkowania wewnętrznego — zmiany musisz wdrożyć ręcznie w WordPress" />

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4 text-[11px] text-emerald-800">
        <strong>✓ Auto-inject:</strong> &quot;Mark Done&quot; próbuje automatycznie wstawić link w WordPress. Jeśli frazy nie znajdzie — pokaże instrukcję ręczną. — <strong>nie dodaje automatycznie linków na stronie WordPress</strong>. Po zatwierdzeniu musisz ręcznie wkleić link do treści w edytorze WordPress, a następnie oznaczyć jako wykonane.
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pending Suggestions", value: stats.pending, icon: Link2, color: "text-primary" },
          { label: "Implemented", value: stats.implemented, icon: TrendingUp, color: "text-emerald-600" },
          { label: "Critical Priority", value: stats.critical, icon: AlertTriangle, color: "text-red-500" },
          { label: "Orphan-Risk Pages", value: stats.orphanPages, icon: AlertTriangle, color: "text-amber-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={cn("h-4 w-4", s.color)} />
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orphan risk panel */}
      {pages.filter(p => (p.internal_links_in_count || 0) < 2).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-xs font-semibold text-amber-800">Pages with Orphan Risk (fewer than 2 incoming links)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {pages.filter(p => (p.internal_links_in_count || 0) < 2).map(p => (
              <div key={p.id} className="flex items-center gap-1.5 bg-white border border-amber-200 rounded-lg px-2.5 py-1 text-[11px]">
                <span className="font-medium">{p.title}</span>
                <span className="text-amber-600 font-bold">{p.internal_links_in_count || 0} in</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pages or anchor…" className="h-8 w-52 pl-8 text-xs" />
        </div>
        {[
          { key: "status", label: "Status", options: [{ value: "pending", label: "Pending" }, { value: "implemented", label: "Implemented" }, { value: "in_review", label: "In Review" }, { value: "dismissed", label: "Dismissed" }] },
          { key: "priority", label: "Priority", options: [{ value: "critical", label: "Critical" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }] },
          { key: "anchor_type", label: "Anchor Type", options: Object.entries(ANCHOR_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })) },
        ].map(f => (
          <Select key={f.key} value={filters[f.key] || "all"} onValueChange={v => setFilters(p => ({ ...p, [f.key]: v }))}>
            <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label}</SelectItem>
              {f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        ))}
        {hasActive && (
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setFilters({}); setSearch(""); }}>
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} suggestions</span>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Source Page</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Target Page</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Anchor Text</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Type</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Context</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Score</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Priority</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const src = pageMap[s.source_page_id];
                const tgt = pageMap[s.target_page_id];
                return (
                  <tr key={s.id} className={cn("border-b border-border/50 hover:bg-secondary/30 transition-colors", i % 2 === 0 ? "" : "bg-secondary/10")}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium truncate max-w-[160px]">{src?.title || <span className="text-muted-foreground italic">Planned page</span>}</p>
                      {src?.page_type && <p className="text-[10px] text-muted-foreground capitalize">{src.page_type}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        {tgt?.url
                          ? <a href={tgt.url.startsWith("http") ? tgt.url : `https://linguatoons.com${tgt.url}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary truncate max-w-[140px] hover:underline flex items-center gap-1">
                              {tgt?.title || "Strona"} <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                          : <p className="font-semibold text-primary truncate max-w-[140px]">{tgt?.title || <span className="text-muted-foreground italic">Planned page</span>}</p>
                        }
                      </div>
                      {tgt?.page_type && <p className="text-[10px] text-muted-foreground capitalize">{tgt.page_type}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-mono text-[11px] text-foreground">"{s.anchor_text}"</p>
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell">
                      <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium", ANCHOR_TYPE_STYLES[s.anchor_type])}>
                        {ANCHOR_TYPE_LABELS[s.anchor_type]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 hidden lg:table-cell max-w-[200px]">
                      <p className="text-[11px] text-muted-foreground truncate">{s.context_note}</p>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <ScoreBadge score={s.relevance_score} size="sm" />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ring-1", PRIORITY_STYLES[s.priority])}>
                        {s.priority}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium",
                        s.status === "implemented" ? "bg-emerald-50 text-emerald-700" :
                        s.status === "dismissed" ? "bg-gray-100 text-gray-500" :
                        s.status === "in_review" ? "bg-blue-50 text-blue-700" :
                        "bg-amber-50 text-amber-700"
                      )}>
                        {s.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {s.status === "pending" && (
                        <button
                          onClick={() => handleMarkDone(s, src, tgt)}
                          disabled={updating === s.id}
                          className="text-[10px] text-emerald-600 hover:underline whitespace-nowrap disabled:opacity-50"
                        >
                          {updating === s.id ? "…" : "Mark Done"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      <Dialog open={!!injectResult} onOpenChange={() => setInjectResult(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              {injectResult?.success
                ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Link wstawiony!</>
                : <><XCircle className="h-4 w-4 text-red-500" /> Nie udało się auto-inject</>
              }
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs space-y-2">
            {injectResult?.success && (
              <p className="text-emerald-700">{injectResult.message}</p>
            )}
            {injectResult?.wp_url && (
              <a href={injectResult.wp_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                Zobacz stronę <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {!injectResult?.success && (
              <>
                <p className="text-red-700">{injectResult?.error}</p>
                {injectResult?.manual && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-800">
                    <p className="font-semibold mb-1">Wstaw ręcznie:</p>
                    <p>Anchor: <span className="font-mono bg-white px-1 rounded">{injectResult?.anchor_text}</span></p>
                    {injectResult?.wp_edit_url && (
                      <a href={injectResult.wp_edit_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline mt-1">
                        Otwórz edytor WP <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Link2 className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground">No suggestions match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}