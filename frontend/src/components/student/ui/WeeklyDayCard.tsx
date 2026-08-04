import { cn } from "@/lib/utils";

/** One weekday chip in the Weekly Overview — day + date, class count, active/highlighted state. */
export function WeeklyDayCard({
  day,
  date,
  count,
  active,
  onClick,
}: {
  day: string;
  date: number;
  count: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "t-lift flex flex-col items-center gap-1 rounded-xl border px-3.5 py-2.5 text-center transition-all",
        active
          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]"
          : "border-border/60 bg-card hover:border-primary/25 hover:bg-muted/40",
      )}
    >
      <span className={cn("text-[11px] font-medium uppercase tracking-wide", active ? "text-primary" : "text-muted-foreground")}>
        {day} {date}
      </span>
      <span className={cn("text-[13px] font-semibold", active ? "text-primary" : "text-foreground")}>
        {count} Classes
      </span>
    </button>
  );
}
