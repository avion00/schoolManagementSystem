import { SubjectForm } from "@/components/subjects/forms/SubjectForm";

export function SubjectFormPage({ mode }: { mode: "create" | "edit" }) {
  return <SubjectForm mode={mode} />;
}
