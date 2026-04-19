import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/LanguageContext";
import { Plus, AlertTriangle, Package, Edit2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["surowiec","półprodukt","produkt_gotowy","opakowanie","materiał_pomocniczy","narzędzie","inne"];
const UNITS = ["szt","kg","g","l","ml","m","m2","m3","t","op","karton"];

const STATUS_STYLES = {
  dostępny: "bg-emerald-50 text-emerald-700",
  niski_stan: "bg-amber-50 text-amber-700",
  brak: "bg-red-50 text-red-700",
  zamówiony: "bg-blue-50 text-blue-700",
};

function ItemRow({ item, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [wh, setWh] = useState(item.quantity_warehouse || 0);
  const [prod, setProd] = useState(item.quantity_production || 0);

  const computeStatus = (warehouse) => {
    if (warehouse <= 0) return "brak";
    if (warehouse <= (item.min_quantity || 0)) return "niski_stan";
    return "dostępny";
  };

  const handleSave = async () => {
    const status = computeStatus(wh);
    await base44.entities.InventoryItems.update(item.id, {
      quantity_warehouse: parseFloat(wh),
      quantity_production: parseFloat(prod),
      status,
    });
    onUpdate();
    setEditing(false);
  };

  return (
    <tr className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium">{item.name}</p>
        {item.sku && <p className="text-[10px] text-muted-foreground font-mono">{item.sku}</p>}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{item.category?.replace(/_/g," ")}</td>
      <td className="px-4 py-3 text-center">
        {editing ? (
          <Input type="number" value={wh} onChange={e => setWh(e.target.value)} className="h-7 w-20 text-xs text-center mx-auto" />
        ) : (
          <span className={cn("font-semibold text-sm", (item.quantity_warehouse || 0) <= (item.min_quantity || 0) ? "text-amber-600" : "")}>
            {item.quantity_warehouse || 0}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {editing ? (
          <Input type="number" value={prod} onChange={e => setProd(e.target.value)} className="h-7 w-20 text-xs text-center mx-auto" />
        ) : (
          <span className="text-sm font-semibold text-blue-600">{item.quantity_production || 0}</span>
        )}
      </td>
      <td className="px-4 py-3 text-center text-xs text-muted-foreground">{item.min_quantity || 0}</td>
      <td className="px-4 py-3 text-center text-xs text-muted-foreground">{item.unit}</td>
      <td className="px-4 py-3 text-center">
        <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", STATUS_STYLES[item.status] || STATUS_STYLES.dostępny)}>
          {item.status?.replace(/_/g," ")}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        {editing ? (
          <div className="flex gap-1 justify-end">
            <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-700"><Check className="h-4 w-4" /></button>
            <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary transition-colors">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
        )}
      </td>
    </tr>
  );
}

function AddItemForm({ onSave, onClose }) {
  const [form, setForm] = useState({ name: "", sku: "", category: "surowiec", unit: "szt", quantity_warehouse: 0, quantity_production: 0, min_quantity: 0, supplier_name: "", unit_price: 0, status: "dostępny" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await base44.entities.InventoryItems.create(form);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Dodaj pozycję magazynową</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground block mb-1">Nazwa *</label>
            <Input value={form.name} onChange={e => set("name", e.target.value)} required className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">SKU / Kod</label>
            <Input value={form.sku} onChange={e => set("sku", e.target.value)} className="text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Kategoria</label>
            <Select value={form.category} onValueChange={v => set("category", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g," ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Ilość w magazynie</label>
            <Input type="number" value={form.quantity_warehouse} onChange={e => set("quantity_warehouse", e.target.value)} className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">W produkcji</label>
            <Input type="number" value={form.quantity_production} onChange={e => set("quantity_production", e.target.value)} className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Stan minimalny</label>
            <Input type="number" value={form.min_quantity} onChange={e => set("min_quantity", e.target.value)} className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Jednostka</label>
            <Select value={form.unit} onValueChange={v => set("unit", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Cena jedn. (PLN)</label>
            <Input type="number" step="0.01" value={form.unit_price} onChange={e => set("unit_price", e.target.value)} className="text-sm" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground block mb-1">Dostawca</label>
            <Input value={form.supplier_name} onChange={e => set("supplier_name", e.target.value)} className="text-sm" />
          </div>
          <div className="col-span-2 flex gap-2 pt-1">
            <Button type="submit" className="flex-1">Dodaj</Button>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InventoryPanel() {
  const { t } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.InventoryItems.list("-created_date", 200);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    if (catFilter !== "all" && i.category !== catFilter) return false;
    if (search && !i.name?.toLowerCase().includes(search.toLowerCase()) && !i.sku?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const lowStock = items.filter(i => i.status === "niski_stan" || i.status === "brak").length;
  const totalValue = items.reduce((s, i) => s + (i.quantity_warehouse || 0) * (i.unit_price || 0), 0);

  return (
    <div className="p-4 lg:p-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Wszystkich pozycji", value: items.length, color: "text-primary" },
          { label: "Niski stan / Brak", value: lowStock, color: "text-amber-600" },
          { label: "Wartość magazynu", value: `${totalValue.toLocaleString("pl-PL", {minimumFractionDigits:2})} PLN`, color: "text-emerald-600" },
          { label: "W produkcji", value: items.filter(i => (i.quantity_production||0) > 0).length, color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {lowStock > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2 text-xs text-amber-800">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <strong>{lowStock} pozycji</strong> wymaga uzupełnienia stanu magazynowego
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj po nazwie lub SKU…" className="h-8 w-52 text-xs" />
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Kategoria" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie kategorie</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g," ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" className="h-8 gap-1.5 ml-auto" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" />Dodaj pozycję
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Nazwa</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Kategoria</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Magazyn</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Produkcja</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Min.</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Jedn.</th>
                <th className="text-center px-4 py-2.5 font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">Ładowanie…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Brak pozycji — dodaj pierwszą
                </td></tr>
              ) : filtered.map(item => (
                <ItemRow key={item.id} item={item} onUpdate={load} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddItemForm onSave={() => { setShowAdd(false); load(); }} onClose={() => setShowAdd(false)} />}
    </div>
  );
}