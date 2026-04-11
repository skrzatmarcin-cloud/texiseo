import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import FilterBar from "../components/FilterBar";
import ScoreBar from "../components/ScoreBar";
import ScoreBadge from "../components/ScoreBadge";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus, ArrowRight } from "lucide-react";
import { LANGUAGES } from "../lib/constants";
import { cn } from "@/lib/utils";

export default function Clusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("cards");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    base44.entities.Clusters.list().then(c => { setClusters(c); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return clusters.filter(c => {
      if (search && !c.name?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.language && filters.language !== "all" && c.language !== filters.language) return false;
      return true;
    });
  }, [clusters, search, filters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Topic Clusters" description={`${clusters.length} clusters mapped`}>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
          <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md", view === "table" ? "bg-card shadow-sm" : "")}>
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setView("cards")} className={cn("p-1.5 rounded-md", view === "cards" ? "bg-card shadow-sm" : "")}>
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </PageHeader>

      <FilterBar
        filters={[{ key: "language", label: "Language", options: LANGUAGES }]}
        values={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onReset={() => setFilters({})}
        searchValue={search}
        onSearchChange={setSearch}
      />

      {view === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Link
              key={c.id}
              to={`/clusters/${c.id}`}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/20 transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-4">{c.description}</p>
              <div className="space-y-2 mb-3">
                <ScoreBar value={c.completeness_score} label="Completeness" />
                <ScoreBar value={c.authority_score} label="Authority" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground">{c.support_content_count || 0} support articles</span>
                {c.missing_topics?.length > 0 && (
                  <span className="text-[10px] text-amber-600 font-medium">{c.missing_topics.length} gaps</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Name</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Lang</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Authority</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Completeness</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Articles</th>
                  <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Gaps</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="px-3 py-2.5">
                      <Link to={`/clusters/${c.id}`} className="font-medium text-foreground hover:text-primary">{c.name}</Link>
                    </td>
                    <td className="px-3 py-2.5 text-center">{c.language}</td>
                    <td className="px-3 py-2.5 text-center"><ScoreBadge score={c.authority_score} /></td>
                    <td className="px-3 py-2.5 text-center"><ScoreBadge score={c.completeness_score} /></td>
                    <td className="px-3 py-2.5 text-center">{c.support_content_count || 0}</td>
                    <td className="px-3 py-2.5 text-center">{c.missing_topics?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}