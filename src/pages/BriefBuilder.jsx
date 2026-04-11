import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ScoreBadge from "../components/ScoreBadge";
import { LANGUAGES, AUDIENCES } from "../lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, FileText, ChevronRight, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_TYPE_LABELS = {
  informational_blog: "Informational Blog",
  service_support: "Service Support",
  pillar_page: "Pillar Page",
  faq_page: "FAQ Page",
  comparison_page: "Comparison Page",
  landing_page: "Landing Page",
  commercial_investigation: "Commercial Investigation",
};

const PAGE_TYPE_OPTIONS = Object.entries(PAGE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const BRIEF_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "ready", label: "Ready" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "archived", label: "Archived" },
];

const BRIEF_STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  ready: "bg-blue-50 text-blue-700 ring-blue-200",
  in_review: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-gray-100 text-gray-500 ring-gray-200",
};

function BriefStatusBadge({ status }) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1", BRIEF_STATUS_STYLES[status] || BRIEF_STATUS_STYLES.draft)}>
      {BRIEF_STATUS_LABELS[status] || status}
    </span>
  );
}

const BRIEF_STATUS_LABELS = {
  draft: "Draft", ready: "Ready", in_review: "In Review", approved: "Approved", archived: "Archived",
};

export default function BriefBuilder() {
  const [briefs, setBriefs] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.Briefs.list("-created_date"),
      base44.entities.ContentIdeas.filter({ status: "approved" }),
      base44.entities.Clusters.list(),
    ]).then(([b, i, c]) => { setBriefs(b); setIdeas(i); setClusters(c); setLoading(false); });
  }, []);

  const clusterMap = useMemo(() => Object.fromEntries(clusters.map(c => [c.id, c])), [clusters]);
  const briefIdeaIds = useMemo(() => new Set(briefs.map(b => b.content_idea_id)), [briefs]);
  const ideasWithoutBrief = useMemo(() => ideas.filter(i => !briefIdeaIds.has(i.id)), [ideas, briefIdeaIds]);

  const filtered = useMemo(() => {
    return briefs.filter(b => {
      if (search && !b.brief_title?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.language && filters.language !== "all" && b.language !== filters.language) return false;
      if (filters.page_type && filters.page_type !== "all" && b.page_type !== filters.page_type) return false;
      if (filters.cluster_id && filters.cluster_id !== "all" && b.cluster_id !== filters.cluster_id) return false;
      if (filters.audience && filters.audience !== "all" && b.audience !== filters.audience) return false;
      if (filters.status && filters.status !== "all" && b.status !== filters.status) return false;
      return true;
    });
  }, [briefs, search, filters]);

  const hasActive = search || Object.values(filters).some(v => v && v !== "all");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Kreator briefów" description={`${briefs.length} briefów wygenerowanych — ${ideasWithoutBrief.length} zatwierdzonych pomysłów oczekuje`} />

      {/* Pending approved ideas */}
      {ideasWithoutBrief.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-primary mb-3">
            {ideasWithoutBrief.length} zatwierdzonych pomysłów gotowych do wygenerowania briefu
          </p>
          <div className="flex flex-wrap gap-2">
            {ideasWithoutBrief.map(idea => (
              <div key={idea.id} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-xs">
                <FileText className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium truncate max-w-[200px]">{idea.title}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{idea.language}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Przejdź do Pomysłów na treści, aby zmienić status, lub użyj danych przykładowych.</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search briefs..." className="h-8 w-48 pl-8 text-xs" />
        </div>
        {[
          { key: "language", label: "Language", options: LANGUAGES },
          { key: "page_type", label: "Page Type", options: PAGE_TYPE_OPTIONS },
          { key: "audience", label: "Audience", options: AUDIENCES },
          { key: "status", label: "Status", options: BRIEF_STATUS_OPTIONS },
          {
            key: "cluster_id", label: "Cluster",
            options: clusters.map(c => ({ value: c.id, label: c.name })),
          },
        ].map(f => (
          <Select key={f.key} value={filters[f.key] || "all"} onValueChange={v => setFilters(prev => ({ ...prev, [f.key]: v }))}>
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
      </div>

      {/* Brief list */}
      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-muted-foreground">Brak briefów</p>
          <p className="text-xs text-muted-foreground mt-1">Zatwierdź pomysły na treści i dodaj briefy, aby zacząć.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => (
            <Link
              key={b.id}
              to={`/brief-builder/${b.id}`}
              className="flex items-center gap-4 bg-card border border-border rounded-xl px-4 py-3.5 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold truncate">{b.brief_title}</p>
                  <BriefStatusBadge status={b.status} />
                </div>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {PAGE_TYPE_LABELS[b.page_type] || b.page_type}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase">{b.language}</span>
                  {b.cluster_id && clusterMap[b.cluster_id] && (
                    <span className="text-[10px] text-muted-foreground">{clusterMap[b.cluster_id].name}</span>
                  )}
                  {b.primary_keyword && (
                    <span className="text-[10px] text-muted-foreground italic truncate">"{b.primary_keyword}"</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {b.target_word_count && (
                  <div className="text-center hidden sm:block">
                    <p className="text-xs font-bold">{b.target_word_count.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground">słów</p>
                  </div>
                )}
                <ScoreBadge score={b.completeness_score} />
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}