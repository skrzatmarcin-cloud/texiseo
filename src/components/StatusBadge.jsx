import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  idea: "bg-slate-100 text-slate-600 ring-slate-200",
  approved: "bg-blue-50 text-blue-700 ring-blue-200",
  in_progress: "bg-amber-50 text-amber-700 ring-amber-200",
  draft_ready: "bg-purple-50 text-purple-700 ring-purple-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  archived: "bg-gray-100 text-gray-500 ring-gray-200",
  live: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  needs_update: "bg-amber-50 text-amber-700 ring-amber-200",
  deprecated: "bg-red-50 text-red-600 ring-red-200",
  pending: "bg-slate-100 text-slate-600 ring-slate-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  dismissed: "bg-gray-100 text-gray-500 ring-gray-200",
  critical: "bg-red-50 text-red-600 ring-red-200",
  high: "bg-amber-50 text-amber-700 ring-amber-200",
  medium: "bg-blue-50 text-blue-600 ring-blue-200",
  low: "bg-slate-100 text-slate-600 ring-slate-200",
};

const LABELS = {
  idea: "Pomysł", approved: "Zatwierdzony", in_progress: "W trakcie",
  draft_ready: "Szkic gotowy", published: "Opublikowany", archived: "Zarchiwizowany",
  live: "Aktywna", draft: "Szkic", needs_update: "Wymaga aktualizacji",
  deprecated: "Przestarzała", pending: "Oczekuje", completed: "Ukończony",
  dismissed: "Odrzucony", critical: "Krytyczny", high: "Wysoki",
  medium: "Średni", low: "Niski",
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 whitespace-nowrap",
      STATUS_STYLES[status] || "bg-secondary text-secondary-foreground ring-border"
    )}>
      {LABELS[status] || status.replace(/_/g, " ")}
    </span>
  );
}