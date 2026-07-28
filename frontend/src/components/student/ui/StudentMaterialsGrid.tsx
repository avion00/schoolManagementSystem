import { BookOpen, FileText, Image as ImageIcon, Link2, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";

export interface StudentMaterialPreview {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  date: string;
  type: string;
}

const TYPE_ICON: Record<string, LucideIcon> = {
  PDF: FileText, Video: Video, Image: ImageIcon, Doc: BookOpen, Link: Link2,
};
const TYPE_TONE: Record<string, string> = {
  PDF: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  Video: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  Image: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  Doc: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  Link: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
};

/** 2-column grid of premium resource cards — file-type icon, subject, teacher, date, View button. */
export function StudentMaterialsGrid({ materials, viewAllTo = "/student/materials" }: { materials: StudentMaterialPreview[]; viewAllTo?: string }) {
  const navigate = useNavigate();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {materials.map((m) => {
        const Icon = TYPE_ICON[m.type] ?? BookOpen;
        return (
          <div
            key={m.id}
            className="t-lift group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3.5 transition-shadow hover:shadow-md"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${TYPE_TONE[m.type] ?? "bg-muted text-muted-foreground"}`}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] font-medium text-foreground">{m.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">{m.subject} · {m.teacher}</p>
              <p className="truncate text-[10.5px] text-muted-foreground/70">{m.date}</p>
            </div>
            <StudentSecondaryButton className="w-auto shrink-0 px-2.5 py-1.5 text-[11px]" onClick={() => navigate(viewAllTo)}>
              View
            </StudentSecondaryButton>
          </div>
        );
      })}
    </div>
  );
}
