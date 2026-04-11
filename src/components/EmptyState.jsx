import { cn } from "@/lib/utils";

export default function EmptyState({ icon: Icon, title, description, className }) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      {Icon && (
        <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-xs text-muted-foreground max-w-xs">{description}</p>}
    </div>
  );
}