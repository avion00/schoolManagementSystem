import {
  CalendarCheck, MessageSquare, NotebookPen, PenLine, Plus, Upload, type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

interface TeacherAction {
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  cls: string;
}

/** One-click action row — the single canonical set of "things a teacher does daily," reused on Today and the Dashboard. */
export function TeacherActionBar({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();

  const actions: TeacherAction[] = [
    { label: "Mark Attendance",  icon: CalendarCheck, to: "/teacher/attendance",  cls: "text-emerald-600 dark:text-emerald-400" },
    { label: "Create Homework",  icon: Plus,           to: "/teacher/assignments", cls: "text-violet-600 dark:text-violet-400" },
    { label: "Enter Marks",      icon: PenLine,        to: "/teacher/marks",       cls: "text-amber-600 dark:text-amber-400" },
    { label: "Message Parent",   icon: MessageSquare,  to: "/teacher/parents",     cls: "text-blue-600 dark:text-blue-400" },
    { label: "Upload Material",  icon: Upload,         to: "/teacher/materials",   cls: "text-sky-600 dark:text-sky-400" },
    { label: "Add Class Note",   icon: NotebookPen,    onClick: () => toast.success("Note added (demo — not saved)"), cls: "text-rose-600 dark:text-rose-400" },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", compact && "gap-1.5")}>
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            type="button"
            onClick={() => (a.to ? navigate(a.to) : a.onClick?.())}
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground shadow-sm transition-colors hover:bg-accent/60",
              compact && "px-2.5 py-1.5 text-[11.5px]",
            )}
          >
            <Icon className={cn("h-4 w-4", a.cls)} />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
