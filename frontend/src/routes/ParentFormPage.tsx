import { ParentForm } from "@/components/parents/forms/ParentForm";

export function ParentFormPage({ mode }: { mode: "create" | "edit" }) {
  return <ParentForm mode={mode} />;
}
