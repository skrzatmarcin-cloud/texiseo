import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Plus, Wand2, Upload, Link2, BarChart3, Eye, Copy,
  Edit, Trash2, AlertCircle, Loader2, CheckCircle2, X, Play
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function TestBuilder() {
  const [view, setView] = useState("list"); // list, create, edit, preview
  const [tests, setTests] = useState([
    { id: 1, title: "Quiz: Czasy przeszłe", type: "quiz", questions: 10, students: 5, created: "2026-04-15" },
    { id: 2, title: "Gra słownictwa", type: "game", questions: 20, students: 3, created: "2026-04-10" }
  ]);
  const [currentTest, setCurrentTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  const handleCreateTest = () => {
    setCurrentTest({
      title: "",
      description: "",
      type: "quiz", // quiz, game, exam, schema
      questions: [],
      students: [],
      shareLink: null
    });
    setView("create");
  };

  const handleGenerateQuestions = async (count = 10, topic = "current content") => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Wygeneruj ${count} pytań testowych z wielokrotnym wyborem dla nauczyciela języków.
        Temat: ${topic}
        Format JSON: { "questions": [{ "text": "pytanie?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "wyjaśnienie" }]}`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct: { type: "number" },
                  explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      setGeneratedContent(response);
      setCurrentTest(prev => ({
        ...prev,
        questions: response.questions || []
      }));
    } catch (error) {
      console.error("Błąd generowania pytań:", error);
    }
    setLoading(false);
  };

  const handleImportFromLeksikos = async () => {
    setLoading(true);
    try {
      // Symulacja importu z Leksikos
      const mockLeksikosData = {
        title: "Leksikos Import",
        questions: [
          { text: "Co to jest?", options: ["A", "B", "C", "D"], correct: 0, explanation: "Odpowiedź A" },
          { text: "Które słowo?", options: ["X", "Y", "Z", "W"], correct: 2, explanation: "Odpowiedź Z" }
        ]
      };
      
      setCurrentTest(prev => ({
        ...prev,
        title: mockLeksikosData.title,
        questions: [...(prev?.questions || []), ...mockLeksikosData.questions]
      }));
      
      alert("✓ Pytania zaimportowane z Leksikos!");
    } catch (error) {
      console.error("Błąd importu:", error);
    }
    setLoading(false);
  };

  const handleSaveTest = async () => {
    if (!currentTest?.title) {
      alert("Wpisz tytuł testu");
      return;
    }

    setLoading(true);
    try {
      // Generuj link do udostępniania
      const shareLink = `texi-seo.app/test/${Math.random().toString(36).substr(2, 9)}`;
      
      const newTest = {
        ...currentTest,
        id: Date.now(),
        shareLink,
        created: new Date().toISOString().split("T")[0]
      };

      await base44.entities.TeacherQuiz.create({
        teacher_id: "current_user",
        quiz_title: currentTest.title,
        description: currentTest.description || "",
        question_count: currentTest.questions.length,
        status: "published"
      });

      setTests(prev => [...prev, newTest]);
      setView("list");
      setCurrentTest(null);
      alert("✓ Test zapisany!");
    } catch (error) {
      console.error("Błąd zapisu:", error);
    }
    setLoading(false);
  };

  const handleDeleteTest = (id) => {
    setTests(prev => prev.filter(t => t.id !== id));
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert("✓ Link skopiowany do schowka!");
  };

  // === VIEW: List ===
  if (view === "list") {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">📝 Moje Testy & Quizy</h2>
          <Button onClick={handleCreateTest} className="gap-2">
            <Plus className="h-4 w-4" />
            Utwórz nowy test
          </Button>
        </div>

        {tests.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">Brak testów. Utwórz pierwszy test!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map(test => (
              <div key={test.id} className="bg-card border border-border rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{test.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{test.questions} pytań</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                    {test.type === "quiz" && "📋 Quiz"}
                    {test.type === "game" && "🎮 Gra"}
                    {test.type === "exam" && "📊 Egzamin"}
                    {test.type === "schema" && "🎯 Schemat"}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>👥 {test.students} studentów</p>
                  <p>📅 {test.created}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1 text-xs"
                    onClick={() => {
                      setCurrentTest(test);
                      setView("preview");
                    }}
                  >
                    <Eye className="h-3 w-3" />
                    Podgląd
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleDeleteTest(test.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // === VIEW: Create/Edit ===
  if (view === "create") {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Utwórz Test</h2>
          <button
            onClick={() => {
              setView("list");
              setCurrentTest(null);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Tytuł testu</label>
            <input
              type="text"
              value={currentTest?.title || ""}
              onChange={e => setCurrentTest(prev => ({ ...prev, title: e.target.value }))}
              placeholder="np. Quiz: Czasy przeszłe"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Typ testu</label>
            <div className="grid grid-cols-4 gap-2">
              {["quiz", "game", "exam", "schema"].map(type => (
                <button
                  key={type}
                  onClick={() => setCurrentTest(prev => ({ ...prev, type }))}
                  className={cn(
                    "p-3 rounded-lg border-2 text-xs font-medium transition-all text-center",
                    currentTest?.type === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {type === "quiz" && "📋 Quiz"}
                  {type === "game" && "🎮 Gra"}
                  {type === "exam" && "📊 Egzamin"}
                  {type === "schema" && "🎯 Schemat"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Opis (opcjonalnie)</label>
            <textarea
              value={currentTest?.description || ""}
              onChange={e => setCurrentTest(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Opis dla studentów..."
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Options */}
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleGenerateQuestions(10)}
            disabled={loading}
            className="flex items-center gap-2 p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:border-purple-500 transition-all text-left"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            ) : (
              <Wand2 className="h-5 w-5 text-purple-600" />
            )}
            <div>
              <p className="font-semibold text-sm">🤖 Generuj pytania AI</p>
              <p className="text-xs text-muted-foreground">Auto-tworzenie pytań</p>
            </div>
          </button>

          <button
            onClick={handleImportFromLeksikos}
            disabled={loading}
            className="flex items-center gap-2 p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl hover:border-blue-500 transition-all text-left"
          >
            <Upload className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-semibold text-sm">📚 Import z Leksikos</p>
              <p className="text-xs text-muted-foreground">Załaduj pytania</p>
            </div>
          </button>
        </div>

        {/* Pytania */}
        {currentTest?.questions?.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              {currentTest.questions.length} pytań
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {currentTest.questions.map((q, i) => (
                <div key={i} className="p-3 bg-secondary/40 rounded-lg text-xs">
                  <p className="font-medium">{i + 1}. {q.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={() => {
              setView("list");
              setCurrentTest(null);
            }}
          >
            Anuluj
          </Button>
          <Button
            onClick={handleSaveTest}
            disabled={loading || !currentTest?.title}
            className="flex-1 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Zapisuję...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Zapisz test
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // === VIEW: Preview ===
  if (view === "preview" && currentTest) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{currentTest.title}</h2>
          <button
            onClick={() => {
              setView("list");
              setCurrentTest(null);
            }}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-secondary/40 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Pytań</p>
              <p className="text-2xl font-bold mt-1">{currentTest.questions?.length || 0}</p>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Studentów</p>
              <p className="text-2xl font-bold mt-1">{currentTest.students?.length || 0}</p>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Typ</p>
              <p className="text-sm font-bold mt-1 capitalize">{currentTest.type}</p>
            </div>
          </div>

          {currentTest.shareLink && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-emerald-700">🔗 Link do udostępniania</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentTest.shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white/50 border border-emerald-500/20 rounded text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => handleCopyLink(currentTest.shareLink)}
                  className="gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Kopiuj
                </Button>
              </div>
              <p className="text-[10px] text-emerald-600">Studenci mogą dostęp przejść bez logowania</p>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-bold">Pytania ({currentTest.questions?.length || 0})</h3>
            {currentTest.questions?.map((q, i) => (
              <div key={i} className="p-4 bg-secondary/30 rounded-lg space-y-2">
                <p className="font-semibold text-sm">{i + 1}. {q.text}</p>
                <div className="space-y-1">
                  {q.options?.map((opt, j) => (
                    <p
                      key={j}
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        j === q.correct ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"
                      )}
                    >
                      {String.fromCharCode(65 + j)}) {opt}
                    </p>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-xs text-muted-foreground italic">💡 {q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => { setView("list"); setCurrentTest(null); }}>
            Wróć
          </Button>
          <Button className="flex-1 gap-2">
            <Play className="h-4 w-4" />
            Uruchom test
          </Button>
        </div>
      </div>
    );
  }

  return null;
}