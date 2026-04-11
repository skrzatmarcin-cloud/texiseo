import ScoreBar from "../ScoreBar";
import { TrendingUp, Link2, Zap, Hand, AlertTriangle, CheckCircle2 } from "lucide-react";

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className={`h-8 w-8 rounded-lg bg-secondary flex items-center justify-center mb-3 ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

export default function BacklinkPerformance({ backlinks }) {
  const total = backlinks.length;
  const published = backlinks.filter(b => b.status === "published_auto" || b.status === "published_manual").length;
  const auto = backlinks.filter(b => b.status === "published_auto").length;
  const manual = backlinks.filter(b => b.status === "published_manual").length;
  const failed = backlinks.filter(b => b.status === "failed").length;

  // By platform
  const byPlatform = {};
  backlinks.forEach(b => {
    const key = b.platform || b.platform_type || "inne";
    byPlatform[key] = (byPlatform[key] || 0) + 1;
  });

  // This week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const thisWeek = backlinks.filter(b => b.published_at && new Date(b.published_at) >= weekAgo).length;

  // Avg scores
  const avgSafety = total ? Math.round(backlinks.reduce((s, b) => s + (b.safety_score || 0), 0) / total) : 0;
  const avgRelevance = total ? Math.round(backlinks.reduce((s, b) => s + (b.relevance_score || 0), 0) / total) : 0;

  // Top performing
  const topPerforming = [...backlinks]
    .filter(b => b.status === "published_auto" || b.status === "published_manual")
    .sort((a, b) => (b.safety_score || 0) + (b.relevance_score || 0) - ((a.safety_score || 0) + (a.relevance_score || 0)))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Link2} label="Wszystkie backlinki" value={total} color="text-primary" />
        <StatCard icon={CheckCircle2} label="Opublikowane" value={published} color="text-emerald-500" />
        <StatCard icon={Zap} label="Auto-opublikowane" value={auto} color="text-blue-500" />
        <StatCard icon={Hand} label="Ręcznie opublikowane" value={manual} color="text-amber-500" />
        <StatCard icon={TrendingUp} label="Nowe w tym tygodniu" value={thisWeek} color="text-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* By platform */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-4">Backlinki według platformy</h3>
          {Object.keys(byPlatform).length === 0 ? (
            <p className="text-xs text-muted-foreground">Brak danych</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byPlatform).sort((a, b) => b[1] - a[1]).map(([plat, count]) => (
                <div key={plat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium capitalize">{plat}</span>
                    <span className="text-[11px] text-muted-foreground font-semibold">{count}</span>
                  </div>
                  <ScoreBar value={Math.round((count / Math.max(total, 1)) * 100)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quality */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold mb-4">Jakość portfela</h3>
          <div className="space-y-3 mb-4">
            <ScoreBar value={avgSafety} label="Śr. ocena bezpieczeństwa" />
            <ScoreBar value={avgRelevance} label="Śr. trafność" />
          </div>
          {failed > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{failed} backlink{failed > 1 ? "i" : ""} z błędem — sprawdź zakładkę Baza danych.</p>
            </div>
          )}
        </div>

        {/* Top performing */}
        <div className="bg-card rounded-xl border border-border p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold mb-4">Najlepsze backlinki</h3>
          {topPerforming.length === 0 ? (
            <p className="text-xs text-muted-foreground">Brak opublikowanych backlinków.</p>
          ) : (
            <div className="space-y-2">
              {topPerforming.map(b => (
                <div key={b.id} className="flex items-center gap-4 py-2 px-2 rounded-lg hover:bg-secondary/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium capitalize">{b.platform || b.platform_type}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{b.anchor_text || b.linguatoons_url}</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">Bezp.</p>
                      <p className="text-xs font-bold">{b.safety_score ?? "—"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-muted-foreground">Trafność</p>
                      <p className="text-xs font-bold">{b.relevance_score ?? "—"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}