import { cn } from "@/lib/utils";

export default function ScoreBadge({ score, size = "sm", label }) {
  const getColor = (s) => {
    if (s >= 80) return "text-emerald-600 bg-emerald-50 ring-emerald-200";
    if (s >= 60) return "text-blue-600 bg-blue-50 ring-blue-200";
    if (s >= 40) return "text-amber-600 bg-amber-50 ring-amber-200";
    return "text-red-600 bg-red-50 ring-red-200";
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold ring-1",
          getColor(score || 0),
          size === "sm" && "text-xs h-6 w-10",
          size === "md" && "text-sm h-8 w-12",
          size === "lg" && "text-base h-10 w-14"
        )}
      >
        {score ?? "—"}
      </span>
      {label && <span className="text-[10px] text-muted-foreground">{label}</span>}
    </div>
  );
}