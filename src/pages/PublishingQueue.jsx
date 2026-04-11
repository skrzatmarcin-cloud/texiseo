import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LayoutGrid, List, Search, X, ChevronRight, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import KanbanBoard from "../components/queue/KanbanBoard";
import QueueTable from "../components/queue/QueueTable";
import { LANGUAGES, AUDIENCES } from "../lib/constants";

export const WORKFLOW_STATUSES = [
  { value: "idea", label: "Idea", color: "bg-slate-100 text-slate-600 border-slate-200" },
  { value: "research_needed", label: "Research Needed", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { value: "approved", label: "Approved", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "brief_ready", label: "Brief Ready", color: "bg-violet-50 text-violet-700 border-violet-200" },
  { value: "writing", label: "Writing", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "review", label: "In Review", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { value: "seo_qa", label: "SEO QA", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "ready_to_publish", label: "Ready to Publish", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: "published", label: "Published", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "refresh_needed", label: "Refresh Needed", color: "bg-red-50 text-red-600 border-red-200" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-400 border-gray-200" },
];

const KANBAN_STATUSES = ["approved", "brief_ready", "writing", "review", "seo_qa", "ready_to_publish", "published"];

export default function PublishingQueue() {
  const [items, setItems] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.PublishingQueue.list("-created_date"),
      base44.entities.Clusters.list(),
    ]).then(([q, c]) => { setItems(q); setClusters(c); setLoading(false); });
  }, []);

  const clusterMap = useMemo(() => Object.fromEntries(clusters.map(c => [c.id, c])), [clusters]);

  const filtered = useMemo(() => items.filter(item => {
    if (search && !item.title?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filters.status && filters.status !== "all" && item.current_status !== filters.status) return false;
    if (filters.language && filters.language !== "all" && item.language !== filters.language) return false;
    if (filters.audience && filters.audience !== "all" && item.audience !== filters.audience) return false;
    if (filters.priority && filters.priority !== "all" && item.priority !== filters.priority) return false;
    if (filters.cluster_id && filters.cluster_id !== "all" && item.cluster_id !== filters.cluster_id) return false;
    return true;
  }), [items, filters, search]);

  const updateItem = async (id, data) => {
    await base44.entities.PublishingQueue.update(id, data);
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const hasActive = search || Object.values(filters).some(v => v && v !== "all");

  const statusCounts = useMemo(() => {
    const counts = {};
    WORKFLOW_STATUSES.forEach(s => { counts[s.value] = items.filter(i => i.current_status === s.value).length; });
    return counts;
  }, [items]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Publishing Queue" description={`${items.length} pieces in the editorial pipeline`}>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
          <button onClick={() => setView("kanban")} className={cn("p-1.5 rounded-md transition-colors", view === "kanban" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md transition-colors", view === "table" ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </PageHeader>

      {/* Status pipeline summary */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {WORKFLOW_STATUSES.filter(s => !["idea", "research_needed", "archived"].includes(s.value)).map(s => (
          <div key={s.value} className={cn("flex-shrink-0 border rounded-lg px-3 py-2 text-center min-w-[90px] cursor-pointer transition-all",
            s.color,
            filters.status === s.value ? "ring-2 ring-primary ring-offset-1" : ""
          )}
            onClick={() => setFilters(p => ({ ...p, status: p.status === s.value ? "all" : s.value }))}
          >
            <p className="text-lg font-bold">{statusCounts[s.value] || 0}</p>
            <p className="text-[10px] font-medium leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search queue…" className="h-8 w-44 pl-8 text-xs" />
        </div>
        {[
          { key: "language", label: "Language", options: LANGUAGES },
          { key: "audience", label: "Audience", options: AUDIENCES },
          { key: "priority", label: "Priority", options: [{ value: "critical", label: "Critical" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }] },
          { key: "cluster_id", label: "Cluster", options: clusters.map(c => ({ value: c.id, label: c.name })) },
        ].map(f => (
          <Select key={f.key} value={filters[f.key] || "all"} onValueChange={v => setFilters(p => ({ ...p, [f.key]: v }))}>
            <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs">
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
      </div>

      {view === "kanban" ? (
        <KanbanBoard items={filtered} statuses={KANBAN_STATUSES} workflowStatuses={WORKFLOW_STATUSES} clusterMap={clusterMap} onUpdate={updateItem} />
      ) : (
        <QueueTable items={filtered} workflowStatuses={WORKFLOW_STATUSES} clusterMap={clusterMap} onUpdate={updateItem} />
      )}
    </div>
  );
}