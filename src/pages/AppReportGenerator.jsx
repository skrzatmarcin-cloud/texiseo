import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, FileText, Check } from 'lucide-react';

export default function AppReportGenerator() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const response = await base44.functions.invoke('generateAppReport', {});
      
      if (response.data && typeof response.data === 'string') {
        // HTML report
        const blob = new Blob([response.data], { type: 'text/html; charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TexiSEO-Full-App-Report.html';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        // PDF or other binary
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'TexiSEO-Full-App-Report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Błąd generowania raportu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">App Report Generator</h1>
              <p className="text-sm text-muted-foreground">Generuj pełny raport aplikacji w formacie HTML/PDF</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-secondary/50 rounded-xl p-5 mb-8 space-y-3">
            <h3 className="font-semibold">📋 Zawartość raportu:</h3>
            <ul className="text-sm space-y-2 text-foreground/80">
              <li>✓ Executive summary & status aplikacji</li>
              <li>✓ Architektura systemu (stack, auth, baza danych)</li>
              <li>✓ 8 Hubów z kompletnym opisem</li>
              <li>✓ 22 Stron & Routes</li>
              <li>✓ 30+ Encji bazy danych</li>
              <li>✓ 40+ UI Components</li>
              <li>✓ 11 Backend Functions</li>
              <li>✓ 3 AI Agents</li>
              <li>✓ 6 External Integrations</li>
              <li>✓ Security Architecture</li>
              <li>✓ Performance & Deployment</li>
              <li>✓ Data Statistics & Live Counts</li>
              <li>✓ Recommended Next Steps</li>
            </ul>
          </div>

          {/* Statistics Preview */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">22</p>
              <p className="text-xs text-muted-foreground mt-1">Routes</p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">30+</p>
              <p className="text-xs text-muted-foreground mt-1">Encje</p>
            </div>
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-primary">11</p>
              <p className="text-xs text-muted-foreground mt-1">Functions</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="space-y-3">
            <button
              onClick={generateReport}
              disabled={loading || success}
              className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Generuję raport...
                </>
              ) : success ? (
                <>
                  <Check className="h-5 w-5" />
                  Raport pobrany! ✓
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Pobierz Pełny Raport
                </>
              )}
            </button>

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-700">
                ✓ Raport został wygenerowany i pobrany. Plik zawiera kompletną dokumentację aplikacji.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground">
            <p>📊 Raport zawiera live data z bazy danych + instrukcje dla zespołu developerskiego.</p>
            <p className="mt-2">💾 Plik można otworzyć w dowolnej przeglądarce (HTML) lub drukarce (PDF).</p>
          </div>
        </div>
      </div>
    </div>
  );
}