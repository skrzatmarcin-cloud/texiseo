import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Lightbulb, Network, FileText, TrendingUp, AlertTriangle, Zap, ArrowRight } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ScoreBar from "../components/ScoreBar";
import DashboardStatCard from "../components/dashboard/DashboardStatCard";
import TopOpportunities from "../components/dashboard/TopOpportunities";
import ClusterSnapshot from "../components/dashboard/ClusterSnapshot";
import WeakPages from "../components/dashboard/WeakPages";
import RecommendedActions from "../components/dashboard/RecommendedActions";
import ContentByStatus from "../components/dashboard/ContentByStatus";

export default function Dashboard() {
  const [ideas, setIdeas] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [pages, setPages] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.ContentIdeas.list(),
      base44.entities.Clusters.list(),
      base44.entities.Pages.list(),
      base44.entities.Recommendations.list(),
    ]).then(([i, c, p, r]) => {
      setIdeas(i); setClusters(c); setPages(p); setRecommendations(r);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const weakPages = pages.filter(p => (p.trust_score || 0) < 40 || (p.content_depth_score || 0) < 40);
  const highOpp = ideas.filter(i => (i.priority_score || 0) >= 70);
  const avgCompleteness = clusters.length
    ? Math.round(clusters.reduce((s, c) => s + (c.completeness_score || 0), 0) / clusters.length)
    : 0;

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="Dashboard"
        description="SEO command center for Linguatoons.com"
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <DashboardStatCard
          icon={Lightbulb}
          label="Content Ideas"
          value={ideas.length}
          sub={`${highOpp.length} high opportunity`}
          color="text-amber-500"
          to="/content-ideas"
        />
        <DashboardStatCard
          icon={Network}
          label="Clusters"
          value={clusters.length}
          sub={`${avgCompleteness}% avg completeness`}
          color="text-violet-500"
          to="/clusters"
        />
        <DashboardStatCard
          icon={FileText}
          label="Pages"
          value={pages.length}
          sub={`${weakPages.length} need attention`}
          color="text-blue-500"
          to="/pages"
        />
        <DashboardStatCard
          icon={Zap}
          label="Recommendations"
          value={recommendations.filter(r => r.status === "pending").length}
          sub="pending actions"
          color="text-emerald-500"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopOpportunities ideas={ideas} />
        <ClusterSnapshot clusters={clusters} />
        <WeakPages pages={pages} />
        <RecommendedActions recommendations={recommendations} />
        <ContentByStatus ideas={ideas} />
      </div>
    </div>
  );
}