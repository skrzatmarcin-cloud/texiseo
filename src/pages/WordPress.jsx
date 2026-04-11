import { useState } from "react";
import PageHeader from "../components/PageHeader";
import WPConnectionSettings from "../components/wordpress/WPConnectionSettings";
import WPContentSync from "../components/wordpress/WPContentSync";
import WPContentMapping from "../components/wordpress/WPContentMapping";
import WPDraftPublishing from "../components/wordpress/WPDraftPublishing";
import WPSyncLogs from "../components/wordpress/WPSyncLogs";
import WPHealthDashboard from "../components/wordpress/WPHealthDashboard";
import { Settings, RefreshCw, Network, Send, FileText, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "health", label: "Stan integracji", icon: Activity },
  { id: "connection", label: "Połączenie", icon: Settings },
  { id: "sync", label: "Synchronizacja", icon: RefreshCw },
  { id: "mapping", label: "Mapowanie treści", icon: Network },
  { id: "publish", label: "Publikowanie szkiców", icon: Send },
  { id: "logs", label: "Dzienniki synchronizacji", icon: FileText },
];

export default function WordPress() {
  const [activeTab, setActiveTab] = useState("health");

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Integracja WordPress"
        description="Połącz, importuj i publikuj treści między systemem Linguatoons a WordPress"
      />

      {/* Tab bar */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0",
              activeTab === t.id
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "health" && <WPHealthDashboard />}
      {activeTab === "connection" && <WPConnectionSettings />}
      {activeTab === "sync" && <WPContentSync />}
      {activeTab === "mapping" && <WPContentMapping />}
      {activeTab === "publish" && <WPDraftPublishing />}
      {activeTab === "logs" && <WPSyncLogs />}
    </div>
  );
}