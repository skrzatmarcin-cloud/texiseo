import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Download, FileText, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const SYNC_STATE_STYLES = {
  not_synced: "bg-slate-100 text-slate-500",
  imported: "bg-blue-50 text-blue-700",
  synced: "bg-emerald-50 text-emerald-700",
  changed_in_wordpress: "bg-amber-50 text-amber-700",
  changed_in_base44: "bg-purple-50 text-purple-700",
  conflict: "bg-red-50 text-red-700",
  failed: "bg-red-100 text-red-800",
  archived_in_wordpress: "bg-gray-100 text-gray-500",
};

export default function WPContentSync() {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [result, setResult] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.WordPressContentMap.list("-created_date");
    setMaps(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runSync = async (type) => {
    setSyncing(type);
    setResult(null);
    const res = await base44.functions.invoke("wordpressProxy", { action: type === "posts" ? "import_posts" : "import_pages", per_page: 50 });
    setResult(res.data);
    setSyncing(null);
    load();
  };

  const filtered = maps.filter(m => filter === "all" || m.sync_state === filter || m.wordpress_post_type === filter);

  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(filtered.length === selected.size ? new Set() : new Set(filtered.map(m => m.id)));

  return (
    <div>
      {/* Sync controls */}
      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold mb-3">Importuj z WordPress</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => runSync("posts")} disabled={!!syncing}>
            {syncing === "posts" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            Importuj wpisy
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => runSync("pages")} disabled={!!syncing}>
            {syncing === "pages" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            Importuj strony
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={load} disabled={!!syncing}>
            <RefreshCw className="h-3 w-3" />Odśwież status
          </Button>
        </div>
        {result && (
          <div className={cn("text-xs rounded-lg px-3 py-2 border", result.success ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700")}>
            {result.success ? `✓ ${result.imported} item(s) processed` : `Error: ${result.error}`}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-[10px] text-muted-foreground">
            Imports fetch posts/pages with their metadata — status, slug, categories, tags, modified date — and create or update entries in the Content Mapping table below.
            No Base44 content is overwritten. You control all merging decisions.
          </p>
        </div>
      </div>

      {/* Sync status overview */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
        {[
          { state: "all", label: "Wszystkie", count: maps.length },
          { state: "synced", label: "Zsync.", count: maps.filter(m => m.sync_state === "synced").length },
          { state: "imported", label: "Zaimportowane", count: maps.filter(m => m.sync_state === "imported").length },
          { state: "changed_in_wordpress", label: "Zmienione WP", count: maps.filter(m => m.sync_state === "changed_in_wordpress").length },
          { state: "conflict", label: "Konflikt", count: maps.filter(m => m.sync_state === "conflict").length },
          { state: "failed", label: "Błąd", count: maps.filter(m => m.sync_state === "failed").length },
        ].map(s => (
          <button key={s.state} onClick={() => setFilter(s.state)}
            className={cn("rounded-lg border p-2 text-center cursor-pointer transition-all text-xs",
              filter === s.state ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/30")}>
            <p className="text-lg font-bold">{s.count}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={filtered.length > 0 && selected.size === filtered.length} onChange={toggleAll} className="rounded" />
            <p className="text-xs font-semibold">{filtered.length} items</p>
          </div>
          {selected.size > 0 && (
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="w-8 px-4 py-2"></th>
                <th className="text-left px-4 py-2 font-semibold">Title</th>
                <th className="text-left px-4 py-2 font-semibold">WP Type</th>
                <th className="text-left px-4 py-2 font-semibold">WP Status</th>
                <th className="text-left px-4 py-2 font-semibold">Sync State</th>
                <th className="text-left px-4 py-2 font-semibold hidden lg:table-cell">WP Modified</th>
                <th className="text-left px-4 py-2 font-semibold hidden lg:table-cell">Last Synced</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-8 text-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center">
                  <FileText className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-muted-foreground">Brak zaimportowanych elementów — uruchom import powyżej.</p>
                </td></tr>
              ) : filtered.map(m => (
                <tr key={m.id} className="border-b border-border/50 hover:bg-secondary/20">
                  <td className="px-4 py-2.5"><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} className="rounded" /></td>
                  <td className="px-4 py-2.5">
                    <p className="font-medium truncate max-w-[220px]">{m.base44_title || "Untitled"}</p>
                    {m.wordpress_slug && <p className="text-[10px] text-muted-foreground font-mono">/{m.wordpress_slug}</p>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-secondary px-1.5 py-0.5 rounded text-[10px] font-medium capitalize">{m.wordpress_post_type}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[10px] capitalize">{m.wordpress_status || "—"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium", SYNC_STATE_STYLES[m.sync_state] || SYNC_STATE_STYLES.not_synced)}>
                      {(m.sync_state || "not_synced").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-[10px] text-muted-foreground">
                    {m.wordpress_modified_gmt ? new Date(m.wordpress_modified_gmt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-[10px] text-muted-foreground">
                    {m.wordpress_last_synced_at ? new Date(m.wordpress_last_synced_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2.5">
                    {m.wordpress_permalink && (
                      <a href={m.wordpress_permalink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">View ↗</a>
                    )}
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