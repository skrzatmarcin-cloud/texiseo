import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Building2, Users, Settings, BarChart3, Loader2, Package, Users2, Layers } from "lucide-react";

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
            { id: "architecture", label: "Architektura", icon: Layers },
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
          <div className="space-y-6">
            <h2 className="text-lg font-bold">Dostępne moduły i integracje</h2>

            {/* CRM */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold">CRM — Zarządzanie relacjami z klientami</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "Salesforce Sales Cloud", status: "available", desc: "Mocny, skalowalne, automatyzacja sprzedaży" },
                  { name: "HubSpot CRM", status: "available", desc: "Idealne dla SMB, marketing, leady, szybki start" },
                  { name: "Microsoft Dynamics 365", status: "available", desc: "Integracja CRM + ERP, ekosystem Microsoft" }
                ].map(sys => (
                  <div key={sys.name} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all">
                    <p className="font-semibold text-sm">{sys.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{sys.desc}</p>
                    <button className={`text-xs px-3 py-1 rounded ${sys.status === "available" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : "bg-gray-100 text-gray-500"}`}>
                      {sys.status === "available" ? "Połącz" : "Niedostępne"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* WMS */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-600" />
                <h3 className="font-bold">WMS — Zarządzanie magazynem</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "Oracle NetSuite WMS", status: "available", desc: "WMS spięty z ERP, dla firm handlowych" },
                  { name: "SAP Extended Warehouse (EWM)", status: "available", desc: "Mocny dla zaawansowanych operacji i logistyki" },
                  { name: "Manhattan Active WMS", status: "available", desc: "Enterprise-grade, automatyzacja, zaawansowane hale" }
                ].map(sys => (
                  <div key={sys.name} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all">
                    <p className="font-semibold text-sm">{sys.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{sys.desc}</p>
                    <button className={`text-xs px-3 py-1 rounded ${sys.status === "available" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-500"}`}>
                      {sys.status === "available" ? "Połącz" : "Niedostępne"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ERP/MRP */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold">ERP / MRP — Planowanie zasobów i produkcji</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "Oracle NetSuite ERP", status: "available", desc: "Cloud ERP dla handlu, usług, produkcji średniej skali" },
                  { name: "Microsoft Dynamics 365", status: "available", desc: "ERP + CRM, integracja z Office i Power BI" },
                  { name: "Odoo MRP", status: "available", desc: "Elastyczny, tańszy, modułowy, produkcja i planowanie" },
                  { name: "SAP ERP / Manufacturing", status: "available", desc: "Dla dużego przemysłu, pełna integracja produkcji" }
                ].map(sys => (
                  <div key={sys.name} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all">
                    <p className="font-semibold text-sm">{sys.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{sys.desc}</p>
                    <button className={`text-xs px-3 py-1 rounded ${sys.status === "available" ? "bg-purple-100 text-purple-700 hover:bg-purple-200" : "bg-gray-100 text-gray-500"}`}>
                      {sys.status === "available" ? "Połącz" : "Niedostępne"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* MES */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <h3 className="font-bold">MES — Manufacturing Execution System</h3>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: "Siemens Opcenter Execution", status: "available", desc: "Silny MES, śledzenie produkcji, jakość, traceability" },
                  { name: "Tulip MES", status: "available", desc: "Nowoczesny, low-code, szybkie wdrożenia, digitalizacja hali" },
                  { name: "Plex Smart Manufacturing", status: "available", desc: "Cloud MES, maszyny real-time, supply chain" },
                  { name: "AVEVA MES", status: "available", desc: "Dla przemysłu, jakość, dane czasu rzeczywistego" }
                ].map(sys => (
                  <div key={sys.name} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all">
                    <p className="font-semibold text-sm">{sys.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">{sys.desc}</p>
                    <button className={`text-xs px-3 py-1 rounded ${sys.status === "available" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500"}`}>
                      {sys.status === "available" ? "Połącz" : "Niedostępne"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "architecture" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold">🏗️ Enterprise Digital Ecosystem Architecture</h2>

            {/* Core Architecture */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-primary">1. Central Core — ERP as Brain</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• ERP jest głównym hubem danych (finanse, operacje, użytkownicy, uprawnienia)</p>
                <p>• MRP wbudowany w ERP (materiały, planowanie)</p>
                <p>• Kontroluje przepływ danych i orkiestruje wszystkie systemy</p>
              </div>
            </div>

            {/* Integration Layer */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-primary">2. Integration Layer — API Gateway + Event Bus</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• API Gateway (centralna bramma API do wszystkich systemów)</p>
                <p>• Event Bus (Kafka / PubSub) — asynchroniczna komunikacja</p>
                <p>• Unified Data Model — jednolity format danych</p>
                <p>• Middleware — transformacja i routing zdarzeń</p>
              </div>
            </div>

            {/* System Relationships */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-primary">3. System Relationships (Data Flow)</h3>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                  <p className="font-semibold text-blue-900 dark:text-blue-200">CRM → ERP:</p>
                  <p className="text-muted-foreground">leady, zamówienia, kontakty klientów</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                  <p className="font-semibold text-amber-900 dark:text-amber-200">ERP → MES + WMS:</p>
                  <p className="text-muted-foreground">zamówienia produkcji, materiały, harmonogram</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
                  <p className="font-semibold text-purple-900 dark:text-purple-200">MES → ERP:</p>
                  <p className="text-muted-foreground">dane produkcji real-time, raport postępu</p>
                </div>
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                  <p className="font-semibold text-green-900 dark:text-green-200">WMS → ERP:</p>
                  <p className="text-muted-foreground">stan magazynu, alerty niskiego stanu</p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-950/30 p-3 rounded-lg">
                  <p className="font-semibold text-cyan-900 dark:text-cyan-200">AI Agent → Wszystkie:</p>
                  <p className="text-muted-foreground">monitoring, optymalizacja, predykcje, alerty</p>
                </div>
              </div>
            </div>

            {/* Enterprise Layers */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-primary">4. Enterprise Layers (Purdue Architecture)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <span className="font-bold text-primary min-w-12">Layer 1:</span>
                  <div>
                    <p className="font-semibold">Physical</p>
                    <p className="text-muted-foreground text-xs">Maszyny, urządzenia produkcyjne, czujniki IoT</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <span className="font-bold text-primary min-w-12">Layer 2:</span>
                  <div>
                    <p className="font-semibold">MES</p>
                    <p className="text-muted-foreground text-xs">Wykonanie produkcji, śledzenie, jakość</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <span className="font-bold text-primary min-w-12">Layer 3:</span>
                  <div>
                    <p className="font-semibold">ERP + MRP</p>
                    <p className="text-muted-foreground text-xs">Logika biznesowa, planowanie, finanse</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <span className="font-bold text-primary min-w-12">Layer 4:</span>
                  <div>
                    <p className="font-semibold">CRM / CMS / Client Panels</p>
                    <p className="text-muted-foreground text-xs">Interfejsy użytkownika, klienci, marketing</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-primary">5. Tech Stack Recommendation</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-semibold mb-2">Backend & Infrastructure:</p>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• Node.js / Python (microservices)</li>
                    <li>• PostgreSQL / MongoDB (polyglot DB)</li>
                    <li>• Kafka / RabbitMQ (event bus)</li>
                    <li>• Docker + Kubernetes (orchestration)</li>
                    <li>• AWS / GCP / Azure (cloud)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Frontend & Integration:</p>
                  <ul className="space-y-1 text-muted-foreground text-xs">
                    <li>• React / Vue.js (UI)</li>
                    <li>• GraphQL / REST APIs</li>
                    <li>• Zapier / n8n (workflow automation)</li>
                    <li>• WordPress + REST API (CMS)</li>
                    <li>• TensorFlow / PyTorch (AI Agent)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Roles & Permissions */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-primary">6. Role-Based Access Control (RBAC)</h3>
              <div className="space-y-2 text-sm">
                {[
                  { role: "Super Admin", perms: "Pełna kontrola, konfiguracja, audyt" },
                  { role: "CRM Manager", perms: "Leady, deals, klienci, raporty" },
                  { role: "Production Manager", perms: "MES, planowanie, jakość" },
                  { role: "Warehouse Manager", perms: "WMS, inwentarz, logistyka" },
                  { role: "Finance Manager", perms: "ERP, faktury, raporty finansowe" },
                  { role: "AI Agent", perms: "Monitoring, optymalizacja, alerty (automatyczne)" },
                  { role: "Enterprise Client", perms: "Dostęp do swoich zamówień i raportów" },
                  { role: "Teacher", perms: "Kursy, studenci, quizy, zarobki" }
                ].map(r => (
                  <div key={r.role} className="flex gap-3 p-2 bg-secondary/20 rounded">
                    <span className="font-semibold text-primary min-w-40">{r.role}</span>
                    <span className="text-muted-foreground text-xs">{r.perms}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Implementation Roadmap */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-primary">7. Implementation Roadmap</h3>
              <div className="space-y-2 text-sm">
                {[
                  { phase: "Q1", tasks: "Setup infrastruktury, ERP core, API Gateway, DB" },
                  { phase: "Q2", tasks: "CRM integration, MES foundation, WMS module" },
                  { phase: "Q3", tasks: "MRP planowanie, Event Bus, AI Agent beta" },
                  { phase: "Q4", tasks: "CMS + SEO AI, Social automation, Client Panels" },
                  { phase: "Q1+", tasks: "Skalowanie, ML optimization, Advanced analytics" }
                ].map(r => (
                  <div key={r.phase} className="flex gap-3 p-2 bg-primary/10 rounded">
                    <span className="font-bold text-primary min-w-12">{r.phase}</span>
                    <span className="text-muted-foreground text-xs">{r.tasks}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scaling Plan */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-primary">8. Scaling Plan (Startup → Enterprise)</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Stage 1 (Startup):</p>
                <p className="text-xs ml-4">• Monolithic architecture, single instance, 100-1K users</p>
                <p className="font-semibold text-foreground mt-3">Stage 2 (Growth):</p>
                <p className="text-xs ml-4">• Microservices, auto-scaling, 1K-100K users, multi-region</p>
                <p className="font-semibold text-foreground mt-3">Stage 3 (Enterprise):</p>
                <p className="text-xs ml-4">• Full distributed system, 100K-1M users, global CDN, AI-driven optimization</p>
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