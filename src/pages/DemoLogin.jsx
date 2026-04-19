import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Sparkles, Lock, User, ArrowRight, Shield, Zap, BarChart3, Globe, CheckCircle2 } from "lucide-react";

const FEATURES = [
  { icon: Sparkles, label: "SEO Autopilot", desc: "AI generuje artykuły i słowa kluczowe automatycznie" },
  { icon: BarChart3, label: "Competitor Intel", desc: "Codzienne porównanie z konkurencją" },
  { icon: Globe, label: "Link Exchange", desc: "Automatyczna sieć wymiany linków między firmami" },
  { icon: Shield, label: "Security Monitor", desc: "Skanowanie bezpieczeństwa WordPress 24/7" },
  { icon: Zap, label: "Content Engine", desc: "Generowanie treści na wszystkie platformy" },
];

export default function DemoLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Czyszczenie danych demo przed logowaniem
      const keys = [...Object.keys(sessionStorage), ...Object.keys(localStorage)];
      keys.forEach(key => {
        if (key.startsWith("lg_") || key.startsWith("demo_") || key.includes("cache")) {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        }
      });
      await base44.auth.redirectToLogin();
    } catch (err) {
      setError("Logowanie demo — użyj danych pokazanych na ekranie.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">

        {/* Left — info */}
        <div className="text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">LinguaSEO OS</h1>
              <p className="text-xs text-white/50">by Linguatoons</p>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-black mb-4 leading-tight">
            SEO na <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">Auto-Pilocie</span>
          </h2>
          <p className="text-white/60 mb-8 text-sm leading-relaxed">
            Platforma SEO z AI dla szkół językowych i firm edukacyjnych. Analizuj konkurencję, 
            buduj linki, generuj treści — wszystko automatycznie.
          </p>

          <div className="space-y-3 mb-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <f.icon className="h-4 w-4 text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{f.label}</p>
                  <p className="text-xs text-white/50">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Demo info */}
          <div className="bg-gradient-to-r from-teal-500/20 to-purple-500/20 border border-teal-400/30 rounded-2xl p-4">
            <p className="text-xs font-bold text-teal-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />Wirtualny pokaz systemu
            </p>
            <p className="text-xs text-teal-200">
              Wypróbuj wszystkie funkcje platformy TexiSEO w trybie demonstracyjnym — bez rzeczywistych zmian w systemie. Idealne do zapoznania się z możliwościami!
            </p>
          </div>
        </div>

        {/* Right — login form */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8">
          <h3 className="text-white text-xl font-bold mb-2">Zaloguj się do systemu</h3>
          <p className="text-white/50 text-sm mb-6">Wypróbuj pełną funkcjonalność bez rejestracji</p>

          <div className="flex items-center gap-3 mb-4">
             <div className="flex-1 h-px bg-white/10" />
             <span className="text-xs text-white/30">Zaloguj się aby rozpocząć demo</span>
             <div className="flex-1 h-px bg-white/10" />
           </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
               <label className="text-xs text-white/50 mb-1.5 block">Email / Login</label>
               <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                 <input
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   placeholder="Wpisz email"
                   className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                 />
               </div>
             </div>
             <div>
               <label className="text-xs text-white/50 mb-1.5 block">Hasło</label>
               <div className="relative">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                 <input
                   type={showPassword ? "text" : "password"}
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   placeholder="Wpisz hasło"
                   className="w-full h-12 pl-10 pr-10 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                 />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-90 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {loading ? "Logowanie…" : <><span>Zaloguj się</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            Chcesz pełny dostęp?{" "}
            <a href="mailto:kontakt@linguatoons.com" className="text-purple-400 hover:underline">Skontaktuj się z nami</a>
          </p>

          {/* Payment badges */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-[10px] text-white/30 text-center mb-3">Wkrótce dostępne metody płatności</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {["Dotpay", "PayPal", "Bitcoin", "BLIK", "Visa/MC"].map(p => (
                <span key={p} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white/40">{p}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}