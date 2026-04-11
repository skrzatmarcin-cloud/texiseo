import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_LABELS = {
  connection_test: "Connection Test", import_posts: "Import Posts", import_pages: "Import Pages",
  create_draft: "Create Draft", update_draft: "Update Draft", update_page: "Update Page",
  sync_conflict: "Sync Conflict", failed_auth: "Auth Failed", failed_api: "API Failed",
  manual_sync: "Manual Sync", bulk_sync: "Bulk Sync", credentials_check: "Credentials Check",
};

const RESULT_STYLES = {
  success: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-600",
  skipped: "bg-slate-100 text-slate-500",
  conflict: "bg-amber-50 text-amber-700",
};

export default function WPSyncLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    base44.entities.WordPressSyncLog.list("-created_date", 200).then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => logs.filter(l => {
    if (filters.result && filters.result !== "all" && l.result !== filters.result) return false;
    if (filters.action_type && filters.action_type !== "all" && l.action_type !== filters.action_type) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!l.item_name?.toLowerCase().includes(q) && !l.base44_record_id?.toLowerCase().includes(q) && !String(l.wordpress_id || "").includes(q)) return false;
    }
    return true;
  }), [logs, filters, search]);

  const hasActive = search || Object.values(filters).some(v => v && v !== "all");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or ID…" className="h-8 w-52 pl-8 text-xs" />
        </div>
        <Select value={filters.result || "all"} onValueChange={v => setFilters(p => ({ ...p, result: v }))}>
          <SelectTrigger className="h-8 w-auto min-w-[110px] text-xs"><SelectValue placeholder="Result" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Results</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="skipped">Skipped</SelectItem>
            <SelectItem value="conflict">Conflict</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.action_type || "all"} onValueChange={v => setFilters(p => ({ ...p, action_type: v }))}>
          <SelectTrigger className="h-8 w-auto min-w-[140px] text-xs"><SelectValue placeholder="Action Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {Object.entries(ACTION_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasActive && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setFilters({}); setSearch(""); }}><X className="h-3 w-3" />Clear</Button>}
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} entries</span>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                <th className="text-left px-4 py-2.5 font-semibold">Date / Time</th>
                <th className="text-left px-4 py-2.5 font-semibold">Action</th>
                <th className="text-left px-4 py-2.5 font-semibold">Item</th>
                <th className="text-left px-4 py-2.5 font-semibold hidden md:table-cell">WP ID</th>
                <th className="text-left px-4 py-2.5 font-semibold hidden lg:table-cell">Triggered By</th>
                <th className="text-center px-4 py-2.5 font-semibold">Result</th>
                <th className="text-left px-4 py-2.5 font-semibold hidden lg:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center">
                  <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">No log entries yet. Run a sync to generate logs.</p>
                </td></tr>
              ) : filtered.map((log, i) => (
                <tr key={log.id || i} className={cn("border-b border-border/40 hover:bg-secondary/20", i % 2 === 1 ? "bg-secondary/10" : "")}>
                  <td className="px-4 py-2.5 text-[10px] text-muted-foreground whitespace-nowrap">
                    {log.created_date ? new Date(log.created_date).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap">
                      {ACTION_LABELS[log.action_type] || log.action_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="truncate max-w-[160px] font-medium">{log.item_name || "—"}</p>
                    {log.base44_record_id && <p className="text-[9px] text-muted-foreground font-mono truncate">{log.base44_record_id}</p>}
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-[10px] font-mono">
                    {log.wordpress_id ? `#${log.wordpress_id}` : "—"}
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-[10px] text-muted-foreground">{log.triggered_by || "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium", RESULT_STYLES[log.result] || RESULT_STYLES.skipped)}>
                      {log.result === "success" ? <CheckCircle2 className="h-3 w-3" /> : log.result === "failed" ? <XCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {log.result}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-[10px] text-muted-foreground max-w-[200px]">
                    <p className="truncate">{log.error_message || "—"}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}