import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function DashboardStatCard({ icon: Icon, label, value, sub, color, to }) {
  const Wrapper = to ? Link : "div";
  const wrapperProps = to ? { to } : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        "bg-card rounded-xl border border-border p-4 transition-all hover:shadow-md hover:border-primary/20",
        to && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("h-9 w-9 rounded-lg bg-secondary flex items-center justify-center", color)}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground/70 mt-1">{sub}</div>}
    </Wrapper>
  );
}