import ScoreBadge from "../ScoreBadge";
import StatusBadge from "../StatusBadge";
import { LANG_FLAG } from "../../lib/constants";
import { Pencil } from "lucide-react";

export default function ContentIdeasCards({ ideas, clusterMap, onEdit }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {ideas.map(idea => (
        <div
          key={idea.id}
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md hover:border-primary/20 transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{idea.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{idea.primary_keyword}</p>
            </div>
            <button onClick={() => onEdit(idea.id)} className="p-1 rounded hover:bg-secondary flex-shrink-0">
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status={idea.status} />
            <span className="text-[10px] text-muted-foreground">{LANG_FLAG[idea.language]}</span>
            <span className="text-[10px] text-muted-foreground capitalize">{idea.content_type?.replace(/_/g, " ")}</span>
          </div>

          <div className="flex items-center gap-2">
            <ScoreBadge score={idea.priority_score} label="Priority" />
            <ScoreBadge score={idea.conversion_score} label="Conv." />
            <ScoreBadge score={idea.topical_value_score} label="Topical" />
            <ScoreBadge score={idea.business_relevance_score} label="Biz" />
          </div>

          {idea.cluster_id && clusterMap[idea.cluster_id] && (
            <div className="mt-3 pt-2 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground">Cluster: </span>
              <span className="text-[10px] font-medium">{clusterMap[idea.cluster_id].name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}