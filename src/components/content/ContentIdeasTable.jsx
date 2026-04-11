import ScoreBadge from "../ScoreBadge";
import StatusBadge from "../StatusBadge";
import { LANG_FLAG } from "../../lib/constants";
import { Pencil } from "lucide-react";

export default function ContentIdeasTable({ ideas, clusterMap, onEdit }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Title</th>
              <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Type</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Lang</th>
              <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Cluster</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Priority</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Conv.</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Biz Rel.</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground w-10"></th>
            </tr>
          </thead>
          <tbody>
            {ideas.map(idea => (
              <tr key={idea.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="px-3 py-2.5">
                  <div className="max-w-[280px]">
                    <p className="font-medium text-foreground truncate">{idea.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">{idea.primary_keyword}</p>
                  </div>
                </td>
                <td className="px-3 py-2.5 hidden md:table-cell">
                  <span className="text-muted-foreground capitalize">{idea.content_type?.replace(/_/g, " ")}</span>
                </td>
                <td className="px-3 py-2.5 text-center">{LANG_FLAG[idea.language] || idea.language}</td>
                <td className="px-3 py-2.5 hidden lg:table-cell">
                  <span className="text-muted-foreground truncate max-w-[120px] block">
                    {clusterMap[idea.cluster_id]?.name || "—"}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center"><ScoreBadge score={idea.priority_score} /></td>
                <td className="px-3 py-2.5 text-center hidden md:table-cell"><ScoreBadge score={idea.conversion_score} /></td>
                <td className="px-3 py-2.5 text-center hidden lg:table-cell"><ScoreBadge score={idea.business_relevance_score} /></td>
                <td className="px-3 py-2.5 text-center"><StatusBadge status={idea.status} /></td>
                <td className="px-3 py-2.5 text-center">
                  <button onClick={() => onEdit(idea.id)} className="p-1 rounded hover:bg-secondary transition-colors">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}