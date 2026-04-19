import { AlertCircle, Lock } from "lucide-react";

export default function DemoWrapper({ children, title }) {
  return (
    <div className="relative">
      {/* Demo warning banner */}
      <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-3 mb-5 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-amber-300">🎬 Tryb Demo</p>
          <p className="text-amber-200/80 text-xs mt-0.5">
            To jest sam pokazówka — wszystkie funkcje edycji są wyłączone. Zaloguj się na prawdziwe konto, aby zacząć pracę.
          </p>
        </div>
      </div>

      {/* Disabled overlay for interactions */}
      <div className="relative opacity-75">
        {children}
        <div className="absolute inset-0 bg-black/5 pointer-events-none rounded-xl" />
      </div>

      {/* Disabled buttons/inputs overlay */}
      <style>{`
        [data-demo-mode] button:not(.demo-allowed),
        [data-demo-mode] input:not(.demo-allowed),
        [data-demo-mode] textarea:not(.demo-allowed),
        [data-demo-mode] select:not(.demo-allowed) {
          pointer-events: none;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}