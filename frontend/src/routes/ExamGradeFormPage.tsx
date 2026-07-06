import { ExamGradeForm } from "@/components/exams/forms/ExamGradeForm";

export function ExamGradeFormPage({ mode }: { mode: "create" | "edit" }) {
  return <ExamGradeForm mode={mode} />;
}
