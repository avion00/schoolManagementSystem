import { cn } from "@/lib/utils";
import type { ExamStatus } from "@/data/examsData";

const STATUS_CFG: Record<ExamStatus, { label: string; cls: string }> = {
  draft:     { label: "Draft",     cls: "bg-muted text-muted-foreground ring-border/30" },
  scheduled: { label: "Scheduled", cls: "bg-blue-50   text-blue-700   ring-blue-500/30   dark:bg-blue-950  dark:text-blue-300"   },
  published: { label: "Published", cls: "bg-violet-50 text-violet-700 ring-violet-500/30 dark:bg-violet-950 dark:text-violet-300" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300" },
  cancelled: { label: "Cancelled", cls: "bg-rose-50   text-rose-700   ring-rose-500/30   dark:bg-rose-950  dark:text-rose-300"   },
};

export function ExamStatusBadge({ status, className }: { status: ExamStatus; className?: string }) {
  const { label, cls } = STATUS_CFG[status] ?? STATUS_CFG.draft;
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
      cls, className,
    )}>
      {label}
    </span>
  );
}
