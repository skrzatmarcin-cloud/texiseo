import { cn } from "@/lib/utils";
import { Calendar, User, ChevronRight, ChevronLeft } from "lucide-react";
import { LANG_FLAG } from "../../lib/constants";

const PRIORITY_DOT = {
  critical: "bg-red-500",
  high: "bg-amber-400",
  medium: "bg-blue-400",
  low: "bg-slate-300",
};

const WORKFLOW_NEXT = {
  approved: "brief_ready",
  brief_ready: "writing",
  writing: "review",
  review: "seo_qa",
  seo_qa: "ready_to_publish",
  ready_to_publish: "published",
};
const WORKFLOW_PREV = Object.fromEntries(Object.entries(WORKFLOW_NEXT).map(([k, v]) => [v, k]));

export default function KanbanBoard({ items, statuses, workflowStatuses, clusterMap, onUpdate }) {
  const statusMap = Object.fromEntries(workflowStatuses.map(s => [s.value, s]));

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
      {statuses.map(status => {
        const col = statusMap[status];
        const colItems = items.filter(i => i.current_status === status);
        return (
          <div key={status} className="flex-shrink-0 w-64">
            <div className={cn("flex items-center justify-between px-3 py-2 rounded-t-xl border-b-2 border", col.color)}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{col.label}</span>
                <span className="text-[10px] bg-white/60 rounded-full px-1.5 py-0.5 font-bold">{colItems.length}</span>
              </div>
            </div>
            <div className={cn("rounded-b-xl border border-t-0 min-h-[400px] p-2 space-y-2", col.color, "bg-opacity-20")}>
              {colItems.map(item => (
                <KanbanCard key={item.id} item={item} clusterMap={clusterMap} onUpdate={onUpdate} workflowNext={WORKFLOW_NEXT} workflowPrev={WORKFLOW_PREV} statusMap={statusMap} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ item, clusterMap, onUpdate, workflowNext, workflowPrev, statusMap }) {
  const cluster = clusterMap[item.cluster_id];
  const nextStatus = workflowNext[item.current_status];
  const prevStatus = workflowPrev[item.current_status];

  return (
    <div className="bg-card rounded-lg border border-border p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-1 mb-2">
        <p className="text-xs font-semibold leading-tight line-clamp-2 flex-1">{item.title}</p>
        {item.priority && (
          <span className={cn("h-2 w-2 rounded-full flex-shrink-0 mt-1", PRIORITY_DOT[item.priority])} title={item.priority} />
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {item.language && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{LANG_FLAG[item.language]} {item.language?.toUpperCase()}</span>}
        {item.page_type && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded capitalize">{item.page_type?.replace(/_/g, " ")}</span>}
        {cluster && <span className="text-[10px] text-primary/70 truncate max-w-[120px]">{cluster.name}</span>}
      </div>

      {(item.assigned_to || item.due_date) && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
          {item.assigned_to && (
            <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" />{item.assigned_to}</span>
          )}
          {item.due_date && (
            <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" />{item.due_date}</span>
          )}
        </div>
      )}

      {item.blockers && (
        <p className="text-[10px] text-red-600 bg-red-50 rounded px-1.5 py-0.5 mb-2 truncate">⚠ {item.blockers}</p>
      )}

      <div className="flex gap-1 mt-2">
        {prevStatus && (
          <button
            onClick={() => onUpdate(item.id, { current_status: prevStatus })}
            className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground border border-border rounded px-1.5 py-0.5 transition-colors"
          >
            <ChevronLeft className="h-3 w-3" /> {statusMap[prevStatus]?.label}
          </button>
        )}
        {nextStatus && (
          <button
            onClick={() => onUpdate(item.id, { current_status: nextStatus })}
            className="flex items-center gap-0.5 text-[10px] text-primary hover:text-primary/80 border border-primary/30 rounded px-1.5 py-0.5 transition-colors ml-auto"
          >
            {statusMap[nextStatus]?.label} <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}