import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ScoreBadge from "../ScoreBadge";
import { Search, ExternalLink, Zap, Hand } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  pending: "bg-slate-100 text-slate-600",
  approved: "bg-blue-50 text-blue-700",
  published_auto: "bg-emerald-100 text-emerald-800",
  published_manual: "bg-teal-50 text-teal-700",
  failed: "bg-red-50 text-red-600",
  removed: "bg-gray-100 text-gray-400",
};

const STATUS_LABELS = {
  pending: "Oczekuje", approved: "Zatwierdzony",
  published_auto: "Auto-opublikowany", published_manual: "Ręcznie opublikowany",
  failed: "Błąd", removed: "Usunięty",
};

export default function BacklinkDatabase({ backlinks }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterMode, setFilterMode] = useState("all");

  const filtered = backlinks.filter(b => {
    if (search && !b.platform?.toLowerCase().includes(search.toLowerCase()) && !b.linguatoons_url?.toLowerCase().includes(search.toLowerCase()) && !b.anchor_text?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterMode !== "all" && b.execution_mode !== filterMode) return false;
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj…" className="h-8 w-48 pl-8 text-xs" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            {Object.entries(STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterMode} onValueChange={setFilterMode}>
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tryb: Wszystkie</SelectItem>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="manual">Ręczny</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground">Platforma</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden md:table-cell">URL Linguatoons</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Kotwica</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Tryb</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Bezp.</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground hidden lg:table-cell">Trafność</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground hidden xl:table-cell">Opublikowano</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-3 py-2.5 font-medium capitalize">{b.platform || b.platform_type}</td>
                  <td className="px-3 py-2.5 hidden md:table-cell">
                    <span className="text-muted-foreground text-[10px] truncate max-w-[180px] block">{b.linguatoons_url || "—"}</span>
                  </td>
                  <td className="px-3 py-2.5 hidden lg:table-cell">
                    <span className="text-muted-foreground italic truncate max-w-[120px] block">{b.anchor_text || "—"}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {b.execution_mode === "auto"
                      ? <span className="flex items-center justify-center gap-1 text-emerald-600 text-[10px] font-medium"><Zap className="h-3 w-3" />Auto</span>
                      : <span className="flex items-center justify-center gap-1 text-amber-600 text-[10px] font-medium"><Hand className="h-3 w-3" />Ręczny</span>
                    }
                  </td>
                  <td className="px-3 py-2.5 text-center"><ScoreBadge score={b.safety_score} /></td>
                  <td className="px-3 py-2.5 text-center hidden lg:table-cell"><ScoreBadge score={b.relevance_score} /></td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-md", STATUS_STYLES[b.status] || "bg-secondary text-secondary-foreground")}>
                      {STATUS_LABELS[b.status] || b.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground hidden xl:table-cell">{b.published_at || "—"}</td>
                  <td className="px-3 py-2.5">
                    {b.external_url && (
                      <a href={b.external_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-xs text-muted-foreground">Brak backlinków pasujących do filtrów.</div>
          )}
        </div>
      </div>
    </div>
  );
}