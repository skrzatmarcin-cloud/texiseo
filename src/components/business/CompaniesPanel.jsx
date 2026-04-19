import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/LanguageContext";
import { Plus, Building2, Edit2, Phone, Mail, Globe, MapPin } from "lucide-react";
import CompanyForm from "./CompanyForm";
import { cn } from "@/lib/utils";

const STATUS_STYLES = {
  aktywna: "bg-emerald-50 text-emerald-700",
  nieaktywna: "bg-slate-100 text-slate-500",
  potencjalny: "bg-blue-50 text-blue-700",
  zawieszona: "bg-amber-50 text-amber-700",
};

export default function CompaniesPanel() {
  const { t } = useLanguage();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingCompany, setEditingCompany] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.BusinessClients.list("-created_date", 200);
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = companies.filter(c =>
    !search ||
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.nip?.includes(search) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Wszystkich firm", value: companies.length },
          { label: "Aktywnych", value: companies.filter(c => c.status === "aktywna").length, color: "text-emerald-600" },
          { label: "Potencjalnych", value: companies.filter(c => c.status === "potencjalny").length, color: "text-blue-600" },
          { label: "Nieaktywnych", value: companies.filter(c => c.status === "nieaktywna" || c.status === "zawieszona").length, color: "text-slate-500" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={cn("text-xl font-bold text-primary", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Szukaj po nazwie, NIP, mieście…"
          className="h-8 w-60 text-xs"
        />
        <Button size="sm" className="h-8 gap-1.5 ml-auto" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" />{t.add_company}
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Ładowanie…</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Brak firm — dodaj pierwszą klikając przycisk powyżej</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(company => (
            <div key={company.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{company.company_name}</p>
                  {company.industry && (
                    <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded capitalize">{company.industry}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", STATUS_STYLES[company.status] || STATUS_STYLES.aktywna)}>
                    {company.status}
                  </span>
                  <button
                    onClick={() => setEditingCompany(company)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                {(company.nip || company.regon) && (
                  <div className="flex gap-3">
                    {company.nip && <span className="font-mono">NIP: <strong className="text-foreground">{company.nip}</strong></span>}
                    {company.regon && <span className="font-mono">REGON: <strong className="text-foreground">{company.regon}</strong></span>}
                  </div>
                )}
                {(company.city || company.postal_code) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{company.postal_code && `${company.postal_code} `}{company.city}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <a href={`tel:${company.phone}`} className="hover:text-primary">{company.phone}</a>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <a href={`mailto:${company.email}`} className="hover:text-primary truncate">{company.email}</a>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary truncate">{company.website}</a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAdd || editingCompany) && (
        <CompanyForm
          company={editingCompany}
          onSave={() => { setShowAdd(false); setEditingCompany(null); load(); }}
          onClose={() => { setShowAdd(false); setEditingCompany(null); }}
        />
      )}
    </div>
  );
}