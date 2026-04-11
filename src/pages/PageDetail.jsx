import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { computePageHealth, detectWeaknesses, generateRecommendations } from "../lib/pageHealth";
import ScoreBadge from "../components/ScoreBadge";
import ScoreBar from "../components/ScoreBar";
import StatusBadge from "../components/StatusBadge";
import PageHealthPanel from "../components/pages/PageHealthPanel";
import PageWeaknessPanel from "../components/pages/PageWeaknessPanel";
import PageRecommendationsPanel from "../components/pages/PageRecommendationsPanel";
import { ArrowLeft, ExternalLink, CheckCircle2, X, Globe, Users, Tag, Link2 } from "lucide-react";
import { LANG_FLAG } from "../lib/constants";
import { cn } from "@/lib/utils";

function InfoRow({ label, value, muted }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-border/40 last:border-0">
      <span className="text-[11px] text-muted-foreground w-32 flex-shrink-0">{label}</span>
      <span className={cn("text-[11px] font-medium", muted && "text-muted-foreground")}>{value || "—"}</span>
    </div>
  );
}

export default function PageDetail() {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [cluster, setCluster] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Pages.filter({ id }).then(async ([p]) => {
      setPage(p || null);
      if (p?.cluster_id) {
        const [c] = await base44.entities.Clusters.filter({ id: p.cluster_id });
        setCluster(c || null);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Page not found</p>
        <Link to="/pages" className="text-sm text-primary hover:underline mt-2 inline-block">Back to Pages</Link>
      </div>
    );
  }

  const { score: healthScore, label: healthLabel } = computePageHealth(page);
  const weaknesses = detectWeaknesses(page);
  const recommendations = generateRecommendations(page);

  const healthColors = {
    healthy: "text-emerald-600 bg-emerald-50 ring-emerald-200",
    fair: "text-amber-600 bg-amber-50 ring-amber-200",
    weak: "text-red-600 bg-red-50 ring-red-200",
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      {/* Back */}
      <Link to="/pages" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Back to Pages
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight">{page.title}</h1>
            <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ring-1", healthColors[healthLabel])}>
              {healthScore} — {healthLabel.charAt(0).toUpperCase() + healthLabel.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
              {page.url} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[11px] bg-secondary px-2 py-0.5 rounded capitalize">{page.page_type?.replace(/_/g, " ")}</span>
            <span className="text-[11px] bg-secondary px-2 py-0.5 rounded">{LANG_FLAG[page.language]} {page.language?.toUpperCase()}</span>
            <span className="text-[11px] bg-secondary px-2 py-0.5 rounded capitalize">{page.audience}</span>
            <StatusBadge status={page.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="text-center">
            <ScoreBadge score={page.trust_score} size="lg" />
            <p className="text-[10px] text-muted-foreground mt-1">Trust</p>
          </div>
          <div className="text-center">
            <ScoreBadge score={page.conversion_score} size="lg" />
            <p className="text-[10px] text-muted-foreground mt-1">Conv.</p>
          </div>
          <div className="text-center">
            <ScoreBadge score={page.content_depth_score} size="lg" />
            <p className="text-[10px] text-muted-foreground mt-1">Depth</p>
          </div>
        </div>
      </div>

      {/* Weakness alert */}
      {weaknesses.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <X className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            {weaknesses.length} weakness{weaknesses.length !== 1 ? "es" : ""} detected — {recommendations.length} recommendation{recommendations.length !== 1 ? "s" : ""} generated.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-4">

          {/* Page Profile */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Page Profile</h3>
            <InfoRow label="Page Type" value={page.page_type?.replace(/_/g, " ")} />
            <InfoRow label="Language" value={`${LANG_FLAG[page.language]} ${page.language?.toUpperCase()}`} />
            <InfoRow label="Audience" value={page.audience} />
            <InfoRow label="CTA Type" value={page.cta_type?.replace(/_/g, " ")} />
            <InfoRow label="Status" value={<StatusBadge status={page.status} />} />
            <InfoRow label="Slug" value={page.slug} muted />
          </div>

          {/* Keyword Targeting */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-semibold">Keyword Targeting</h3>
            </div>
            <p className="text-[11px] text-muted-foreground mb-1">Primary keyword</p>
            <p className="text-xs font-medium mb-3">{page.primary_keyword || "Not set"}</p>
            {page.secondary_keywords?.length > 0 && (
              <>
                <p className="text-[11px] text-muted-foreground mb-2">Secondary keywords</p>
                <div className="flex flex-wrap gap-1">
                  {page.secondary_keywords.map((k, i) => (
                    <span key={i} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">{k}</span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Cluster & Strategic Role */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-semibold">Cluster & Strategic Role</h3>
            </div>
            {cluster ? (
              <div>
                <Link to={`/clusters/${cluster.id}`} className="text-xs font-medium text-primary hover:underline">{cluster.name}</Link>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{cluster.description}</p>
                <div className="mt-3 space-y-2">
                  <ScoreBar value={cluster.authority_score} label="Cluster Authority" />
                  <ScoreBar value={cluster.completeness_score} label="Cluster Completeness" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No cluster assigned — this page is operating in isolation.</p>
            )}
          </div>

          {/* Structural Signals */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-semibold">Structural Signals</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Internal links IN</span>
                <span className={cn("font-semibold", (page.internal_links_in_count || 0) < 3 ? "text-red-500" : "text-emerald-600")}>
                  {page.internal_links_in_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Internal links OUT</span>
                <span className={cn("font-semibold", (page.internal_links_out_count || 0) < 2 ? "text-red-500" : "text-emerald-600")}>
                  {page.internal_links_out_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">FAQ present</span>
                {page.faq_present
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  : <X className="h-4 w-4 text-red-400" />}
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Schema markup</span>
                {page.schema_present
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  : <X className="h-4 w-4 text-red-400" />}
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Decay risk</span>
                <span className={cn("font-medium capitalize", page.decay_risk === "high" ? "text-red-500" : page.decay_risk === "medium" ? "text-amber-500" : "text-emerald-600")}>
                  {page.decay_risk || "—"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-muted-foreground">Orphan risk</span>
                <span className={cn("font-medium capitalize", page.orphan_risk === "high" ? "text-red-500" : page.orphan_risk === "medium" ? "text-amber-500" : "text-emerald-600")}>
                  {page.orphan_risk || "—"}
                </span>
              </div>
            </div>
          </div>

          {page.notes && (
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Strategic Notes</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{page.notes}</p>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Health Scorecard */}
          <PageHealthPanel page={page} healthScore={healthScore} healthLabel={healthLabel} />

          {/* Weaknesses */}
          <PageWeaknessPanel weaknesses={weaknesses} />

          {/* Recommendations */}
          <PageRecommendationsPanel recommendations={recommendations} />
        </div>
      </div>
    </div>
  );
}