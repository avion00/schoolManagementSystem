import type { ClassStatus } from "@/data/classesData";

const CFG: Record<ClassStatus, { label: string; cls: string }> = {
  active:    { label: "Active",    cls: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400" },
  inactive:  { label: "Inactive",  cls: "bg-muted text-muted-foreground ring-border/30"                                                  },
  suspended: { label: "Suspended", cls: "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400"               },
};

export function ClassStatusBadge({ status }: { status: ClassStatus }) {
  const cfg = CFG[status] ?? CFG.inactive;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
