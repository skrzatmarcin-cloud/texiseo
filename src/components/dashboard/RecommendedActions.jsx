import StatusBadge from "../StatusBadge";

export default function RecommendedActions({ recommendations }) {
  const pending = recommendations.filter(r => r.status === "pending").slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold mb-4">Recommended Next Actions</h3>
      {pending.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">No pending recommendations</p>
      ) : (
        <div className="space-y-2">
          {pending.map(r => (
            <div key={r.id} className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <StatusBadge status={r.priority} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">{r.short_text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.recommendation_type?.replace(/_/g, " ")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}