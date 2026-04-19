import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, X, Send, Loader2, Bot, User, Minimize2, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const SUGGESTIONS = {
  pl: [
    "Dodaj firmę Kowalski Sp. z o.o. z NIP 123-456-78-90 z Warszawy",
    "Ile mam produktów w magazynie?",
    "Dodaj surowiec: stal nierdzewna, 500 kg",
    "Jakie zlecenia produkcji są aktualnie w toku?",
    "Dodaj dostawcę: Metalex z Katowic",
  ],
  en: [
    "Add company ABC Ltd. from Warsaw",
    "How many products do I have in stock?",
    "Add raw material: stainless steel, 500 kg",
    "What production orders are currently active?",
  ],
  de: [
    "Füge Unternehmen Müller GmbH aus Warschau hinzu",
    "Wie viele Produkte habe ich auf Lager?",
    "Material hinzufügen: Edelstahl, 500 kg",
  ],
  fr: [
    "Ajouter l'entreprise ABC de Varsovie",
    "Combien de produits ai-je en stock?",
  ],
  es: [
    "Agregar empresa ABC S.A. de Varsovia",
    "¿Cuántos productos tengo en stock?",
  ],
};

export default function AIChat() {
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: lang === "pl"
        ? "Cześć! Jestem Twoim asystentem AI 🤖\n\nMogę pomóc Ci:\n- **Dodawać** firmy, towary, surowce, dostawców\n- **Sprawdzać** stany magazynowe i zlecenia produkcji\n- **Zarządzać** danymi w systemie\n\nCo chcesz zrobić?"
        : "Hi! I'm your AI assistant 🤖\n\nI can help you:\n- **Add** companies, products, raw materials, suppliers\n- **Check** inventory levels and production orders\n- **Manage** data in the system\n\nWhat would you like to do?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  const suggestions = SUGGESTIONS[lang] || SUGGESTIONS.pl;

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    // Fetch current context from database
    let context = "";
    try {
      const [companies, inventory, orders] = await Promise.all([
        base44.entities.BusinessClients.list("-created_date", 20),
        base44.entities.InventoryItems.list("-created_date", 20),
        base44.entities.ProductionOrders.list("-created_date", 10),
      ]);
      context = `Aktualne dane w systemie:
- Firm: ${companies.length} (ostatnie: ${companies.slice(0,3).map(c => c.company_name).join(", ")})
- Pozycji magazynowych: ${inventory.length} (niski stan: ${inventory.filter(i => i.status==="niski_stan"||i.status==="brak").length})
- Zleceń produkcji: ${orders.length} (w toku: ${orders.filter(o => o.status==="w_toku").length})`;
    } catch (e) {
      context = "Brak danych kontekstowych.";
    }

    const systemPrompt = `Jesteś asystentem AI dla systemu Business Hub / Customer Management System.
Możesz pomagać użytkownikowi w zarządzaniu firmami, magazynem, produkcją i dostawcami.

${context}

Gdy użytkownik chce DODAĆ element:
1. Zbierz niezbędne dane (nazwa, NIP dla firm, ilość dla towarów itp.)
2. Powiedz mu dokładnie, które pola wypełnić w formularzu
3. Podsumuj co trzeba dodać

Gdy pyta o dane, odpowiedz na podstawie kontekstu.
Odpowiadaj w języku użytkownika. Bądź konkretny i pomocny. Używaj emoji dla przejrzystości.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nUżytkownik: ${userMsg}`,
      model: "gemini_3_flash",
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-primary rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-all hover:scale-105 group"
      >
        <MessageSquare className="h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white" />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-2xl flex flex-col transition-all",
      minimized ? "w-72 h-14" : "w-96 h-[520px]"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-white/20 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{t.ai_chat || "Asystent AI"}</p>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full" />
              <p className="text-[10px] text-white/70">Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(m => !m)} className="h-7 w-7 flex items-center justify-center text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setOpen(false)} className="h-7 w-7 flex items-center justify-center text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-white rounded-tr-sm"
                    : "bg-secondary text-foreground rounded-tl-sm"
                )}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown
                      className="prose prose-xs prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="my-0.5">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="my-1 ml-3 list-disc">{children}</ul>,
                        li: ({ children }) => <li className="my-0.5">{children}</li>,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  ) : msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-3 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {suggestions.slice(0,3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] bg-primary/10 text-primary rounded-full px-2.5 py-1 hover:bg-primary/20 transition-colors text-left"
                >
                  {s.length > 35 ? s.slice(0,35) + "…" : s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={t.type_message || "Napisz wiadomość…"}
                className="flex-1 h-9 bg-secondary rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:bg-primary/90 transition-colors"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}