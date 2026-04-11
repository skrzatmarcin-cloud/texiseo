import { useState } from "react";
import { Edit2, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const ACCENT_STYLES = {
  blue: "border-l-blue-400 bg-blue-50/50",
  emerald: "border-l-emerald-400 bg-emerald-50/50",
  amber: "border-l-amber-400 bg-amber-50/50",
  red: "border-l-red-400 bg-red-50/50",
  purple: "border-l-purple-400 bg-purple-50/50",
  slate: "border-l-slate-400 bg-slate-50/50",
};

export default function BriefSectionBlock({ label, content, accent = "slate", editable, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const accentClass = ACCENT_STYLES[accent] || ACCENT_STYLES.slate;

  return (
    <div className={cn("bg-card border border-border border-l-4 rounded-xl p-4", accentClass)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold">{label}</h3>
        {editable && !editing && (
          <button onClick={() => { setDraft(content); setEditing(true); }} className="text-[10px] text-primary hover:underline flex items-center gap-1">
            <Edit2 className="h-3 w-3" /> Edit
          </button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button onClick={() => { onSave?.(draft); setEditing(false); }} className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1">
              <Check className="h-3 w-3" /> Save
            </button>
            <button onClick={() => setEditing(false)} className="text-[10px] text-muted-foreground hover:underline">Cancel</button>
          </div>
        )}
      </div>
      {editing ? (
        <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="text-xs min-h-[80px]" />
      ) : (
        <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">{content}</p>
      )}
    </div>
  );
}