import type { RoutineStatus } from "@/data/classRoutineData";

const CFG: Record<RoutineStatus, string> = {
  active:    "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  inactive:  "bg-muted text-muted-foreground ring-border/30",
  suspended: "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
};

const LABEL: Record<RoutineStatus, string> = {
  active: "Active", inactive: "Inactive", suspended: "Suspended",
};

export function ClassRoutineStatusBadge({ status }: { status: RoutineStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${CFG[status]}`}>
      {LABEL[status]}
    </span>
  );
}
