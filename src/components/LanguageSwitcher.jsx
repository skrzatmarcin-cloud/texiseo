import { useState } from "react";
import { LANGUAGES } from "@/lib/i18n";
import { useLanguage } from "@/lib/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

// mode: "full" (flag+name+globe), "compact" (flag+globe), "mini" (flag only, tiny)
export default function LanguageSwitcher({ dark = false, compact = false, mini = false }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  if (mini) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(o => !o)}
          title={current.label}
          className="flex items-center justify-center w-6 h-6 rounded text-sm leading-none hover:bg-secondary/80 transition-colors"
        >
          {current.flag}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-1 z-50 rounded-xl shadow-xl border border-border bg-card overflow-hidden min-w-[130px]">
              {LANGUAGES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors",
                    lang === l.code
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-secondary"
                  )}
                >
                  <span className="text-sm">{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
          dark
            ? "bg-white/10 hover:bg-white/20 text-white/80 border border-white/10"
            : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
        )}
      >
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && <span>{current.label}</span>}
        <Globe className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className={cn(
            "absolute right-0 mt-1 z-50 rounded-xl shadow-xl border overflow-hidden min-w-[140px]",
            dark ? "bg-slate-900 border-white/10" : "bg-card border-border"
          )}>
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors",
                  lang === l.code
                    ? dark ? "bg-white/10 text-white" : "bg-primary/10 text-primary font-medium"
                    : dark ? "text-white/70 hover:bg-white/10" : "text-foreground hover:bg-secondary"
                )}
              >
                <span className="text-base">{l.flag}</span>
                {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}