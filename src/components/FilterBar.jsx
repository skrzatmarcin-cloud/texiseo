import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FilterBar({ filters, values, onChange, onReset, searchValue, onSearchChange }) {
  const hasActive = Object.values(values).some(v => v && v !== "all");

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {onSearchChange && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchValue || ""}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Szukaj..."
            className="h-8 w-48 pl-8 text-xs"
          />
        </div>
      )}
      {filters.map(f => (
        <Select
          key={f.key}
          value={values[f.key] || "all"}
          onValueChange={v => onChange(f.key, v)}
        >
          <SelectTrigger className="h-8 w-auto min-w-[120px] text-xs">
            <SelectValue placeholder={f.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            {f.options.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {hasActive && (
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={onReset}>
          <X className="h-3 w-3" /> Wyczyść
        </Button>
      )}
    </div>
  );
}