import type { NotificationPriority } from "@/data/notificationsData";
import { cn } from "@/lib/utils";

const STYLES: Record<NotificationPriority, string> = {
  urgent: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  high:   "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  low:    "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
};

export function NotificationPriorityBadge({ priority, className }: { priority: NotificationPriority; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", STYLES[priority], className)}>
      {priority}
    </span>
  );
}
