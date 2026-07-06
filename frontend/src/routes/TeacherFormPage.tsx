import { TeacherForm } from "@/components/teachers/forms/TeacherForm";

export function TeacherFormPage({ mode }: { mode: "create" | "edit" }) {
  return <TeacherForm mode={mode} />;
}
