import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, ExternalLink, Copy, Zap, Hand, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { id: "wordpress",  label: "WordPress",  emoji: "🌐", mode: "auto",   color: "border-blue-200 bg-blue-50/30",    connected: true },
  { id: "medium",     label: "Medium",     emoji: "📖", mode: "auto",   color: "border-slate-200 bg-slate-50/30",  connected: false },
  { id: "blogger",    label: "Blogger",    emoji: "📰", mode: "auto",   color: "border-orange-200 bg-orange-50/30",connected: false },
  { id: "pinterest",  label: "Pinterest",  emoji: "📌", mode: "auto",   color: "border-red-200 bg-red-50/30",      connected: false },
  { id: "facebook",   label: "Facebook",   emoji: "📘", mode: "manual", color: "border-blue-200 bg-blue-50/30",    connected: false },
  { id: "instagram",  label: "Instagram",  emoji: "📸", mode: "manual", color: "border-pink-200 bg-pink-50/30",    connected: false },
  { id: "tiktok",     label: "TikTok",     emoji: "🎵", mode: "manual", color: "border-slate-200 bg-slate-50/30",  connected: false },
  { id: "reddit",     label: "Reddit",     emoji: "🤖", mode: "manual", color: "border-orange-200 bg-orange-50/30",connected: false },
  { id: "quora",      label: "Quora",      emoji: "❓", mode: "manual", color: "border-red-200 bg-red-50/30",      connected: false },
];

const STATUS_LABELS = {
  pending: "Oczekuje", approved: "Zatwierdzony", scheduled: "Zaplanowany",
  publishing: "Publikuje", published: "Opublikowany", failed: "Błąd", skipped: "Pominięty",
};

const STATUS_STYLES = {
  pending: "bg-slate-100 text-slate-600",
  approved: "bg-blue-50 text-blue-700",
  scheduled: "bg-purple-50 text-purple-700",
  publishing: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-600",
  skipped: "bg-gray-100 text-gray-400",
};

const PLATFORM_LINKS = {
  medium: "https://medium.com/new-story",
  blogger: "https://draft.blogger.com",
  pinterest: "https://pinterest.com/pin/create/button/",
  facebook: "https://www.facebook.com",
  instagram: "https://www.instagram.com",
  tiktok: "https://www.tiktok.com/upload",
  reddit: "https://www.reddit.com/submit",
  quora: "https://www.quora.com",
};

function PlatformCard({ platform, posts, onMarkPublished, onCopy }) {
  const [open, setOpen] = useState(false);
  const platformPosts = posts.filter(p => p.platform === platform.id);
  const published = platformPosts.filter(p => p.status === "published").length;
  const pending = platformPosts.filter(p => p.status === "approved" || p.status === "pending").length;

  return (
    <div className={cn("border rounded-xl overflow-hidden", platform.color)}>
      <button className="w-full flex items-center justify-between px-4 py-3.5" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{platform.emoji}</span>
          <div className="text-left">
            <p className="text-sm font-semibold">{platform.label}</p>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              {platform.mode === "auto"
                ? <span className="flex items-center gap-1 text-emerald-600"><Zap className="h-3 w-3" />Auto</span>
                : <span className="flex items-center gap-1 text-amber-600"><Hand className="h-3 w-3" />Ręczny</span>
              }
              <span>·</span>
              <span className="text-emerald-600">{published} opublikowanych</span>
              {pending > 0 && <span className="text-primary font-medium">{pending} oczekuje</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {platform.connected
            ? <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium"><CheckCircle2 className="h-3 w-3" />Połączony</span>
            : <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary px-2 py-1 rounded-md"><AlertCircle className="h-3 w-3" />Konfiguruj</span>
          }
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/30 space-y-2">
          {/* Connection config */}
          {!platform.connected && (
            <div className="bg-white/60 border border-border rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold mb-1">Konfiguracja połączenia</p>
              <p className="text-[11px] text-muted-foreground mb-2">
                {platform.mode === "auto"
                  ? `Skonfiguruj połączenie API dla ${platform.label}, aby umożliwić auto-publikację.`
                  : `Platforma ${platform.label} wymaga ręcznej publikacji. Przejdź do Integracji, aby skonfigurować.`
                }
              </p>
              <a href="/integrations" className="text-xs text-primary hover:underline">Przejdź do Integracji →</a>
            </div>
          )}

          {/* Posts */}
          {platformPosts.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">Brak postów. Wygeneruj treść w Silniku Treści.</p>
          ) : (
            <div className="space-y-2 mt-2">
              {platformPosts.map(post => (
                <div key={post.id} className="bg-white/70 border border-border/50 rounded-lg px-3 py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{post.title || "Post"}</p>
                    <p className="text-[10px] text-muted-foreground">{post.published_at || post.scheduled_at || post.created_date?.split("T")[0]}</p>
                  </div>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0", STATUS_STYLES[post.status])}>
                    {STATUS_LABELS[post.status] || post.status}
                  </span>
                  {(post.status === "approved" || post.status === "pending") && platform.mode === "manual" && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => onCopy(post.content)}>
                        <Copy className="h-2.5 w-2.5" />
                      </Button>
                      {PLATFORM_LINKS[platform.id] && (
                        <Button size="sm" variant="outline" className="h-6 text-[10px]" asChild>
                          <a href={PLATFORM_LINKS[platform.id]} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-2.5 w-2.5" /></a>
                        </Button>
                      )}
                      <Button size="sm" className="h-6 text-[10px] bg-teal-600 hover:bg-teal-700" onClick={() => onMarkPublished(post)}>✓</Button>
                    </div>
                  )}
                  {post.external_url && (
                    <a href={post.external_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SocialMedia() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => base44.entities.PlatformPosts.list("-created_date", 100).then(p => { setPosts(p); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleMarkPublished = async (post) => {
    await base44.entities.PlatformPosts.update(post.id, { status: "published", published_at: new Date().toISOString().split("T")[0] });
    load();
  };

  const handleCopy = (content) => navigator.clipboard.writeText(content || "");

  const totalPublished = posts.filter(p => p.status === "published").length;
  const totalPending = posts.filter(p => p.status === "approved" || p.status === "pending").length;

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Social Media" description="Zarządzanie publikacjami na wszystkich platformach">
        <div className="flex gap-3 text-xs">
          <span className="text-emerald-600 font-semibold">{totalPublished} opublikowanych</span>
          {totalPending > 0 && <span className="text-primary font-semibold">{totalPending} oczekuje</span>}
        </div>
      </PageHeader>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 text-[11px] text-amber-800">
        <strong>Zasada bezpieczeństwa:</strong> Maksymalnie 1-2 posty dziennie na platformę. Auto-publikacja tylko dla skonfigurowanych, bezpiecznych platform. Ręczna kontrola dla Reddit, Quora, TikTok.
      </div>

      <div className="space-y-3">
        {PLATFORMS.map(platform => (
          <PlatformCard key={platform.id} platform={platform} posts={posts} onMarkPublished={handleMarkPublished} onCopy={handleCopy} />
        ))}
      </div>
    </div>
  );
}