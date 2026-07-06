import type { AttendanceStatus } from "@/data/attendanceData";
import { cn } from "@/lib/utils";

interface StatusCfg { label: string; cls: string; symbol: string; }

const STATUS_CFG: Record<AttendanceStatus, StatusCfg> = {
  present:    { label: "Present",  symbol: "P",  cls: "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300" },
  absent:     { label: "Absent",   symbol: "A",  cls: "bg-rose-50    text-rose-700    ring-rose-500/30    dark:bg-rose-950/30    dark:text-rose-300" },
  late:       { label: "Late",     symbol: "L",  cls: "bg-amber-50   text-amber-700   ring-amber-500/30   dark:bg-amber-950/30   dark:text-amber-300" },
  "half-day": { label: "Half Day", symbol: "H",  cls: "bg-blue-50    text-blue-700    ring-blue-500/30    dark:bg-blue-950/30    dark:text-blue-300" },
  leave:      { label: "Leave",    symbol: "LV", cls: "bg-violet-50  text-violet-700  ring-violet-500/30  dark:bg-violet-950/30  dark:text-violet-300" },
};

interface Props {
  status:   AttendanceStatus;
  compact?: boolean; // show symbol only
  className?: string;
}

export function AttendanceStatusBadge({ status, compact = false, className }: Props) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap",
      cfg.cls,
      className,
    )}>
      {compact ? cfg.symbol : cfg.label}
    </span>
  );
}

/** Colored cell symbol for the monthly grid */
export function AttendanceGridCell({ status, className }: { status: AttendanceStatus; className?: string }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn(
      "flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold mx-auto",
      cfg.cls,
      "ring-0", // no ring in grid cells
      className,
    )}>
      {cfg.symbol}
    </span>
  );
}

export { STATUS_CFG };
