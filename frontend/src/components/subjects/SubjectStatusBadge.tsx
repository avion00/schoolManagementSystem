import type { SubjectStatus } from "@/data/subjectsData";

const CFG: Record<SubjectStatus, string> = {
  active:   "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  inactive: "bg-muted text-muted-foreground ring-border/30",
  draft:    "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  archived: "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
};

const LABEL: Record<SubjectStatus, string> = {
  active: "Active", inactive: "Inactive", draft: "Draft", archived: "Archived",
};

export function SubjectStatusBadge({ status }: { status: SubjectStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${CFG[status]}`}>
      {LABEL[status]}
    </span>
  );
}
