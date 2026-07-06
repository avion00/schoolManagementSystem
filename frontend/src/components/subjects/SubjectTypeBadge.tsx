import type { SubjectType } from "@/data/subjectsData";

const CFG: Record<SubjectType, string> = {
  "Theory":             "bg-blue-50 text-blue-700 ring-blue-500/30 dark:bg-blue-950/40 dark:text-blue-400",
  "Practical":          "bg-violet-50 text-violet-700 ring-violet-500/30 dark:bg-violet-950/40 dark:text-violet-400",
  "Theory + Practical": "bg-teal-50 text-teal-700 ring-teal-500/30 dark:bg-teal-950/40 dark:text-teal-400",
};

export function SubjectTypeBadge({ type }: { type: SubjectType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${CFG[type]}`}>
      {type}
    </span>
  );
}
