import type { StudentStatus } from "@/api/types/students";
import { cn } from "@/lib/utils";

const CONFIG: Record<StudentStatus, { label: string; cls: string }> = {
  active:      { label: "Active",      cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-emerald-500/20"    },
  inactive:    { label: "Inactive",    cls: "bg-muted text-muted-foreground ring-border/40"                                     },
  transferred: { label: "Transferred", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-amber-500/20"             },
  graduated:   { label: "Graduated",   cls: "bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-500/20"                 },
  suspended:   { label: "Suspended",   cls: "bg-rose-500/10 text-rose-700 dark:text-rose-400 ring-rose-500/20"                 },
  left:        { label: "Left",        cls: "bg-muted text-muted-foreground ring-border/40"                                     },
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const { label, cls } = CONFIG[status] ?? CONFIG.inactive;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        cls,
      )}
    >
      {label}
    </span>
  );
}
