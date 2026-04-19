import { useState, useEffect } from 'react';
import { X, Cookie, ExternalLink } from 'lucide-react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem('cookie_consent');
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      analytics: false,
      marketing: false,
      preferences: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const handleCustom = (choices) => {
    localStorage.setItem('cookie_consent', JSON.stringify({
      ...choices,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBanner(false)} />
      
      <div className="relative w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-border shadow-2xl">
        <div className="max-w-4xl mx-auto p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Ciasteczka i Prywatność</h2>
                <p className="text-xs text-muted-foreground">Szanujemy Twoją prywatność</p>
              </div>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          {!showDetails ? (
            <>
              <p className="text-sm text-foreground/80 mb-6">
                Używamy ciasteczek aby zapewnić najlepsze doświadczenie. Obejmuje to ciasteczka niezbędne do funkcjonowania strony, 
                analityczne (aby zrozumieć jak jej używasz) i marketingowe (aby pokazać Ci istotne treści).
                <a href="/privacy" className="ml-1 text-primary hover:underline inline-flex items-center gap-1">
                  Polityka Prywatności <ExternalLink className="h-3 w-3" />
                </a>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRejectAll}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Odrzuć Wszystko
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Dostosuj
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Zaakceptuj Wszystko
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Details View */}
              <div className="space-y-4 mb-6">
                <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" defaultChecked disabled className="mt-1" />
                    <div>
                      <p className="font-semibold text-sm">Niezbędne</p>
                      <p className="text-xs text-muted-foreground">
                        Wymagane do bezpieczeństwa, autentykacji i funkcjonowania strony
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      id="analytics"
                      className="mt-1 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="analytics" className="font-semibold text-sm cursor-pointer">
                        Analityczne
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Pomagają nam zrozumieć jak używasz strony (Google Analytics, Mixpanel)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      id="marketing"
                      className="mt-1 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="marketing" className="font-semibold text-sm cursor-pointer">
                        Marketingowe
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Pozwalają nam pokazać Ci spersonalizowane reklamy (Facebook Ads, Google Ads)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      id="preferences"
                      className="mt-1 cursor-pointer"
                    />
                    <div>
                      <label htmlFor="preferences" className="font-semibold text-sm cursor-pointer">
                        Preferencje
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Zapamiętują Twoje ustawienia (język, motyw, rozmiar czcionki)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  Wróć
                </button>
                <button
                  onClick={() => {
                    handleCustom({
                      analytics: document.getElementById('analytics').checked,
                      marketing: document.getElementById('marketing').checked,
                      preferences: document.getElementById('preferences').checked,
                    });
                  }}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Zapisz Ustawienia
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}