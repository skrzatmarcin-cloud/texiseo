import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import ScoreBar from "../components/ScoreBar";
import ScoreBadge from "../components/ScoreBadge";
import StatusBadge from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Lightbulb, AlertCircle } from "lucide-react";
import { LANG_FLAG } from "../lib/constants";

export default function ClusterDetail() {
  const { id } = useParams();
  const [cluster, setCluster] = useState(null);
  const [clusterPages, setClusterPages] = useState([]);
  const [clusterIdeas, setClusterIdeas] = useState([]);
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Clusters.filter({ id }),
      base44.entities.Pages.filter({ cluster_id: id }),
      base44.entities.ContentIdeas.filter({ cluster_id: id }),
      base44.entities.Pages.list(),
    ]).then(([c, p, i, ap]) => {
      setCluster(c[0] || null);
      setClusterPages(p);
      setClusterIdeas(i);
      setAllPages(ap);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!cluster) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Cluster not found</p>
        <Link to="/clusters" className="text-sm text-primary hover:underline mt-2 inline-block">Back to clusters</Link>
      </div>
    );
  }

  const pillarPage = allPages.find(p => p.id === cluster.pillar_page_id);

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <Link to="/clusters" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to Clusters
      </Link>

      <PageHeader
        title={cluster.name}
        description={cluster.description}
      />

      {/* Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <ScoreBar value={cluster.authority_score} label="Authority" />
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <ScoreBar value={cluster.completeness_score} label="Completeness" />
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex flex-col justify-center">
          <span className="text-2xl font-bold">{cluster.support_content_count || 0}</span>
          <span className="text-[11px] text-muted-foreground">Support Articles</span>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex flex-col justify-center">
          <span className="text-2xl font-bold">{cluster.missing_topics?.length || 0}</span>
          <span className="text-[11px] text-muted-foreground">Missing Topics</span>
        </div>
      </div>

      {/* Pillar page */}
      {pillarPage && (
        <div className="bg-card rounded-xl border border-primary/20 p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold">Pillar Page</span>
          </div>
          <p className="text-sm font-medium">{pillarPage.title}</p>
          <p className="text-[11px] text-muted-foreground">{pillarPage.url}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Assigned Pages */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-blue-500" />
            <h3 className="text-sm font-semibold">Assigned Pages ({clusterPages.length})</h3>
          </div>
          {clusterPages.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No pages assigned yet</p>
          ) : (
            <div className="space-y-2">
              {clusterPages.map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">{p.url}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Ideas */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Content Ideas ({clusterIdeas.length})</h3>
          </div>
          {clusterIdeas.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No ideas assigned yet</p>
          ) : (
            <div className="space-y-2">
              {clusterIdeas.map(i => (
                <div key={i.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50">
                  <ScoreBadge score={i.priority_score} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{i.title}</p>
                    <p className="text-[10px] text-muted-foreground">{LANG_FLAG[i.language]} {i.content_type?.replace(/_/g, " ")}</p>
                  </div>
                  <StatusBadge status={i.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Missing topics */}
      {cluster.missing_topics?.length > 0 && (
        <div className="bg-card rounded-xl border border-amber-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Missing Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {cluster.missing_topics.map((t, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-medium rounded-md ring-1 ring-amber-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {cluster.notes && (
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-2">Strategic Notes</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{cluster.notes}</p>
        </div>
      )}
    </div>
  );
}