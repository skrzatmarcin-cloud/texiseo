import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Plus, Wand2, Upload, Link2, BarChart3, Eye, Copy,
  Edit, Trash2, AlertCircle, Loader2, CheckCircle2, X, Play,
  Clock, Users, Mail, Share2
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
      type: "quiz",
      timeLimit: 30, // minuty
      topics: [], // zagadnienia
      questionTypes: ["multiple-choice"], // typy pytań
      questions: [],
      assignedStudents: [],
      shareLink: null,
      allowAnonymous: true
    });
    setView("create");
  };

  const handleGenerateQuestions = async (count = 10) => {
    if (currentTest?.topics?.length === 0) {
      alert("Wybierz zagadnienia przed generowaniem pytań");
      return;
    }

    setLoading(true);
    try {
      const typePrompts = {
        "multiple-choice": "wielokrotnym wyborem (A, B, C, D)",
        "matching": "dopasowywanie (połącz kolumny)",
        "word-drop": "wstawianie wyrazów na czas",
        "true-false": "prawda/fałsz"
      };

      const selectedTypes = currentTest?.questionTypes || ["multiple-choice"];
      const typeDescription = selectedTypes.map(t => typePrompts[t]).join(", ");

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Wygeneruj ${count} pytań do testu języka obcego.
        
Zagadnienia: ${currentTest?.topics?.join(", ")}
Typy pytań: ${typeDescription}
Poziom: uniwersytecki - wąski zakres
Język odpowiedzi: polski

Dla każdego pytania określ typ. Zwróć JSON:
{
  "questions": [
    {
      "type": "multiple-choice|matching|word-drop|true-false",
      "text": "pytanie",
      "options": ["A", "B", "C", "D"] albo {"lewo": "prawo"} dla matching,
      "correct": 0 albo {"1": "3"} dla matching,
      "explanation": "wyjaśnienie"
    }
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "object" }
            }
          }
        }
      });

      setCurrentTest(prev => ({
        ...prev,
        questions: response.questions || []
      }));
    } catch (error) {
      console.error("Błąd generowania:", error);
      alert("Błąd podczas generowania pytań");
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
      const shareLink = `linguatoons.com/test/${Math.random().toString(36).substr(2, 9)}`;
      
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
        time_limit_minutes: currentTest.timeLimit,
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

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 block">Typ testu</label>
              <div className="grid grid-cols-2 gap-2">
                {["quiz", "exam"].map(type => (
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
                    {type === "exam" && "📊 Egzamin"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Czas testu (minuty)
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={currentTest?.timeLimit || 30}
                onChange={e => setCurrentTest(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Zagadnienia (wybierz zakresy)</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Czasy angielskie",
                "Słownictwo biznesowe",
                "Gramatyka podstawowa",
                "Conversational",
                "Wymowa",
                "Idiomatic expressions"
              ].map(topic => (
                <label key={topic} className="flex items-center gap-2 p-2 bg-secondary/40 rounded-lg cursor-pointer hover:bg-secondary/60">
                  <input
                    type="checkbox"
                    checked={currentTest?.topics?.includes(topic) || false}
                    onChange={e => {
                      setCurrentTest(prev => ({
                        ...prev,
                        topics: e.target.checked
                          ? [...(prev?.topics || []), topic]
                          : (prev?.topics || []).filter(t => t !== topic)
                      }));
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium">{topic}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Typy pytań</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "multiple-choice", label: "A, B, C, D" },
                { id: "matching", label: "Dopasuj" },
                { id: "word-drop", label: "Wyrazy na czas" },
                { id: "true-false", label: "Prawda/Fałsz" }
              ].map(qtype => (
                <label key={qtype.id} className="flex items-center gap-2 p-2 bg-secondary/40 rounded-lg cursor-pointer hover:bg-secondary/60">
                  <input
                    type="checkbox"
                    checked={currentTest?.questionTypes?.includes(qtype.id) || false}
                    onChange={e => {
                      setCurrentTest(prev => ({
                        ...prev,
                        questionTypes: e.target.checked
                          ? [...(prev?.questionTypes || []), qtype.id]
                          : (prev?.questionTypes || []).filter(t => t !== qtype.id)
                      }));
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-medium">{qtype.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Opis (opcjonalnie)</label>
            <textarea
              value={currentTest?.description || ""}
              onChange={e => setCurrentTest(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Opis dla studentów..."
              rows={2}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Generate & Import */}
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleGenerateQuestions(10)}
            disabled={loading || !currentTest?.topics?.length}
            className="flex items-center gap-2 p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl hover:border-purple-500 transition-all text-left disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
            ) : (
              <Wand2 className="h-5 w-5 text-purple-600" />
            )}
            <div>
              <p className="font-semibold text-sm">🤖 Generuj pytania AI</p>
              <p className="text-xs text-muted-foreground">Wg. wybranych zagadnień</p>
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
              <p className="text-xs text-muted-foreground">Dodaj pytania</p>
            </div>
          </button>
        </div>

        {/* Assign Students */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-3">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Przypisz studentów lub udostępnij link
          </label>
          <div className="space-y-2">
            <textarea
              placeholder="Wpisz emaile studentów (jeden na linię)"
              rows={3}
              onChange={e => {
                const emails = e.target.value.split("\n").filter(e => e.trim());
                setCurrentTest(prev => ({ ...prev, assignedStudents: emails }));
              }}
              className="w-full px-3 py-2 border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={currentTest?.allowAnonymous || false}
                onChange={e => setCurrentTest(prev => ({ ...prev, allowAnonymous: e.target.checked }))}
                className="w-4 h-4"
              />
              Zezwól na dostęp anonimowy (via link)
            </label>
          </div>
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
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-secondary/40 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Pytań</p>
              <p className="text-xl font-bold">{currentTest.questions?.length || 0}</p>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Czas</p>
              <p className="text-xl font-bold flex items-center justify-center gap-1">
                <Clock className="h-4 w-4" />
                {currentTest.timeLimit}m
              </p>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Studentów</p>
              <p className="text-xl font-bold">{currentTest.assignedStudents?.length || 0}</p>
            </div>
            <div className="p-3 bg-secondary/40 rounded-lg text-center">
              <p className="text-xs text-muted-foreground">Typ</p>
              <p className="text-xs font-bold mt-1">{currentTest.type === "quiz" ? "Quiz" : "Egzamin"}</p>
            </div>
          </div>

          {/* Share Link */}
          {currentTest.shareLink && currentTest.allowAnonymous && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                <Link2 className="h-3.5 w-3.5" />
                Link dostępny dla studentów
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentTest.shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-white/70 border border-blue-500/20 rounded text-xs font-mono"
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
            </div>
          )}

          {/* Assigned Students */}
          {currentTest.assignedStudents?.length > 0 && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2">
              <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                Przypisani studenci ({currentTest.assignedStudents.length})
              </p>
              <div className="space-y-1">
                {currentTest.assignedStudents.map((email, i) => (
                  <p key={i} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                    📧 {email}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {currentTest.topics?.length > 0 && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-xs font-semibold text-purple-700 mb-2">Zagadnienia:</p>
              <div className="flex flex-wrap gap-1">
                {currentTest.topics.map((topic, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Questions Preview */}
          <div className="space-y-3">
            <h3 className="font-bold">Pytania ({currentTest.questions?.length || 0})</h3>
            {currentTest.questions?.length === 0 ? (
              <p className="text-sm text-muted-foreground">Brak pytań. Wygeneruj lub importuj pytania.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentTest.questions.map((q, i) => (
                  <div key={i} className="p-4 bg-secondary/30 rounded-lg space-y-2 border-l-4 border-primary">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-sm flex-1">{i + 1}. {q.text}</p>
                      <span className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded">
                        {q.type || "multiple-choice"}
                      </span>
                    </div>

                    {/* Different question types */}
                    {(q.type === "multiple-choice" || !q.type) && q.options && (
                      <div className="space-y-1">
                        {q.options.map((opt, j) => (
                          <p
                            key={j}
                            className={cn(
                              "text-xs px-2 py-1 rounded",
                              j === q.correct ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-slate-100"
                            )}
                          >
                            {String.fromCharCode(65 + j)}) {opt}
                          </p>
                        ))}
                      </div>
                    )}

                    {q.type === "matching" && q.options && (
                      <div className="text-xs space-y-1">
                        <p className="text-muted-foreground">Dopasuj:</p>
                        {Object.entries(q.options || {}).map(([left, right], idx) => (
                          <p key={idx}>
                            <span className="font-medium">{left}</span> ↔ <span className="text-emerald-600">{right}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {q.type === "word-drop" && (
                      <p className="text-xs text-muted-foreground italic">⏱️ Wstaw wyrazy na czas</p>
                    )}

                    {q.type === "true-false" && (
                      <p className="text-xs">
                        Prawidłowa odpowiedź: <span className="font-bold text-emerald-600">{q.correct ? "PRAWDA" : "FAŁSZ"}</span>
                      </p>
                    )}

                    {q.explanation && (
                      <p className="text-xs text-muted-foreground italic">💡 {q.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => { setView("list"); setCurrentTest(null); }}>
            Wróć
          </Button>
          <Button className="flex-1 gap-2">
            <Play className="h-4 w-4" />
            Uruchom test dla studentów
          </Button>
        </div>
      </div>
    );
  }

  return null;
}