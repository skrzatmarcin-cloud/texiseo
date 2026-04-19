import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageContext";

const CREDENTIALS = { username: "Marcin", password: "Marcinek2026!" };
const ADMIN_EMAIL = "skrzatmarcin@gmail.com";

function LoginGateInner({ children }) {
  const { t } = useLanguage();
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("lg_auth") === "1");
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (loggedIn) return children;

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === CREDENTIALS.username && password === CREDENTIALS.password) {
      sessionStorage.setItem("lg_auth", "1");
      setLoggedIn(true);
    } else {
      setError(t.invalid_credentials || "Nieprawidłowa nazwa użytkownika lub hasło.");
    }
  };

  const handleDemo = () => {
    sessionStorage.setItem("lg_auth", "1");
    setLoggedIn(true);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: "Reset hasła — LinguaSEO OS",
      body: `Cześć Marcin!\n\nOtrzymaliśmy prośbę o reset hasła do systemu LinguaSEO OS.\n\nTwoje dane logowania:\n• Użytkownik: Marcin\n• Hasło: Marcinek2026!\n\nJeśli to nie Ty wysłałeś tę prośbę, zignoruj tę wiadomość.\n\nPozdrowienia,\nLinguaSEO OS`,
    });
    setLoading(false);
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
      <div className="absolute inset-0 bg-black/40" />

      {/* Language switcher top right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher dark />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://media.base44.com/images/public/69da036b1797baa333fdb6c1/f24cb9015_ChatGPTImage11kwi202616_54_09.png"
            alt="LinguaSEO OS"
            className="h-56 w-56 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          {mode === "login" ? (
            <>
              <h2 className="text-lg font-semibold text-white mb-6">{t.login_title || "Zaloguj się"}</h2>

              {/* DEMO button */}
              <button
                onClick={handleDemo}
                className="w-full mb-4 py-3 rounded-xl border border-teal-400/40 bg-teal-400/10 text-teal-300 text-sm font-bold hover:bg-teal-400/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {t.demo_btn || "Wejdź jako DEMO (bez hasła)"}
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] text-white/30">lub</span>
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
                      placeholder={t.username}
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
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
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

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors mt-2"
                >
                  {t.login_btn || "Zaloguj się"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setMode("forgot"); setError(""); }}
                  className="text-xs text-slate-400 hover:text-primary transition-colors underline underline-offset-2"
                >
                  {t.forgot_password || "Zapomniałeś hasła?"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-2">{t.reset_title || "Reset hasła"}</h2>
              <p className="text-xs text-slate-400 mb-6">{t.reset_subtitle}</p>

              {resetSent ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  <p className="text-sm font-medium text-white">{t.email_sent || "E-mail wysłany!"}</p>
                  <p className="text-xs text-slate-400 text-center">Sprawdź skrzynkę <strong className="text-slate-300">{ADMIN_EMAIL}</strong></p>
                  <button onClick={() => { setMode("login"); setResetSent(false); }} className="mt-2 text-xs text-primary hover:underline">
                    {t.back_to_login || "← Wróć do logowania"}
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
                  >
                    {loading ? (t.sending || "Wysyłanie…") : (t.reset_btn || "Wyślij reset hasła")}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={() => setMode("login")} className="text-xs text-slate-400 hover:text-white transition-colors">
                      {t.back_to_login || "← Wróć do logowania"}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginGate({ children }) {
  return <LoginGateInner>{children}</LoginGateInner>;
}