import { useEffect, useState } from "react";
import { Shield, CheckCircle2, Wifi, Globe, Lock, Cpu, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

const SCAN_STEPS = [
  { icon: Globe,      label: "Wykrywanie adresu IP…",          duration: 700  },
  { icon: Wifi,       label: "Sprawdzanie połączenia…",         duration: 600  },
  { icon: Eye,        label: "Identyfikacja przeglądarki…",     duration: 700  },
  { icon: Shield,     label: "Analiza zagrożeń (TexiSEO AI)…", duration: 900  },
  { icon: Cpu,        label: "Weryfikacja odcisku palca…",      duration: 700  },
  { icon: Lock,       label: "Szyfrowanie sesji TLS 1.3…",     duration: 600  },
  { icon: CheckCircle2, label: "Środowisko bezpieczne ✓",       duration: 400  },
];

export default function SecurityScanAnimation({ ipData, onDone }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let current = 0;
    const run = () => {
      if (current >= SCAN_STEPS.length) {
        setDone(true);
        setTimeout(() => onDone?.(), 600);
        return;
      }
      setStep(current);
      current++;
      setTimeout(run, SCAN_STEPS[current - 1]?.duration || 600);
    };
    const t = setTimeout(run, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative mb-4">
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-150" />
          <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse scale-125" />
          <div className="h-20 w-20 bg-gradient-to-br from-slate-900 to-blue-950 rounded-full border border-blue-500/30 flex items-center justify-center relative z-10 shadow-2xl shadow-blue-900/50">
            <Shield className={cn(
              "h-9 w-9 transition-all duration-300",
              done ? "text-emerald-400" : "text-blue-400 animate-pulse"
            )} />
          </div>
        </div>
        <p className="text-white font-bold text-base tracking-tight">
          {done ? "Weryfikacja zakończona" : "TexiSEO Security AI"}
        </p>
        <p className="text-white/50 text-xs mt-1">
          {done ? "Środowisko jest bezpieczne" : "Skanowanie środowiska…"}
        </p>
      </div>

      {/* Steps */}
      <div className="bg-black/30 backdrop-blur border border-white/10 rounded-2xl p-4 space-y-2">
        {SCAN_STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step && !done;
          const isComplete = i < step || done;

          return (
            <div key={i} className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-300",
              isActive ? "bg-blue-500/15 border border-blue-500/20" :
              isComplete ? "opacity-60" : "opacity-20"
            )}>
              <div className={cn(
                "h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                isActive ? "bg-blue-500/20" :
                isComplete ? "bg-emerald-500/20" : "bg-white/5"
              )}>
                <Icon className={cn(
                  "h-3.5 w-3.5",
                  isActive ? "text-blue-400 animate-pulse" :
                  isComplete ? "text-emerald-400" : "text-white/30"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium flex-1",
                isActive ? "text-blue-200" :
                isComplete ? "text-white/60" : "text-white/20"
              )}>
                {s.label}
              </span>
              {isActive && (
                <span className="flex gap-0.5">
                  {[0,1,2].map(d => (
                    <span key={d} className="h-1 w-1 bg-blue-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d * 150}ms` }} />
                  ))}
                </span>
              )}
              {isComplete && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* IP info shown when done */}
      {done && ipData && (
        <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
          <div className="text-xs text-emerald-300">
            <span className="font-semibold">IP: {ipData.ip}</span>
            {ipData.country && <span className="text-emerald-400/70"> · {ipData.country}{ipData.city ? `, ${ipData.city}` : ""}</span>}
            <span className="text-emerald-400/50 block">Połączenie szyfrowane · Brak zagrożeń</span>
          </div>
        </div>
      )}
    </div>
  );
}