import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, MousePointer, Eye, Search, Percent, RefreshCw, ExternalLink, AlertTriangle, CheckCircle2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function StatCard({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className={cn("h-8 w-8 rounded-lg bg-secondary flex items-center justify-center mb-3", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-bold">{value ?? "—"}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-muted-foreground/70 mt-1">{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const [gscSettings, setGscSettings] = useState(null);
  const [trafficData, setTrafficData] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [range, setRange] = useState(28);
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [siteUrl, setSiteUrl] = useState("https://linguatoons.com/");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [savingKey, setSavingKey] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load saved GSC settings from WordPressSettings (reuse entity for simplicity)
    base44.entities.WordPressSettings.list().then(list => {
      const s = list[0];
      if (s?.gsc_api_key) {
        setApiKey(s.gsc_api_key);
        setSiteUrl(s.gsc_site_url || "https://linguatoons.com/");
        setConnected(true);
        loadGSCData(s.gsc_api_key, s.gsc_site_url || "https://linguatoons.com/", range);
      }
    });
  }, []);

  const loadGSCData = async (key, site, days) => {
    if (!key || !site) return;
    setLoading(true);
    setError(null);
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    try {
      const [summaryRes, pagesRes, kwRes] = await Promise.all([
        base44.functions.invoke('gscProxy', { action: 'query_summary', site_url: site, api_key: key, start_date: startDate, end_date: endDate }),
        base44.functions.invoke('gscProxy', { action: 'query_pages', site_url: site, api_key: key, start_date: startDate, end_date: endDate, row_limit: 20 }),
        base44.functions.invoke('gscProxy', { action: 'query_keywords', site_url: site, api_key: key, start_date: startDate, end_date: endDate, row_limit: 25 }),
      ]);

      if (summaryRes.data?.rows) {
        setTrafficData(summaryRes.data.rows.map(r => ({
          date: r.keys[0],
          Kliknięcia: r.clicks,
          Wyświetlenia: r.impressions,
        })));
      }
      if (pagesRes.data?.rows) {
        setTopPages(pagesRes.data.rows.map(r => ({
          page: r.keys[0].replace('https://linguatoons.com', ''),
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: `${(r.ctr * 100).toFixed(1)}%`,
          pos: r.position.toFixed(1),
        })));
      }
      if (kwRes.data?.rows) {
        setKeywords(kwRes.data.rows.map(r => ({
          keyword: r.keys[0],
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: `${(r.ctr * 100).toFixed(1)}%`,
          pos: r.position.toFixed(1),
        })));
      }
    } catch (err) {
      setError(err.message || 'Błąd połączenia z GSC');
    }
    setLoading(false);
  };

  const handleTest = async () => {
    if (!apiKey || !siteUrl) return;
    setTesting(true);
    setTestResult(null);
    const res = await base44.functions.invoke('gscProxy', { action: 'test', site_url: siteUrl, api_key: apiKey });
    setTestResult(res.data);
    setTesting(false);
  };

  const handleSave = async () => {
    setSavingKey(true);
    const list = await base44.entities.WordPressSettings.list();
    const data = { gsc_api_key: apiKey, gsc_site_url: siteUrl };
    if (list[0]) {
      await base44.entities.WordPressSettings.update(list[0].id, data);
    } else {
      await base44.entities.WordPressSettings.create(data);
    }
    setConnected(true);
    setSavingKey(false);
    setShowSetup(false);
    loadGSCData(apiKey, siteUrl, range);
  };

  const totalClicks = trafficData.reduce((s, d) => s + (d.Kliknięcia || 0), 0);
  const totalImpressions = trafficData.reduce((s, d) => s + (d.Wyświetlenia || 0), 0);
  const avgCTR = totalImpressions ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0;

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Analityka — Google Search Console" description="Rzeczywiste dane z GSC dla linguatoons.com">
        <div className="flex gap-1 bg-secondary rounded-lg p-0.5">
          {[7, 28, 90].map(d => (
            <button key={d} onClick={() => { setRange(d); if (connected) loadGSCData(apiKey, siteUrl, d); }}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", range === d ? "bg-card shadow-sm" : "text-muted-foreground")}>
              {d}d
            </button>
          ))}
        </div>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowSetup(true)}>
          <Settings className="h-3.5 w-3.5" />{connected ? "Zmień API Key" : "Podłącz GSC"}
        </Button>
        {connected && (
          <Button size="sm" variant="outline" className="gap-1" onClick={() => loadGSCData(apiKey, siteUrl, range)} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />Odśwież
          </Button>
        )}
      </PageHeader>

      {!connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-amber-800 mb-1">Google Search Console nie jest podłączone</p>
          <p className="text-xs text-amber-700 mb-4">Podłącz GSC żeby zobaczyć realne dane kliknięć, wyświetleń i pozycji dla linguatoons.com</p>
          <Button size="sm" onClick={() => setShowSetup(true)} className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />Podłącz Google Search Console
          </Button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {error} — <button className="underline" onClick={() => setShowSetup(true)}>Sprawdź ustawienia API</button>
        </div>
      )}

      {connected && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 mb-4 text-[11px] text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <strong>GSC połączone:</strong> {siteUrl} — ostatnie {range} dni
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Kliknięcia" value={totalClicks.toLocaleString()} sub={`ostatnie ${range} dni`} icon={MousePointer} color="text-primary" />
        <StatCard label="Wyświetlenia" value={totalImpressions.toLocaleString()} sub="łączne wyświetlenia" icon={Eye} color="text-violet-500" />
        <StatCard label="Śr. CTR" value={`${avgCTR}%`} sub="click-through rate" icon={Percent} color="text-emerald-500" />
        <StatCard label="Śledzone strony" value={topPages.length} sub="z danych GSC" icon={Search} color="text-blue-500" />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mr-3" />
          <span className="text-sm text-muted-foreground">Pobieranie danych z Google Search Console…</span>
        </div>
      )}

      {!loading && connected && trafficData.length > 0 && (
        <>
          <div className="bg-card rounded-xl border border-border p-5 mb-4">
            <h3 className="text-sm font-semibold mb-4">Ruch organiczny — {range} dni</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trafficData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.ceil(trafficData.length / 7)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Kliknięcia" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Wyświetlenia" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-4">Top strony (kliknięcia)</h3>
              <div className="space-y-2">
                {topPages.slice(0, 10).map((page, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-[10px] font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate text-primary">{page.page || '/'}</p>
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

            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold mb-4">Top słowa kluczowe</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-semibold text-muted-foreground">Słowo kluczowe</th>
                      <th className="text-center py-2 font-semibold text-muted-foreground">Klik.</th>
                      <th className="text-center py-2 font-semibold text-muted-foreground">Poz.</th>
                      <th className="text-center py-2 font-semibold text-muted-foreground">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywords.slice(0, 15).map((kw, i) => (
                      <tr key={i} className="border-b border-border/30 hover:bg-secondary/30">
                        <td className="py-1.5 font-medium">{kw.keyword}</td>
                        <td className="py-1.5 text-center font-bold text-primary">{kw.clicks}</td>
                        <td className="py-1.5 text-center">
                          <span className={cn("font-semibold", parseFloat(kw.pos) <= 5 ? "text-emerald-600" : parseFloat(kw.pos) <= 10 ? "text-amber-600" : "text-muted-foreground")}>
                            {kw.pos}
                          </span>
                        </td>
                        <td className="py-1.5 text-center text-muted-foreground">{kw.ctr}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && connected && trafficData.length === 0 && !error && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-muted-foreground">Brak danych — sprawdź czy API key ma dostęp do tej właściwości GSC</p>
          <p className="text-xs text-muted-foreground mt-1">Upewnij się że API key ma włączone Search Console API w Google Cloud</p>
        </div>
      )}

      {/* GSC Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Podłącz Google Search Console</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-xs">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 space-y-1">
              <p className="font-semibold">Jak uzyskać API Key:</p>
              <ol className="list-decimal ml-4 space-y-0.5">
                <li>Wejdź na <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">console.cloud.google.com</a></li>
                <li>Utwórz projekt (lub wybierz istniejący)</li>
                <li>APIs &amp; Services → Library → znajdź "Search Console API" → Enable</li>
                <li>APIs &amp; Services → Credentials → "Create Credentials" → "API key"</li>
                <li>Skopiuj klucz i wklej poniżej</li>
                <li className="text-amber-800 font-medium">⚠️ Uwaga: API key działa tylko dla publicznych danych. Dla pełnych danych (kliknięcia/pozycje) wymagane jest OAuth — skontaktuj się z supportem Base44.</li>
              </ol>
            </div>

            <div>
              <label className="block font-medium mb-1">API Key Google</label>
              <Input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="AIzaSy..." className="font-mono text-xs" />
            </div>
            <div>
              <label className="block font-medium mb-1">URL właściwości GSC</label>
              <Input value={siteUrl} onChange={e => setSiteUrl(e.target.value)} placeholder="https://linguatoons.com/" className="text-xs" />
              <p className="text-[10px] text-muted-foreground mt-1">Musi dokładnie zgadzać się z właściwością w Google Search Console</p>
            </div>

            {testResult && (
              <div className={cn("rounded-lg p-3 border text-xs", testResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800")}>
                {testResult.success ? (
                  <><CheckCircle2 className="inline h-3.5 w-3.5 mr-1" />Połączono! Znaleziono {testResult.sites?.length || 0} właściwości GSC.</>
                ) : (
                  <><AlertTriangle className="inline h-3.5 w-3.5 mr-1" />Błąd: {testResult.error}</>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={handleTest} disabled={testing || !apiKey}>
                {testing ? "Testuję…" : "Test połączenia"}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={savingKey || !apiKey || !siteUrl}>
                {savingKey ? "Zapisuję…" : "Zapisz i połącz"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}