import { NoticeForm } from "@/components/notices/forms/NoticeForm";

export function NoticeFormPage({ mode }: { mode: "create" | "edit" }) {
  return <NoticeForm mode={mode} />;
}
