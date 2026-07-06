import { ClassForm } from "@/components/classes/forms/ClassForm";

export function ClassFormPage({ mode }: { mode: "create" | "edit" }) {
  return <ClassForm mode={mode} />;
}
