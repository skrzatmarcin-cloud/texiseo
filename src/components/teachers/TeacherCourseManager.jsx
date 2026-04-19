import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus, BookOpen, Wand2, Loader2, Globe, Users, Edit3, Upload,
  CheckCircle2, Clock, Archive, AlertCircle
} from "lucide-react";

const STATUS_STYLES = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-100 text-slate-500",
  pending_review: "bg-amber-50 text-amber-700",
};

export default function TeacherCourseManager() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({ language: "angielski", level: "A1", age_group: "8-12", topics: "", lessons_count: 12 });
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const load = async () => {
    setLoading(true);
    const [c, t] = await Promise.all([
      base44.entities.TeacherCourses.list("-created_date", 50),
      base44.entities.Teachers.list(),
    ]);
    setCourses(c);
    setTeachers(t);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const generateCourse = async () => {
    setGenerating(true);
    setAiResult(null);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Stwórz kompletny program kursu językowego dla szkoły Linguatoons.
Język: ${aiForm.language}
Poziom CEFR: ${aiForm.level}
Grupa wiekowa: ${aiForm.age_group}
Główne tematy: ${aiForm.topics}
Liczba lekcji: ${aiForm.lessons_count}

Zwróć JSON z polami:
- course_title: string (po polsku)
- description: string (atrakcyjny opis 2-3 zdania)
- curriculum: array of { lesson_number, title, objectives: string[], duration_minutes: 50, materials: string[] }
- learning_outcomes: string[]
- assessment_methods: string[]
- recommended_materials: string[]`,
      response_json_schema: {
        type: "object",
        properties: {
          course_title: { type: "string" },
          description: { type: "string" },
          curriculum: { type: "array", items: { type: "object" } },
          learning_outcomes: { type: "array", items: { type: "string" } },
          assessment_methods: { type: "array", items: { type: "string" } },
          recommended_materials: { type: "array", items: { type: "string" } },
        }
      }
    });
    setAiResult(result);
    setGenerating(false);
  };

  const saveCourse = async (teacherId) => {
    if (!aiResult) return;
    const course = await base44.entities.TeacherCourses.create({
      teacher_id: teacherId,
      course_title: aiResult.course_title,
      language: aiForm.language,
      level: aiForm.level,
      age_group: aiForm.age_group,
      description: aiResult.description,
      lessons_count: aiForm.lessons_count,
      status: "draft",
      curriculum_json: JSON.stringify(aiResult.curriculum),
      materials_json: JSON.stringify({
        learning_outcomes: aiResult.learning_outcomes,
        assessment_methods: aiResult.assessment_methods,
        recommended_materials: aiResult.recommended_materials,
      }),
    });
    load();
    setShowAiPanel(false);
    setAiResult(null);
  };

  const pushToWordPress = async (course) => {
    const teacher = teachers.find(t => t.id === course.teacher_id);
    const res = await base44.functions.invoke("wordpressProxy", {
      action: "push_draft",
      post_type: "post",
      payload: {
        title: course.course_title,
        content: `<h2>Opis kursu</h2><p>${course.description}</p><h2>Program lekcji</h2>${
          JSON.parse(course.curriculum_json || "[]").map((l, i) =>
            `<h3>Lekcja ${l.lesson_number}: ${l.title}</h3><ul>${(l.objectives || []).map(o => `<li>${o}</li>`).join("")}</ul>`
          ).join("")
        }`,
        slug: course.course_title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        status: "draft",
      },
    });
    if (res.data?.success) {
      await base44.entities.TeacherCourses.update(course.id, {
        wordpress_course_id: res.data.wordpress_id,
        status: "pending_review",
      });
      load();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold">Menedżer kursów</h2>
          <p className="text-xs text-muted-foreground">AI auto-generowanie kursów + synchronizacja z MasterStudy WordPress</p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setShowAiPanel(p => !p)}>
          <Wand2 className="h-3.5 w-3.5" /> Generuj kurs AI
        </Button>
      </div>

      {/* AI generator panel */}
      {showAiPanel && (
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-primary">Generator kursu AI — MasterStudy Style</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-xs font-medium mb-1 block">Język</label>
              <Select value={aiForm.language} onValueChange={v => setAiForm(p => ({ ...p, language: v }))}>
                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="angielski">Angielski</SelectItem>
                  <SelectItem value="hiszpański">Hiszpański</SelectItem>
                  <SelectItem value="francuski">Francuski</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Poziom</label>
              <Select value={aiForm.level} onValueChange={v => setAiForm(p => ({ ...p, level: v }))}>
                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["A1","A2","B1","B2","C1","C2"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Wiek</label>
              <Select value={aiForm.age_group} onValueChange={v => setAiForm(p => ({ ...p, age_group: v }))}>
                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4-7">4–7 lat</SelectItem>
                  <SelectItem value="8-12">8–12 lat</SelectItem>
                  <SelectItem value="13-17">13–17 lat</SelectItem>
                  <SelectItem value="dorośli">Dorośli</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Liczba lekcji</label>
              <Input type="number" value={aiForm.lessons_count} onChange={e => setAiForm(p => ({ ...p, lessons_count: Number(e.target.value) }))} className="h-8 text-xs bg-white" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium mb-1 block">Tematy do uwzględnienia (opcjonalnie)</label>
            <Input value={aiForm.topics} onChange={e => setAiForm(p => ({ ...p, topics: e.target.value }))} placeholder="np. kolory, liczby, rodzina, zwierzęta..." className="h-8 text-xs bg-white" />
          </div>
          <Button onClick={generateCourse} disabled={generating} className="gap-1.5">
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {generating ? "Generuję program kursu…" : "Generuj AI"}
          </Button>

          {/* AI Result */}
          {aiResult && (
            <div className="mt-4 bg-white border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700">{aiResult.course_title}</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{aiResult.description}</p>
              <p className="text-xs font-medium mb-1">Program ({aiResult.curriculum?.length} lekcji):</p>
              <div className="max-h-32 overflow-y-auto space-y-1 mb-3">
                {aiResult.curriculum?.slice(0, 6).map((l, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground">Lekcja {l.lesson_number}: {l.title}</p>
                ))}
                {aiResult.curriculum?.length > 6 && <p className="text-[11px] text-muted-foreground">... i {aiResult.curriculum.length - 6} więcej</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs font-medium">Przypisz do nauczyciela:</p>
                {teachers.filter(t => t.status === "active").map(t => (
                  <Button key={t.id} size="sm" variant="outline" className="h-7 text-xs"
                    onClick={() => saveCourse(t.id)}>
                    {t.first_name} {t.last_name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Courses list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map(course => {
          const teacher = teachers.find(t => t.id === course.teacher_id);
          const curriculum = (() => { try { return JSON.parse(course.curriculum_json || "[]"); } catch { return []; } })();
          return (
            <div key={course.id} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold line-clamp-1">{course.course_title}</p>
                    <p className="text-[11px] text-muted-foreground">{course.language} · {course.level} · {course.age_group}</p>
                  </div>
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_STYLES[course.status])}>
                  {course.status}
                </span>
              </div>
              {course.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{course.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {course.lessons_count} lekcji</span>
                {course.enrolled_count > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrolled_count}</span>}
                {teacher && <span className="flex items-center gap-1">{teacher.first_name} {teacher.last_name?.[0]}.</span>}
              </div>
              {curriculum.length > 0 && (
                <div className="bg-secondary/40 rounded-lg p-2 mb-3">
                  <p className="text-[10px] font-medium mb-1">Program kursu:</p>
                  <div className="space-y-0.5">
                    {curriculum.slice(0, 3).map((l, i) => (
                      <p key={i} className="text-[10px] text-muted-foreground truncate">L{l.lesson_number}: {l.title}</p>
                    ))}
                    {curriculum.length > 3 && <p className="text-[10px] text-muted-foreground">+{curriculum.length - 3} więcej…</p>}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {!course.wordpress_course_id && (
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1"
                    onClick={() => pushToWordPress(course)}>
                    <Globe className="h-3 w-3" /> Wyślij do WP
                  </Button>
                )}
                {course.wordpress_course_id && (
                  <div className="flex-1 flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> WP ID: {course.wordpress_course_id}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {courses.length === 0 && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Brak kursów — wygeneruj pierwszy za pomocą AI</p>
          </div>
        )}
      </div>
    </div>
  );
}