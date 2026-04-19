import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { MessageSquare, X, Send, Loader2, Bot, User, Minimize2, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const BRAND = {
  name: "TexiSEO.ai",
  adminEmail: "skrzatmarcin@gmail.com",
  url: "https://texiseo.ai",
};

const QUICK_SUGGESTIONS = [
  "Jakie języki oferujecie?",
  "Ile kosztują zajęcia?",
  "Chcę zapisać dziecko na angielski",
  "Mam pytanie o ofertę dla firmy",
];

const WELCOME_MSG = `Cześć! Jestem asystentem **TexiSEO.ai** 👋

Mogę Ci pomóc z:
- 📚 Ofertą kursów językowych
- 💰 Cennikiem i zapisami  
- 🏢 Ofertami dla firm (B2B)
- 🔧 Sugestiami i zmianami w systemie

W czym mogę pomóc?`;

export default function PublicSupportChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: WELCOME_MSG }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) inputRef.current?.focus();
  }, [open, minimized]);

  const sendMessage = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    // Build conversation history for context
    const history = messages.slice(-6).map(m => `${m.role === "user" ? "Klient" : "Asystent"}: ${m.content}`).join("\n");

    const systemPrompt = `Jesteś przyjaznym asystentem TexiSEO.ai / LinguaTons (platforma kursów językowych online).

INFORMACJE O FIRMIE:
- Oferta: angielski, hiszpański, francuski online — dzieci i dorośli
- Pierwsze zajęcia GRATIS
- Certyfikowani lektorzy, AI matching
- Ceny: od 49 PLN/h (indywidualne), od 29 PLN/h (grupowe)
- Kontakt email: ${BRAND.adminEmail}
- Strona: ${BRAND.url}

HISTORIA ROZMOWY:
${history}

INSTRUKCJE:
- Odpowiadaj po polsku, ciepło i pomocnie
- Przy pytaniach o ceny/zapis → zaproponuj podanie emaila żeby admin się skontaktował
- Przy prośbach o nowe funkcje/pola → powiedz że przekazujesz do zespołu i zostanie rozpatrzone
- Przy dużych zapytaniach B2B → zbierz kontakt i przekaż że admin odpowie w 24h
- Przy reklamacjach → przeproś i zaproponuj rozwiązanie
- Używaj emoji dla przyjazności
- Bądź konkretny, max 3-4 zdania na odpowiedź`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nKlient: ${userMsg}`,
      model: "gemini_3_flash",
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);

    // Auto-save important requests to DB
    await autoSaveRequest(userMsg, response);

    if (!open || minimized) setUnread(u => u + 1);
  };

  const autoSaveRequest = async (userMsg, aiResponse) => {
    const lower = userMsg.toLowerCase();
    let type = "question";
    let priority = "low";
    let emailNeeded = false;

    if (lower.includes("pole") || lower.includes("funkcj") || lower.includes("dodaj") || lower.includes("brak")) {
      type = "field_request";
      priority = "medium";
    } else if (lower.includes("firma") || lower.includes("b2b") || lower.includes("ofert") || lower.includes("cennik firm")) {
      type = "lead";
      priority = "high";
      emailNeeded = true;
    } else if (lower.includes("reklamacj") || lower.includes("problem") || lower.includes("nie działa") || lower.includes("błąd")) {
      type = "complaint";
      priority = "high";
      emailNeeded = true;
    } else if (lower.includes("zapis") || lower.includes("kurs") || lower.includes("lekcj") || lower.includes("cena")) {
      type = "lead";
      priority = "medium";
    }

    // Only save non-trivial messages
    if (type !== "question" || userMsg.length > 60) {
      await base44.entities.ClientRequests.create({
        type,
        message: userMsg,
        ai_response: aiResponse,
        status: type === "field_request" ? "pending_review" : "new",
        priority,
        email_sent: false,
      });

      // Send email for high priority
      if (emailNeeded || priority === "high") {
        base44.integrations.Core.SendEmail({
          to: BRAND.adminEmail,
          subject: `[TexiSEO Chat] Nowe zgłoszenie: ${type} — ${priority.toUpperCase()}`,
          body: `Nowe zgłoszenie z czatu TexiSEO.ai\n\nTyp: ${type}\nPriorytet: ${priority}\n\nWiadomość klienta:\n${userMsg}\n\nOdpowiedź AI:\n${aiResponse}\n\n---\nTexiSEO AI System`,
        });
      }
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-gradient-to-br from-violet-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-all group"
      >
        <MessageSquare className="h-6 w-6 text-white" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
            {unread}
          </span>
        )}
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full border-2 border-white" style={{ display: unread > 0 ? 'none' : 'block' }} />
      </button>
    );
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-2xl flex flex-col transition-all duration-200",
      minimized ? "w-72 h-14" : "w-[360px] sm:w-96 h-[540px]"
    )}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-r from-violet-600 to-blue-600 rounded-t-2xl cursor-pointer"
        onClick={() => minimized && setMinimized(false)}
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-white/15 rounded-xl flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Asystent TexiSEO.ai</p>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-[10px] text-white/70">Online — odpowiadamy natychmiast</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={e => { e.stopPropagation(); setMinimized(m => !m); }}
            className="h-7 w-7 flex items-center justify-center text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            {minimized ? <MessageSquare className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={e => { e.stopPropagation(); setOpen(false); }}
            className="h-7 w-7 flex items-center justify-center text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}>
                {msg.role === "assistant" && (
                  <div className="h-6 w-6 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-tr-sm"
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
                    <User className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="h-6 w-6 bg-gradient-to-br from-violet-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-2.5 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-1 flex flex-wrap gap-1.5">
              {QUICK_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-[10px] bg-primary/10 text-primary rounded-full px-2.5 py-1 hover:bg-primary/20 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Napisz wiadomość…"
                className="flex-1 h-9 bg-secondary rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="h-9 w-9 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition-all"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground/50 text-center mt-1.5">
              TexiSEO.ai · Powered by AI · Dane są bezpieczne
            </p>
          </div>
        </>
      )}
    </div>
  );
}