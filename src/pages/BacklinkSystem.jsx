import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import BacklinkOpportunitiesTab from "../components/backlinks/BacklinkOpportunitiesTab";
import ApprovalQueueTab from "../components/backlinks/ApprovalQueueTab";
import ExecutionPanel from "../components/backlinks/ExecutionPanel";
import BacklinkDatabase from "../components/backlinks/BacklinkDatabase";
import BacklinkPerformance from "../components/backlinks/BacklinkPerformance";
import NewOpportunityModal from "../components/backlinks/NewOpportunityModal";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb, CheckSquare, Zap, Database, BarChart3, Shield, Bot, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "opportunities", label: "Okazje", icon: Lightbulb },
  { id: "approval", label: "Kolejka zatwierdzeń", icon: CheckSquare },
  { id: "execution", label: "Silnik wykonania", icon: Zap },
  { id: "database", label: "Baza backlinków", icon: Database },
  { id: "performance", label: "Wyniki", icon: BarChart3 },
];

export default function BacklinkSystem() {
  const [tab, setTab] = useState("opportunities");
  const [opportunities, setOpportunities] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [backlinks, setBacklinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      base44.entities.BacklinkOpportunities.list("-created_date", 100),
      base44.entities.BacklinkMaterials.list("-created_date", 100),
      base44.entities.Backlinks.list("-created_date", 100),
    ]).then(([o, m, b]) => {
      setOpportunities(o);
      setMaterials(m);
      setBacklinks(b);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const [dailyScan, setDailyScan] = useState(false);
  const [scanMsg, setScanMsg] = useState(null);

  const runDailyScan = async () => {
    setDailyScan(true);
    setScanMsg(null);
    const res = await base44.functions.invoke("backlinkAgent", { action: "daily_scan" });
    setScanMsg(res.data?.message || "Skan zakończony");
    setDailyScan(false);
    load();
  };

  const approvalCount = opportunities.filter(o => o.status === "ready_for_review").length;
  const execCount = opportunities.filter(o => o.status === "scheduled" || o.status === "ready_manual").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader
        title="System Backlinków"
        description="Bezpieczne budowanie linków — zatwierdź → auto-publikacja lub ręczna realizacja"
      >
        <div className="flex items-center gap-2 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5">
          <Shield className="h-3.5 w-3.5" />
          Tryb SEO-SAFE aktywny
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={runDailyScan} disabled={dailyScan}>
          {dailyScan ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Skanuje…</> : <><Bot className="h-3.5 w-3.5" />Skan AI</>}
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => setShowNew(true)}>
          <Plus className="h-3.5 w-3.5" />Nowa okazja
        </Button>
      </PageHeader>

      {scanMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mb-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5" />{scanMsg}
        </div>
      )}

      {/* Safety banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
        <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-[11px] text-amber-800 leading-relaxed">
          <strong>Zasada działania:</strong> Żaden backlink nie jest publikowany bez Twojego zatwierdzenia.
          Platformy bezpieczne (Medium, Pinterest, Blogger) mogą być auto-publikowane po zatwierdzeniu.
          Platformy ręczne (Reddit, Quora, Fora) wymagają ręcznego działania. Max 1–2 posty dziennie.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap relative",
              tab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.id === "approval" && approvalCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full text-[9px] flex items-center justify-center font-bold">{approvalCount}</span>
            )}
            {t.id === "execution" && execCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">{execCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === "opportunities" && <BacklinkOpportunitiesTab opportunities={opportunities} onRefresh={load} />}
      {tab === "approval" && <ApprovalQueueTab opportunities={opportunities} materials={materials} onRefresh={load} />}
      {tab === "execution" && <ExecutionPanel opportunities={opportunities} materials={materials} onRefresh={load} />}
      {tab === "database" && <BacklinkDatabase backlinks={backlinks} />}
      {tab === "performance" && <BacklinkPerformance backlinks={backlinks} />}

      {showNew && <NewOpportunityModal open onClose={() => setShowNew(false)} onSaved={load} />}
    </div>
  );
}