import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import FilterBar from "../components/FilterBar";
import ScoreBadge from "../components/ScoreBadge";
import StatusBadge from "../components/StatusBadge";
import { LANGUAGES, AUDIENCES, PAGE_TYPES, PAGE_STATUSES } from "../lib/constants";

export default function PagesModule() {
  const [pages, setPages] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
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
      if (search && !p.title?.toLowerCase().includes(search.toLowerCase()) && !p.url?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.language && filters.language !== "all" && p.language !== filters.language) return false;
      if (filters.page_type && filters.page_type !== "all" && p.page_type !== filters.page_type) return false;
      if (filters.audience && filters.audience !== "all" && p.audience !== filters.audience) return false;
      if (filters.status && filters.status !== "all" && p.status !== filters.status) return false;
      return true;
    });
  }, [pages, search, filters]);

  const getHealthStatus = (p) => {
    if ((p.trust_score || 0) < 40 || (p.content_depth_score || 0) < 40) return "weak";
    if ((p.trust_score || 0) < 60 || (p.content_depth_score || 0) < 60) return "fair";
    return "healthy";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Pages" description={`${pages.length} pages tracked`} />

      <FilterBar
        filters={[
          { key: "language", label: "Language", options: LANGUAGES },
          { key: "page_type", label: "Type", options: PAGE_TYPES },
          { key: "audience", label: "Audience", options: AUDIENCES },
          { key: "status", label: "Status", options: PAGE_STATUSES },
        ]}
        values={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onReset={() => setFilters({})}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Page</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Type</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Lang</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Cluster</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Trust</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Conv.</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Depth</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Refresh</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Health</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const health = getHealthStatus(p);
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="max-w-[240px]">
                        <p className="font-medium text-foreground truncate">{p.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{p.url}</p>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground capitalize hidden md:table-cell">{p.page_type}</td>
                    <td className="px-3 py-2.5 text-center">{p.language}</td>
                    <td className="px-3 py-2.5 hidden lg:table-cell">
                      <span className="text-muted-foreground truncate max-w-[100px] block">
                        {clusterMap[p.cluster_id]?.name || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center"><ScoreBadge score={p.trust_score} /></td>
                    <td className="px-3 py-2.5 text-center hidden md:table-cell"><ScoreBadge score={p.conversion_score} /></td>
                    <td className="px-3 py-2.5 text-center hidden lg:table-cell"><ScoreBadge score={p.content_depth_score} /></td>
                    <td className="px-3 py-2.5 text-center hidden lg:table-cell"><ScoreBadge score={p.refresh_score} /></td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ${
                        health === "healthy" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" :
                        health === "fair" ? "bg-amber-50 text-amber-700 ring-amber-200" :
                        "bg-red-50 text-red-600 ring-red-200"
                      }`}>
                        {health === "healthy" ? "Healthy" : health === "fair" ? "Fair" : "Weak"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-center"><StatusBadge status={p.status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}