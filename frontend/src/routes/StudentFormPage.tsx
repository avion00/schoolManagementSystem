import { useParams } from "react-router-dom";

import { StudentForm } from "@/components/students/forms/StudentForm";

export function StudentFormPage({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  return <StudentForm mode={mode} studentId={id} />;
}
