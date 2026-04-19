import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";

const LANGS = ["angielski", "hiszpański", "francuski", "inny"];
const AGE_GROUPS = ["4-7", "8-12", "13-17", "dorośli"];

export default function TeacherForm({ teacher, onClose, onSaved }) {
  const [form, setForm] = useState(teacher || {
    first_name: "", last_name: "", email: "", phone: "",
    bio: "", hourly_rate: "", currency: "PLN",
    status: "active", contract_type: "b2b",
    zoom_link: "", google_meet_link: "",
    languages: [], age_groups: [], specializations: [],
  });
  const [saving, setSaving] = useState(false);

  const toggleArr = (key, val) => {
    setForm(p => ({
      ...p,
      [key]: p[key]?.includes(val) ? p[key].filter(x => x !== val) : [...(p[key] || []), val],
    }));
  };

  const save = async () => {
    setSaving(true);
    const data = { ...form, hourly_rate: parseFloat(form.hourly_rate) || 0 };
    if (teacher?.id) {
      await base44.entities.Teachers.update(teacher.id, data);
    } else {
      await base44.entities.Teachers.create(data);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold">{teacher ? "Edytuj nauczyciela" : "Nowy nauczyciel"}</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Imię *</label>
              <Input value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Nazwisko *</label>
              <Input value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Email *</label>
            <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="h-8 text-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Telefon</label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Stawka (PLN/h)</label>
              <Input type="number" value={form.hourly_rate} onChange={e => setForm(p => ({ ...p, hourly_rate: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktywny</SelectItem>
                  <SelectItem value="inactive">Nieaktywny</SelectItem>
                  <SelectItem value="on_leave">Urlop</SelectItem>
                  <SelectItem value="trial">Próbny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Typ umowy</label>
              <Select value={form.contract_type} onValueChange={v => setForm(p => ({ ...p, contract_type: v }))}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="b2b">B2B</SelectItem>
                  <SelectItem value="umowa_zlecenie">Umowa zlecenie</SelectItem>
                  <SelectItem value="umowa_o_prace">Umowa o pracę</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="text-xs font-medium mb-2 block">Nauczane języki</label>
            <div className="flex flex-wrap gap-2">
              {LANGS.map(l => (
                <button key={l} type="button"
                  onClick={() => toggleArr("languages", l)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    form.languages?.includes(l) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                  }`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Age groups */}
          <div>
            <label className="text-xs font-medium mb-2 block">Grupy wiekowe</label>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map(g => (
                <button key={g} type="button"
                  onClick={() => toggleArr("age_groups", g)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    form.age_groups?.includes(g) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Link Zoom / Meet</label>
            <Input value={form.zoom_link} onChange={e => setForm(p => ({ ...p, zoom_link: e.target.value }))} placeholder="https://zoom.us/j/..." className="h-8 text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Opis nauczyciela…"
            />
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <Button variant="outline" className="flex-1 text-xs" onClick={onClose}>Anuluj</Button>
          <Button className="flex-1 text-xs gap-1.5" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Zapisz
          </Button>
        </div>
      </div>
    </div>
  );
}