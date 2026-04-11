import { cn } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import { LANG_FLAG } from "../../lib/constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRIORITY_STYLES = {
  critical: "text-red-600 bg-red-50",
  high: "text-amber-700 bg-amber-50",
  medium: "text-blue-600 bg-blue-50",
  low: "text-slate-500 bg-slate-100",
};

export default function QueueTable({ items, workflowStatuses, clusterMap, onUpdate }) {
  const statusMap = Object.fromEntries(workflowStatuses.map(s => [s.value, s]));

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Title</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Language</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Cluster</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">Priority</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Owner</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Due</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground hidden xl:table-cell">Publish</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const cluster = clusterMap[item.cluster_id];
              const statusInfo = statusMap[item.current_status];
              return (
                <tr key={item.id} className={cn("border-b border-border/50 hover:bg-secondary/30 transition-colors", i % 2 !== 0 && "bg-secondary/10")}>
                  <td className="px-4 py-3">
                    <p className="font-semibold truncate max-w-[240px]">{item.title}</p>
                    {item.page_type && <p className="text-[10px] text-muted-foreground capitalize mt-0.5">{item.page_type?.replace(/_/g, " ")}</p>}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {item.language && <span className="text-sm">{LANG_FLAG[item.language]} {item.language?.toUpperCase()}</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-muted-foreground truncate max-w-[120px] block">{cluster?.name || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={item.current_status} onValueChange={v => onUpdate(item.id, { current_status: v })}>
                      <SelectTrigger className={cn("h-6 w-auto text-[10px] border px-2 rounded-md", statusInfo?.color)}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {workflowStatuses.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {item.priority && (
                      <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize", PRIORITY_STYLES[item.priority])}>
                        {item.priority}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {item.assigned_to ? (
                      <span className="flex items-center gap-1 text-muted-foreground"><User className="h-3 w-3" />{item.assigned_to}</span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {item.due_date ? (
                      <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3 w-3" />{item.due_date}</span>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-muted-foreground">{item.publish_date || "—"}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No queue items match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}