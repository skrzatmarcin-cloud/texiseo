import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, FileText, ExternalLink, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ScoreBadge from "../components/ScoreBadge";
import BriefSectionBlock from "../components/briefs/BriefSectionBlock";
import BriefStructureBlock from "../components/briefs/BriefStructureBlock";
import { cn } from "@/lib/utils";
import { LANG_FLAG } from "../lib/constants";

const PAGE_TYPE_LABELS = {
  informational_blog: "Artykuł informacyjny",
  service_support: "Wsparcie usługi",
  pillar_page: "Strona filarowa",
  faq_page: "Strona FAQ",
  comparison_page: "Porównanie",
  landing_page: "Landing page",
  commercial_investigation: "Analiza komercyjna",
};

const STATUS_OPTIONS = ["draft", "ready", "in_review", "approved", "archived"];

const BRIEF_STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-600",
  ready: "bg-blue-50 text-blue-700",
  in_review: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  archived: "bg-gray-100 text-gray-500",
};

export default function BriefDetail() {
  const { id } = useParams();
  const [brief, setBrief] = useState(null);
  const [idea, setIdea] = useState(null);
  const [cluster, setCluster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);

  useEffect(() => {
    base44.entities.Briefs.filter({ id }).then(async ([b]) => {
      setBrief(b || null);
      if (!b) { setLoading(false); return; }
      const fetches = [];
      if (b.content_idea_id) fetches.push(base44.entities.ContentIdeas.filter({ id: b.content_idea_id }).then(([i]) => setIdea(i)));
      if (b.cluster_id) fetches.push(base44.entities.Clusters.filter({ id: b.cluster_id }).then(([c]) => setCluster(c)));
      await Promise.all(fetches);
      setLoading(false);
    });
  }, [id]);

  const updateField = async (field, value) => {
    setSaving(true);
    await base44.entities.Briefs.update(id, { [field]: value });
    setBrief(prev => ({ ...prev, [field]: value }));
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-muted-foreground">Brief not found.</p>
        <Link to="/brief-builder" className="text-sm text-primary hover:underline mt-2 inline-block">Back to Brief Builder</Link>
      </div>
    );
  }

  let h2Structure = [];
  let faqItems = [];
  let internalLinks = [];
  let anchorSuggestions = [];
  try { h2Structure = JSON.parse(brief.h2_structure_json || "[]"); } catch {}
  try { faqItems = JSON.parse(brief.faq_json || "[]"); } catch {}
  try { internalLinks = JSON.parse(brief.internal_links_json || "[]"); } catch {}
  try { anchorSuggestions = JSON.parse(brief.anchor_suggestions_json || "[]"); } catch {}

  const completeness = brief.completeness_score || 0;
  const completenessColor = completeness >= 80 ? "text-emerald-600" : completeness >= 60 ? "text-amber-600" : "text-red-500";

  return (
    <div className="p-4 lg:p-6 max-w-[1100px] mx-auto">
      <Link to="/brief-builder" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-3 w-3" /> Powrót do kreatora briefów
      </Link>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight mb-1">{brief.brief_title}</h1>
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
              <span className="bg-secondary px-2 py-0.5 rounded">{PAGE_TYPE_LABELS[brief.page_type] || brief.page_type}</span>
              <span>{LANG_FLAG[brief.language]} {brief.language?.toUpperCase()}</span>
              <span className="capitalize">{brief.audience}</span>
              <span className="capitalize">{brief.funnel_stage}</span>
              {brief.target_word_count && <span>{brief.target_word_count.toLocaleString()} words</span>}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <p className={cn("text-2xl font-bold", completenessColor)}>{completeness}</p>
              <p className="text-[9px] text-muted-foreground">Kompletność</p>
            </div>
            {editingStatus ? (
              <select
                className="text-xs border rounded-lg px-2 py-1 bg-card"
                value={brief.status}
                onChange={e => { updateField("status", e.target.value); setEditingStatus(false); }}
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            ) : (
              <button onClick={() => setEditingStatus(true)} className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg cursor-pointer", BRIEF_STATUS_STYLES[brief.status])}>
                {brief.status?.replace(/_/g, " ")}
              </button>
            )}
            {saving && <span className="text-[10px] text-muted-foreground">Saving…</span>}
          </div>
        </div>

        {/* Linked references */}
        <div className="flex flex-wrap gap-3 pt-3 border-t border-border/40">
          {idea && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <FileText className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">Pomysł:</span>
              <span className="font-medium truncate max-w-[200px]">{idea.title}</span>
            </div>
          )}
          {cluster && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <Link to={`/clusters/${cluster.id}`} className="text-primary hover:underline font-medium flex items-center gap-1">
                Cluster: {cluster.name} <ExternalLink className="h-2.5 w-2.5" />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left — strategy */}
        <div className="space-y-3">

          {/* Keyword strategy */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Strategia słów kluczowych</h3>
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Główne słowo kluczowe</p>
                <p className="text-xs font-semibold">{brief.primary_keyword || "—"}</p>
              </div>
              {brief.secondary_keywords?.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Pomocnicze słowa kluczowe</p>
                  <div className="flex flex-wrap gap-1">
                    {brief.secondary_keywords.map((k, i) => (
                      <span key={i} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">{k}</span>
                    ))}
                  </div>
                </div>
              )}
              {brief.semantic_keywords?.length > 0 && (
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Semantyczne słowa kluczowe</p>
                  <div className="flex flex-wrap gap-1">
                    {brief.semantic_keywords.map((k, i) => (
                      <span key={i} className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Meta i URL</h3>
            <div className="space-y-2.5">
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Tytuł Meta</p>
                <p className="text-xs font-medium leading-snug">{brief.meta_title || "—"}</p>
                {brief.meta_title && <p className={cn("text-[9px] mt-0.5", brief.meta_title.length > 60 ? "text-red-500" : "text-emerald-600")}>{brief.meta_title.length}/60 chars</p>}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Opis Meta</p>
                <p className="text-xs text-muted-foreground leading-snug">{brief.meta_description || "—"}</p>
                {brief.meta_description && <p className={cn("text-[9px] mt-0.5", brief.meta_description.length > 160 ? "text-red-500" : "text-emerald-600")}>{brief.meta_description.length}/160 chars</p>}
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Proponowany slug</p>
                <p className="text-[11px] font-mono text-primary">{brief.slug || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">Typ schematu</p>
                <p className="text-xs font-medium">{brief.schema_type || "—"}</p>
              </div>
            </div>
          </div>

          {/* Business logic */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Strategia i cele</h3>
            <div className="space-y-2.5 text-[11px]">
              <div><p className="text-muted-foreground">Intencja wyszukiwania</p><p className="font-medium mt-0.5">{brief.search_intent_summary || "—"}</p></div>
              <div><p className="text-muted-foreground">Odbiorcy</p><p className="font-medium mt-0.5">{brief.audience_summary || "—"}</p></div>
              <div><p className="text-muted-foreground">Cel biznesowy</p><p className="font-medium mt-0.5">{brief.business_goal || "—"}</p></div>
              <div><p className="text-muted-foreground">Cel CTA</p><p className="font-medium mt-0.5">{brief.cta_goal || "—"}</p></div>
            </div>
          </div>

          {/* Internal links */}
          {internalLinks.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Linki wewnętrzne</h3>
              <div className="space-y-2">
                {internalLinks.map((l, i) => (
                  <div key={i} className="text-[11px]">
                    <p className="font-medium">{l.page}</p>
                    <p className="text-muted-foreground">{l.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anchor suggestions */}
          {anchorSuggestions.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Sugestie tekstu kotwicy</h3>
              <div className="flex flex-wrap gap-1">
                {anchorSuggestions.map((a, i) => (
                  <span key={i} className="text-[10px] bg-secondary px-2 py-0.5 rounded font-medium">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — content structure */}
        <div className="lg:col-span-2 space-y-3">

          {/* H1 */}
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide mb-1.5">Zalecany H1</p>
            <p className="text-base font-bold text-foreground">{brief.h1 || "Nie ustawiono"}</p>
          </div>

          {/* H2 Structure */}
          {h2Structure.length > 0 && <BriefStructureBlock sections={h2Structure} />}

          {/* FAQ */}
          {faqItems.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3">Sekcja FAQ ({faqItems.length} pytań)</h3>
              <div className="space-y-3">
                {faqItems.map((faq, i) => (
                  <div key={i} className="border-l-2 border-primary/30 pl-3">
                    <p className="text-xs font-semibold">{faq.q}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {brief.mid_cta && (
              <BriefSectionBlock label="Mid-Content CTA" content={brief.mid_cta} accent="blue" />
            )}
            {brief.bottom_cta && (
              <BriefSectionBlock label="Bottom CTA" content={brief.bottom_cta} accent="emerald" />
            )}
          </div>

          {/* Quality sections */}
          {[
            { label: "Ton i głos", field: "tone_notes", accent: "purple" },
            { label: "Wytyczne E-E-A-T", field: "eeat_notes", accent: "blue" },
            { label: "Dla kogo", field: "who_for", accent: "emerald" },
            { label: "Dla kogo nie jest", field: "who_not_for", accent: "red" },
            { label: "Elementy budujące zaufanie", field: "trust_blocks", accent: "amber" },
            { label: "Obsługa obiekcji", field: "objection_handling", accent: "amber" },
            { label: "Sugestie bloków porównania", field: "comparison_blocks", accent: "slate" },
            { label: "Błędy do uniknięcia", field: "mistakes_to_avoid", accent: "red" },
          ].filter(s => brief[s.field]).map(s => (
            <BriefSectionBlock
              key={s.field}
              label={s.label}
              content={brief[s.field]}
              accent={s.accent}
              editable
              onSave={val => updateField(s.field, val)}
            />
          ))}

          {/* Editable notes */}
          <EditableNotesBlock
            label="Notatki dla redaktora"
            value={brief.editor_notes || ""}
            onSave={val => updateField("editor_notes", val)}
          />
          <EditableNotesBlock
            label="QA / Lista kontrolna"
            value={brief.qa_notes || ""}
            onSave={val => updateField("qa_notes", val)}
          />
        </div>
      </div>
    </div>
  );
}

function EditableNotesBlock({ label, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</h3>
        {!editing ? (
          <button onClick={() => { setDraft(value); setEditing(true); }} className="text-[10px] text-primary hover:underline flex items-center gap-1">
            <Edit2 className="h-3 w-3" /> Edytuj
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { onSave(draft); setEditing(false); }} className="text-[10px] text-emerald-600 hover:underline flex items-center gap-1">
              <Check className="h-3 w-3" /> Zapisz
            </button>
            <button onClick={() => setEditing(false)} className="text-[10px] text-muted-foreground hover:underline">Anuluj</button>
          </div>
        )}
      </div>
      {editing ? (
        <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="text-xs min-h-[80px]" />
      ) : (
        <p className="text-[11px] text-muted-foreground leading-relaxed whitespace-pre-line">{value || "Jeszcze nie napisane."}</p>
      )}
    </div>
  );
}