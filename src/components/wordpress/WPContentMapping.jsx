import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CONTENT_TYPE_MAP = [
  { base44_type: "blog_post", base44_label: "Blog Post", wp_type: "post", wp_label: "WordPress Post", note: "Informational articles, guides, parent resources" },
  { base44_type: "service_support", base44_label: "Service Support", wp_type: "post", wp_label: "WordPress Post", note: "Support articles for specific service pages" },
  { base44_type: "parent_guide", base44_label: "Parent Guide", wp_type: "post", wp_label: "WordPress Post", note: "Trust-building content for parents" },
  { base44_type: "trust_building", base44_label: "Trust Building", wp_type: "post", wp_label: "WordPress Post", note: "Authority and credibility articles" },
  { base44_type: "comparison", base44_label: "Comparison Page", wp_type: "post", wp_label: "WordPress Post", note: "Private vs group, online vs in-person" },
  { base44_type: "faq_page", base44_label: "FAQ Page", wp_type: "page", wp_label: "WordPress Page", note: "FAQ hub pages use WP pages by default" },
  { base44_type: "pillar_page", base44_label: "Pillar Page", wp_type: "page", wp_label: "WordPress Page", note: "Comprehensive pillar content maps to WP pages" },
  { base44_type: "commercial_investigation", base44_label: "Commercial Investigation", wp_type: "post", wp_label: "WordPress Post", note: "Decision-stage comparison and review content" },
  { base44_type: "conversion_assist", base44_label: "Conversion Assist / Landing", wp_type: "page", wp_label: "WordPress Page", note: "Trial landing pages, conversion-focused" },
];

const DEMO_MAPPINGS = [
  { base44_title: "How to Choose Online English Lessons for Your Child", base44_type: "parent_guide", wp_type: "post", wp_id: null, sync_state: "not_synced", language: "en" },
  { base44_title: "Spanish Lessons Online — Service Page", base44_type: "service_support", wp_type: "page", wp_id: 42, sync_state: "synced", language: "en" },
  { base44_title: "Polish for Foreigners — Complete Guide", base44_type: "pillar_page", wp_type: "page", wp_id: 38, sync_state: "changed_in_wordpress", language: "en" },
  { base44_title: "Private vs Group Language Lessons: Which is Better?", base44_type: "comparison", wp_type: "post", wp_id: 67, sync_state: "synced", language: "en" },
  { base44_title: "French Lessons for Adults Online", base44_type: "service_support", wp_type: "page", wp_id: null, sync_state: "not_synced", language: "en" },
  { base44_title: "Is My Child Ready to Learn a Language?", base44_type: "parent_guide", wp_type: "post", wp_id: 89, sync_state: "conflict", language: "en" },
];

const SYNC_STATE_STYLES = {
  not_synced: "bg-slate-100 text-slate-500",
  imported: "bg-blue-50 text-blue-700",
  synced: "bg-emerald-50 text-emerald-700",
  changed_in_wordpress: "bg-amber-50 text-amber-700",
  conflict: "bg-red-50 text-red-700",
  failed: "bg-red-100 text-red-800",
};

export default function WPContentMapping() {
  const [maps, setMaps] = useState([]);
  const [resolving, setResolving] = useState(null);

  useEffect(() => {
    base44.entities.WordPressContentMap.list("-created_date").then(data => {
      setMaps(data.length > 0 ? data : DEMO_MAPPINGS.map((d, i) => ({ ...d, id: `demo_${i}`, base44_record_id: "" })));
    });
  }, []);

  const conflicts = maps.filter(m => m.sync_state === "conflict");

  return (
    <div>
      {/* Type mapping rules */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-4">
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <p className="text-xs font-semibold">Base44 → WordPress Type Mapping Rules</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">How each Base44 content type maps to WordPress object types by default</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-semibold">Base44 Type</th>
                <th className="text-left px-4 py-2 font-semibold">Maps To</th>
                <th className="text-left px-4 py-2 font-semibold hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {CONTENT_TYPE_MAP.map((r, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-4 py-2.5">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-medium">{r.base44_label}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">{r.wp_label}</span>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-[10px] text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conflict panel */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-xs font-semibold text-red-700">{conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""} — Manual Decision Required</p>
          </div>
          <div className="space-y-2">
            {conflicts.map((c, i) => (
              <div key={i} className="bg-white border border-red-200 rounded-lg p-3">
                <p className="text-xs font-semibold mb-1">{c.base44_title || "Untitled"}</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground mb-2">
                  <div><span className="font-medium text-foreground">WP modified:</span> {c.wordpress_modified_gmt ? new Date(c.wordpress_modified_gmt).toLocaleDateString() : "Unknown"}</div>
                  <div><span className="font-medium text-foreground">Last sync:</span> {c.wordpress_last_synced_at ? new Date(c.wordpress_last_synced_at).toLocaleDateString() : "Never"}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => {
                    if (c.id && !c.id.startsWith("demo_")) {
                      base44.entities.WordPressContentMap.update(c.id, { sync_state: "synced", conflict_note: "Kept WordPress version" });
                      setMaps(prev => prev.map(m => m.id === c.id ? { ...m, sync_state: "synced" } : m));
                    }
                  }}>Keep WordPress version</Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => {
                    if (c.id && !c.id.startsWith("demo_")) {
                      base44.entities.WordPressContentMap.update(c.id, { sync_state: "changed_in_base44", conflict_note: "Kept Base44 version" });
                      setMaps(prev => prev.map(m => m.id === c.id ? { ...m, sync_state: "changed_in_base44" } : m));
                    }
                  }}>Keep Base44 version</Button>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground">Review later</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <p className="text-xs font-semibold">Content Item Mapping {maps.some(m => m.id?.startsWith("demo_")) ? "(Demo Data)" : ""}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left px-4 py-2 font-semibold">Base44 Item</th>
                <th className="text-left px-4 py-2 font-semibold">Type</th>
                <th className="text-left px-4 py-2 font-semibold">WP Type</th>
                <th className="text-left px-4 py-2 font-semibold">WP ID</th>
                <th className="text-left px-4 py-2 font-semibold">Sync State</th>
                <th className="text-left px-4 py-2 font-semibold hidden lg:table-cell">Last Synced</th>
              </tr>
            </thead>
            <tbody>
              {maps.map((m, i) => (
                <tr key={m.id || i} className="border-b border-border/40 hover:bg-secondary/20">
                  <td className="px-4 py-2.5">
                    <p className="font-medium truncate max-w-[200px]">{m.base44_title || "Untitled"}</p>
                    {m.language && <span className="text-[10px] text-muted-foreground uppercase">{m.language}</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">{(m.base44_content_type || m.base44_type || "—").replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[10px] capitalize">{m.wordpress_post_type || m.wp_type || "—"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {(m.wordpress_post_id || m.wp_id) ? (
                      <span className="font-mono text-[10px]">#{m.wordpress_post_id || m.wp_id}</span>
                    ) : <span className="text-muted-foreground text-[10px]">not created</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={cn("inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium", SYNC_STATE_STYLES[m.sync_state] || SYNC_STATE_STYLES.not_synced)}>
                      {(m.sync_state || "not_synced").replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-[10px] text-muted-foreground">
                    {m.wordpress_last_synced_at ? new Date(m.wordpress_last_synced_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}