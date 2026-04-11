import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import FilterBar from "../components/FilterBar";
import ContentIdeasTable from "../components/content/ContentIdeasTable";
import ContentIdeasCards from "../components/content/ContentIdeasCards";
import ContentIdeaEditor from "../components/content/ContentIdeaEditor";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Plus } from "lucide-react";
import { LANGUAGES, AUDIENCES, CONTENT_TYPES, STATUSES } from "../lib/constants";
import { cn } from "@/lib/utils";

export default function ContentIdeas() {
  const [ideas, setIdeas] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      base44.entities.ContentIdeas.list("-priority_score", 200),
      base44.entities.Clusters.list(),
      base44.entities.Pages.list(),
    ]).then(([i, c, p]) => {
      setIdeas(i); setClusters(c); setPages(p); setLoading(false);
    });
  };

  useEffect(() => { loadData(); }, []);

  const filterDefs = [
    { key: "language", label: "Language", options: LANGUAGES },
    { key: "content_type", label: "Type", options: CONTENT_TYPES },
    { key: "audience", label: "Audience", options: AUDIENCES },
    { key: "status", label: "Status", options: STATUSES },
    { key: "cluster_id", label: "Cluster", options: clusters.map(c => ({ value: c.id, label: c.name })) },
  ];

  const filtered = useMemo(() => {
    return ideas.filter(i => {
      if (search && !i.title?.toLowerCase().includes(search.toLowerCase()) && !i.primary_keyword?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filters.language && filters.language !== "all" && i.language !== filters.language) return false;
      if (filters.content_type && filters.content_type !== "all" && i.content_type !== filters.content_type) return false;
      if (filters.audience && filters.audience !== "all" && i.audience !== filters.audience) return false;
      if (filters.status && filters.status !== "all" && i.status !== filters.status) return false;
      if (filters.cluster_id && filters.cluster_id !== "all" && i.cluster_id !== filters.cluster_id) return false;
      return true;
    });
  }, [ideas, search, filters]);

  const clusterMap = useMemo(() => Object.fromEntries(clusters.map(c => [c.id, c])), [clusters]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Content Ideas" description={`${ideas.length} ideas tracked`}>
        <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
          <button onClick={() => setView("table")} className={cn("p-1.5 rounded-md transition-colors", view === "table" ? "bg-card shadow-sm" : "")}>
            <List className="h-4 w-4" />
          </button>
          <button onClick={() => setView("cards")} className={cn("p-1.5 rounded-md transition-colors", view === "cards" ? "bg-card shadow-sm" : "")}>
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5" /> New Idea
        </Button>
      </PageHeader>

      <FilterBar
        filters={filterDefs}
        values={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onReset={() => setFilters({})}
        searchValue={search}
        onSearchChange={setSearch}
      />

      {view === "table" ? (
        <ContentIdeasTable ideas={filtered} clusterMap={clusterMap} onEdit={setEditingId} />
      ) : (
        <ContentIdeasCards ideas={filtered} clusterMap={clusterMap} onEdit={setEditingId} />
      )}

      {(editingId || showCreate) && (
        <ContentIdeaEditor
          ideaId={editingId}
          clusters={clusters}
          pages={pages}
          onClose={() => { setEditingId(null); setShowCreate(false); }}
          onSaved={loadData}
        />
      )}
    </div>
  );
}