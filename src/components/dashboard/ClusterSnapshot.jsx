import { Link } from "react-router-dom";
import ScoreBar from "../ScoreBar";
import { ArrowRight } from "lucide-react";

export default function ClusterSnapshot({ clusters }) {
  const sorted = [...clusters].sort((a, b) => (a.completeness_score || 0) - (b.completeness_score || 0));

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Cluster Coverage</h3>
        <Link to="/clusters" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {sorted.slice(0, 8).map(c => (
          <div key={c.id}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium truncate max-w-[60%]">{c.name}</span>
              <span className="text-[10px] text-muted-foreground">
                {c.support_content_count || 0} articles
              </span>
            </div>
            <ScoreBar value={c.completeness_score} />
          </div>
        ))}
      </div>
    </div>
  );
}