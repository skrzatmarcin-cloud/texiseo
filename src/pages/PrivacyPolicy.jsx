import { Mail, Shield, Lock, Eye, Clock, Users, DollarSign } from 'lucide-react';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Shield,
      title: "1. Kontroller Danych",
      content: "TexiSEO.ai sp. z o.o.\nul. Warszawska 123\n00-950 Warszawa, Polska\nEmail: skrzatmarcin@gmail.com\n\nAdministrator Danych Osobowych: Marcin Skrzat"
    },
    {
      icon: Eye,
      title: "2. Jakie Dane Zbieramy",
      content: "• Dane logowania: email, nazwa użytkownika\n• Dane kontaktowe: imię, nazwisko, adres\n• Dane techniczne: IP address, przeglądarka, system operacyjny\n• Dane aktywności: strony odwiedzone, czas spędzony, akcje użytkownika\n• Dane płatności: informacje o transakcjach (NIP, REGON dla firm)\n• Ciasteczka: identyfikatory sesji, preferencje użytkownika"
    },
    {
      icon: Lock,
      title: "3. Jak Używamy Danych",
      content: "Dane osobowe są przetwarzane w celu:\n• Świadczenia usług (autentykacja, zarządzanie kontem)\n• Komunikacji (powiadomienia, newsletter)\n• Analizy i ulepszania usług\n• Zgodności z prawem (przechowywanie logów bezpieczeństwa)\n• Marketingu (jeśli wyraziłeś zgodę)\n• Zabezpieczenia przed oszustwami i włamaniami"
    },
    {
      icon: Lock,
      title: "4. Szyfrowanie i Bezpieczeństwo",
      content: "• Wszystkie dane są transmitowane przez HTTPS (SSL/TLS 256-bit)\n• Hasła są hashowane za pomocą bcrypt (nigdy nie przechowywane w czystej postaci)\n• Dane osobowe są szyfrowane w bazie danych\n• Dostęp ograniczony tylko do autoryzowanego personelu\n• Regularne audyty bezpieczeństwa\n• Monitoring 24/7 podejrzanej aktywności"
    },
    {
      icon: Users,
      title: "5. Udostępnianie Danych Trzecim Stronom",
      content: "Dane mogą być udostępniane:\n• Dostawcom usług (Base44 — hosting, Google — analytics, Stripe — płatności)\n• Organom publicznym (jeśli wymagane prawem)\n• Partnerom biznesowym (tylko za wyrażoną zgodą)\n\nNigdy nie sprzedajemy ani nie handlujemy Twoimi danymi osobowymi."
    },
    {
      icon: Clock,
      title: "6. Przechowywanie Danych",
      content: "• Dane aktywnych użytkowników: przechowywane przez czas trwania konta\n• Loginy nieudane: 30 dni (do śledzenia bezpieczeństwa)\n• Kopie zapasowe: do 90 dni\n• Dane usuniętego konta: anonimizowane w ciągu 30 dni\n• Dane w celach prawnych: przechowywane zgodnie z wymogami prawa (min. 5 lat)"
    },
    {
      icon: Eye,
      title: "7. Twoje Prawa (GDPR)",
      content: "Masz prawo do:\n• Dostępu do swoich danych\n• Sprostowania (zmiana) błędnych danych\n• Usunięcia (prawo do bycia zapomnianym)\n• Przenośności danych (otrzymania kopii w standardowym formacie)\n• Sprzeciwu wobec przetwarzania\n• Ograniczenia przetwarzania\n• Wycofania zgody (w dowolnym momencie)\n\nProszenia należy wysyłać na: skrzatmarcin@gmail.com"
    },
    {
      icon: DollarSign,
      title: "8. Ciasteczka (Cookies)",
      content: "Używamy ciasteczek do:\n• Pamiętania preferencji użytkownika\n• Śledzenia analitycznego (Google Analytics)\n• Reklam spersonalizowanych\n• Sesji bezpieczeństwa\n\nMożesz zarządzać ciasteczkami w ustawieniach przeglądarki. Zgoda jest zbierana na stronie poprzez Cookie Banner."
    },
    {
      icon: Shield,
      title: "9. Bezpieczeństwo Danych Klientów (B2B)",
      content: "Dla klientów biznesowych (BusinessClients, Suppliers, ProductionOrders):\n• Dane NIP, REGON, KRS chronimy z maksymalną staranności\n• Dostęp ograniczony tylko do administratora\n• Dane finansowe (ceny, opłacalność) szyfrowane\n• Regularne backupy w bezpiecznych lokalizacjach\n• Zgodność z Ustawą o Ochronie Konkurencji"
    },
    {
      icon: Clock,
      title: "10. Polityka IP Blocking",
      content: "Ze względów bezpieczeństwa:\n• Po 3 nieudanych próbach logowania IP jest blokowana na 30 minut\n• Wszystkie próby logowania są rejestrowane (IP, przeglądarka, OS)\n• Administrator otrzymuje alert o podejrzanej aktywności\n• Dane logowania przechowywane są 30 dni\n• Użytkownik ma prawo do dostępu do swoich logów"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Polityka Prywatności</h1>
          <p className="text-white/80">TexiSEO.ai — Ostatnia aktualizacja: 19 kwietnia 2026</p>
          <p className="text-sm text-white/60 mt-2">Zgodna z RODO (GDPR) i polskim prawem ochrony danych osobowych</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mb-8">
          <p className="text-sm leading-relaxed">
            Niniejsza Polityka Prywatności wyjaśnia, jak zbieramy, używamy, chronimy i udostępniamy Twoje dane osobowe. 
            Jesteśmy zobowiązani do ochrony Twoich danych zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 
            (RODO) oraz Ustawą o Ochronie Danych Osobowych.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold mb-3">{section.title}</h2>
                    <p className="text-sm text-foreground/70 whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-secondary/50 border border-border rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Kontakt
          </h2>
          <div className="space-y-2 text-sm">
            <p><strong>Jeśli masz pytania dotyczące tej polityki lub swoich danych:</strong></p>
            <p>📧 Email: <a href="mailto:skrzatmarcin@gmail.com" className="text-primary hover:underline">skrzatmarcin@gmail.com</a></p>
            <p>🏢 Adres: ul. Warszawska 123, 00-950 Warszawa, Polska</p>
            <p>📞 Możesz również złożyć skargę do:</p>
            <p className="ml-4">Prezesa Urzędu Ochrony Danych Osobowych (UODO)</p>
            <p className="ml-4">ul. Stawki 2, 00-193 Warszawa</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>© 2024-2026 TexiSEO.ai sp. z o.o. Wszystkie prawa zastrzeżone.</p>
          <p className="mt-2">Polityka Prywatności obowiązuje od 19 kwietnia 2026</p>
        </div>
      </div>
    </div>
  );
}