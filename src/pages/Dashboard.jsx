import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Lightbulb, Network, FileText, Zap } from "lucide-react";
import DashboardStatCard from "../components/dashboard/DashboardStatCard";
import HomeHub from "../components/dashboard/HomeHub";

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
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto space-y-6">

      {/* Quick stat strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardStatCard
          icon={Lightbulb}
          label="Pomysły na treści"
          value={ideas.length}
          sub={`${highOpp.length} wysokich możliwości`}
          color="text-amber-500"
          to="/content-ideas"
        />
        <DashboardStatCard
          icon={Network}
          label="Klastry"
          value={clusters.length}
          sub={`${avgCompleteness}% śr. kompletność`}
          color="text-violet-500"
          to="/clusters"
        />
        <DashboardStatCard
          icon={FileText}
          label="Strony"
          value={pages.length}
          sub={`${weakPages.length} wymaga uwagi`}
          color="text-blue-500"
          to="/pages"
        />
        <DashboardStatCard
          icon={Zap}
          label="Rekomendacje"
          value={recommendations.filter(r => r.status === "pending").length}
          sub="oczekujące działania"
          color="text-emerald-500"
        />
      </div>

      {/* Main hub navigation */}
      <HomeHub />
    </div>
  );
}