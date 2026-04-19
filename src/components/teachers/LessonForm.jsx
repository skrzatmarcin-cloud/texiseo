import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Loader2 } from "lucide-react";

export default function LessonForm({ lesson, teachers, onClose, onSaved }) {
  const [form, setForm] = useState(lesson || {
    teacher_id: "", student_name: "", student_email: "",
    lesson_date: new Date().toISOString().split("T")[0],
    lesson_time: "10:00", duration_minutes: 50,
    language: "angielski", level: "A1", lesson_type: "individual",
    status: "scheduled", rate_at_time: 0, amount_due: 0,
    lesson_notes: "", homework: "", topic_covered: "",
  });
  const [saving, setSaving] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = { ...form, duration_minutes: Number(form.duration_minutes), rate_at_time: Number(form.rate_at_time), amount_due: Number(form.amount_due) };
    if (lesson?.id) await base44.entities.TeacherLessons.update(lesson.id, data);
    else await base44.entities.TeacherLessons.create(data);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold">{lesson ? "Edytuj lekcję" : "Nowa lekcja"}</h2>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Nauczyciel *</label>
            <Select value={form.teacher_id} onValueChange={v => f("teacher_id", v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Wybierz nauczyciela" /></SelectTrigger>
              <SelectContent>
                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.first_name} {t.last_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Imię ucznia *</label>
              <Input value={form.student_name} onChange={e => f("student_name", e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Email ucznia</label>
              <Input type="email" value={form.student_email} onChange={e => f("student_email", e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Data *</label>
              <Input type="date" value={form.lesson_date} onChange={e => f("lesson_date", e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Godzina *</label>
              <Input type="time" value={form.lesson_time} onChange={e => f("lesson_time", e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Język</label>
              <Select value={form.language} onValueChange={v => f("language", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="angielski">Angielski</SelectItem>
                  <SelectItem value="hiszpański">Hiszpański</SelectItem>
                  <SelectItem value="francuski">Francuski</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Poziom</label>
              <Select value={form.level} onValueChange={v => f("level", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["A1","A2","B1","B2","C1","C2"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Status</label>
              <Select value={form.status} onValueChange={v => f("status", v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Zaplanowana</SelectItem>
                  <SelectItem value="completed">Ukończona</SelectItem>
                  <SelectItem value="cancelled">Anulowana</SelectItem>
                  <SelectItem value="no_show">Nieobecność</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Stawka (PLN)</label>
              <Input type="number" value={form.rate_at_time} onChange={e => f("rate_at_time", e.target.value)} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Do zapłaty (PLN)</label>
              <Input type="number" value={form.amount_due} onChange={e => f("amount_due", e.target.value)} className="h-8 text-xs" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Temat lekcji</label>
            <Input value={form.topic_covered} onChange={e => f("topic_covered", e.target.value)} className="h-8 text-xs" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Notatki z lekcji</label>
            <textarea value={form.lesson_notes} onChange={e => f("lesson_notes", e.target.value)}
              rows={2} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Zadanie domowe</label>
            <textarea value={form.homework} onChange={e => f("homework", e.target.value)}
              rows={2} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <Button variant="outline" className="flex-1 text-xs" onClick={onClose}>Anuluj</Button>
          <Button className="flex-1 text-xs gap-1.5" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Zapisz
          </Button>
        </div>
      </div>
    </div>
  );
}