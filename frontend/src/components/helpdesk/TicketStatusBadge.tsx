import type { TicketStatus } from "@/data/helpDeskData";
import { cn } from "@/lib/utils";

const STYLES: Record<TicketStatus, string> = {
  New:                     "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Open:                    "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  Assigned:                "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "In Progress":           "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "Waiting for User":      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "Waiting for Department":"bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Escalated:               "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Resolved:                "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Closed:                  "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
  Reopened:                "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
};

export function TicketStatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", STYLES[status], className)}>
      {status}
    </span>
  );
}
