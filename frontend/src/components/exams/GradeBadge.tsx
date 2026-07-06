import { cn } from "@/lib/utils";

const GRADE_CFG: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-800 ring-emerald-500/30 dark:bg-emerald-950 dark:text-emerald-300",
  "A":  "bg-green-100   text-green-800   ring-green-500/30   dark:bg-green-950  dark:text-green-300",
  "B+": "bg-teal-100    text-teal-800    ring-teal-500/30    dark:bg-teal-950   dark:text-teal-300",
  "B":  "bg-blue-100    text-blue-800    ring-blue-500/30    dark:bg-blue-950   dark:text-blue-300",
  "C+": "bg-cyan-100    text-cyan-800    ring-cyan-500/30    dark:bg-cyan-950   dark:text-cyan-300",
  "C":  "bg-amber-100   text-amber-800   ring-amber-500/30   dark:bg-amber-950  dark:text-amber-300",
  "F":  "bg-rose-100    text-rose-800    ring-rose-500/30    dark:bg-rose-950   dark:text-rose-300",
};

const DEF = "bg-muted text-muted-foreground ring-border/30";

export function GradeBadge({ grade, className }: { grade: string | null; className?: string }) {
  if (!grade) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 min-w-[2rem]",
      GRADE_CFG[grade] ?? DEF, className,
    )}>
      {grade}
    </span>
  );
}
