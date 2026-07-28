import type { LucideIcon } from "lucide-react";

import { PopNumber } from "@/components/motion";
import { cn } from "@/lib/utils";

/** Compact metric tile — hero progress summary, right-column stat rows. */
export function StudentMetricCard({
  label,
  value,
  icon: Icon,
  iconCls,
  spotlight = false,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconCls?: string;
  /** Glassy translucent surface used inside the gradient hero panel. */
  spotlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-3",
        spotlight
          ? "border border-white/40 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]"
          : "border border-border/60 bg-card/60",
        className,
      )}
    >
      {Icon && (
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary", iconCls)}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      )}
      <div className="min-w-0">
        <p className="font-display text-lg font-bold tabular-nums tracking-tight text-foreground">
          <PopNumber value={value} />
        </p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
