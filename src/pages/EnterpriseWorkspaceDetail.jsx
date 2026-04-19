import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, Users, Settings, BarChart3, Loader2, Package, Users2 } from "lucide-react";

export default function EnterpriseWorkspaceDetail() {
  const { workspaceId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    loadWorkspace();
  }, [workspaceId]);

  const loadWorkspace = async () => {
    setLoading(true);
    try {
      const ws = await base44.entities.EnterpriseWorkspace.list().then(
        items => items.find(w => w.id === workspaceId)
      ).catch(() => null);
      setWorkspace(ws);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!workspace) {
    return <div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">Workspace not found</p></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{workspace.company_name}</h1>
            <p className="text-xs text-muted-foreground">{workspace.industry || "N/A"}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "modules", label: "Moduły", icon: Package },
            { id: "team", label: "Team", icon: Users },
            { id: "settings", label: "Settings", icon: Settings },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                tab === t.id ? "bg-primary text-white" : "bg-secondary hover:bg-border"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {tab === "overview" && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Company Name</p>
              <p className="text-lg font-bold mt-1">{workspace.company_name}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Subscription</p>
              <p className="text-lg font-bold mt-1 capitalize">{workspace.subscription_plan}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-lg font-bold mt-1 capitalize">{workspace.subscription_status}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">Team Members</p>
              <p className="text-lg font-bold mt-1">{workspace.team_members}</p>
            </div>
          </div>
        )}

        {tab === "modules" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Dostępne moduły</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* CRM Module */}
              <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">CRM</h3>
                    <p className="text-xs text-muted-foreground">Customer Relationship</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">Zarządzaj kontaktami klientów, leady, transakcje i historię komunikacji w jednym miejscu.</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">Zainstalowany</span>
                  <button className="text-xs text-primary hover:underline">Otwórz →</button>
                </div>
              </div>

              {/* WMS Module */}
              <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">WMS</h3>
                    <p className="text-xs text-muted-foreground">Warehouse Management</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">System zarządzania magazynem - inwentarz, lokalizacja produktów, zamówienia i logistyka.</p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-700 rounded">Zainstalowany</span>
                  <button className="text-xs text-primary hover:underline">Otwórz →</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "team" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Team Members</h2>
            <p className="text-sm text-muted-foreground">Workspace ID: {workspaceId}</p>
          </div>
        )}

        {tab === "settings" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Settings</h2>
            <p className="text-sm text-muted-foreground">Configure workspace settings here</p>
          </div>
        )}
      </div>
    </div>
  );
}