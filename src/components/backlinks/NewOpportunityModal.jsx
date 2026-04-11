import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const SAFE_PLATFORMS = ["medium", "pinterest", "blogger", "wordpress_external"];

const PLATFORM_OPTIONS = [
  { value: "medium", label: "Medium" },
  { value: "pinterest", label: "Pinterest" },
  { value: "blogger", label: "Blogger" },
  { value: "wordpress_external", label: "WordPress (zewnętrzny)" },
  { value: "reddit", label: "Reddit" },
  { value: "quora", label: "Quora" },
  { value: "forum", label: "Forum" },
  { value: "directory", label: "Katalog" },
  { value: "community", label: "Społeczność" },
];

export default function NewOpportunityModal({ open, onClose, onSaved }) {
  const [data, setData] = useState({
    title: "", platform_type: "medium", topic: "",
    target_url: "https://linguatoons.com",
    platform_url: "", language: "en",
    safety_score: 80, relevance_score: 70, notes: "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setData(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const execution_mode = SAFE_PLATFORMS.includes(data.platform_type) ? "auto" : "manual";
    await base44.entities.BacklinkOpportunities.create({ ...data, execution_mode, status: "idea" });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nowa okazja backlinkowa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div>
            <Label className="text-xs">Tytuł okazji</Label>
            <Input value={data.title} onChange={e => set("title", e.target.value)} className="mt-1" placeholder="np. Artykuł o nauce angielskiego na Medium" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Platforma</Label>
              <Select value={data.platform_type} onValueChange={v => set("platform_type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORM_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Język</Label>
              <Select value={data.language} onValueChange={v => set("language", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">Angielski</SelectItem>
                  <SelectItem value="pl">Polski</SelectItem>
                  <SelectItem value="es">Hiszpański</SelectItem>
                  <SelectItem value="fr">Francuski</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs">Temat / Kąt contentu</Label>
            <Input value={data.topic} onChange={e => set("topic", e.target.value)} className="mt-1" placeholder="np. nauka angielskiego dla dzieci przez zabawę" />
          </div>
          <div>
            <Label className="text-xs">URL docelowy Linguatoons</Label>
            <Input value={data.target_url} onChange={e => set("target_url", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">URL platformy (opcjonalne)</Label>
            <Input value={data.platform_url} onChange={e => set("platform_url", e.target.value)} className="mt-1" placeholder="np. konkretny wątek na forum" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Ocena bezpieczeństwa (0-100)</Label>
              <Input type="number" min={0} max={100} value={data.safety_score} onChange={e => set("safety_score", parseInt(e.target.value) || 0)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Trafność (0-100)</Label>
              <Input type="number" min={0} max={100} value={data.relevance_score} onChange={e => set("relevance_score", parseInt(e.target.value) || 0)} className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Notatki</Label>
            <Textarea value={data.notes} onChange={e => set("notes", e.target.value)} className="mt-1" rows={2} />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[11px] text-blue-700">
            Tryb wykonania zostanie ustawiony automatycznie: <strong>{SAFE_PLATFORMS.includes(data.platform_type) ? "Auto (bezpieczna platforma)" : "Ręczny"}</strong>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Anuluj</Button>
          <Button onClick={handleSave} disabled={saving || !data.title}>{saving ? "Zapisuję…" : "Dodaj okazję"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}