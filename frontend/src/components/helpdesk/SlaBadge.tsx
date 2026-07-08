import { AlarmClockCheck, Clock, ClockAlert } from "lucide-react";

import type { SlaStatus, TicketStatus } from "@/data/helpDeskData";
import { cn } from "@/lib/utils";

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(1, Math.round(ms / 60_000));
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function SlaBadge({
  dueAt,
  status,
  ticketStatus,
  className,
}: {
  dueAt: string;
  status: SlaStatus;
  ticketStatus: TicketStatus;
  className?: string;
}) {
  if (ticketStatus === "Resolved" || ticketStatus === "Closed") {
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", className)}>
        <AlarmClockCheck className="h-3 w-3" />
        SLA Met
      </span>
    );
  }

  const diff = new Date(dueAt).getTime() - Date.now();
  const label =
    status === "Overdue" ? `Overdue by ${formatDuration(-diff)}` :
    status === "Due Soon" ? `Due in ${formatDuration(diff)}` :
    "On track";

  const styles: Record<SlaStatus, string> = {
    "On Track": "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    "Due Soon": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    "Overdue":  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  };
  const Icon = status === "Overdue" ? ClockAlert : Clock;

  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", styles[status], className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
