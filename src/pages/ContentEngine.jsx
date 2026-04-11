import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wand2, Copy, ChevronDown, ChevronUp, CheckCircle2, Globe, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

const SAFE_PLATFORMS = ["medium","blogger","pinterest"];

const PLATFORM_SECTIONS = [
  { key: "blog_article",          platform: "wordpress",  label: "📝 Artykuł WordPress",        mode: "auto" },
  { key: "blogger_post",          platform: "blogger",    label: "📰 Post Blogger",              mode: "auto" },
  { key: "medium_article",        platform: "medium",     label: "📖 Artykuł Medium",            mode: "auto" },
  { key: "pinterest_description", platform: "pinterest",  label: "📌 Opis Pinterest",            mode: "auto" },
  { key: "facebook_post",         platform: "facebook",   label: "📘 Post Facebook",             mode: "manual" },
  { key: "instagram_caption",     platform: "instagram",  label: "📸 Caption Instagram",         mode: "manual" },
  { key: "tiktok_script",         platform: "tiktok",     label: "🎵 Skrypt TikTok",             mode: "manual" },
  { key: "short_snippet",         platform: "general",    label: "✂️ Fragment edukacyjny",        mode: "auto" },
  { key: "backlink_snippet",      platform: "backlink",   label: "🔗 Fragment do backlinkowania", mode: "auto" },
];

function ContentSection({ label, value, platform, mode, onApprove, onCopy, contentItemId }) {
  const [open, setOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  if (!value) return null;

  const handleApprove = async () => {
    setApproving(true);
    await base44.entities.PlatformPosts.create({
      content_item_id: contentItemId,
      platform,
      execution_mode: mode,
      status: "approved",
      title: label,
      content: value,
      language: "en",
    });
    await base44.entities.ExecutionLogs.create({
      action_type: `${platform}_publish`,
      entity_type: "ContentItems",
      entity_id: contentItemId,
      item_name: label,
      platform,
      status: "pending",
      executed_at: new Date().toISOString().split("T")[0],
      triggered_by: "Marcin",
    });
    setApproved(true);
    setApproving(false);
  };

  return (
    <div className={cn("border rounded-xl overflow-hidden", approved ? "border-emerald-200 bg-emerald-50/30" : "border-border bg-card")}>
      <button className="w-full flex items-center justify-between px-4 py-3 text-left" onClick={() => setOpen(v => !v)}>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium",
            mode === "auto" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
            {mode === "auto" ? "Auto" : "Ręczny"}
          </span>
          {approved && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium flex items-center gap-1"><CheckCircle2 className="h-2.5 w-2.5" />Zatwierdzono</span>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border/50">
          <p className="text-[11px] text-foreground leading-relaxed whitespace-pre-line mt-3 bg-secondary/40 rounded-lg p-3 max-h-48 overflow-y-auto">{value}</p>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onCopy(value)}>
              <Copy className="h-3 w-3" />Kopiuj
            </Button>
            {!approved && (
              <Button size="sm" className="h-7 text-xs gap-1 bg-primary" onClick={handleApprove} disabled={approving}>
                <CheckCircle2 className="h-3 w-3" />{approving ? "…" : "Zatwierdź i dodaj do kolejki"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContentEngine() {
  const [items, setItems] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(null);
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [language, setLanguage] = useState("en");
  const [audience, setAudience] = useState("all");
  const [recording, setRecording] = useState(false);
  const [mediaRec, setMediaRec] = useState(null);
  const [copied, setCopied] = useState(false);

  const load = () => base44.entities.ContentItems.list("-created_date", 30).then(setItems);
  useEffect(() => { load(); }, []);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (!topic) return;
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      model: "claude_sonnet_4_6",
      prompt: `You are a content creator for Linguatoons, an online language school at https://linguatoons.com.
Generate multi-platform content for the following topic:

Topic: ${topic}
Primary keyword: ${keyword || topic}
Language: ${language}
Audience: ${audience}

Generate a comprehensive JSON with all platform versions. Make everything human-like, educational, engaging.
All content must naturally include linguatoons.com as a reference.

Return JSON with these exact fields:
- blog_article (full 800-1000 word WordPress blog post with H2/H3 structure)
- blogger_post (600 word version for Blogger)
- medium_article (700 word version for Medium, engaging intro)
- pinterest_title (max 100 chars, catchy)
- pinterest_description (max 500 chars, educational, with link)
- pinterest_image_prompt (detailed image generation prompt)
- facebook_post (150-200 words, engaging, with emoji, soft CTA)
- instagram_caption (120 words max, with emoji)
- instagram_hashtags (20-25 relevant hashtags as string)
- tiktok_hook (opening 3 seconds, grabby sentence)
- tiktok_script (60-90 second script with timestamps)
- tiktok_caption (short, with hashtags)
- short_snippet (2-3 sentences educational)
- backlink_snippet (2-3 sentences naturally linking to linguatoons.com)
- meta_title (60 chars max, includes keyword)
- meta_description (160 chars max, compelling)`,
      response_json_schema: {
        type: "object",
        properties: {
          blog_article: { type: "string" },
          blogger_post: { type: "string" },
          medium_article: { type: "string" },
          pinterest_title: { type: "string" },
          pinterest_description: { type: "string" },
          pinterest_image_prompt: { type: "string" },
          facebook_post: { type: "string" },
          instagram_caption: { type: "string" },
          instagram_hashtags: { type: "string" },
          tiktok_hook: { type: "string" },
          tiktok_script: { type: "string" },
          tiktok_caption: { type: "string" },
          short_snippet: { type: "string" },
          backlink_snippet: { type: "string" },
          meta_title: { type: "string" },
          meta_description: { type: "string" },
        }
      }
    });

    const item = await base44.entities.ContentItems.create({
      topic, primary_keyword: keyword || topic, language, audience,
      target_url: "https://linguatoons.com",
      ...result,
      status: "generated",
    });
    await base44.entities.ExecutionLogs.create({
      action_type: "content_generate", entity_type: "ContentItems", entity_id: item.id,
      item_name: topic, status: "completed",
      executed_at: new Date().toISOString().split("T")[0], triggered_by: "Marcin",
    });
    setGenerating(false);
    setSelected(item);
    load();
  };

  const handleVoice = async () => {
    if (recording) {
      mediaRec?.stop();
      setRecording(false);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    const chunks = [];
    rec.ondataavailable = e => chunks.push(e.data);
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `The user recorded a voice note for a language learning blog idea. Extract the topic and suggest: a blog topic, primary keyword, and brief description. Return as JSON: { topic, keyword, description }`,
        response_json_schema: { type: "object", properties: { topic: { type: "string" }, keyword: { type: "string" }, description: { type: "string" } } }
      });
      if (result.topic) setTopic(result.topic);
      if (result.keyword) setKeyword(result.keyword);
    };
    rec.start();
    setMediaRec(rec);
    setRecording(true);
  };

  return (
    <div className="p-4 lg:p-6 max-w-[1200px] mx-auto">
      <PageHeader title="Silnik Treści" description="1 temat → wiele platform — generuj, zatwierdzaj, publikuj" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 sticky top-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Wand2 className="h-4 w-4 text-primary" />Generator treści</h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs">Temat</Label>
                <button onClick={handleVoice} className={cn("flex items-center gap-1 text-[10px] px-2 py-1 rounded-md transition-colors",
                  recording ? "bg-red-50 text-red-600 animate-pulse" : "text-muted-foreground hover:text-primary")}>
                  {recording ? <><MicOff className="h-3 w-3" />Zatrzymaj</> : <><Mic className="h-3 w-3" />Głos</>}
                </button>
              </div>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="np. nauka angielskiego dla dzieci przez zabawę" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Główne słowo kluczowe</Label>
              <Input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="np. angielski dla dzieci online" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1.5 block">Język</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">Angielski</SelectItem>
                    <SelectItem value="pl">Polski</SelectItem>
                    <SelectItem value="es">Hiszpański</SelectItem>
                    <SelectItem value="fr">Francuski</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Odbiorcy</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="children">Dzieci</SelectItem>
                    <SelectItem value="adults">Dorośli</SelectItem>
                    <SelectItem value="parents">Rodzice</SelectItem>
                    <SelectItem value="all">Wszyscy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full gap-2" onClick={handleGenerate} disabled={generating || !topic}>
              <Wand2 className="h-4 w-4" />{generating ? "Generuję wszystkie platformy…" : "Generuj dla wszystkich platform"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">Używa Claude Sonnet — może potrwać 15-30 sekund</p>
          </div>

          {/* History */}
          {items.length > 0 && (
            <div className="mt-4 bg-card border border-border rounded-xl p-4">
              <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Historia ({items.length})</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <button key={item.id} onClick={() => setSelected(item)}
                    className={cn("w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors truncate",
                      selected?.id === item.id ? "bg-primary/10 text-primary" : "hover:bg-secondary text-muted-foreground")}>
                    {item.topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Output */}
        <div className="lg:col-span-2">
          {generating && (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium">Generuję treści dla 9 platform…</p>
              <p className="text-xs text-muted-foreground mt-1">Może potrwać 15-30 sekund</p>
            </div>
          )}
          {!generating && selected && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">{selected.topic}</h3>
              </div>
              {PLATFORM_SECTIONS.map(s => (
                <ContentSection
                  key={s.key}
                  label={s.label}
                  value={selected[s.key]}
                  platform={s.platform}
                  mode={s.mode}
                  contentItemId={selected.id}
                  onCopy={handleCopy}
                />
              ))}
              {selected.pinterest_image_prompt && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs font-semibold mb-2">🎨 Prompt obrazu (Pinterest/IG)</p>
                  <p className="text-[11px] text-muted-foreground bg-secondary/40 rounded p-2">{selected.pinterest_image_prompt}</p>
                  <Button size="sm" variant="outline" className="h-7 text-xs mt-2 gap-1" onClick={() => handleCopy(selected.pinterest_image_prompt)}>
                    <Copy className="h-3 w-3" />Kopiuj prompt
                  </Button>
                </div>
              )}
            </div>
          )}
          {!generating && !selected && (
            <div className="bg-card border border-dashed border-border rounded-xl p-16 text-center">
              <Wand2 className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-sm font-medium text-muted-foreground">Wpisz temat i kliknij Generuj</p>
              <p className="text-xs text-muted-foreground mt-1">System wygeneruje treści dla wszystkich platform jednocześnie</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}