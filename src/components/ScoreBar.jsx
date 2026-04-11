import { cn } from "@/lib/utils";

export default function ScoreBar({ value, max = 100, label, className }) {
  const pct = Math.min(100, Math.max(0, ((value || 0) / max) * 100));
  const getColor = () => {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 60) return "bg-blue-500";
    if (pct >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">{label}</span>
          <span className="text-[11px] font-semibold">{value ?? 0}%</span>
        </div>
      )}
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor())}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}