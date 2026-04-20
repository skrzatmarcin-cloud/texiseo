import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, Zap, ShieldOff } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";
import SecurityScanAnimation from "./SecurityScanAnimation";

const ADMIN_CREDENTIALS = { username: "Marcin",      password: "Cinek123" };
const ADMIN_EMAIL       = "marcin@linguatoons.com";
const MAX_FAILS         = 3;
const BLOCK_MINUTES     = 30;

// ── helpers ──────────────────────────────────────────────────────────────────

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Firefox"))       browser = "Firefox";
  else if (ua.includes("Edg"))      browser = "Edge";
  else if (ua.includes("Chrome"))   browser = "Chrome";
  else if (ua.includes("Safari"))   browser = "Safari";
  else if (ua.includes("Opera"))    browser = "Opera";

  let os = "Unknown";
  if (ua.includes("Windows"))       os = "Windows";
  else if (ua.includes("Mac"))      os = "macOS";
  else if (ua.includes("Linux"))    os = "Linux";
  else if (ua.includes("Android"))  os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

  return { browser, os };
}

async function fetchIPData() {
  try {
    const r = await fetch("https://ipapi.co/json/");
    const d = await r.json();
    return { ip: d.ip || "unknown", country: d.country_name || "", city: d.city || "" };
  } catch {
    return { ip: "unknown", country: "", city: "" };
  }
}

function getFailKey(ip) { return `lf_${ip}`; }

function getFailData(ip) {
  try { return JSON.parse(localStorage.getItem(getFailKey(ip)) || "{}"); }
  catch { return {}; }
}

function setFailData(ip, data) {
  localStorage.setItem(getFailKey(ip), JSON.stringify(data));
}

function isBlocked(ip) {
  const d = getFailData(ip);
  if (!d.blockedUntil) return false;
  if (Date.now() < d.blockedUntil) return true;
  // unblock — reset
  setFailData(ip, {});
  return false;
}

function minutesLeft(ip) {
  const d = getFailData(ip);
  if (!d.blockedUntil) return 0;
  return Math.ceil((d.blockedUntil - Date.now()) / 60000);
}

function recordFail(ip) {
  const d = getFailData(ip);
  const count = (d.failCount || 0) + 1;
  const update = { failCount: count };
  if (count >= MAX_FAILS) {
    update.blockedUntil = Date.now() + BLOCK_MINUTES * 60 * 1000;
  }
  setFailData(ip, update);
  return count;
}

function clearFails(ip) { setFailData(ip, {}); }

// ── Module Details Component ─────────────────────────────────────────────────

function ModuleDetails({ module }) {
  const MODULE_COLORS = {
    sales: "from-blue-600 to-indigo-700",
    production: "from-amber-600 to-orange-700",
    inventory: "from-green-600 to-emerald-700",
    finance: "from-purple-600 to-pink-700",
    marketing: "from-cyan-600 to-blue-700",
    ai_insights: "from-violet-600 to-purple-700"
  };
  const MODULE_LABELS = {
    sales: "💼 Sales (CRM)",
    production: "🏭 Production (MES)",
    inventory: "📦 Inventory (WMS)",
    finance: "💰 Finance (ERP)",
    marketing: "📱 Marketing (SEO+Social)",
    ai_insights: "🧠 AI Insights"
  };

  return (
    <div className={`bg-gradient-to-br ${MODULE_COLORS[module]} rounded-xl p-4 text-white space-y-3`}>
      <h3 className="font-bold text-sm">{MODULE_LABELS[module]}</h3>
      <div className="space-y-2 text-xs">
        <div className="bg-white/10 rounded p-2"><span className="text-slate-300">Status:</span> <span className="font-semibold">Active</span></div>
        <div className="bg-white/10 rounded p-2"><span className="text-slate-300">Users:</span> <span className="font-semibold">0</span></div>
        <div className="bg-white/10 rounded p-2"><span className="text-slate-300">Features:</span> <span className="font-semibold">Multiple</span></div>
      </div>
      <p className="text-[10px] text-white/60 italic">Demo mode — dane przykładowe</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

function LoginGateInner({ children }) {
  const { t } = useLanguage();

  const [phase, setPhase]       = useState("scanning"); // scanning | login
  const [ipData, setIpData]     = useState(null);
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("lg_auth") === "1");
  const [mode, setMode]         = useState("login"); // login | register | demo-select | forgot
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetSent, setResetSent]       = useState(false);
  const [blocked, setBlocked]   = useState(false);
  const [minsLeft, setMinsLeft] = useState(0);
  const [selectedModule, setSelectedModule] = useState(null);
  // Register mode
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regUserType, setRegUserType] = useState("student");
  const [regLoading, setRegLoading] = useState(false);

  // Run security scan once on mount
  useEffect(() => {
    (async () => {
      const ip = await fetchIPData();
      setIpData(ip);
      const { browser, os } = getBrowserInfo();

      // Check block before showing login
      if (isBlocked(ip.ip)) {
        setBlocked(true);
        setMinsLeft(minutesLeft(ip.ip));
      }

      // Save page visit to DB (fire-and-forget)
      base44.entities.LoginAttempts.create({
        ip_address: ip.ip,
        country: ip.country,
        city: ip.city,
        browser,
        os,
        page_visit: true,
        success: false,
      }).catch(() => {});
    })();
  }, []);

  // Countdown for block timer
  useEffect(() => {
    if (!blocked) return;
    const id = setInterval(() => {
      if (ipData && !isBlocked(ipData.ip)) {
        setBlocked(false);
        clearInterval(id);
      } else if (ipData) {
        setMinsLeft(minutesLeft(ipData.ip));
      }
    }, 10000);
    return () => clearInterval(id);
  }, [blocked, ipData]);

  if (loggedIn) return children;

  const handleScanDone = () => setPhase("login");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const ip = ipData?.ip || "unknown";

    // Check block
    if (isBlocked(ip)) {
      setBlocked(true);
      setMinsLeft(minutesLeft(ip));
      setLoading(false);
      return;
    }

    const isCorrect =
      username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;

    const { browser, os } = getBrowserInfo();

    if (isCorrect) {
      clearFails(ip);
      sessionStorage.setItem("lg_auth", "1");
      
      // Fetch user role from Base44
      try {
        const userData = await base44.auth.me();
        if (userData?.role === 'admin') {
          sessionStorage.setItem("lg_is_admin", "1");
          console.log("✅ ADMIN MODE ENABLED");
        } else {
          sessionStorage.removeItem("lg_is_admin");
          console.log(`👤 USER MODE - Role: ${userData?.role || 'user'}`);
        }
      } catch {
        sessionStorage.removeItem("lg_is_admin");
      }

      base44.entities.LoginAttempts.create({
        ip_address: ip,
        country: ipData?.country || "",
        city: ipData?.city || "",
        browser, os,
        username_tried: username,
        success: true,
        fail_count: 0,
        page_visit: false,
      }).catch(() => {});

      setLoggedIn(true);
    } else {
      const fails = recordFail(ip);
      const remaining = MAX_FAILS - fails;

      base44.entities.LoginAttempts.create({
        ip_address: ip,
        country: ipData?.country || "",
        city: ipData?.city || "",
        browser, os,
        username_tried: username,
        success: false,
        fail_count: fails,
        is_blocked: fails >= MAX_FAILS,
        page_visit: false,
      }).catch(() => {});

      if (fails >= MAX_FAILS) {
        setBlocked(true);
        setMinsLeft(BLOCK_MINUTES);
      } else {
        setError(`Nieprawidłowe dane logowania. Pozostało prób: ${remaining}`);
      }
    }
    setLoading(false);
  };

  const handleDemo = () => {
    sessionStorage.removeItem("lg_is_admin");
    sessionStorage.removeItem("lg_demo_type");
    sessionStorage.setItem("lg_auth", "1");
    sessionStorage.setItem("lg_demo_mode", "1");
    setMode("demo-select");
  };

  const handleDemoSelect = (type) => {
    sessionStorage.setItem("lg_demo_type", type);
    setLoggedIn(true);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!regEmail || !regPassword || !regFullName) {
      setError("Wypełnij wszystkie pola");
      return;
    }

    if (regPassword.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków");
      return;
    }

    // Zapisz dane w sessionStorage i zaloguj jako demo
    sessionStorage.setItem("lg_auth", "1");
    sessionStorage.setItem("lg_demo_mode", "1");
    sessionStorage.setItem("lg_user_email", regEmail);
    sessionStorage.setItem("lg_user_name", regFullName);
    sessionStorage.setItem("lg_user_type", regUserType);

    if (regUserType === "enterprise") {
      sessionStorage.setItem("lg_demo_type", "enterprise");
    } else if (regUserType === "teacher") {
      sessionStorage.setItem("lg_demo_type", "teacher");
    } else {
      sessionStorage.setItem("lg_demo_type", "student");
    }

    setLoggedIn(true);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    await base44.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: "Reset hasła — TexiSEO AI & Enterprise",
      body: `Cześć!\n\nOtrzymaliśmy prośbę o reset hasła.\n\nLink do resetowania hasła zostanie wysłany na tę skrzynkę pocztową.\n\n---\nTexiSEO System`,
    });
    setEmailLoading(false);
    setResetSent(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('https://media.base44.com/images/public/69da036b1797baa333fdb6c1/c7295d27f_ChatGPTImage11kwi202617_29_17.png')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher dark />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="https://media.base44.com/images/public/69da036b1797baa333fdb6c1/f24cb9015_ChatGPTImage11kwi202616_54_09.png"
            alt="TexiSEO"
            className="h-48 w-48 object-contain drop-shadow-2xl"
          />
        </div>

        {/* ── SECURITY SCAN PHASE ── */}
        {phase === "scanning" && (
          <SecurityScanAnimation ipData={ipData} onDone={handleScanDone} />
        )}

        {/* ── LOGIN PHASE ── */}
        {phase === "login" && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">

            {/* BLOCKED */}
            {blocked ? (
              <div className="text-center py-4">
                <ShieldOff className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-white font-bold text-base mb-2">Dostęp zablokowany</p>
                <p className="text-red-300/80 text-sm mb-4">
                  Wykryto {MAX_FAILS} błędnych prób logowania z tego adresu IP.
                </p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-red-300">
                    Blokada wygaśnie za <span className="font-bold text-red-200">{minsLeft} min</span>
                  </p>
                  <p className="text-[10px] text-red-400/60 mt-1">
                    IP: {ipData?.ip} · {ipData?.country}
                  </p>
                </div>
                <p className="text-xs text-white/30 mt-4">
                  Blokada wygaśnie automatycznie — spróbuj ponownie za kilka minut.
                </p>
              </div>
            ) : mode === "login" ? (
              <>
                <h2 className="text-lg font-semibold text-white mb-5">{t.login_title || "Zaloguj się"}</h2>

                {/* Social buttons — informacyjne, niedostępne w tej wersji */}
                <div className="space-y-2 mb-4">
                  <div className="w-full py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/30 text-sm font-medium flex items-center justify-center gap-3 cursor-not-allowed select-none">
                    <svg className="h-5 w-5 opacity-40" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Zaloguj przez Google <span className="text-[10px] ml-1 opacity-60">(wkrótce)</span>
                  </div>
                  <div className="w-full py-2.5 rounded-xl border border-white/8 bg-white/5 text-white/30 text-sm font-medium flex items-center justify-center gap-3 cursor-not-allowed select-none">
                    <svg className="h-5 w-5 opacity-40" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Zaloguj przez Facebook <span className="text-[10px] ml-1 opacity-60">(wkrótce)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[11px] text-white/30">zaloguj się hasłem lub spróbuj demo</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.username || "Nazwa użytkownika"}</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => { setUsername(e.target.value); setError(""); }}
                        placeholder={t.username || "Login"}
                        className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">{t.password || "Hasło"}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(""); }}
                        placeholder="••••••••"
                        className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      <button type="button" onClick={() => setShowPass(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2">
                    {loading ? "Logowanie…" : (t.login_btn || "Zaloguj się")}
                  </button>
                </form>

                <div className="mt-4 space-y-3">
                  <div className="text-center">
                    <button onClick={() => { setMode("forgot"); setError(""); }}
                      className="text-xs text-slate-400 hover:text-primary transition-colors underline underline-offset-2">
                      {t.forgot_password || "Zapomniałeś hasła?"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-xs text-slate-400">lub</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <button
                    onClick={() => { setMode("register"); setError(""); }}
                    className="w-full h-10 bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 font-medium rounded-lg text-xs transition-all">
                    ✍️ Załóż konto
                  </button>
                  <button
                    onClick={handleDemo}
                    className="w-full h-10 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 font-medium rounded-lg text-xs transition-all">
                    🎬 Spróbuj Demo
                  </button>
                </div>


              </>
            ) : mode === "demo-select" ? (
               /* DEMO SELECTION */
               <>
                 <h2 className="text-lg font-semibold text-white mb-2">🎬 Wybierz tryb demo</h2>
                 <p className="text-xs text-slate-400 mb-6">Jaki rodzaj konta chcesz zobaczyć w akcji?</p>
                 <div className="space-y-3">
                   <button
                     onClick={() => handleDemoSelect("teacher")}
                     className="w-full p-4 rounded-xl border-2 border-blue-400/30 bg-blue-500/10 hover:bg-blue-500/20 text-left transition-all">
                     <p className="font-semibold text-blue-200 text-sm">👨‍🏫 Demo Nauczyciel</p>
                     <p className="text-xs text-blue-300/70 mt-1">Kursy, lekcje, testy & quizy, zarobki</p>
                   </button>
                   <button
                     onClick={() => handleDemoSelect("student")}
                     className="w-full p-4 rounded-xl border-2 border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-left transition-all">
                     <p className="font-semibold text-emerald-200 text-sm">👨‍🎓 Demo Student</p>
                     <p className="text-xs text-emerald-300/70 mt-1">Szukaj nauczycieli, zapisz się na kursy, śledź postęp</p>
                   </button>
                   <button
                     onClick={() => setMode("demo-enterprise")}
                     className="w-full p-4 rounded-xl border-2 border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-left transition-all">
                     <p className="font-semibold text-purple-200 text-sm">🏛️ Demo Enterprise</p>
                     <p className="text-xs text-purple-300/70 mt-1">Sales • Production • Inventory • Finance • Marketing • AI</p>
                   </button>
                 </div>
                <div className="mt-4 text-center">
                  <button onClick={() => { setMode("login"); setError(""); }}
                    className="text-xs text-slate-400 hover:text-white transition-colors">
                    ← Wróć do logowania
                  </button>
                </div>
                </>
                ) : mode === "demo-enterprise" ? (
                /* ENTERPRISE MODULES SELECTION */
                <>
                  <h2 className="text-lg font-semibold text-white mb-1">🏛️ Enterprise Moduły</h2>
                  <p className="text-xs text-slate-400 mb-3">Kliknij moduł aby wejść do odpowiedniej sekcji</p>
                  <div className="space-y-1.5 max-h-72 overflow-y-auto">
                    {[
                      { id: "companies", label: "💼 Sales (CRM) — Zarządzanie klientami" },
                      { id: "production", label: "🏭 Production (MES) — Zlecenia produkcji" },
                      { id: "inventory", label: "📦 Inventory (WMS) — Magazyn" },
                      { id: "reports", label: "💰 Finance (ERP) — Raporty finansowe" },
                      { id: "suppliers", label: "📱 Marketing & Dostawcy" },
                      { id: "companies", label: "🧠 AI Insights — Analityka firm" }
                    ].map((module, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          sessionStorage.setItem("lg_auth", "1");
                          sessionStorage.setItem("lg_demo_mode", "1");
                          sessionStorage.setItem("lg_demo_type", "enterprise");
                          sessionStorage.setItem("lg_enterprise_tab", module.id);
                          setLoggedIn(true);
                        }}
                        className="w-full p-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/15 transition-all text-left text-xs font-medium text-purple-300">
                        {module.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 text-center">
                    <button onClick={() => { setMode("demo-select"); setError(""); }}
                      className="text-xs text-slate-400 hover:text-white transition-colors">
                      ← Wróć
                    </button>
                  </div>
                </>
                ) : mode === "register" ? (
              /* REGISTRATION */
              <>
                <h2 className="text-lg font-semibold text-white mb-2">✍️ Załóż konto</h2>
                <p className="text-xs text-slate-400 mb-6">Wybierz typ konta i wypełnij dane</p>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-2">Typ konta *</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "student", label: "👨‍🎓 Student" },
                        { value: "teacher", label: "👨‍🏫 Nauczyciel" },
                        { value: "enterprise", label: "🏛️ Enterprise" }
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRegUserType(opt.value)}
                          className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${
                            regUserType === opt.value
                              ? "border-primary bg-primary/20 text-primary"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">Pełne imię i nazwisko *</label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={e => { setRegFullName(e.target.value); setError(""); }}
                      placeholder="Jan Kowalski"
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">Email *</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => { setRegEmail(e.target.value); setError(""); }}
                      placeholder="jan@example.com"
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1.5">Hasło (minimum 6 znaków) *</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => { setRegPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                      <p className="text-xs text-red-400">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={regLoading}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
                    {regLoading ? "Rejestruję…" : "Załóż konto"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button onClick={() => { setMode("login"); setError(""); }}
                    className="text-xs text-slate-400 hover:text-white transition-colors">
                    ← Wróć do logowania
                  </button>
                </div>
              </>
              ) : (
              /* FORGOT PASSWORD */
              <>
                <h2 className="text-lg font-semibold text-white mb-2">{t.reset_title || "Reset hasła"}</h2>
                <p className="text-xs text-slate-400 mb-6">{t.reset_subtitle}</p>
                {resetSent ? (
                  <div className="flex flex-col items-center gap-3 py-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                    <p className="text-sm font-medium text-white">{t.email_sent || "E-mail wysłany!"}</p>
                    <p className="text-xs text-slate-400 text-center">Sprawdź skrzynkę <strong className="text-slate-300">{ADMIN_EMAIL}</strong></p>
                    <button onClick={() => { setMode("login"); setResetSent(false); }} className="mt-2 text-xs text-primary hover:underline">
                      ← Wróć do logowania
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-3">
                      <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Reset zostanie wysłany na:</p>
                        <p className="text-sm font-medium text-white">{ADMIN_EMAIL}</p>
                      </div>
                    </div>
                    <button type="submit" disabled={emailLoading}
                      className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors">
                      {emailLoading ? "Wysyłanie…" : "Wyślij reset hasła"}
                    </button>
                    <div className="text-center">
                      <button type="button" onClick={() => setMode("login")} className="text-xs text-slate-400 hover:text-white transition-colors">
                        ← Wróć do logowania
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginGate({ children }) {
  return <LoginGateInner>{children}</LoginGateInner>;
}