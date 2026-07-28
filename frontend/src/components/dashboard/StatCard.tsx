import { TrendingDown, TrendingUp } from "lucide-react";

import { PopNumber, TiltCard } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { Stat } from "@/data/dashboardData";
import { cn } from "@/lib/utils";

export function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <TiltCard className="h-full">
      <PremiumCard hoverable className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", stat.iconCls)}>
            <Icon className="h-5 w-5" />
          </span>
          {stat.trend && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1 rounded-md px-2 py-0.5 text-xs",
                stat.trend.up
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
              )}
            >
              {stat.trend.up ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {stat.trend.value}
            </Badge>
          )}
        </div>
        <div>
          <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground lg:text-3xl">
            <PopNumber value={stat.value} />
          </p>
          <p className="mt-0.5 text-sm font-medium text-foreground">{stat.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>
        </div>
      </PremiumCard>
    </TiltCard>
  );
}
