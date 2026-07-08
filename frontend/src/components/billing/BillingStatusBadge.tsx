import { cn } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  Paid:             "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Completed:        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Approved:         "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Active:           "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Issued:           "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  Partial:          "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "Partially Paid":  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Due:              "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Pending:          "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Overdue:          "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Failed:           "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Rejected:         "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  Refunded:         "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  Draft:            "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
  Cancelled:        "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
  Inactive:         "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
  Waived:           "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
};

export function BillingStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium",
      STATUS_COLOR[status] ?? "bg-muted text-muted-foreground",
      className,
    )}>
      {status}
    </span>
  );
}
