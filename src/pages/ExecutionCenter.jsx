import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Zap, RotateCcw, AlertTriangle, Play, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  pending:   { label: "Oczekuje",    color: "bg-slate-100 text-slate-600",   icon: Clock },
  executing: { label: "Wykonuje",    color: "bg-blue-50 text-blue-700",      icon: Zap },
  completed: { label: "Ukończono",   color: "bg-emerald-50 text-emerald-700",icon: CheckCircle2 },
  failed:    { label: "Błąd",        color: "bg-red-50 text-red-600",        icon: XCircle },
  reverted:  { label: "Cofnięto",   color: "bg-slate-100 text-slate-400",    icon: RotateCcw },
};

const ACTION_LABELS = {
  wordpress_update: "Aktualizacja WordPress",
  wordpress_create: "Nowy post WordPress",
  rankmath_update: "Aktualizacja Rank Math",
  blogger_publish: "Publikacja Blogger",
  medium_publish: "Publikacja Medium",
  pinterest_publish: "Publikacja Pinterest",
  facebook_publish: "Publikacja Facebook",
  instagram_publish: "Publikacja Instagram",
  backlink_publish: "Publikacja backlinka",
  content_generate: "Generowanie treści",
  seo_apply: "Zastosowanie SEO",
};

const SAFE_AUTO = ["medium_publish","blogger_publish","pinterest_publish","wordpress_create","wordpress_update","rankmath_update","seo_apply","content_generate"];

function LogRow({ log, onRetry, onRevert }) {
  const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 hover:bg-secondary/30 transition-colors">
      <Icon className={cn("h-4 w-4 flex-shrink-0", cfg.color.split(" ")[1])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-semibold">{ACTION_LABELS[log.action_type] || log.action_type}</p>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", cfg.color)}>{cfg.label}</span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{log.item_name || log.entity_id || "—"} · {log.platform || ""}</p>
        {log.error_message && <p className="text-[10px] text-red-500 mt-0.5">{log.error_message}</p>}
        {log.result_url && <a href={log.result_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">{log.result_url}</a>}
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] text-muted-foreground">
        {log.executed_at && <span>{log.executed_at}</span>}
        {log.status === "failed" && (
          <Button size="sm" variant="outline" className="h-6 text-[10px] gap-1" onClick={() => onRetry(log)}>
            <RotateCcw className="h-3 w-3" />Ponów
          </Button>
        )}
        {log.status === "completed" && (
          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-muted-foreground" onClick={() => onRevert(log)}>
            <RotateCcw className="h-3 w-3" />Cofnij
          </Button>
        )}
      </div>
    </div>
  );
}

function PlatformPostRow({ post, onApprove, onMarkPublished, onCopy }) {
  const [acting, setActing] = useState(false);
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 hover:bg-secondary/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs font-semibold truncate">{post.title || "Bez tytułu"}</p>
          <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded capitalize">{post.platform}</span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded",
            post.execution_mode === "auto" ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50")}>
            {post.execution_mode === "auto" ? "Auto" : "Ręczny"}
          </span>
        </div>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        {post.status === "approved" && post.execution_mode === "auto" && (
          <Button size="sm" className="h-7 text-xs gap-1 bg-primary" onClick={async () => { setActing(true); await onApprove(post); setActing(false); }} disabled={acting}>
            <Play className="h-3 w-3" />{acting ? "…" : "Wykonaj"}
          </Button>
        )}
        {post.status === "approved" && post.execution_mode === "manual" && (
          <>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onCopy(post.content)}>Kopiuj</Button>
            <Button size="sm" className="h-7 text-xs bg-teal-600 hover:bg-teal-700" onClick={() => onMarkPublished(post)}>Oznacz</Button>
          </>
        )}
      </div>
    </div>
  );
}

export default function ExecutionCenter() {
  const [logs, setLogs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("queue");

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.ExecutionLogs.list("-created_date", 50),
      base44.entities.PlatformPosts.filter({ status: "approved" }),
      base44.entities.BacklinkOpportunities.filter({ status: "ready_manual" }),
    ]).then(([l, p, o]) => { setLogs(l); setPosts(p); setOpportunities(o); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleApprovePost = async (post) => {
    await base44.entities.PlatformPosts.update(post.id, {
      status: "published",
      published_at: new Date().toISOString().split("T")[0],
    });
    await base44.entities.ExecutionLogs.create({
      action_type: `${post.platform}_publish`,
      entity_type: "PlatformPosts",
      entity_id: post.id,
      item_name: post.title,
      platform: post.platform,
      status: "completed",
      executed_at: new Date().toISOString().split("T")[0],
      triggered_by: "Marcin",
    });
    load();
  };

  const handleMarkPublished = async (post) => {
    await base44.entities.PlatformPosts.update(post.id, { status: "published", published_at: new Date().toISOString().split("T")[0] });
    load();
  };

  const handleCopy = (content) => navigator.clipboard.writeText(content || "");

  const handleRetry = async (log) => {
    await base44.entities.ExecutionLogs.update(log.id, { status: "pending" });
    load();
  };

  const handleRevert = async (log) => {
    await base44.entities.ExecutionLogs.update(log.id, { status: "reverted" });
    load();
  };

  const pendingCount = posts.length + opportunities.length;
  const recentFailed = logs.filter(l => l.status === "failed").length;

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Centrum Wykonania" description="Centralne centrum zarządzania wszystkimi działaniami systemu">
        <div className="flex items-center gap-2 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
          <Shield className="h-3.5 w-3.5" />SEO-SAFE aktywny
        </div>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Gotowe do wykonania", value: pendingCount, color: "text-primary", icon: Play },
          { label: "Ukończone dziś", value: logs.filter(l => l.status === "completed" && l.executed_at === new Date().toISOString().split("T")[0]).length, color: "text-emerald-500", icon: CheckCircle2 },
          { label: "Błędy", value: recentFailed, color: "text-red-500", icon: XCircle },
          { label: "Wszystkich logów", value: logs.length, color: "text-slate-500", icon: Clock },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4">
            <div className={cn("h-8 w-8 rounded-lg bg-secondary flex items-center justify-center mb-3", s.color)}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5">
        {[
          { id: "queue", label: `Kolejka do wykonania (${pendingCount})` },
          { id: "logs", label: `Historia logów (${logs.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors", tab === t.id ? "bg-card shadow-sm" : "text-muted-foreground")}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "queue" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {posts.length === 0 && opportunities.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm text-muted-foreground">Kolejka pusta — wszystko wykonane!</p>
            </div>
          ) : (
            <>
              {posts.map(p => <PlatformPostRow key={p.id} post={p} onApprove={handleApprovePost} onMarkPublished={handleMarkPublished} onCopy={handleCopy} />)}
              {opportunities.map(o => (
                <div key={o.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <div className="flex-1"><p className="text-xs font-semibold">{o.title}</p><p className="text-[11px] text-muted-foreground">Backlink ręczny · {o.platform_type}</p></div>
                  <a href={`/backlinks`} className="text-xs text-primary hover:underline">Przejdź →</a>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === "logs" && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">Brak logów. Zacznij wykonywać działania.</div>
          ) : (
            logs.map(l => <LogRow key={l.id} log={l} onRetry={handleRetry} onRevert={handleRevert} />)
          )}
        </div>
      )}
    </div>
  );
}