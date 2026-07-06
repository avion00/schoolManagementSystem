import { ExamScheduleForm } from "@/components/exams/forms/ExamScheduleForm";

export function ExamScheduleFormPage({ mode }: { mode: "create" | "edit" }) {
  return <ExamScheduleForm mode={mode} />;
}
