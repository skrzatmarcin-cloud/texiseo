import { useState, useEffect } from "react";
import { Building2, Package, Factory, Truck, BarChart3, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { base44 } from "@/api/base44Client";
import CompaniesPanel from "../components/business/CompaniesPanel";
import InventoryPanel from "../components/business/InventoryPanel";
import ProductionPanel from "../components/business/ProductionPanel";

const TABS = [
  { id: "companies", labelKey: "companies", icon: Building2 },
  { id: "inventory", labelKey: "inventory", icon: Package },
  { id: "production", labelKey: "production", icon: Factory },
  { id: "suppliers", labelKey: "suppliers", icon: Truck },
  { id: "reports", labelKey: "reports", icon: BarChart3 },
];

function SuppliersPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Suppliers.list("-created_date", 100).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Ładowanie dostawców…</div>;

  return (
    <div className="p-4 lg:p-6">
      {items.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Truck className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Brak dostawców — dodaj przez Asystenta AI lub ręcznie</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(s => (
            <div key={s.id} className="bg-card border border-border rounded-xl p-4">
              <p className="font-semibold text-sm">{s.name}</p>
              {s.nip && <p className="text-xs font-mono text-muted-foreground">NIP: {s.nip}</p>}
              {s.city && <p className="text-xs text-muted-foreground">{s.postal_code} {s.city}</p>}
              {s.phone && <p className="text-xs text-muted-foreground">{s.phone}</p>}
              {s.lead_time_days && <p className="text-xs text-muted-foreground">Czas realizacji: {s.lead_time_days} dni</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportsPanel() {
  const [stats, setStats] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [items, orders, companies] = await Promise.all([
      base44.entities.InventoryItems.list("-created_date", 500),
      base44.entities.ProductionOrders.list("-created_date", 500),
      base44.entities.BusinessClients.list("-created_date", 500),
    ]);
    const totalValue = items.reduce((s, i) => s + (i.quantity_warehouse || 0) * (i.unit_price || 0), 0);
    const lowStock = items.filter(i => i.status === "niski_stan" || i.status === "brak").length;
    const activeOrders = orders.filter(o => o.status === "w_toku").length;
    const completedOrders = orders.filter(o => o.status === "zakończone").length;
    setStats({ totalValue, lowStock, activeOrders, completedOrders, totalItems: items.length, totalCompanies: companies.length });
    setLoaded(true);
  };

  if (!loaded) return <div className="p-6 text-sm text-muted-foreground">Generowanie raportów…</div>;

  const cards = [
    { label: "Wartość magazynu", value: `${stats.totalValue.toLocaleString("pl-PL", {minimumFractionDigits:2})} PLN`, color: "text-emerald-600" },
    { label: "Pozycje w magazynie", value: stats.totalItems, color: "text-primary" },
    { label: "Niski stan / Brak", value: stats.lowStock, color: "text-amber-600" },
    { label: "Zlecenia w toku", value: stats.activeOrders, color: "text-blue-600" },
    { label: "Ukończone zlecenia", value: stats.completedOrders, color: "text-emerald-600" },
    { label: "Firm w bazie", value: stats.totalCompanies, color: "text-purple-600" },
  ];

  return (
    <div className="p-4 lg:p-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground mb-2">{c.label}</p>
            <p className={cn("text-2xl font-bold", c.color)}>{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessHub() {
  const [tab, setTab] = useState(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    if (["companies","inventory","production","suppliers","reports"].includes(p)) return p;
    const stored = sessionStorage.getItem("lg_enterprise_tab");
    if (stored && ["companies","inventory","production","suppliers","reports"].includes(stored)) {
      sessionStorage.removeItem("lg_enterprise_tab");
      return stored;
    }
    return "companies";
  });
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full">
      <div className="bg-card border-b border-border px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-primary" />
              </span>
              Business Hub
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">{t.business_hub_desc}</p>
          </div>
        </div>

        <div className="flex gap-0.5 overflow-x-auto">
          {TABS.map(tab_item => (
            <button
              key={tab_item.id}
              onClick={() => setTab(tab_item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap",
                tab === tab_item.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab_item.icon className="h-3.5 w-3.5" />
              {t[tab_item.labelKey] || tab_item.labelKey}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-background">
        {tab === "companies" && <CompaniesPanel />}
        {tab === "inventory" && <InventoryPanel />}
        {tab === "production" && <ProductionPanel />}
        {tab === "suppliers" && <SuppliersPanel />}
        {tab === "reports" && <ReportsPanel />}
      </div>
    </div>
  );
}