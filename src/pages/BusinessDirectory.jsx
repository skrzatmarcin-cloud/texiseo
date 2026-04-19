import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Plus, Globe, MapPin, Phone, Mail, Star, Link2, Shield, Loader2, CheckCircle2, Network, Zap, Users, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAN_STYLES = {
  free: "bg-slate-100 text-slate-600",
  basic: "bg-blue-50 text-blue-700",
  premium: "bg-purple-50 text-purple-700",
  enterprise: "bg-amber-50 text-amber-700",
};

const CATEGORY_LABELS = {
  language_school: "Szkoła językowa",
  tutoring: "Korepetycje",
  "e-learning": "E-learning",
  kids_education: "Edukacja dzieci",
  adult_education: "Edukacja dorosłych",
  corporate_training: "Szkolenia firmowe",
  other: "Inne",
};

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [buildingNetwork, setBuildingNetwork] = useState(false);
  const [networkMsg, setNetworkMsg] = useState(null);
  const [tab, setTab] = useState("directory");

  const [form, setForm] = useState({
    business_name: "", description: "", category: "language_school",
    website_url: "", email: "", phone: "", city: "", country: "PL",
    languages_offered: [], plan: "free",
  });

  const load = async () => {
    const [biz, ex] = await Promise.all([
      base44.entities.BusinessDirectory.list("-created_date", 100),
      base44.entities.LinkExchanges.list("-created_date", 200),
    ]);
    setBusinesses(biz);
    setExchanges(ex);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.business_name) return;
    const slug = form.business_name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await base44.entities.BusinessDirectory.create({
      ...form,
      slug,
      backlink_url: `https://linguatoons.com/katalog/${slug}`,
      verified: false,
      active: true,
      featured: false,
    });
    setShowForm(false);
    setForm({ business_name: "", description: "", category: "language_school", website_url: "", email: "", phone: "", city: "", country: "PL", languages_offered: [], plan: "free" });
    load();
  };

  const buildNetwork = async () => {
    setBuildingNetwork(true);
    setNetworkMsg(null);
    const res = await base44.functions.invoke("linkExchangeAgent", { action: "build_network" });
    setNetworkMsg(res.data?.message || "Sieć zaktualizowana");
    setBuildingNetwork(false);
    load();
  };

  const linkCount = (bizId) => exchanges.filter(e => e.from_business_id === bizId || e.to_business_id === bizId).length;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Katalog Firm — Link Exchange Network" description="Każda firma w katalogu jest automatycznie linkowana do wszystkich innych">
        <button onClick={buildNetwork} disabled={buildingNetwork} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-secondary transition-all disabled:opacity-50">
          {buildingNetwork ? <><Loader2 className="h-4 w-4 animate-spin" />Buduje sieć…</> : <><Network className="h-4 w-4" />Zbuduj sieć linków</>}
        </button>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all">
          <Plus className="h-4 w-4" />Dodaj firmę
        </button>
      </PageHeader>

      {networkMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />{networkMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Firm w katalogu", value: businesses.length, icon: Users, color: "text-primary" },
          { label: "Aktywnych wymian linków", value: exchanges.filter(e => e.status === "active").length, icon: Link2, color: "text-emerald-600" },
          { label: "Zweryfikowanych", value: businesses.filter(b => b.verified).length, icon: Shield, color: "text-blue-600" },
          { label: "Premium / Enterprise", value: businesses.filter(b => b.plan === "premium" || b.plan === "enterprise").length, icon: Star, color: "text-amber-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <s.icon className={cn("h-4 w-4", s.color)} />
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* SEO Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <Zap className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-blue-800 leading-relaxed">
          <strong>Jak działa Link Exchange Network:</strong> Każda firma otrzymuje profil pod adresem <code>linguatoons.com/katalog/[slug]</code>. 
          AI automatycznie tworzy pary wymiany linków między wszystkimi firmami — dofollow, z naturalnymi kotwicami. 
          Linki są następnie propagowane przez Medium, Pinterest i Blogger dla maksymalnej widoczności SEO.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5">
        {[{ id: "directory", label: "Katalog firm" }, { id: "network", label: "Sieć linków" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn(
            "flex-1 py-2 rounded-lg text-xs font-medium transition-colors",
            tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}>{t.label}</button>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5 mb-5">
          <p className="text-sm font-semibold mb-4">Dodaj nową firmę do katalogu</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { key: "business_name", label: "Nazwa firmy *", placeholder: "np. Angielski dla dzieci Kowalski" },
              { key: "website_url", label: "Strona WWW", placeholder: "https://" },
              { key: "email", label: "Email", placeholder: "kontakt@firma.pl" },
              { key: "phone", label: "Telefon", placeholder: "+48 123 456 789" },
              { key: "city", label: "Miasto", placeholder: "Warszawa" },
              { key: "country", label: "Kraj", placeholder: "PL" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[11px] text-muted-foreground mb-1 block">{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-[11px] text-muted-foreground mb-1 block">Opis firmy</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Krótki opis działalności…" rows={2}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Kategoria</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Plan</label>
              <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none">
                {["free", "basic", "premium", "enterprise"].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90">Dodaj firmę</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm">Anuluj</button>
          </div>
        </div>
      )}

      {/* Directory grid */}
      {tab === "directory" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.length === 0 ? (
            <div className="sm:col-span-3 py-16 text-center">
              <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Brak firm w katalogu. Dodaj pierwszą!</p>
            </div>
          ) : businesses.map(b => (
            <div key={b.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{b.business_name}</p>
                    {b.verified && <Shield className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />}
                    {b.featured && <Star className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                  </div>
                  <span className={cn("inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium", PLAN_STYLES[b.plan])}>
                    {b.plan?.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{b.description || CATEGORY_LABELS[b.category]}</p>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                {b.city && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{b.city}, {b.country}</div>}
                {b.website_url && <a href={b.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:underline"><Globe className="h-3 w-3" />{b.website_url.replace("https://", "")}<ExternalLink className="h-2.5 w-2.5" /></a>}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-[11px] text-emerald-600">
                  <Link2 className="h-3 w-3" />
                  <span>{linkCount(b.id)} wymian linków</span>
                </div>
                <a href={`/katalog/${b.slug}`} className="text-[11px] text-primary hover:underline">Zobacz profil →</a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Network tab */}
      {tab === "network" && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Od firmy</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Do firmy</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Kotwica</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Typ</th>
                  <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {exchanges.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
                    Brak wymian linków. Dodaj firmy i kliknij "Zbuduj sieć linków".
                  </td></tr>
                ) : exchanges.map(e => {
                  const from = businesses.find(b => b.id === e.from_business_id);
                  const to = businesses.find(b => b.id === e.to_business_id);
                  return (
                    <tr key={e.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-2.5 font-medium">{from?.business_name || e.from_business_id}</td>
                      <td className="px-4 py-2.5">{to?.business_name || e.to_business_id}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">"{e.anchor_text}"</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-medium",
                          e.link_type === "dofollow" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        )}>{e.link_type}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={cn("px-2 py-0.5 rounded text-[10px]",
                          e.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        )}>{e.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}