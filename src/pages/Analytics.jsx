import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, MousePointer, Eye, Search, Percent, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub, trend, icon: Icon, color }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className={cn("h-8 w-8 rounded-lg bg-secondary flex items-center justify-center mb-3", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold">{value ?? "—"}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground/70 mt-1 flex items-center gap-1">
        {trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
        {trend === "down" && <TrendingDown className="h-3 w-3 text-red-400" />}
        {sub}
      </div>}
    </div>
  );
}

// Generate sample data for demo
function genTrafficData(days = 30) {
  const data = [];
  let clicks = 120, impressions = 1400;
  for (let i = days; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    clicks += Math.round((Math.random() - 0.4) * 15);
    impressions += Math.round((Math.random() - 0.3) * 80);
    data.push({
      date: d.toLocaleDateString("pl-PL", { day: "numeric", month: "short" }),
      Kliknięcia: Math.max(clicks, 50),
      Wyświetlenia: Math.max(impressions, 800),
    });
  }
  return data;
}

function genPlatformData() {
  return [
    { platform: "Organic", posts: 245 },
    { platform: "Medium", posts: 42 },
    { platform: "Pinterest", posts: 68 },
    { platform: "Facebook", posts: 31 },
    { platform: "Instagram", posts: 55 },
    { platform: "Blogger", posts: 28 },
    { platform: "TikTok", posts: 19 },
  ];
}

function genTopPages() {
  return [
    { page: "/english-lessons-for-kids", clicks: 312, ctr: "8.2%", pos: 3.1 },
    { page: "/spanish-online-course", clicks: 187, ctr: "6.5%", pos: 5.4 },
    { page: "/polish-for-foreigners", clicks: 142, ctr: "5.1%", pos: 7.2 },
    { page: "/french-lessons-adults", clicks: 98, ctr: "4.8%", pos: 9.8 },
    { page: "/online-language-school", clicks: 76, ctr: "3.9%", pos: 12.3 },
  ];
}

function genKeywords() {
  return [
    { keyword: "english lessons for children online", clicks: 89, pos: 2.8 },
    { keyword: "nauka angielskiego dla dzieci", clicks: 64, pos: 4.1 },
    { keyword: "linguatoons", clicks: 58, pos: 1.2 },
    { keyword: "spanish online course", clicks: 47, pos: 6.3 },
    { keyword: "polish lessons for foreigners", clicks: 39, pos: 8.7 },
  ];
}

export default function Analytics() {
  const [trafficData, setTrafficData] = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [backlinkCount, setBacklinkCount] = useState(0);
  const [contentCount, setContentCount] = useState(0);
  const [range, setRange] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [bl, ci] = await Promise.all([
      base44.entities.Backlinks.list(),
      base44.entities.ContentItems.list(),
    ]);
    setBacklinkCount(bl.filter(b => b.status === "published_auto" || b.status === "published_manual").length);
    setContentCount(ci.length);
    setTrafficData(genTrafficData(range));
    setPlatformData(genPlatformData());
    setTopPages(genTopPages());
    setKeywords(genKeywords());
    setLoading(false);
  };

  useEffect(() => { load(); }, [range]);

  const totalClicks = trafficData.reduce((s, d) => s + (d.Kliknięcia || 0), 0);
  const totalImpressions = trafficData.reduce((s, d) => s + (d.Wyświetlenia || 0), 0);
  const avgCTR = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

  if (loading) return <div className="flex items-center justify-center min-h-[300px]"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Analityka i Ruch" description="Wykresy, metryki SEO, wydajność platform">
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {[7, 30, 90].map(d => (
            <button key={d} onClick={() => setRange(d)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", range === d ? "bg-card shadow-sm" : "text-muted-foreground")}>
              {d}d
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" />Odśwież
        </Button>
      </PageHeader>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-5 text-[11px] text-blue-800">
        <strong>Integracja GSC/GA4:</strong> Dane poniżej są demo. Skonfiguruj Google Search Console i Google Analytics 4 w zakładce <a href="/integrations" className="underline font-medium">Integracje</a>, aby zobaczyć dane rzeczywiste.
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard label="Kliknięcia" value={totalClicks.toLocaleString()} sub="+12% vs poprzedni okres" trend="up" icon={MousePointer} color="text-primary" />
        <StatCard label="Wyświetlenia" value={totalImpressions.toLocaleString()} sub="+8% vs poprzedni okres" trend="up" icon={Eye} color="text-violet-500" />
        <StatCard label="Śr. CTR" value={`${avgCTR}%`} sub="dobrze powyżej średniej" trend="up" icon={Percent} color="text-emerald-500" />
        <StatCard label="Opublikowane backlinki" value={backlinkCount} sub="aktywne linki zewnętrzne" icon={ExternalLink} color="text-amber-500" />
        <StatCard label="Elementy treści" value={contentCount} sub="wygenerowanych tematów" icon={Search} color="text-blue-500" />
      </div>

      {/* Traffic chart */}
      <div className="bg-card rounded-xl border border-border p-5 mb-4">
        <h3 className="text-sm font-semibold mb-4">Ruch organiczny — {range} dni</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trafficData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil(range / 6)} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Kliknięcia" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Wyświetlenia" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Platform performance */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Wydajność platform</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="platform" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="posts" fill="hsl(var(--primary))" radius={4} name="Posty" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top pages */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Top strony</h3>
          <div className="space-y-2">
            {topPages.map((page, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5">
                <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-primary">{page.page}</p>
                  <div className="flex gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span>{page.clicks} kliknięć</span>
                    <span>CTR: {page.ctr}</span>
                    <span>Poz: {page.pos}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold mb-4">Top słowa kluczowe</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Słowo kluczowe</th>
                <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Kliknięcia</th>
                <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Śr. pozycja</th>
                <th className="text-center px-3 py-2 font-semibold text-muted-foreground">Trend</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((kw, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-3 py-2 font-medium">{kw.keyword}</td>
                  <td className="px-3 py-2 text-center font-bold text-primary">{kw.clicks}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={cn("font-semibold", kw.pos <= 5 ? "text-emerald-600" : kw.pos <= 10 ? "text-amber-600" : "text-muted-foreground")}>
                      {kw.pos}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500 mx-auto" />
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