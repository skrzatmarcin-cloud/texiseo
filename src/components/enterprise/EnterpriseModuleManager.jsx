import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

const MODULES = [
    {
        id: 'crm',
        name: 'Sales (CRM)',
        icon: '💼',
        description: 'Lead Management, Sales Pipeline, Customer Database',
        color: 'from-blue-600 to-cyan-600'
    },
    {
        id: 'mes',
        name: 'Production (MES)',
        icon: '⚙️',
        description: 'Production Orders, Quality Control, Real-time Monitoring',
        color: 'from-amber-600 to-orange-600'
    },
    {
        id: 'wms',
        name: 'Inventory (WMS)',
        icon: '📦',
        description: 'Warehouse Management, Stock Tracking, Reordering',
        color: 'from-emerald-600 to-teal-600'
    },
    {
        id: 'erp',
        name: 'Finance (ERP)',
        icon: '💰',
        description: 'Financial Reports, Budget Planning, Invoice Management',
        color: 'from-purple-600 to-pink-600'
    },
    {
        id: 'marketing',
        name: 'Marketing (SEO + Social)',
        icon: '📊',
        description: 'SEO Tools, Social Scheduler, Content Calendar, Analytics',
        color: 'from-red-600 to-rose-600'
    },
    {
        id: 'ai_insights',
        name: 'AI Insights',
        icon: '🤖',
        description: 'Predictive Analytics, Trend Analysis, Recommendations',
        color: 'from-indigo-600 to-violet-600'
    }
];

export default function EnterpriseModuleManager({ workspaceId }) {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState({});

    useEffect(() => {
        loadModules();
    }, [workspaceId]);

    async function loadModules() {
        setLoading(true);
        try {
            const data = await base44.entities.EnterpriseModule.filter(
                { workspace_id: workspaceId }
            );
            setModules(data || []);
        } catch (error) {
            console.error('Error loading modules:', error);
        }
        setLoading(false);
    }

    async function toggleModule(moduleType, isActive) {
        setActivating(prev => ({ ...prev, [moduleType]: true }));
        try {
            if (isActive) {
                await base44.functions.invoke('deactivateEnterpriseModule', {
                    workspace_id: workspaceId,
                    module_type: moduleType
                });
            } else {
                await base44.functions.invoke('activateEnterpriseModule', {
                    workspace_id: workspaceId,
                    module_type: moduleType
                });
            }
            await loadModules();
        } catch (error) {
            console.error('Error toggling module:', error);
        }
        setActivating(prev => ({ ...prev, [moduleType]: false }));
    }

    if (loading) {
        return <div className="flex items-center justify-center p-6"><Loader2 className="h-6 w-6 animate-spin" /></div>;
    }

    return (
        <div className="space-y-4">
            {MODULES.map(module => {
                const isActive = modules?.some(m => m.module_type === module.id && m.status === 'active');
                const isLoading = activating[module.id];

                return (
                    <div
                        key={module.id}
                        className={`border-2 rounded-xl p-5 transition-all ${
                            isActive
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card hover:border-primary/50'
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <span className="text-3xl">{module.icon}</span>
                                <div>
                                    <h3 className="font-bold text-sm mb-1">{module.name}</h3>
                                    <p className="text-xs text-muted-foreground">{module.description}</p>
                                    {isActive && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                            <span className="text-xs text-emerald-600 font-medium">Active</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={() => toggleModule(module.id, isActive)}
                                disabled={isLoading}
                                variant={isActive ? 'default' : 'outline'}
                                className="gap-2"
                                size="sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : isActive ? (
                                    <>
                                        <ToggleRight className="h-4 w-4" />
                                        Deactivate
                                    </>
                                ) : (
                                    <>
                                        <ToggleLeft className="h-4 w-4" />
                                        Activate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}