import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { cn } from "@/lib/utils";

export interface MetricCardTrend {
  value: string;
  up: boolean;
}

/** Shared icon-tile tones for MetricCard — one palette reused by every entity's summary-cards row. */
export const METRIC_TONES = {
  blue:    "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  green:   "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber:   "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  purple:  "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  red:     "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  cyan:    "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300",
  neutral: "bg-muted text-foreground",
} as const;
export type MetricTone = keyof typeof METRIC_TONES;

/**
 * The one reusable metric tile — every entity's summary-cards row (Students,
 * Teachers, Parents, Notices, Users…) renders a grid of these instead of
 * hand-rolling near-identical card markup per page.
 */
export function MetricCard({
  label,
  value,
  icon: Icon,
  iconCls,
  trend,
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  iconCls?: string;
  trend?: MetricCardTrend;
  className?: string;
}) {
  return (
    <PremiumCard hoverable className={cn("group p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110",
              iconCls,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
              trend.up
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400",
            )}
          >
            {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value}
          </span>
        )}
      </div>
      <p className={cn("font-display text-2xl font-bold tabular-nums tracking-tight text-foreground", Icon && "mt-3")}>
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </PremiumCard>
  );
}
