import { Link } from "react-router-dom";
import ScoreBadge from "../ScoreBadge";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function WeakPages({ pages }) {
  const weak = pages
    .filter(p => (p.trust_score || 0) < 50 || (p.content_depth_score || 0) < 50)
    .sort((a, b) => (a.trust_score || 0) - (b.trust_score || 0))
    .slice(0, 5);

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold">Słabe strony</h3>
        </div>
        <Link to="/pages" className="text-xs text-primary hover:underline flex items-center gap-1">
          Pokaż wszystkie <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {weak.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">Wszystkie strony wyglądają świetnie!</p>
      ) : (
        <div className="space-y-2">
          {weak.map(page => (
            <div key={page.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{page.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{page.url}</p>
              </div>
              <div className="flex gap-1.5">
                <ScoreBadge score={page.trust_score} label="Trust" />
                <ScoreBadge score={page.content_depth_score} label="Depth" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}