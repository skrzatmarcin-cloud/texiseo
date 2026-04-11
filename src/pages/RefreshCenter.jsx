import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, RefreshCw, AlertTriangle, TrendingDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import ScoreBadge from "../components/ScoreBadge";
import ScoreBar from "../components/ScoreBar";

const TASK_TYPE_LABELS = {
  light_refresh: "Light Refresh", expansion: "Expansion", rewrite_intro: "Rewrite Intro",
  add_faq: "Add FAQ", add_trust_section: "Add Trust Section", update_cta: "Update CTA",
  add_examples: "Add Examples", add_internal_links: "Add Internal Links",
  add_comparison_block: "Add Comparison Block", rewrite_outdated_section: "Rewrite Section", full_rewrite: "Full Rewrite",
};

const TASK_TYPE_EFFORT = {
  light_refresh: "30min", expansion: "half_day", rewrite_intro: "1-2h",
  add_faq: "1-2h", add_trust_section: "1-2h", update_cta: "30min",
  add_examples: "1-2h", add_internal_links: "30min",
  add_comparison_block: "1-2h", rewrite_outdated_section: "half_day", full_rewrite: "full_day",
};

const EFFORT_LABELS = { "30min": "30 min", "1-2h": "1–2 h", "half_day": "½ day", "full_day": "Full day" };

const PRIORITY_STYLES = {
  critical: "text-red-600 bg-red-50 ring-red-200",
  high: "text-amber-700 bg-amber-50 ring-amber-200",
  medium: "text-blue-600 bg-blue-50 ring-blue-200",
  low: "text-slate-500 bg-slate-100 ring-slate-200",
};

const DECAY_STYLES = {
  high: "text-red-600 bg-red-50", medium: "text-amber-600 bg-amber-50", low: "text-emerald-600 bg-emerald-50",
};

export default function RefreshCenter() {
  const [tasks, setTasks] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.RefreshTasks.list("-created_date"),
      base44.entities.Pages.list(),
    ]).then(([t, p]) => { setTasks(t); setPages(p); setLoading(false); });
  }, []);

  const pageMap = useMemo(() => Object.fromEntries(pages.map(p => [p.id, p])), [pages]);

  const filtered = useMemo(() => tasks.filter(t => {
    if (filters.status && filters.status !== "all" && t.status !== filters.status) return false;
    if (filters.priority && filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.task_type && filters.task_type !== "all" && t.task_type !== filters.task_type) return false;
    if (search) {
      const page = pageMap[t.page_id];
      const q = search.toLowerCase();
      if (!page?.title?.toLowerCase().includes(q) && !t.reason?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [tasks, filters, search, pageMap]);

  const stats = useMemo(() => ({
    pending: tasks.filter(t => t.status === "pending").length,
    critical: tasks.filter(t => t.priority === "critical" && t.status === "pending").length,
    highDecay: pages.filter(p => p.decay_risk === "high").length,
    avgFreshness: pages.length ? Math.round(pages.reduce((a, p) => a + (p.refresh_score || 50), 0) / pages.length) : 0,
  }), [tasks, pages]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await base44.entities.RefreshTasks.update(id, { status });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    setUpdating(null);
  };

  const hasActive = search || Object.values(filters).some(v => v && v !== "all");

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Refresh Center" description="Content decay monitoring and refresh task queue for Linguatoons" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Pending Refresh Tasks", value: stats.pending, icon: RefreshCw, color: "text-primary" },
          { label: "Critical Priority", value: stats.critical, icon: AlertTriangle, color: "text-red-500" },
          { label: "High Decay Risk Pages", value: stats.highDecay, icon: TrendingDown, color: "text-amber-500" },
          { label: "Avg Freshness Score", value: stats.avgFreshness, icon: Clock, color: "text-blue-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1"><s.icon className={cn("h-4 w-4", s.color)} /><p className="text-[11px] text-muted-foreground">{s.label}</p></div>
            <p className="text-2xl font-bold">{s.value}{s.label === "Avg Freshness Score" ? "%" : ""}</p>
          </div>
        ))}
      </div>

      {/* Page freshness overview */}
      <div className="bg-card border border-border rounded-xl p-4 mb-5">
        <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Page Freshness Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pages.map(page => (
            <div key={page.id} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold truncate flex-1">{page.title}</p>
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded ml-2 font-medium flex-shrink-0", DECAY_STYLES[page.decay_risk] || DECAY_STYLES.low)}>
                  {page.decay_risk || "low"} decay
                </span>
              </div>
              <ScoreBar value={page.refresh_score || 50} label="Freshness" className="mb-1" />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{tasks.filter(t => t.page_id === page.id && t.status === "pending").length} pending task(s)</span>
                <span className="capitalize">{page.orphan_risk || "low"} orphan risk</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks or pages…" className="h-8 w-52 pl-8 text-xs" />
        </div>
        {[
          { key: "status", label: "Status", options: [{ value: "pending", label: "Pending" }, { value: "in_progress", label: "In Progress" }, { value: "completed", label: "Completed" }, { value: "dismissed", label: "Dismissed" }] },
          { key: "priority", label: "Priority", options: [{ value: "critical", label: "Critical" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }] },
          { key: "task_type", label: "Task Type", options: Object.entries(TASK_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })) },
        ].map(f => (
          <Select key={f.key} value={filters[f.key] || "all"} onValueChange={v => setFilters(p => ({ ...p, [f.key]: v }))}>
            <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs"><SelectValue placeholder={f.label} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label}</SelectItem>
              {f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        ))}
        {hasActive && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setFilters({}); setSearch(""); }}><X className="h-3 w-3" /> Clear</Button>}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} tasks</span>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map(task => {
          const page = pageMap[task.page_id];
          const effort = EFFORT_LABELS[task.effort_estimate || TASK_TYPE_EFFORT[task.task_type]] || "—";
          return (
            <div key={task.id} className={cn("bg-card border border-border rounded-xl p-4 transition-opacity", task.status === "completed" || task.status === "dismissed" ? "opacity-60" : "")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-semibold bg-secondary px-2 py-0.5 rounded">{TASK_TYPE_LABELS[task.task_type]}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded ring-1 font-semibold", PRIORITY_STYLES[task.priority])}>{task.priority}</span>
                    <span className="text-[10px] text-muted-foreground">⏱ {effort}</span>
                    {page && <span className="text-[10px] text-primary font-medium truncate max-w-[200px]">→ {page.title}</span>}
                  </div>
                  <p className="text-xs font-medium mb-0.5">{task.reason}</p>
                  {task.recommendation && <p className="text-[11px] text-muted-foreground leading-relaxed">{task.recommendation}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {task.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(task.id, "in_progress")} disabled={updating === task.id}
                        className="text-[10px] text-blue-600 hover:underline">Start</button>
                      <button onClick={() => updateStatus(task.id, "dismissed")} disabled={updating === task.id}
                        className="text-[10px] text-muted-foreground hover:underline">Dismiss</button>
                    </>
                  )}
                  {task.status === "in_progress" && (
                    <button onClick={() => updateStatus(task.id, "completed")} disabled={updating === task.id}
                      className="text-[10px] text-emerald-600 hover:underline">Mark Done</button>
                  )}
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
                    task.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                    task.status === "in_progress" ? "bg-blue-50 text-blue-700" :
                    task.status === "dismissed" ? "bg-gray-100 text-gray-500" :
                    "bg-amber-50 text-amber-700")}>{task.status?.replace(/_/g, " ")}</span>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-card border border-border rounded-xl py-12 text-center">
            <RefreshCw className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">No refresh tasks match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}