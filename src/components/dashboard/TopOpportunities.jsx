import { Link } from "react-router-dom";
import ScoreBadge from "../ScoreBadge";
import StatusBadge from "../StatusBadge";
import { LANG_FLAG } from "../../lib/constants";
import { ArrowRight } from "lucide-react";

export default function TopOpportunities({ ideas }) {
  const top = [...ideas]
    .sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))
    .slice(0, 6);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Top Content Opportunities</h3>
        <Link to="/content-ideas" className="text-xs text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-2">
        {top.map(idea => (
          <div key={idea.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
            <ScoreBadge score={idea.priority_score} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{idea.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">
                  {LANG_FLAG[idea.language]} {idea.content_type?.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            <StatusBadge status={idea.status} />
          </div>
        ))}
      </div>
    </div>
  );
}