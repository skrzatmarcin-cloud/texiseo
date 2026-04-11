import { useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Zap, Play, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTOMATIONS = [
  {
    id: "generate_ideas",
    name: "Topic Generation",
    trigger: "Manual trigger",
    description: "Generate strategic content ideas classified by language, intent, audience, and cluster. Scores each by business value for Linguatoons.",
    action: "Generate ideas → classify → score → save to Content Ideas",
    category: "content",
    configFields: [
      { key: "language", label: "Language", type: "select", options: [{ value: "en", label: "English" }, { value: "pl", label: "Polish" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }] },
      { key: "count", label: "Ideas to generate", type: "number", default: 10 },
      { key: "focus", label: "Focus area (optional)", type: "text", placeholder: "e.g. children, Polish learners, beginner adults" },
    ],
    functionName: "generateIdeas",
  },
  {
    id: "approval_to_brief",
    name: "Approval → Brief",
    trigger: "When a Content Idea is approved",
    description: "Automatically generates a full SEO brief and places the item in the Publishing Queue when an idea is moved to 'Approved' status.",
    action: "Approved idea → generate brief → add to queue",
    category: "workflow",
    configFields: [
      { key: "idea_id", label: "Content Idea ID (manual trigger)", type: "text", placeholder: "Paste idea ID to trigger manually" },
    ],
    functionName: "approvalToBrief",
    isEntityTriggered: true,
  },
  {
    id: "page_audit",
    name: "Page Audit Trigger",
    trigger: "Manual trigger per page",
    description: "Audits a page for health signals — trust, conversion, orphan risk, decay, and content depth — and auto-creates refresh tasks for identified issues.",
    action: "Audit page → detect issues → create refresh tasks",
    category: "quality",
    configFields: [
      { key: "page_id", label: "Page ID", type: "text", placeholder: "Paste page ID to audit" },
    ],
    functionName: "pageAuditTrigger",
  },
  {
    id: "cluster_gap",
    name: "Cluster Gap Detection",
    trigger: "Manual trigger per cluster",
    description: "Analyses a cluster for missing content types — pillar, comparison, FAQ, trust. Updates completeness score and missing_topics list.",
    action: "Analyse cluster → detect gaps → update completeness → suggest actions",
    category: "strategy",
    configFields: [
      { key: "cluster_id", label: "Cluster ID", type: "text", placeholder: "Paste cluster ID to analyse" },
    ],
    functionName: "clusterGapDetection",
  },
  {
    id: "refresh_trigger",
    name: "Refresh Task Creator",
    trigger: "Same as Page Audit — run on any page",
    description: "Creates targeted refresh tasks for a page based on its current decay risk, freshness score, and quality signals. Routes tasks to the Refresh Center.",
    action: "Detect decay signals → create tasks → route to Refresh Center",
    category: "quality",
    configFields: [
      { key: "page_id", label: "Page ID", type: "text", placeholder: "Same as Page Audit" },
    ],
    functionName: "pageAuditTrigger",
  },
  {
    id: "pre_publish_qa",
    name: "Pre-Publish QA Gate",
    trigger: "Manual — run on a brief before publishing",
    description: "Runs the full SEO QA engine on a brief and outputs a publish-readiness decision. Use before moving any item to 'Ready to Publish' status.",
    action: "Evaluate brief → score SEO/content/readiness → output decision",
    category: "quality",
    isUIOnly: true,
    uiLink: "/seo-qa",
    configFields: [],
  },
];

const CATEGORY_STYLES = {
  content: "bg-blue-50 text-blue-700",
  workflow: "bg-purple-50 text-purple-700",
  quality: "bg-emerald-50 text-emerald-700",
  strategy: "bg-amber-50 text-amber-700",
};

export default function Automations() {
  const [states, setStates] = useState({});
  const [configs, setConfigs] = useState({});
  const [results, setResults] = useState({});
  const [expanded, setExpanded] = useState({});

  const setConfig = (automId, key, value) => {
    setConfigs(prev => ({ ...prev, [automId]: { ...(prev[automId] || {}), [key]: value } }));
  };

  const runAutomation = async (autom) => {
    setStates(prev => ({ ...prev, [autom.id]: "running" }));
    setResults(prev => ({ ...prev, [autom.id]: null }));
    const payload = configs[autom.id] || {};
    const numericFields = autom.configFields.filter(f => f.type === "number");
    for (const f of numericFields) {
      if (payload[f.key]) payload[f.key] = Number(payload[f.key]);
    }
    const res = await base44.functions.invoke(autom.functionName, payload);
    setStates(prev => ({ ...prev, [autom.id]: res.data?.success ? "success" : "error" }));
    setResults(prev => ({ ...prev, [autom.id]: res.data }));
    setTimeout(() => setStates(prev => ({ ...prev, [autom.id]: "idle" })), 5000);
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1100px] mx-auto">
      <PageHeader title="Automations" description="Smart workflow triggers and automation controls for the Linguatoons content OS" />

      <div className="grid grid-cols-1 gap-3">
        {AUTOMATIONS.map(autom => {
          const state = states[autom.id] || "idle";
          const isOpen = expanded[autom.id];
          const result = results[autom.id];

          return (
            <div key={autom.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{autom.name}</p>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", CATEGORY_STYLES[autom.category])}>{autom.category}</span>
                      {autom.isEntityTriggered && (
                        <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">Auto-triggered</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{autom.trigger}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {state === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {state === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {state === "running" && <Loader2 className="h-4 w-4 text-primary animate-spin" />}
                  {autom.isUIOnly ? (
                    <a href={autom.uiLink} className="text-xs text-primary hover:underline font-medium">Open →</a>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                      onClick={() => setExpanded(p => ({ ...p, [autom.id]: !isOpen }))}>
                      {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {isOpen ? "Close" : "Configure"}
                    </Button>
                  )}
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-border px-5 py-4 bg-secondary/20">
                  <p className="text-xs text-muted-foreground mb-3">{autom.description}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Action</p>
                  <p className="text-xs font-mono bg-card border border-border rounded px-2 py-1 mb-3">{autom.action}</p>

                  {autom.configFields.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {autom.configFields.map(field => (
                        <div key={field.key}>
                          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">{field.label}</label>
                          {field.type === "select" ? (
                            <Select value={configs[autom.id]?.[field.key] || field.options?.[0]?.value}
                              onValueChange={v => setConfig(autom.id, field.key, v)}>
                              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{field.options?.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type={field.type}
                              placeholder={field.placeholder || ""}
                              defaultValue={field.default || ""}
                              className="h-8 text-xs"
                              onChange={e => setConfig(autom.id, field.key, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button size="sm" className="gap-1.5 h-8" onClick={() => runAutomation(autom)} disabled={state === "running"}>
                      {state === "running" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                      {state === "running" ? "Running…" : "Run Now"}
                    </Button>
                    {result && (
                      <span className={cn("text-[11px] font-medium", result.success ? "text-emerald-600" : result.skipped ? "text-muted-foreground" : "text-red-600")}>
                        {result.success ? `✓ Done${result.created !== undefined ? ` — ${result.created} created` : result.tasks_created !== undefined ? ` — ${result.tasks_created} task(s) created` : result.brief_id ? " — Brief created" : ""}` : result.skipped ? `Skipped: ${result.reason}` : `Error: ${result.error || "Unknown"}`}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Entity automation notice */}
      <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-xs font-semibold text-primary">Live Entity Automation</p>
        </div>
        <p className="text-[11px] text-muted-foreground">The <strong>Approval → Brief</strong> workflow is also wired as a database trigger: any Content Idea moved to <code className="bg-secondary px-1 rounded">approved</code> status will automatically queue for brief generation. Configure the scheduled automation from the platform's Automations panel.</p>
      </div>
    </div>
  );
}