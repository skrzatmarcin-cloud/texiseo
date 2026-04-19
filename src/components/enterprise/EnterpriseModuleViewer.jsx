import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Users, TrendingUp, Package, DollarSign, Sparkles } from "lucide-react";

const MODULE_INFO = {
  sales: { label: "💼 Sales (CRM)", icon: TrendingUp, color: "from-blue-600 to-indigo-700" },
  production: { label: "🏭 Production (MES)", icon: Package, color: "from-amber-600 to-orange-700" },
  inventory: { label: "📦 Inventory (WMS)", icon: Package, color: "from-green-600 to-emerald-700" },
  finance: { label: "💰 Finance (ERP)", icon: DollarSign, color: "from-purple-600 to-pink-700" },
  marketing: { label: "📱 Marketing (SEO+Social)", icon: Sparkles, color: "from-cyan-600 to-blue-700" },
  ai_insights: { label: "🧠 AI Insights", icon: Sparkles, color: "from-violet-600 to-purple-700" },
};

export default function EnterpriseModuleViewer({ module, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [module]);

  const loadData = async () => {
    setLoading(true);
    try {
      const modules = await base44.entities.EnterpriseModule.filter({ module_type: module });
      setData(modules[0] || null);
    } catch (err) {
      console.error("Error loading module data:", err);
    } finally {
      setLoading(false);
    }
  };

  const info = MODULE_INFO[module];
  const Icon = info?.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className={`bg-gradient-to-br ${info.color} p-6 text-white`}>
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-sm opacity-90 hover:opacity-100 mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć
          </button>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-8 w-8" />}
            <h2 className="text-xl font-bold">{info.label}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <StatCard label="Status" value={data.status} />
                <StatCard label="Users" value={data.users_count || 0} />
                {data.features && data.features.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {data.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                      {data.features.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{data.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {data.last_used && (
                <div className="text-xs text-muted-foreground border-t border-border pt-2">
                  Last used: {new Date(data.last_used).toLocaleDateString()}
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}