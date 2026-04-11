import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function HealthCard({ label, value, status, sub }) {
  const colors = { green: "text-emerald-600 bg-emerald-50 border-emerald-200", yellow: "text-amber-600 bg-amber-50 border-amber-200", red: "text-red-600 bg-red-50 border-red-200", gray: "text-slate-500 bg-slate-50 border-slate-200" };
  const icons = { green: CheckCircle2, yellow: AlertTriangle, red: XCircle, gray: Activity };
  const Icon = icons[status] || Activity;
  return (
    <div className={cn("border rounded-xl p-4", colors[status] || colors.gray)}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <p className="text-[11px] font-medium">{label}</p>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {sub && <p className="text-[10px] opacity-75 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function WPHealthDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await base44.functions.invoke("wordpressProxy", { action: "get_stats" });
    setStats(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[200px]"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const cs = stats?.connection_status || "untested";
  const connStatus = cs === "connected" ? "green" : cs === "failed" || cs === "auth_error" ? "red" : "yellow";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground">Real-time health overview of your WordPress connection</p>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={load}><RefreshCw className="h-3 w-3" />Refresh</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <HealthCard label="Connection Status" value={cs === "connected" ? "Connected" : cs === "untested" ? "Not Tested" : "Failed"} status={connStatus} sub={stats?.last_tested ? `Tested ${new Date(stats.last_tested).toLocaleDateString()}` : "Never tested"} />
        <HealthCard label="Total Mapped Items" value={stats?.total_mapped || 0} status={stats?.total_mapped > 0 ? "green" : "gray"} sub={`${stats?.imported_posts || 0} posts · ${stats?.imported_pages || 0} pages`} />
        <HealthCard label="Synced" value={stats?.synced || 0} status={stats?.synced > 0 ? "green" : "gray"} sub="Confirmed in sync" />
        <HealthCard label="Conflicts" value={stats?.conflicts || 0} status={stats?.conflicts > 0 ? "red" : "green"} sub="Require manual decision" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <HealthCard label="Changed in WP" value={stats?.changed_in_wp || 0} status={stats?.changed_in_wp > 0 ? "yellow" : "green"} sub="WP modified after last sync" />
        <HealthCard label="Failed Syncs" value={stats?.failed || 0} status={stats?.failed > 0 ? "red" : "green"} sub="Need retry" />
        <HealthCard label="Imported Posts" value={stats?.imported_posts || 0} status="gray" />
        <HealthCard label="Imported Pages" value={stats?.imported_pages || 0} status="gray" />
      </div>

      {/* Action prompts */}
      <div className="bg-card border border-border rounded-xl p-4">
        <p className="text-xs font-semibold mb-3">Recommended Actions</p>
        <div className="space-y-2">
          {cs !== "connected" && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs text-red-700">WordPress connection not verified — test your credentials before syncing</p>
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium flex-shrink-0">Action Required</span>
            </div>
          )}
          {(stats?.conflicts || 0) > 0 && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-700">{stats.conflicts} content conflict{stats.conflicts > 1 ? "s" : ""} detected — review in Content Mapping</p>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium flex-shrink-0">Review Conflicts</span>
            </div>
          )}
          {(stats?.failed || 0) > 0 && (
            <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs text-red-700">{stats.failed} failed sync{stats.failed > 1 ? "s" : ""} — retry from Sync Logs</p>
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium flex-shrink-0">Retry Failed</span>
            </div>
          )}
          {(stats?.changed_in_wp || 0) > 0 && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <p className="text-xs text-amber-700">{stats.changed_in_wp} items changed in WordPress since last sync</p>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-medium flex-shrink-0">Run Sync</span>
            </div>
          )}
          {cs === "connected" && (stats?.conflicts || 0) === 0 && (stats?.failed || 0) === 0 && (stats?.changed_in_wp || 0) === 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <p className="text-xs text-emerald-700">All systems healthy — no action required</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent logs */}
      {stats?.recent_logs?.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 mt-3">
          <p className="text-xs font-semibold mb-3">Recent Activity</p>
          <div className="space-y-1.5">
            {stats.recent_logs.slice(0, 5).map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-[11px]">
                <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", log.result === "success" ? "bg-emerald-500" : log.result === "failed" ? "bg-red-500" : "bg-amber-400")} />
                <span className="text-muted-foreground">{new Date(log.created_date).toLocaleDateString()}</span>
                <span className="font-medium">{log.action_type?.replace(/_/g, " ")}</span>
                {log.item_name && <span className="text-muted-foreground truncate">{log.item_name}</span>}
                <span className={cn("ml-auto flex-shrink-0 font-medium", log.result === "success" ? "text-emerald-600" : "text-red-500")}>{log.result}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}