import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, ArrowRight, Check, Globe, Users, BookOpen, FileText, Tag, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Business",    icon: Globe },
  { id: 2, label: "Competitors", icon: Users },
  { id: 3, label: "Blog",        icon: BookOpen },
  { id: 4, label: "Articles",    icon: FileText },
  { id: 5, label: "Keywords",    icon: Tag },
];

export default function SEOAutopilot() {
  const [step, setStep] = useState(1);

  // Step 1
  const [websiteUrl, setWebsiteUrl] = useState("https://linguatoons.com");
  const [businessInfo, setBusinessInfo] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(false);

  // Step 2
  const [competitors, setCompetitors] = useState([]);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [selectedCompetitors, setSelectedCompetitors] = useState([]);

  // Step 3
  const [blogConfig, setBlogConfig] = useState({ language: "pl", audience: "parents", frequency: "2x/week", tone: "friendly" });

  // Step 4
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);

  // Step 5
  const [keywords, setKeywords] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [done, setDone] = useState(false);

  // ---- STEP 1: AI Autocomplete business ----
  const handleAutocomplete = async () => {
    setLoadingBusiness(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this website URL and return a JSON profile of the business: ${websiteUrl}
      Focus on: what they do, target audience, main services, languages they serve, niche.
      Also return a short tagline (max 10 words) and 3 main selling points.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          business_name: { type: "string" },
          tagline: { type: "string" },
          niche: { type: "string" },
          target_audience: { type: "string" },
          main_services: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
          selling_points: { type: "array", items: { type: "string" } },
        }
      }
    });
    setBusinessInfo(res);
    setLoadingBusiness(false);
  };

  // ---- STEP 2: Detect competitors ----
  const handleDetectCompetitors = async () => {
    setLoadingCompetitors(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `For the website ${websiteUrl} (${businessInfo?.niche || "language school for kids"}), find the top 6 direct competitors.
      Focus on Polish and international online language schools for children. Return real URLs.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                url: { type: "string" },
                why: { type: "string" },
                strength: { type: "string" },
              }
            }
          }
        }
      }
    });
    setCompetitors(res.competitors || []);
    setSelectedCompetitors((res.competitors || []).map(c => c.url));
    setLoadingCompetitors(false);
  };

  // ---- STEP 4: Generate article ideas ----
  const handleGenerateArticles = async () => {
    setLoadingArticles(true);
    const compList = selectedCompetitors.join(", ");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `For ${websiteUrl} (online language school for kids, Polish market), generate 8 high-potential blog article ideas.
      Consider competitors: ${compList}.
      Language: ${blogConfig.language}, Audience: ${blogConfig.audience}, Tone: ${blogConfig.tone}.
      Focus on content gaps and high search volume topics.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          articles: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                slug: { type: "string" },
                keyword: { type: "string" },
                volume: { type: "number" },
                difficulty: { type: "number" },
                why: { type: "string" },
              }
            }
          }
        }
      }
    });
    setArticles(res.articles || []);
    setSelectedArticles((res.articles || []).map((_, i) => i));
    setLoadingArticles(false);
  };

  // ---- STEP 5: Generate keywords ----
  const handleGenerateKeywords = async () => {
    setLoadingKeywords(true);
    const titles = articles.filter((_, i) => selectedArticles.includes(i)).map(a => a.title).join(", ");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a keyword cluster for ${websiteUrl} based on these article topics: ${titles}.
      Include: main keyword, volume estimate, difficulty, intent, related keywords.
      Focus on Polish SEO market + some international terms.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string" },
                volume: { type: "number" },
                difficulty: { type: "number" },
                intent: { type: "string" },
                related: { type: "array", items: { type: "string" } },
              }
            }
          }
        }
      }
    });
    setKeywords(res.keywords || []);
    setLoadingKeywords(false);
  };

  // ---- Save to DB ----
  const handleFinish = async () => {
    // Save selected competitors to DB
    for (const url of selectedCompetitors) {
      const comp = competitors.find(c => c.url === url);
      if (comp) {
        await base44.entities.Competitors.create({
          name: comp.name,
          url: comp.url,
          niche: "language_school",
          language: "pl",
          notes: comp.why,
          active: true,
        });
      }
    }
    // Save selected article ideas
    const sel = articles.filter((_, i) => selectedArticles.includes(i));
    for (const a of sel) {
      await base44.entities.ContentIdeas.create({
        title: a.title,
        slug_idea: a.slug,
        primary_keyword: a.keyword,
        language: blogConfig.language,
        audience: blogConfig.audience === "parents" ? "parents" : "all",
        content_type: "blog_post",
        status: "idea",
      });
    }
    setDone(true);
  };

  if (done) return <SuccessScreen />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SEO Autopilot</span>
        </div>
        <span className="text-xs text-white/40">linguatoons.com</span>
      </div>

      {/* Progress steps */}
      <div className="max-w-2xl mx-auto px-6 pt-10 pb-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-white/10 z-0" />
          <div
            className="absolute left-0 top-4 h-0.5 bg-purple-500 z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2 z-10">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                s.id < step ? "bg-purple-500 text-white" :
                s.id === step ? "bg-white text-slate-900 ring-4 ring-purple-500/30" :
                "bg-white/10 text-white/40"
              )}>
                {s.id < step ? <Check className="h-3.5 w-3.5" /> : s.id}
              </div>
              <span className={cn("text-[11px] font-medium hidden sm:block", s.id === step ? "text-white" : "text-white/40")}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-6 pb-16">
        {step === 1 && <Step1 websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl} businessInfo={businessInfo} loading={loadingBusiness} onAutocomplete={handleAutocomplete} onNext={() => setStep(2)} />}
        {step === 2 && <Step2 competitors={competitors} selected={selectedCompetitors} setSelected={setSelectedCompetitors} loading={loadingCompetitors} onDetect={handleDetectCompetitors} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3 config={blogConfig} setConfig={setBlogConfig} onNext={() => { setStep(4); handleGenerateArticles(); }} onBack={() => setStep(2)} />}
        {step === 4 && <Step4 articles={articles} selected={selectedArticles} setSelected={setSelectedArticles} loading={loadingArticles} onNext={() => { setStep(5); handleGenerateKeywords(); }} onBack={() => setStep(3)} />}
        {step === 5 && <Step5 keywords={keywords} loading={loadingKeywords} onFinish={handleFinish} onBack={() => setStep(4)} />}
      </div>
    </div>
  );
}

/* ============================================================
   STEP 1 — Tell us about your business
   ============================================================ */
function Step1({ websiteUrl, setWebsiteUrl, businessInfo, loading, onAutocomplete, onNext }) {
  return (
    <div>
      <StepHeader step={1} title="Tell us about your business" subtitle="Enter your website URL and let AI analyze your business automatically." />
      <div className="space-y-3">
        <div>
          <label className="text-xs text-white/60 mb-1.5 block">Website to Business</label>
          <input
            value={websiteUrl}
            onChange={e => setWebsiteUrl(e.target.value)}
            placeholder="https://your-website.com"
            className="w-full h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={onAutocomplete}
          disabled={loading || !websiteUrl}
          className="w-full h-12 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing…</> : <><Sparkles className="h-4 w-4" />Autocomplete With AI</>}
        </button>

        {businessInfo && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-teal-400" />
              <span className="text-sm font-semibold text-teal-300">Business profile detected</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Business" value={businessInfo.business_name} />
              <InfoItem label="Niche" value={businessInfo.niche} />
              <InfoItem label="Audience" value={businessInfo.target_audience} />
              <InfoItem label="Languages" value={(businessInfo.languages || []).join(", ")} />
            </div>
            <div>
              <p className="text-[11px] text-white/50 mb-1.5">Main Services</p>
              <div className="flex flex-wrap gap-1.5">
                {(businessInfo.main_services || []).map((s, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-400/30 rounded-full text-xs text-purple-200">{s}</span>
                ))}
              </div>
            </div>
            <button onClick={onNext} className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all mt-2">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STEP 2 — Competitors
   ============================================================ */
function Step2({ competitors, selected, setSelected, loading, onDetect, onNext, onBack }) {
  const toggle = (url) => setSelected(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  return (
    <div>
      <StepHeader step={2} title="Identify your Competitors" subtitle="AI will detect who you're competing against in search results." />
      {competitors.length === 0 ? (
        <button onClick={onDetect} disabled={loading} className="w-full h-12 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Detecting competitors…</> : <><Sparkles className="h-4 w-4" />Detect Competitors with AI</>}
        </button>
      ) : (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
          {competitors.map((c) => (
            <button key={c.url} onClick={() => toggle(c.url)} className={cn(
              "w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3",
              selected.includes(c.url) ? "bg-purple-500/20 border-purple-400/50" : "bg-white/5 border-white/10 hover:border-white/20"
            )}>
              <div className={cn("mt-0.5 h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                selected.includes(c.url) ? "border-purple-400 bg-purple-500" : "border-white/30"
              )}>
                {selected.includes(c.url) && <Check className="h-3 w-3 text-white" />}
              </div>
              <div>
                <p className="font-semibold text-sm">{c.name}</p>
                <p className="text-xs text-white/50">{c.url}</p>
                <p className="text-xs text-white/40 mt-0.5">{c.why}</p>
              </div>
            </button>
          ))}
          <NavButtons onBack={onBack} onNext={onNext} nextDisabled={selected.length === 0} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STEP 3 — Blog Configuration
   ============================================================ */
function Step3({ config, setConfig, onNext, onBack }) {
  const set = (k, v) => setConfig(p => ({ ...p, [k]: v }));
  return (
    <div>
      <StepHeader step={3} title="Configure your Blog" subtitle="Tell us how you want to publish content." />
      <div className="space-y-4">
        <SelectField label="Language" value={config.language} onChange={v => set("language", v)} options={[{ v: "pl", l: "Polish 🇵🇱" }, { v: "en", l: "English 🇬🇧" }, { v: "es", l: "Spanish 🇪🇸" }, { v: "fr", l: "French 🇫🇷" }]} />
        <SelectField label="Target Audience" value={config.audience} onChange={v => set("audience", v)} options={[{ v: "parents", l: "Parents of children" }, { v: "children", l: "Children 6–12" }, { v: "adults", l: "Adults" }, { v: "all", l: "All audiences" }]} />
        <SelectField label="Publishing Frequency" value={config.frequency} onChange={v => set("frequency", v)} options={[{ v: "1x/week", l: "1× per week" }, { v: "2x/week", l: "2× per week (recommended)" }, { v: "3x/week", l: "3× per week" }, { v: "daily", l: "Daily" }]} />
        <SelectField label="Content Tone" value={config.tone} onChange={v => set("tone", v)} options={[{ v: "friendly", l: "Friendly & Warm" }, { v: "professional", l: "Professional" }, { v: "playful", l: "Playful & Fun" }, { v: "educational", l: "Educational" }]} />
        <NavButtons onBack={onBack} onNext={onNext} />
      </div>
    </div>
  );
}

/* ============================================================
   STEP 4 — Article Ideas
   ============================================================ */
function Step4({ articles, selected, setSelected, loading, onNext, onBack }) {
  const toggle = (i) => setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  return (
    <div>
      <StepHeader step={4} title="Select Article Ideas" subtitle="AI generated high-potential blog posts based on your competitors and niche." />
      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm">Generating article ideas with AI…</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-8 text-center text-white/40 text-sm">No articles generated yet.</div>
      ) : (
        <div className="space-y-2 animate-in fade-in">
          {articles.map((a, i) => (
            <button key={i} onClick={() => toggle(i)} className={cn(
              "w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3",
              selected.includes(i) ? "bg-purple-500/20 border-purple-400/50" : "bg-white/5 border-white/10 hover:border-white/20"
            )}>
              <div className={cn("mt-0.5 h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                selected.includes(i) ? "border-purple-400 bg-purple-500" : "border-white/30"
              )}>
                {selected.includes(i) && <Check className="h-3 w-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-white/50 mt-0.5">{a.why}</p>
                <div className="flex gap-3 mt-1.5">
                  <MetricChip label="Vol" value={a.volume?.toLocaleString() || "—"} />
                  <MetricChip label="Diff" value={a.difficulty || "—"} />
                  <span className="text-[10px] text-teal-400 font-mono">{a.keyword}</span>
                </div>
              </div>
            </button>
          ))}
          <NavButtons onBack={onBack} onNext={onNext} nextDisabled={selected.length === 0} nextLabel={`Continue with ${selected.length} articles`} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   STEP 5 — Keywords
   ============================================================ */
function Step5({ keywords, loading, onFinish, onBack }) {
  return (
    <div>
      <StepHeader step={5} title="Your Keyword Clusters" subtitle="AI built keyword clusters based on your selected articles." />
      {loading ? (
        <div className="py-16 flex flex-col items-center gap-3 text-white/50">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm">Building keyword clusters…</p>
        </div>
      ) : keywords.length === 0 ? (
        <div className="py-8 text-center text-white/40 text-sm">Loading keywords…</div>
      ) : (
        <div className="space-y-2 animate-in fade-in">
          {keywords.map((k, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{k.keyword}</p>
                <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-medium",
                  k.intent === "informational" ? "bg-blue-500/20 text-blue-300" :
                  k.intent === "commercial" ? "bg-amber-500/20 text-amber-300" :
                  "bg-purple-500/20 text-purple-300"
                )}>{k.intent}</span>
              </div>
              <div className="flex gap-3 mt-1.5">
                <MetricChip label="Vol" value={k.volume?.toLocaleString() || "—"} />
                <MetricChip label="Diff" value={k.difficulty || "—"} />
              </div>
              {k.related?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {k.related.slice(0, 4).map((r, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 bg-white/5 rounded-full text-white/50">{r}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4">
            <button onClick={onFinish} className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-90 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/40">
              <Sparkles className="h-4 w-4" />
              Save & Launch SEO Autopilot →
            </button>
          </div>
          <button onClick={onBack} className="w-full text-center text-xs text-white/30 hover:text-white/60 py-2">← Back</button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SUCCESS SCREEN
   ============================================================ */
function SuccessScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-900/60">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">SEO Autopilot is Live! 🚀</h1>
        <p className="text-white/60 mb-8">Competitors added to monitoring. Articles saved to Content Ideas. Linguatoons is now on Auto-Pilot.</p>
        <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all">
          Go to Dashboard <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

/* ============================================================
   REUSABLE SMALL COMPONENTS
   ============================================================ */
function StepHeader({ step, title, subtitle }) {
  return (
    <div className="mb-8">
      <p className="text-xs text-purple-400 font-semibold uppercase tracking-widest mb-2">Step {step} of 5</p>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-white/50">{subtitle}</p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-[10px] text-white/40 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-white">{value || "—"}</p>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-white/60 mb-1.5 block">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
      >
        {options.map(o => <option key={o.v} value={o.v} className="bg-slate-900">{o.l}</option>)}
      </select>
    </div>
  );
}

function MetricChip({ label, value }) {
  return (
    <span className="text-[10px] text-white/50">
      <span className="text-white/30">{label}: </span>{value}
    </span>
  );
}

function NavButtons({ onBack, onNext, nextDisabled = false, nextLabel = "Continue" }) {
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onBack} className="flex-1 h-11 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 text-sm font-medium transition-all">
        ← Back
      </button>
      <button onClick={onNext} disabled={nextDisabled} className="flex-[2] h-11 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all">
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}