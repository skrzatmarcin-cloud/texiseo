import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Eye, ExternalLink, AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_PAYLOAD = {
  title: "", slug: "", excerpt: "", content: "", status: "draft",
  post_type: "post", category_ids: [], tag_ids: [],
};

export default function WPDraftPublishing() {
  const [briefs, setBriefs] = useState([]);
  const [maps, setMaps] = useState([]);
  const [selectedBriefId, setSelectedBriefId] = useState("");
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [mapRecord, setMapRecord] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Briefs.filter({ status: "ready" }),
      base44.entities.Briefs.filter({ status: "approved" }),
      base44.entities.WordPressContentMap.list(),
    ]).then(([ready, approved, mapData]) => {
      setBriefs([...ready, ...approved]);
      setMaps(mapData);
    });
  }, []);

  const PAGE_TYPE_WP = {
    informational_blog: "post", service_support: "page", pillar_page: "page",
    faq_page: "page", comparison_page: "post", landing_page: "page", commercial_investigation: "post",
  };

  const onSelectBrief = (id) => {
    setSelectedBriefId(id);
    setResult(null);
    const brief = briefs.find(b => b.id === id);
    if (!brief) return;
    const existingMap = maps.find(m => m.base44_record_id === id);
    setMapRecord(existingMap || null);
    setPayload({
      title: brief.h1 || brief.brief_title || "",
      slug: (brief.slug || "").replace(/^\//, ""),
      excerpt: brief.meta_description || "",
      content: `<!-- Content body will be added by the writer. Brief: ${brief.brief_title} -->\n\n<!-- Primary keyword: ${brief.primary_keyword || "—"} -->\n<!-- Word count target: ${brief.target_word_count || "—"} -->`,
      status: "draft",
      post_type: PAGE_TYPE_WP[brief.page_type] || "post",
      category_ids: [], tag_ids: [],
    });
  };

  const set = (key, val) => setPayload(p => ({ ...p, [key]: val }));

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    const isUpdate = !!(mapRecord?.wordpress_post_id);
    const res = await base44.functions.invoke("wordpressProxy", {
      action: isUpdate ? "update_draft" : "push_draft",
      payload,
      post_type: payload.post_type,
      map_id: mapRecord?.id || null,
      wp_post_id: mapRecord?.wordpress_post_id || null,
    });
    setResult(res.data);

    if (res.data?.success && selectedBriefId) {
      // Create or update map record
      if (!mapRecord) {
        const newMap = await base44.entities.WordPressContentMap.create({
          base44_entity: "Briefs", base44_record_id: selectedBriefId,
          base44_title: payload.title, base44_content_type: payload.post_type === "post" ? "blog_post" : "service_support",
          wordpress_post_id: res.data.wordpress_id, wordpress_post_type: payload.post_type,
          wordpress_status: res.data.status, wordpress_permalink: res.data.wordpress_link,
          wordpress_slug: payload.slug, last_push_at: new Date().toISOString(),
          last_push_result: "success", sync_state: "synced",
          wordpress_last_synced_at: new Date().toISOString(),
        });
        setMapRecord(newMap);
      }
    }
    setSending(false);
  };

  const brief = briefs.find(b => b.id === selectedBriefId);
  const existingWpId = mapRecord?.wordpress_post_id;

  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-[11px] text-amber-800">
        <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
        <strong>Draft-first:</strong> All content is sent as a WordPress <strong>draft</strong> by default. Nothing is auto-published. You must manually publish in WordPress after review.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: source selection */}
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs font-semibold mb-3">Select Content to Push</p>
            <Select value={selectedBriefId} onValueChange={onSelectBrief}>
              <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Choose a brief (Ready or Approved)…" /></SelectTrigger>
              <SelectContent>
                {briefs.length === 0 ? <SelectItem value="none" disabled>No ready briefs found</SelectItem> : briefs.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.brief_title} ({b.status})</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {existingWpId && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-[11px] text-amber-800">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                This brief already has a WordPress entry (ID: #{existingWpId}). Sending will <strong>update</strong> the existing draft.
              </div>
            )}
          </div>

          {brief && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold">Publishing Settings</p>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">Title</label>
                <Input value={payload.title} onChange={e => set("title", e.target.value)} className="text-xs h-8" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">Slug</label>
                <Input value={payload.slug} onChange={e => set("slug", e.target.value)} className="text-xs h-8 font-mono" />
              </div>
              <div>
                <label className="text-[10px] font-medium text-muted-foreground block mb-1">Excerpt / Meta Description</label>
                <Input value={payload.excerpt} onChange={e => set("excerpt", e.target.value)} className="text-xs h-8" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground block mb-1">Post Type</label>
                  <Select value={payload.post_type} onValueChange={v => set("post_type", v)}>
                    <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Post</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] font-medium text-muted-foreground block mb-1">Status</label>
                  <Select value={payload.status} onValueChange={v => set("status", v)}>
                    <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft ✓</SelectItem>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="publish">Publish ⚠</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: preview + actions */}
        <div className="space-y-3">
          {brief && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold mb-3">Pre-Send Review</p>
              <div className="space-y-2 text-xs">
                {[
                  ["Title", payload.title],
                  ["Slug", `/${payload.slug}`],
                  ["Target Type", payload.post_type],
                  ["Target Status", payload.status],
                  ["Excerpt", payload.excerpt ? payload.excerpt.slice(0, 80) + (payload.excerpt.length > 80 ? "…" : "") : "—"],
                  ["Primary Keyword", brief.primary_keyword || "—"],
                  ["Word Count Target", brief.target_word_count ? `${brief.target_word_count} words` : "—"],
                ].map(([label, val]) => (
                  <div key={label} className="flex gap-2">
                    <span className="text-muted-foreground w-36 flex-shrink-0">{label}</span>
                    <span className={cn("font-medium truncate", label === "Target Status" && payload.status === "publish" ? "text-amber-600" : "")}>{val}</span>
                  </div>
                ))}
              </div>

              {payload.status === "publish" && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-[11px] text-red-700">
                  ⚠ <strong>Warning:</strong> You are about to publish content immediately. This cannot be undone automatically. Confirm this is intentional.
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button size="sm" className="gap-1.5 text-xs h-8" onClick={handleSend} disabled={sending || !payload.title}>
                  {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  {sending ? "Sending…" : existingWpId ? "Update in WordPress" : "Send as Draft"}
                </Button>
              </div>
            </div>
          )}

          {result && (
            <div className={cn("rounded-xl border p-4 text-xs", result.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200")}>
              {result.success ? (
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-700">Successfully sent to WordPress</p>
                    <p className="text-emerald-600 mt-0.5">WordPress ID: #{result.wordpress_id} · Status: {result.status}</p>
                    {result.wordpress_link && (
                      <a href={result.wordpress_link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-emerald-700 hover:underline mt-1">
                        View in WordPress <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-700">Send failed</p>
                    <p className="text-red-600 mt-0.5">{result.error || "Unknown error"}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!brief && (
            <div className="bg-card border border-border rounded-xl py-12 text-center">
              <Send className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-40" />
              <p className="text-sm text-muted-foreground">Select a brief to configure the push</p>
              <p className="text-[11px] text-muted-foreground mt-1">Only briefs with status "Ready" or "Approved" are shown</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}