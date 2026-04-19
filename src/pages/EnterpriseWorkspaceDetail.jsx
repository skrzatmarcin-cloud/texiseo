import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Edit, Settings, Package, Factory, Users, CreditCard,
  Globe, AlertCircle, CheckCircle2, Clock, DollarSign, Lock,
  BarChart3, FileText, Mail, Phone, MapPin, Building2, Trash2,
  Plus, Search, RefreshCw
} from "lucide-react";

export default function EnterpriseWorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadData();
  }, [workspaceId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const ws = await base44.entities.EnterpriseWorkspace.filter({ id: workspaceId }).then(r => r[0]);
      const team = await base44.entities.EnterpriseTeamMembers.filter({ workspace_id: workspaceId });
      setWorkspace(ws);
      setTeamMembers(team);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Ładowanie...</div>;
  if (!workspace) return <div className="p-6 text-center text-destructive">Workspace nie znaleziony</div>;

  const TABS = [
    { id: "overview", label: "Przegląd", icon: Building2 },
    { id: "warehouse", label: "Magazyn", icon: Package },
    { id: "production", label: "Produkcja", icon: Factory },
    { id: "team", label: "Zespół", icon: Users },
    { id: "seo", label: "SEO App", icon: Globe },
    { id: "billing", label: "Rozliczenia", icon: CreditCard },
    { id: "settings", label: "Ustawienia", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate("/business")} className="flex items-center gap-2 text-primary hover:text-primary/80">
              <ArrowLeft className="h-4 w-4" /> Wróć
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditMode(!editMode)} className="px-3 py-1.5 bg-secondary hover:bg-border rounded-lg text-sm flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edytuj
              </button>
              <button onClick={loadData} className="px-3 py-1.5 bg-secondary hover:bg-border rounded-lg text-sm flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4">
            {workspace.logo_url && <img src={workspace.logo_url} alt={workspace.company_name} className="h-16 w-16 rounded-lg object-cover" />}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{workspace.company_name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm">
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold",
                  workspace.subscription_status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                )}>
                  {workspace.subscription_status}
                </span>
                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold",
                  workspace.billing_status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                )}>
                  {workspace.billing_status}
                </span>
                <span className="text-muted-foreground">{workspace.subscription_plan}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 flex gap-0.5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors",
                tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Członkowie zespołu" value={workspace.team_members} icon={Users} />
              <StatCard label="Plan" value={workspace.subscription_plan} icon={CreditCard} />
              <StatCard label="SEO Access" value={workspace.seo_app_access ? "✓" : "✗"} icon={Globe} />
              <StatCard label="WordPress" value={workspace.wordpress_connected ? "Podłączony" : "Nie"} icon={Lock} />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-bold mb-4">Informacje o firmie</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <InfoRow label="Email" value={workspace.email} icon={Mail} />
                <InfoRow label="Telefon" value={workspace.phone} icon={Phone} />
                <InfoRow label="Adres" value={`${workspace.postal_code} ${workspace.city}`} icon={MapPin} />
                <InfoRow label="Branża" value={workspace.industry} icon={Building2} />
                <InfoRow label="Strona" value={workspace.website} icon={Globe} copyable />
                <InfoRow label="NIP" value={workspace.nip} icon={FileText} />
              </div>
              {workspace.description && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-foreground/80">{workspace.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "warehouse" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Magazyn</h2>
            <button onClick={() => navigate(`/business?tab=inventory`)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              + Zarządzaj magazynem
            </button>
            <p className="text-sm text-muted-foreground mt-4">Moduł magazynu dostępny w panelu Business Hub</p>
          </div>
        )}

        {tab === "production" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Produkcja</h2>
            <button onClick={() => navigate(`/business?tab=production`)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
              + Zarządzaj produkcją
            </button>
            <p className="text-sm text-muted-foreground mt-4">Moduł produkcji dostępny w panelu Business Hub</p>
          </div>
        )}

        {tab === "team" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Członkowie zespołu</h2>
              <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm flex items-center gap-2 hover:bg-primary/90">
                <Plus className="h-4 w-4" /> Zaproś
              </button>
            </div>
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{member.full_name}</p>
                    <p className="text-xs text-muted-foreground">{member.user_email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-secondary px-2 py-1 rounded">{member.role}</span>
                    <span className={cn("text-xs font-bold px-2 py-1 rounded",
                      member.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {member.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "seo" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">SEO App Access</h2>
            <div className="flex items-start gap-4">
              <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", workspace.seo_app_access ? "bg-green-50" : "bg-red-50")}>
                {workspace.seo_app_access ? <CheckCircle2 className="h-6 w-6 text-green-600" /> : <AlertCircle className="h-6 w-6 text-red-600" />}
              </div>
              <div>
                <p className="font-semibold">{workspace.seo_app_access ? "Dostęp włączony" : "Dostęp wyłączony"}</p>
                <p className="text-sm text-muted-foreground">Ta firma może używać pełnego SEO narzędzia</p>
                <button className="mt-2 text-sm text-primary hover:underline">Zmień ustawienie</button>
              </div>
            </div>
          </div>
        )}

        {tab === "billing" && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <StatCard label="Plan" value={workspace.subscription_plan} icon={CreditCard} />
              <StatCard label="Status" value={workspace.billing_status} icon={Clock} />
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground text-sm">Moduł rozliczeń dostępny wkrótce</p>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Ustawienia workspace</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 hover:bg-secondary rounded-lg transition-colors">
                ⚙️ Edytuj informacje o firmie
              </button>
              <button className="w-full text-left p-3 hover:bg-secondary rounded-lg transition-colors">
                🔗 Podłącz WordPress
              </button>
              <button className="w-full text-left p-3 hover:bg-secondary rounded-lg transition-colors text-destructive hover:bg-red-50">
                🗑️ Usuń workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, copyable }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm flex items-center gap-2">
          {value || "—"}
          {copyable && (
            <button onClick={handle} className="text-[10px] text-primary hover:text-primary/80">
              {copied ? "✓" : "Kopiuj"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}