import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ALL_CITIES, getCityCodes, VOIVODESHIPS } from "@/lib/polishCities";
import { useLanguage } from "@/lib/LanguageContext";
import { X } from "lucide-react";

const INDUSTRIES = ["produkcja","handel","usługi","budowlana","spożywcza","metalurgiczna","chemiczna","odzieżowa","IT","logistyka","inne"];

export default function CompanyForm({ company, onSave, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(company || {
    company_name: "", nip: "", regon: "", krs: "", address: "",
    postal_code: "", city: "", voivodeship: "", phone: "", email: "",
    website: "", contact_person: "", industry: "inne", status: "aktywna", notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [cityCodes, setCityCodes] = useState(company?.city ? getCityCodes(company.city) : []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleCityChange = (city) => {
    set("city", city);
    const codes = getCityCodes(city);
    setCityCodes(codes);
    if (codes.length > 0) set("postal_code", codes[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (company?.id) {
      await base44.entities.BusinessClients.update(company.id, form);
    } else {
      await base44.entities.BusinessClients.create(form);
    }
    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-base">{company?.id ? "Edytuj firmę" : t.add_company}</h2>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.company_name} *</label>
              <Input value={form.company_name} onChange={e => set("company_name", e.target.value)} required className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.nip}</label>
              <Input value={form.nip} onChange={e => set("nip", e.target.value)} placeholder="000-000-00-00" className="text-sm font-mono" maxLength={13} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.regon}</label>
              <Input value={form.regon} onChange={e => set("regon", e.target.value)} placeholder="000000000" className="text-sm font-mono" maxLength={9} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">KRS</label>
              <Input value={form.krs} onChange={e => set("krs", e.target.value)} placeholder="0000000000" className="text-sm font-mono" maxLength={10} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Branża</label>
              <Select value={form.industry} onValueChange={v => set("industry", v)}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.address}</label>
              <Input value={form.address} onChange={e => set("address", e.target.value)} placeholder="ul. Przykładowa 1" className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.city}</label>
              <Select value={form.city} onValueChange={handleCityChange}>
                <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Wybierz miasto" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {ALL_CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.postal_code}</label>
              {cityCodes.length > 1 ? (
                <Select value={form.postal_code} onValueChange={v => set("postal_code", v)}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cityCodes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={form.postal_code} onChange={e => set("postal_code", e.target.value)} placeholder="00-000" className="text-sm font-mono" maxLength={6} />
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Województwo</label>
              <Select value={form.voivodeship} onValueChange={v => set("voivodeship", v)}>
                <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Wybierz" /></SelectTrigger>
                <SelectContent>
                  {VOIVODESHIPS.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.phone}</label>
              <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+48 000 000 000" className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.email}</label>
              <Input value={form.email} onChange={e => set("email", e.target.value)} type="email" className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Strona WWW</label>
              <Input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://" className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Osoba kontaktowa</label>
              <Input value={form.contact_person} onChange={e => set("contact_person", e.target.value)} className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{t.status}</label>
              <Select value={form.status} onValueChange={v => set("status", v)}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktywna">Aktywna</SelectItem>
                  <SelectItem value="nieaktywna">Nieaktywna</SelectItem>
                  <SelectItem value="potencjalny">Potencjalny</SelectItem>
                  <SelectItem value="zawieszona">Zawieszona</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Zapisywanie…" : t.save}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>{t.cancel}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}