import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { TiltCard } from "@/components/motion";
import { cn } from "@/lib/utils";

export interface KPITrend {
  value: string;
  up: boolean;
  compareLabel: string;
}

/**
 * Dashboard-style KPI tile: circular icon badge, big value, directional trend
 * line, and a filled sparkline anchoring the bottom of the card. Wrapped in
 * TiltCard for the same subtle pointer-tracking 3D tilt used by the main
 * Dashboard's stat cards.
 */
export function KPITrendCard({
  label,
  value,
  icon: Icon,
  iconCls,
  trend,
  sparklineData,
  sparklineColor,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconCls: string;
  trend?: KPITrend;
  /** Only pass real series; the card renders no sparkline without data. */
  sparklineData?: Record<string, number>[];
  sparklineColor?: string;
  className?: string;
}) {
  return (
    <TiltCard className="h-full">
      <PremiumCard hoverable className={cn("group flex h-full flex-col p-4", className)}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110",
              iconCls,
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        </div>

        <p className="mt-1.5 font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">
          <AnimatedNumber value={value} />
        </p>

        {trend && (
          <p className="mt-1 flex items-center gap-1 text-[11.5px]">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-semibold",
                trend.up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
              )}
            >
              {trend.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value}
            </span>
            <span className="text-muted-foreground">{trend.compareLabel}</span>
          </p>
        )}

        {sparklineData && sparklineData.length > 1 && (
          <div className="-mx-1 -mb-1 mt-auto pt-3">
            <MiniSparkline data={sparklineData} color={sparklineColor ?? "currentColor"} width="100%" height={36} />
          </div>
        )}
      </PremiumCard>
    </TiltCard>
  );
}
