import { ClassRoutineForm } from "@/components/classRoutine/forms/ClassRoutineForm";

export function ClassRoutineFormPage({ mode }: { mode: "create" | "edit" }) {
  return <ClassRoutineForm mode={mode} />;
}
