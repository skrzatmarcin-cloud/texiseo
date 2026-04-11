import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, HelpCircle, Code2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import ScoreBadge from "../components/ScoreBadge";
import FAQEditor from "../components/faq/FAQEditor";

const FAQ_TYPE_LABELS = {
  seo_support: "SEO Support", conversion: "Conversion", objection_handling: "Objection Handling",
  service_clarification: "Service Clarification", process: "Process", pricing_format: "Pricing / Format",
};
const FAQ_TYPE_STYLES = {
  seo_support: "bg-blue-50 text-blue-700", conversion: "bg-emerald-50 text-emerald-700",
  objection_handling: "bg-amber-50 text-amber-700", service_clarification: "bg-purple-50 text-purple-700",
  process: "bg-slate-100 text-slate-700", pricing_format: "bg-rose-50 text-rose-700",
};

const SCHEMA_SUGGESTIONS = {
  faq: { type: "FAQPage", reason: "Page contains FAQ content eligible for Google FAQ rich snippets.", value: 95, recommended: true },
  blog: { type: "Article", reason: "Blog posts and informational content should use Article schema for better Google indexing.", value: 78, recommended: true },
  service: { type: "EducationalOrganization", reason: "Service pages for a language school should signal the organisation type to search engines.", value: 82, recommended: true },
  pricing: { type: "WebPage", reason: "Pricing pages benefit from WebPage schema as a baseline. Consider adding Offer schema if prices are listed.", value: 65, recommended: true },
  pillar: { type: "Article + BreadcrumbList", reason: "Pillar pages benefit from Article schema combined with BreadcrumbList to show site hierarchy in SERPs.", value: 88, recommended: true },
  landing: { type: "WebPage", reason: "Landing pages use WebPage schema to signal page purpose and type.", value: 60, recommended: false },
  about: { type: "EducationalOrganization + Person", reason: "About pages for educational organisations should use EducationalOrganization with Person schema for teachers.", value: 75, recommended: true },
  homepage: { type: "EducationalOrganization", reason: "Homepage should identify Linguatoons as an educational organisation.", value: 85, recommended: true },
};

export default function FAQSchema() {
  const [faqs, setFaqs] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState("faqs");
  const [editing, setEditing] = useState(null);
  const [expandedPage, setExpandedPage] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.FAQItems.list("-created_date"),
      base44.entities.Pages.list(),
    ]).then(([f, p]) => { setFaqs(f); setPages(p); setLoading(false); });
  }, []);

  const pageMap = useMemo(() => Object.fromEntries(pages.map(p => [p.id, p])), [pages]);

  const faqsByPage = useMemo(() => {
    const grouped = {};
    faqs.forEach(f => {
      const key = f.related_page_id || "__unlinked";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(f);
    });
    return grouped;
  }, [faqs]);

  const filtered = useMemo(() => faqs.filter(f => {
    if (filters.faq_type && filters.faq_type !== "all" && f.faq_type !== filters.faq_type) return false;
    if (filters.language && filters.language !== "all" && f.language !== filters.language) return false;
    if (filters.status && filters.status !== "all" && f.status !== filters.status) return false;
    if (search && !f.question?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [faqs, filters, search]);

  const saveItem = async (data) => {
    if (data.id) {
      await base44.entities.FAQItems.update(data.id, data);
      setFaqs(prev => prev.map(f => f.id === data.id ? { ...f, ...data } : f));
    } else {
      const created = await base44.entities.FAQItems.create(data);
      setFaqs(prev => [created, ...prev]);
    }
    setEditing(null);
  };

  const hasActive = search || Object.values(filters).some(v => v && v !== "all");

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="FAQ & Schema Builder" description={`${faqs.length} FAQ items across ${Object.keys(faqsByPage).length} pages`}>
        <Button size="sm" onClick={() => setEditing({})} className="gap-1"><Plus className="h-3.5 w-3.5" /> Add FAQ</Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit mb-5">
        {[{ id: "faqs", label: "FAQ Library", icon: HelpCircle }, { id: "schema", label: "Schema Planner", icon: Code2 }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === t.id ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      {activeTab === "faqs" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions…" className="h-8 w-52 pl-8 text-xs" />
            </div>
            {[
              { key: "faq_type", label: "Type", options: Object.entries(FAQ_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })) },
              { key: "language", label: "Language", options: [{ value: "en", label: "English" }, { value: "pl", label: "Polish" }, { value: "es", label: "Spanish" }, { value: "fr", label: "French" }] },
              { key: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }] },
            ].map(f => (
              <Select key={f.key} value={filters[f.key] || "all"} onValueChange={v => setFilters(p => ({ ...p, [f.key]: v }))}>
                <SelectTrigger className="h-8 w-auto min-w-[100px] text-xs"><SelectValue placeholder={f.label} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {f.label}</SelectItem>
                  {f.options.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
            {hasActive && <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => { setFilters({}); setSearch(""); }}><X className="h-3 w-3" /> Clear</Button>}
            <span className="text-xs text-muted-foreground ml-auto">{filtered.length} items</span>
          </div>

          {/* Grouped by page */}
          <div className="space-y-3">
            {pages.map(page => {
              const pageFaqs = filtered.filter(f => f.related_page_id === page.id);
              if (pageFaqs.length === 0) return null;
              const isOpen = expandedPage === page.id;
              return (
                <div key={page.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedPage(isOpen ? null : page.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-semibold">{page.title}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{page.page_type} · {pageFaqs.length} FAQ{pageFaqs.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                  {isOpen && (
                    <div className="border-t border-border divide-y divide-border/50">
                      {pageFaqs.map(faq => (
                        <div key={faq.id} className="px-4 py-3 flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", FAQ_TYPE_STYLES[faq.faq_type])}>{FAQ_TYPE_LABELS[faq.faq_type]}</span>
                              {faq.language && <span className="text-[10px] text-muted-foreground uppercase">{faq.language}</span>}
                            </div>
                            <p className="text-xs font-semibold mb-0.5">{faq.question}</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <ScoreBadge score={faq.seo_value_score} size="sm" />
                            <button onClick={() => setEditing(faq)} className="text-[10px] text-primary hover:underline">Edit</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "schema" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground mb-4">Schema recommendations for each live page based on page type and content signals.</p>
          {pages.map(page => {
            const rec = SCHEMA_SUGGESTIONS[page.page_type] || SCHEMA_SUGGESTIONS.blog;
            return (
              <div key={page.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold">{page.title}</p>
                      {page.schema_present ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Schema Live</span>
                      ) : (
                        <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium">No Schema</span>
                      )}
                      {rec.recommended && !page.schema_present && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium">Recommended</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Code2 className="h-3 w-3" />
                      <span className="font-mono font-semibold text-foreground">{rec.type}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">{rec.reason}</p>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <p className={cn("text-lg font-bold", rec.value >= 80 ? "text-emerald-600" : rec.value >= 65 ? "text-amber-600" : "text-slate-500")}>{rec.value}</p>
                    <p className="text-[9px] text-muted-foreground">SEO Value</p>
                  </div>
                </div>
                {!page.faq_present && page.page_type !== "faq" && (
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <p className="text-[10px] text-amber-700 bg-amber-50 rounded px-2 py-1">
                      ⚠ No FAQ present — adding 3-5 FAQ items and FAQPage schema could significantly improve SERP visibility for this page type.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <FAQEditor item={editing} pages={pages} onSave={saveItem} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}