import { useEffect, useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Send, MessageSquare, Loader2, Plus, X, Paperclip } from "lucide-react";

export default function TeacherChat() {
  const [teachers, setTeachers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMsg, setNewMsg] = useState({ subject: "", message: "" });
  const [showCompose, setShowCompose] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const [t, m] = await Promise.all([
      base44.entities.Teachers.list(),
      base44.entities.TeacherMessages.list("-created_date", 200),
    ]);
    setTeachers(t);
    setMessages(m);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, selectedTeacher]);

  const threadMessages = selectedTeacher
    ? messages.filter(m => m.teacher_id === selectedTeacher.id).reverse()
    : [];

  const unreadCount = (teacherId) =>
    messages.filter(m => m.teacher_id === teacherId && !m.read && m.direction === "to_teacher").length;

  const markRead = async (teacherId) => {
    const unread = messages.filter(m => m.teacher_id === teacherId && !m.read);
    await Promise.all(unread.map(m => base44.entities.TeacherMessages.update(m.id, { read: true })));
    setMessages(p => p.map(m => m.teacher_id === teacherId ? { ...m, read: true } : m));
  };

  const selectTeacher = (t) => {
    setSelectedTeacher(t);
    markRead(t.id);
  };

  const sendMessage = async () => {
    if (!newMsg.message.trim() || !selectedTeacher) return;
    setSending(true);
    const msg = await base44.entities.TeacherMessages.create({
      teacher_id: selectedTeacher.id,
      sender_name: "Admin Linguatoons",
      sender_email: "admin@linguatoons.com",
      direction: "to_teacher",
      subject: newMsg.subject || "Wiadomość",
      message: newMsg.message,
      read: false,
    });
    // Also send real email
    await base44.integrations.Core.SendEmail({
      to: selectedTeacher.email,
      subject: `[Linguatoons] ${newMsg.subject || "Nowa wiadomość"}`,
      body: `Cześć ${selectedTeacher.first_name},\n\n${newMsg.message}\n\n---\nZespół Linguatoons`,
    });
    setMessages(p => [msg, ...p]);
    setNewMsg({ subject: "", message: "" });
    setSending(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[500px]">
      {/* Sidebar — teacher list */}
      <div className="w-64 border-r border-border bg-card flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nauczyciele</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {teachers.map(t => {
            const unread = unreadCount(t.id);
            const lastMsg = messages.filter(m => m.teacher_id === t.id)[0];
            return (
              <button
                key={t.id}
                onClick={() => selectTeacher(t)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-3 hover:bg-secondary/50 transition-colors border-b border-border/40",
                  selectedTeacher?.id === t.id && "bg-accent/50"
                )}
              >
                <div className="relative flex-shrink-0">
                  {t.photo_url
                    ? <img src={t.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                    : <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
                        {t.first_name?.[0]}{t.last_name?.[0]}
                      </div>
                  }
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                      {unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium truncate">{t.first_name} {t.last_name}</p>
                  {lastMsg && (
                    <p className="text-[10px] text-muted-foreground truncate">{lastMsg.message}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedTeacher ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
                  {selectedTeacher.first_name?.[0]}{selectedTeacher.last_name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{selectedTeacher.first_name} {selectedTeacher.last_name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedTeacher.email}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/20">
              {threadMessages.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Brak wiadomości — napisz pierwszą</p>
                </div>
              )}
              {threadMessages.map(msg => (
                <div key={msg.id} className={cn(
                  "flex",
                  msg.direction === "to_teacher" ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5",
                    msg.direction === "to_teacher"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-foreground"
                  )}>
                    {msg.subject && msg.subject !== "Wiadomość" && (
                      <p className={cn("text-[10px] font-semibold mb-1 opacity-70")}>{msg.subject}</p>
                    )}
                    <p className="text-xs leading-relaxed">{msg.message}</p>
                    <p className={cn(
                      "text-[9px] mt-1 opacity-60",
                      msg.direction === "to_teacher" ? "text-right" : "text-left"
                    )}>
                      {new Date(msg.created_date).toLocaleString("pl-PL", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card space-y-2">
              <Input
                value={newMsg.subject}
                onChange={e => setNewMsg(p => ({ ...p, subject: e.target.value }))}
                placeholder="Temat wiadomości (opcjonalnie)"
                className="h-8 text-xs"
              />
              <div className="flex gap-2">
                <Input
                  value={newMsg.message}
                  onChange={e => setNewMsg(p => ({ ...p, message: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Napisz wiadomość… (Enter = wyślij)"
                  className="flex-1 h-9 text-xs"
                />
                <Button size="sm" onClick={sendMessage} disabled={sending || !newMsg.message.trim()} className="h-9 gap-1.5">
                  {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Wyślij
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Wiadomość zostanie wysłana na email: {selectedTeacher.email}</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Wybierz nauczyciela aby zobaczyć wiadomości</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}