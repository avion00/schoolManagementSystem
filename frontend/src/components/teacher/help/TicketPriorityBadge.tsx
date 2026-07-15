import type { HelpPriority } from "@/data/teacherHelpData";
import { cn } from "@/lib/utils";

const STYLES: Record<HelpPriority, string> = {
  Low:    "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
  Normal: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  High:   "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Urgent: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

export function TicketPriorityBadge({ priority, className }: { priority: HelpPriority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", STYLES[priority], className)}>
      {priority}
    </span>
  );
}
