import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle2 } from "lucide-react";

const CREDENTIALS = { username: "Marcin", password: "Marcinek2026!" };
const ADMIN_EMAIL = "skrzatmarcin@gmail.com";

export default function LoginGate({ children }) {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("lg_auth") === "1");
  const [mode, setMode] = useState("login"); // "login" | "forgot"
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
      setError("Nieprawidłowa nazwa użytkownika lub hasło.");
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="https://media.base44.com/images/public/69da036b1797baa333fdb6c1/f24cb9015_ChatGPTImage11kwi202616_54_09.png"
            alt="LinguaSEO OS"
            className="h-28 w-28 object-contain mb-4 drop-shadow-2xl"
          />
          <h1 className="text-2xl font-bold text-white tracking-tight">LinguaSEO OS</h1>
          <p className="text-slate-400 text-sm mt-1">linguatoons.com</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          {mode === "login" ? (
            <>
              <h2 className="text-lg font-semibold text-white mb-6">Zaloguj się</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Nazwa użytkownika</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => { setUsername(e.target.value); setError(""); }}
                      placeholder="Użytkownik"
                      className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Hasło</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
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
                  Zaloguj się
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setMode("forgot"); setError(""); }}
                  className="text-xs text-slate-400 hover:text-primary transition-colors underline underline-offset-2"
                >
                  Zapomniałeś hasła?
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-white mb-2">Reset hasła</h2>
              <p className="text-xs text-slate-400 mb-6">Wyślemy dane logowania na Twój adres e-mail.</p>

              {resetSent ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  <p className="text-sm font-medium text-white">E-mail wysłany!</p>
                  <p className="text-xs text-slate-400 text-center">Sprawdź skrzynkę <strong className="text-slate-300">{ADMIN_EMAIL}</strong></p>
                  <button onClick={() => { setMode("login"); setResetSent(false); }} className="mt-2 text-xs text-primary hover:underline">
                    Wróć do logowania
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
                    {loading ? "Wysyłanie…" : "Wyślij reset hasła"}
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
      </div>
    </div>
  );
}