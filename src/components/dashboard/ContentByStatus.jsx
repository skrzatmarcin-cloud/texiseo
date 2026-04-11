import { useMemo } from "react";
import ScoreBar from "../ScoreBar";

const STATUS_ORDER = ["idea", "approved", "in_progress", "draft_ready", "published", "archived"];
const STATUS_LABELS = {
  idea: "Pomysł", approved: "Zatwierdzony", in_progress: "W trakcie",
  draft_ready: "Szkic gotowy", published: "Opublikowany", archived: "Zarchiwizowany"
};

export default function ContentByStatus({ ideas }) {
  const statusCounts = useMemo(() => {
    const counts = {};
    ideas.forEach(i => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    return counts;
  }, [ideas]);

  const total = ideas.length || 1;

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold mb-4">Pomysły na treści według statusu</h3>
      <div className="space-y-3">
        {STATUS_ORDER.map(s => (
          <div key={s}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{STATUS_LABELS[s]}</span>
              <span className="text-[11px] text-muted-foreground font-semibold">{statusCounts[s] || 0}</span>
            </div>
            <ScoreBar value={Math.round(((statusCounts[s] || 0) / total) * 100)} />
          </div>
        ))}
      </div>
    </div>
  );
}