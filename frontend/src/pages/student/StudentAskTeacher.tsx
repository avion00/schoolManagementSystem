import { useState } from "react";
import { toast } from "sonner";

import { Reveal, SuccessCheck } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  askTeacherQuestions as initialQuestions, submitAskTeacherQuestion, subjects, teachers,
  type AskTeacherQuestionType,
} from "@/data/studentDashboardData";

const QUESTION_TYPES: AskTeacherQuestionType[] = ["Homework", "Result", "Exam", "Attendance", "Material", "Other"];

export function StudentAskTeacher() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [subject, setSubject] = useState(subjects[0].name);
  const [teacher, setTeacher] = useState(teachers[0].name);
  const [type, setType] = useState<AskTeacherQuestionType>("Homework");
  const [question, setQuestion] = useState("");
  const [success, setSuccess] = useState(false);

  function submit() {
    if (!question.trim()) return;
    submitAskTeacherQuestion({ subject, teacher, type, question: question.trim() });
    setQuestions([...initialQuestions]);
    setQuestion("");
    setSuccess(true);
    toast.success("Question sent to your teacher.");
    window.setTimeout(() => setSuccess(false), 1200);
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Ask Teacher</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Ask a quick, structured question and track the reply.</p>
      </Reveal>

      <Reveal delay={40}>
        <PremiumCard className="p-5">
          {success ? (
            <div className="flex flex-col items-center gap-1 py-6">
              <SuccessCheck label="Question sent" />
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">Subject</label>
                  <PremiumSelect value={subject} onChange={setSubject} options={subjects.map((s) => ({ value: s.name, label: s.name }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">Teacher</label>
                  <PremiumSelect value={teacher} onChange={setTeacher} options={teachers.map((t) => ({ value: t.name, label: t.name }))} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-foreground">Question type</label>
                  <PremiumSelect value={type} onChange={(v) => setType(v as AskTeacherQuestionType)} options={QUESTION_TYPES.map((t) => ({ value: t, label: t }))} />
                </div>
              </div>
              <div className="mt-3">
                <label className="mb-1.5 block text-[12px] font-medium text-foreground">Your question</label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  placeholder="Type your question…"
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <Button className="mt-3" onClick={submit} disabled={!question.trim()}>Submit question</Button>
            </>
          )}
        </PremiumCard>
      </Reveal>

      <Reveal delay={80}>
        <PremiumCard className="overflow-hidden">
          <p className="border-b border-border/60 p-4 text-[13px] font-semibold text-foreground">Your questions</p>
          <div className="divide-y divide-border/60">
            {questions.map((q) => (
              <div key={q.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-foreground">{q.question}</p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">{q.subject} · {q.teacher} · {q.type} · {q.askedAt}</p>
                  </div>
                  <PremiumBadge label={q.status} tone={q.status === "Answered" ? "success" : "warning"} />
                </div>
                {q.answer && <p className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-[12.5px] text-foreground">{q.answer}</p>}
              </div>
            ))}
            {questions.length === 0 && <p className="p-6 text-center text-[12.5px] text-muted-foreground">No questions asked yet.</p>}
          </div>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
