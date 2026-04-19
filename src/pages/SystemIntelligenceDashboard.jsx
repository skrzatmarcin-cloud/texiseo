import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Activity, AlertTriangle, CheckCircle2, TrendingUp, Eye, Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SystemIntelligenceDashboard() {
    const [data, setData] = useState({
        syncLogs: [],
        competitorAnalysis: [],
        seoAudit: null,
        healthChecks: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    async function loadDashboardData() {
        setLoading(true);
        try {
            const [syncLogs, competitorData, seoData, healthData] = await Promise.all([
                base44.entities.SyncLog.list('-created_date', 10),
                base44.entities.CompetitorAnalysis.list('-created_date', 5),
                base44.entities.SEOAudit.list('-created_date', 1),
                base44.entities.HealthCheck.list('-created_date', 10)
            ]);

            setData({
                syncLogs: syncLogs || [],
                competitorAnalysis: competitorData || [],
                seoAudit: seoData?.[0] || null,
                healthChecks: healthData || []
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
        setLoading(false);
    }

    const runFullAudit = async () => {
        setLoading(true);
        try {
            await Promise.all([
                base44.functions.invoke('dataSyncAgent', {}),
                base44.functions.invoke('competitorIntelligenceAgent', {}),
                base44.functions.invoke('seoAuditAgent', {}),
                base44.functions.invoke('securityHealthMonitorAgent', {})
            ]);
            setTimeout(loadDashboardData, 2000);
        } catch (error) {
            console.error('Audit error:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const latestSync = data.syncLogs?.[0];
    const latestAudit = data.seoAudit;
    const recentAnalysis = data.competitorAnalysis?.slice(0, 3) || [];
    const healthStatus = data.healthChecks?.filter(h => h.status === 'critical').length === 0 ? 'healthy' : 'warning';

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">🧠 System Intelligence Dashboard</h1>
                    <Button onClick={runFullAudit} className="gap-2">
                        <Zap className="h-4 w-4" />
                        Run Full Audit Now
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Data Sync */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Activity className="h-5 w-5 text-blue-500" />
                            <h3 className="font-semibold text-sm">Data Sync</h3>
                        </div>
                        <p className="text-2xl font-bold">{latestSync?.records_processed || 0}</p>
                        <p className="text-xs text-muted-foreground mt-1">Records synced</p>
                        {latestSync && (
                            <p className="text-[10px] text-muted-foreground mt-2">
                                {new Date(latestSync.created_date).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    {/* Competitor Analysis */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Eye className="h-5 w-5 text-purple-500" />
                            <h3 className="font-semibold text-sm">Competitors</h3>
                        </div>
                        <p className="text-2xl font-bold">{recentAnalysis.length}</p>
                        <p className="text-xs text-muted-foreground mt-1">Recently analyzed</p>
                    </div>

                    {/* SEO Health */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            <h3 className="font-semibold text-sm">SEO Health</h3>
                        </div>
                        <p className="text-2xl font-bold">{latestAudit?.health_score || '--'}/100</p>
                        <p className="text-xs text-muted-foreground mt-1">Current score</p>
                    </div>

                    {/* System Health */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <Lock className="h-5 w-5 text-cyan-500" />
                            <h3 className="font-semibold text-sm">System Health</h3>
                        </div>
                        <p className="text-2xl font-bold capitalize">{healthStatus}</p>
                        <p className="text-xs text-muted-foreground mt-1">Overall status</p>
                    </div>
                </div>

                {/* Latest Sync */}
                {latestSync && (
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h2 className="text-lg font-bold mb-4">📊 Latest Data Sync</h2>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Pages</p>
                                <p className="text-2xl font-bold">42</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Courses</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Lessons</p>
                                <p className="text-2xl font-bold">156</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="text-2xl font-bold">{latestSync.duration_seconds}s</p>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-4">
                            Next sync: {new Date(latestSync.next_sync_scheduled).toLocaleString()}
                        </p>
                    </div>
                )}

                {/* Competitor Intelligence */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h2 className="text-lg font-bold mb-4">🔍 Recent Competitor Analysis</h2>
                    <div className="space-y-4">
                        {recentAnalysis.map(analysis => (
                            <div key={analysis.id} className="border-t border-border pt-4 first:border-0 first:pt-0">
                                <h3 className="font-semibold text-sm mb-2">{analysis.site_name}</h3>
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                    <div>
                                        <p className="text-muted-foreground">Opportunities</p>
                                        <p className="font-bold text-emerald-600">{analysis.opportunities?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Threats</p>
                                        <p className="font-bold text-red-600">{analysis.threats?.length || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Changes</p>
                                        <p className="font-bold text-primary">{analysis.changes_detected?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* SEO Audit */}
                {latestAudit && (
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h2 className="text-lg font-bold mb-4">📈 SEO Audit Summary</h2>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Technical Issues</span>
                                    <span className="text-sm font-bold">{latestAudit.technical_issues?.length || 0}</span>
                                </div>
                                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500" style={{ width: `${Math.min(latestAudit.technical_issues?.length * 10, 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">Content Opportunities</span>
                                    <span className="text-sm font-bold">{latestAudit.content_opportunities?.length || 0}</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">AI Search Readiness</span>
                                    <span className="text-sm font-bold capitalize">{latestAudit.ai_search_readiness}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Health Status */}
                <div className="bg-card border border-border rounded-xl p-5">
                    <h2 className="text-lg font-bold mb-4">🏥 System Health Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {['wordpress', 'masterstudy', 'performance', 'content_integrity'].map(checkType => {
                            const check = data.healthChecks?.find(c => c.check_type === checkType);
                            return (
                                <div key={checkType} className="flex items-center gap-3">
                                    {check?.status === 'healthy' ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                    ) : (
                                        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                    )}
                                    <div>
                                        <p className="text-xs text-muted-foreground capitalize">{checkType.replace(/_/g, ' ')}</p>
                                        <p className="text-sm font-semibold capitalize">{check?.status || 'unknown'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}