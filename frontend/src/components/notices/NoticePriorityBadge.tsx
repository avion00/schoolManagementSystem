import type { NoticePriority } from "@/data/noticesData";
import { cn } from "@/lib/utils";

const PRIORITY_CFG: Record<NoticePriority, { label: string; cls: string; dot: string }> = {
  Low:    { label: "Low",    dot: "bg-slate-400",   cls: "bg-slate-50   text-slate-600   ring-slate-300/50   dark:bg-slate-800   dark:text-slate-400" },
  Normal: { label: "Normal", dot: "bg-blue-500",    cls: "bg-blue-50    text-blue-700    ring-blue-400/40    dark:bg-blue-950/30 dark:text-blue-300" },
  High:   { label: "High",   dot: "bg-amber-500",   cls: "bg-amber-50   text-amber-700   ring-amber-400/40   dark:bg-amber-950/30 dark:text-amber-300" },
  Urgent: { label: "Urgent", dot: "bg-rose-500",    cls: "bg-rose-50    text-rose-700    ring-rose-400/40    dark:bg-rose-950/30  dark:text-rose-300" },
};

export function NoticePriorityBadge({ priority, className }: { priority: NoticePriority; className?: string }) {
  const cfg = PRIORITY_CFG[priority];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap",
      cfg.cls, className,
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
