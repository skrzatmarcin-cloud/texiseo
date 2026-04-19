import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Factory } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  planowane: "bg-slate-100 text-slate-600",
  w_toku: "bg-blue-50 text-blue-700",
  wstrzymane: "bg-amber-50 text-amber-700",
  zakończone: "bg-emerald-50 text-emerald-700",
  anulowane: "bg-red-50 text-red-600",
};
const PRIORITIES = { krytyczny: "text-red-600", wysoki: "text-amber-600", normalny: "text-blue-600", niski: "text-slate-500" };

function OrderCard({ order, onUpdate }) {
  const progress = order.quantity_ordered > 0 ? Math.min(100, Math.round((order.quantity_produced || 0) / order.quantity_ordered * 100)) : 0;

  const updateStatus = async (status) => {
    await base44.entities.ProductionOrders.update(order.id, { status });
    onUpdate();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold text-sm">{order.product_name}</p>
          {order.order_number && <p className="text-[10px] font-mono text-muted-foreground">#{order.order_number}</p>}
          {order.client_name && <p className="text-xs text-muted-foreground">{order.client_name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-[10px] font-bold uppercase", PRIORITIES[order.priority] || "text-slate-500")}>{order.priority}</span>
          <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[order.status] || STATUS_COLORS.planowane)}>
            {order.status?.replace(/_/g," ")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-muted-foreground">Wyprodukowano: <strong>{order.quantity_produced || 0}</strong> / {order.quantity_ordered} {order.unit}</span>
        <span className="font-bold text-primary">{progress}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
        <div className="h-full bg-primary transition-all rounded-full" style={{ width: `${progress}%` }} />
      </div>

      {order.start_date && (
        <div className="flex gap-3 text-[10px] text-muted-foreground mb-3">
          <span>Start: {order.start_date}</span>
          {order.end_date && <span>Plan: {order.end_date}</span>}
        </div>
      )}

      <div className="flex gap-1.5">
        {order.status === "planowane" && (
          <Button size="sm" className="h-7 text-[11px] flex-1" onClick={() => updateStatus("w_toku")}>▶ Rozpocznij</Button>
        )}
        {order.status === "w_toku" && (
          <>
            <Button size="sm" variant="outline" className="h-7 text-[11px] flex-1" onClick={() => updateStatus("wstrzymane")}>⏸ Wstrzymaj</Button>
            <Button size="sm" className="h-7 text-[11px] flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus("zakończone")}>✓ Zakończ</Button>
          </>
        )}
        {order.status === "wstrzymane" && (
          <Button size="sm" className="h-7 text-[11px] flex-1" onClick={() => updateStatus("w_toku")}>▶ Wznów</Button>
        )}
      </div>
    </div>
  );
}

function AddOrderForm({ onSave, onClose }) {
  const [form, setForm] = useState({
    order_number: `ZLP-${Date.now().toString().slice(-6)}`,
    product_name: "", client_name: "", quantity_ordered: 1, quantity_produced: 0,
    unit: "szt", start_date: new Date().toISOString().split("T")[0],
    end_date: "", priority: "normalny", status: "planowane", notes: ""
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    await base44.entities.ProductionOrders.create(form);
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Nowe zlecenie produkcji</h3>
          <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Nr zlecenia</label>
            <Input value={form.order_number} onChange={e => set("order_number", e.target.value)} className="text-sm font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Priorytet</label>
            <Select value={form.priority} onValueChange={v => set("priority", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["krytyczny","wysoki","normalny","niski"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground block mb-1">Produkt *</label>
            <Input value={form.product_name} onChange={e => set("product_name", e.target.value)} required className="text-sm" />
          </div>
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground block mb-1">Klient</label>
            <Input value={form.client_name} onChange={e => set("client_name", e.target.value)} className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Ilość</label>
            <Input type="number" value={form.quantity_ordered} onChange={e => set("quantity_ordered", e.target.value)} className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Jednostka</label>
            <Select value={form.unit} onValueChange={v => set("unit", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["szt","kg","m","m2","op"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Data rozpoczęcia</label>
            <Input type="date" value={form.start_date} onChange={e => set("start_date", e.target.value)} className="text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Planowane zakończenie</label>
            <Input type="date" value={form.end_date} onChange={e => set("end_date", e.target.value)} className="text-sm" />
          </div>
          <div className="col-span-2 flex gap-2 pt-1">
            <Button type="submit" className="flex-1">Utwórz zlecenie</Button>
            <Button type="button" variant="outline" onClick={onClose}>Anuluj</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProductionPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.ProductionOrders.list("-created_date", 100);
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = statusFilter === "all" ? orders : orders.filter(o => o.status === statusFilter);

  const stats = {
    total: orders.length,
    w_toku: orders.filter(o => o.status === "w_toku").length,
    planowane: orders.filter(o => o.status === "planowane").length,
    zakonczone: orders.filter(o => o.status === "zakończone").length,
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Wszystkich zleceń", value: stats.total, color: "text-primary" },
          { label: "W toku", value: stats.w_toku, color: "text-blue-600" },
          { label: "Planowane", value: stats.planowane, color: "text-slate-600" },
          { label: "Zakończone", value: stats.zakonczone, color: "text-emerald-600" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie statusy</SelectItem>
            {["planowane","w_toku","wstrzymane","zakończone","anulowane"].map(s => (
              <SelectItem key={s} value={s}>{s.replace(/_/g," ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" className="h-8 gap-1.5 ml-auto" onClick={() => setShowAdd(true)}>
          <Plus className="h-3.5 w-3.5" />Nowe zlecenie
        </Button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground text-sm">Ładowanie…</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Factory className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Brak zleceń produkcji</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(order => <OrderCard key={order.id} order={order} onUpdate={load} />)}
        </div>
      )}

      {showAdd && <AddOrderForm onSave={() => { setShowAdd(false); load(); }} onClose={() => setShowAdd(false)} />}
    </div>
  );
}