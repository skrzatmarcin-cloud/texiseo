import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LANGUAGES, AUDIENCES, CONTENT_TYPES, STATUSES, FUNNEL_STAGES, SEARCH_INTENTS } from "../../lib/constants";
import ScoreBadge from "../ScoreBadge";

export default function ContentIdeaEditor({ ideaId, clusters, pages, onClose, onSaved }) {
  const [data, setData] = useState({
    title: "", seo_title: "", slug_idea: "", content_type: "blog_post",
    language: "en", audience: "all", search_intent: "informational",
    funnel_stage: "awareness", primary_keyword: "", secondary_keywords: [],
    semantic_keywords: [], cluster_id: "", priority_score: 50,
    conversion_score: 50, topical_value_score: 50, difficulty_score: 50,
    freshness_score: 50, business_relevance_score: 50, status: "idea",
    notes: "", recommended_service_page_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!ideaId);

  useEffect(() => {
    if (ideaId) {
      base44.entities.ContentIdeas.filter({ id: ideaId }).then(res => {
        if (res.length) setData(res[0]);
        setLoading(false);
      });
    }
  }, [ideaId]);

  const handleSave = async () => {
    setSaving(true);
    const { id, created_date, updated_date, created_by, ...payload } = data;
    if (ideaId) {
      await base44.entities.ContentIdeas.update(ideaId, payload);
    } else {
      await base44.entities.ContentIdeas.create(payload);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  if (loading) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">{ideaId ? "Edit" : "New"} Content Idea</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <div className="sm:col-span-2">
            <Label className="text-xs">Title</Label>
            <Input value={data.title} onChange={e => set("title", e.target.value)} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">SEO Title</Label>
            <Input value={data.seo_title || ""} onChange={e => set("seo_title", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Primary Keyword</Label>
            <Input value={data.primary_keyword || ""} onChange={e => set("primary_keyword", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Slug Idea</Label>
            <Input value={data.slug_idea || ""} onChange={e => set("slug_idea", e.target.value)} className="mt-1" />
          </div>

          {[
            { key: "content_type", label: "Content Type", opts: CONTENT_TYPES },
            { key: "language", label: "Language", opts: LANGUAGES.filter(l => l.value !== "multi") },
            { key: "audience", label: "Audience", opts: AUDIENCES },
            { key: "search_intent", label: "Search Intent", opts: SEARCH_INTENTS },
            { key: "funnel_stage", label: "Funnel Stage", opts: FUNNEL_STAGES },
            { key: "status", label: "Status", opts: STATUSES },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-xs">{f.label}</Label>
              <Select value={data[f.key] || ""} onValueChange={v => set(f.key, v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {f.opts.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div>
            <Label className="text-xs">Cluster</Label>
            <Select value={data.cluster_id || "none"} onValueChange={v => set("cluster_id", v === "none" ? "" : v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {clusters.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Service Page</Label>
            <Select value={data.recommended_service_page_id || "none"} onValueChange={v => set("recommended_service_page_id", v === "none" ? "" : v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {pages.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Scores */}
          <div className="sm:col-span-2 border-t border-border pt-3 mt-1">
            <p className="text-xs font-semibold mb-3">Scoring</p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { key: "priority_score", label: "Priority" },
                { key: "conversion_score", label: "Conversion" },
                { key: "topical_value_score", label: "Topical" },
                { key: "difficulty_score", label: "Difficulty" },
                { key: "freshness_score", label: "Freshness" },
                { key: "business_relevance_score", label: "Business" },
              ].map(s => (
                <div key={s.key} className="flex flex-col items-center gap-1">
                  <ScoreBadge score={data[s.key]} size="md" />
                  <Label className="text-[10px] text-center">{s.label}</Label>
                  <Input
                    type="number" min={0} max={100}
                    value={data[s.key] || 0}
                    onChange={e => set(s.key, parseInt(e.target.value) || 0)}
                    className="h-7 w-14 text-center text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Label className="text-xs">Notes</Label>
            <Textarea value={data.notes || ""} onChange={e => set("notes", e.target.value)} className="mt-1" rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !data.title}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}