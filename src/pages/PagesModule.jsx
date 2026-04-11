import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ScoreBadge from "../components/ScoreBadge";
import StatusBadge from "../components/StatusBadge";
import { computePageHealth } from "../lib/pageHealth";
import { LANGUAGES, AUDIENCES, PAGE_TYPES, PAGE_STATUSES } from "../lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, LayoutGrid, List, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BOOLEAN_OPTIONS = [
  { value: "yes", label: "Obecne" },
  { value: "no", label: "Brak" },
];

const HEALTH_OPTIONS = [
  { value: "healthy", label: "Zdrowe" },
  { value: "fair", label: "Przeciętne" },
  { value: "weak", label: "Słabe" },
];

function HealthBadge({ health }) {
  const styles = {
    healthy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    fair: "bg-amber-50 text-amber-700 ring-amber-200",
    weak: "bg-red-50 text-red-600 ring-red-200",
  };
  const labels = { healthy: "Zdrowe", fair: "Przeciętne", weak: "Słabe" };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1", styles[health] || styles.fair)}>
      {labels[health] || health}
    </span>
  );
}

export default function PagesModule() {
  const [pages, setPages] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.Pages.list(),
      base44.entities.Clusters.list(),
    ]).then(([p, c]) => { setPages(p); setClusters(c); setLoading(false); });
  }, []);

  const clusterMap = useMemo(() => Object.fromEntries(clusters.map(c => [c.id, c])), [clusters]);

  const filtered = useMemo(() => {
    return pages.filter(p => {
      const health = computePageHealth(p).label;
      if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.url?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.language && filters.language !== "all" && p.language !== filters.language) return false;
      if (filters.page_type && filters.page_type !== "all" && p.page_type !== filters.page_type) return false;
      if (filters.audience && filters.audience !== "all" && p.audience !== filters.audience) return false;
      if (filters.status && filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.health && filters.health !== "all" && health !== filters.health) return false;
      if (filters.faq && filters.faq !== "all") {
        if (filters.faq === "yes" && !p.faq_present) return false;
        if (filters.faq === "no" && p.faq_present) return false;
      }
      if (filters.schema && filters.schema !== "all") {
        if (filters.schema === "yes" && !p.schema_present) return false;
        if (filters.schema === "no" && p.schema_present) return false;
      }
      if (filters.weak_only === "yes") {
        if (health !== "weak") return false;
      }
      return true;
    });
  }, [pages, search, filters]);

  const hasActive = search || Object.values(filters).some(v => v && v !== "all");

  const resetFilters = () => { setFilters({}); setSearch(""); };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Strony" description={`${pages.length} stron śledzonych — ${filtered.length} wyświetlanych`}>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
          <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md transition-colors", view === "table" ? "bg-card shadow-sm" : "")}>
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setView("cards")} className={cn("p-1.5 rounded-md transition-colors", view === "cards" ? "bg-card shadow-sm" : "")}>
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </PageHeader>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj stron..." className="h-8 w-48 pl-8 text-xs" />
        </div>
        {[
          { key: "page_type", label: "Typ", options: PAGE_TYPES },
          { key: "language", label: "Język", options: LANGUAGES },
          { key: "audience", label: "Odbiorcy", options: AUDIENCES },
          { key: "status", label: "Status", options: PAGE_STATUSES },
          { key: "health", label: "Zdrowie", options: HEALTH_OPTIONS },
          { key: "faq", label: "FAQ", options: BOOLEAN_OPTIONS },
          { key: "schema", label: "Schemat", options: BOOLEAN_OPTIONS },
          { key: "weak_only", label: "Tylko słabe", options: [{ value: "yes", label: "Tylko słabe strony" }] },
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
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={resetFilters}>
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {view === "table" ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Strona</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Typ</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Język</th>
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Klaster</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Zaufanie</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Konw.</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Głębokość</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden xl:table-cell">FAQ</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden xl:table-cell">Schemat</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Zdrowie</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const { label: health, score } = computePageHealth(p);
                  return (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors group">
                      <td className="px-3 py-2.5">
                        <div className="max-w-[220px]">
                          <p className="font-medium text-foreground truncate">{p.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{p.url}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground capitalize hidden md:table-cell">{p.page_type?.replace(/_/g, " ")}</td>
                      <td className="px-3 py-2.5 text-center uppercase text-muted-foreground">{p.language}</td>
                      <td className="px-3 py-2.5 hidden lg:table-cell">
                        <span className="text-muted-foreground truncate max-w-[120px] block">{clusterMap[p.cluster_id]?.name || "—"}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center"><ScoreBadge score={p.trust_score} /></td>
                      <td className="px-3 py-2.5 text-center hidden md:table-cell"><ScoreBadge score={p.conversion_score} /></td>
                      <td className="px-3 py-2.5 text-center hidden lg:table-cell"><ScoreBadge score={p.content_depth_score} /></td>
                      <td className="px-3 py-2.5 text-center hidden xl:table-cell">
                        {p.faq_present
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                          : <X className="h-3.5 w-3.5 text-red-400 mx-auto" />}
                      </td>
                      <td className="px-3 py-2.5 text-center hidden xl:table-cell">
                        {p.schema_present
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
                          : <X className="h-3.5 w-3.5 text-red-400 mx-auto" />}
                      </td>
                      <td className="px-3 py-2.5 text-center"><HealthBadge health={health} /></td>
                      <td className="px-3 py-2.5 text-center"><StatusBadge status={p.status} /></td>
                      <td className="px-3 py-2.5">
                        <Link to={`/pages/${p.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-12 text-center text-xs text-muted-foreground">Brak stron pasujących do filtrów.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => {
            const { label: health, score } = computePageHealth(p);
            return (
              <Link
                key={p.id}
                to={`/pages/${p.id}`}
                className="bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/20 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{p.url}</p>
                  </div>
                  <HealthBadge health={health} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground capitalize">{p.page_type?.replace(/_/g, " ")}</span>
                  <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground uppercase">{p.language}</span>
                  {clusterMap[p.cluster_id] && (
                    <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground truncate max-w-[120px]">{clusterMap[p.cluster_id].name}</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
                    <ScoreBadge score={p.trust_score} />
                    <p className="text-[9px] text-muted-foreground mt-1">Trust</p>
                  </div>
                  <div className="text-center">
                    <ScoreBadge score={p.conversion_score} />
                    <p className="text-[9px] text-muted-foreground mt-1">Conv.</p>
                  </div>
                  <div className="text-center">
                    <ScoreBadge score={p.content_depth_score} />
                    <p className="text-[9px] text-muted-foreground mt-1">Depth</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex gap-2">
                    <span className={cn("text-[10px] font-medium", p.faq_present ? "text-emerald-600" : "text-red-400")}>
                      {p.faq_present ? "✓ FAQ" : "✗ FAQ"}
                    </span>
                    <span className={cn("text-[10px] font-medium", p.schema_present ? "text-emerald-600" : "text-red-400")}>
                      {p.schema_present ? "✓ Schema" : "✗ Schema"}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-muted-foreground">Brak stron pasujących do filtrów.</div>
          )}
        </div>
      )}
    </div>
  );
}