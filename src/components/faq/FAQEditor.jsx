import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

const FAQ_TYPES = [
  { value: "seo_support", label: "SEO Support" },
  { value: "conversion", label: "Conversion" },
  { value: "objection_handling", label: "Objection Handling" },
  { value: "service_clarification", label: "Service Clarification" },
  { value: "process", label: "Process" },
  { value: "pricing_format", label: "Pricing / Format" },
];

export default function FAQEditor({ item, pages, onSave, onClose }) {
  const [form, setForm] = useState({
    question: item.question || "",
    answer: item.answer || "",
    faq_type: item.faq_type || "seo_support",
    language: item.language || "en",
    related_page_id: item.related_page_id || "",
    seo_value_score: item.seo_value_score || 70,
    conversion_value_score: item.conversion_value_score || 70,
    status: item.status || "active",
    ...(item.id ? { id: item.id } : {}),
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-semibold">{item.id ? "Edit FAQ Item" : "New FAQ Item"}</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Question</label>
            <Input value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))} placeholder="Enter the FAQ question…" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Answer</label>
            <Textarea value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))} placeholder="Write a concise, helpful answer…" className="min-h-[100px] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">FAQ Type</label>
              <Select value={form.faq_type} onValueChange={v => setForm(p => ({ ...p, faq_type: v }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{FAQ_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
              <Select value={form.language} onValueChange={v => setForm(p => ({ ...p, language: v }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[["en","English"],["pl","Polish"],["es","Spanish"],["fr","French"]].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Related Page</label>
            <Select value={form.related_page_id || "none"} onValueChange={v => setForm(p => ({ ...p, related_page_id: v === "none" ? "" : v }))}>
              <SelectTrigger className="text-xs"><SelectValue placeholder="Select page…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No linked page</SelectItem>
                {pages.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">SEO Value (0-100)</label>
              <Input type="number" min="0" max="100" value={form.seo_value_score} onChange={e => setForm(p => ({ ...p, seo_value_score: +e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Conversion Value (0-100)</label>
              <Input type="number" min="0" max="100" value={form.conversion_value_score} onChange={e => setForm(p => ({ ...p, conversion_value_score: +e.target.value }))} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving || !form.question || !form.answer}>
            {saving ? "Saving…" : "Save FAQ"}
          </Button>
        </div>
      </div>
    </div>
  );
}