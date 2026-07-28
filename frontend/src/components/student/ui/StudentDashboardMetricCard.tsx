import type { LucideIcon } from "lucide-react";

import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { PopNumber } from "@/components/motion";
import { cn } from "@/lib/utils";

export type StudentMetricTone = "emerald" | "blue" | "amber" | "violet" | "rose" | "slate";

const TONE: Record<StudentMetricTone, { icon: string; tint: string; spark: string; bar: string }> = {
  emerald: { icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300", tint: "from-emerald-500/[0.06]", spark: "#10b981", bar: "bg-emerald-500" },
  blue: { icon: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300", tint: "from-blue-500/[0.06]", spark: "#3b82f6", bar: "bg-blue-500" },
  amber: { icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300", tint: "from-amber-500/[0.06]", spark: "#f59e0b", bar: "bg-amber-500" },
  violet: { icon: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300", tint: "from-violet-500/[0.06]", spark: "#8b5cf6", bar: "bg-violet-500" },
  rose: { icon: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300", tint: "from-rose-500/[0.06]", spark: "#f43f5e", bar: "bg-rose-500" },
  slate: { icon: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300", tint: "from-slate-500/[0.05]", spark: "#64748b", bar: "bg-slate-400" },
};

/**
 * Premium top-of-dashboard KPI tile — label + icon tile up top, big number,
 * small supporting text, and either a mini sparkline (trend data) or a thin
 * progress strip (percent) anchoring the bottom.
 */
export function StudentDashboardMetricCard({
  label,
  value,
  supporting,
  icon: Icon,
  tone = "slate",
  trendData,
  percent,
  onClick,
}: {
  label: string;
  value: string | number;
  supporting?: string;
  icon: LucideIcon;
  tone?: StudentMetricTone;
  trendData?: Record<string, number>[];
  percent?: number;
  onClick?: () => void;
}) {
  const t = TONE[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "t-lift group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b to-card p-4 text-left shadow-elevated transition-shadow hover:shadow-md",
        t.tint,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11.5px] font-medium text-muted-foreground">{label}</p>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110", t.icon)}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">
        <PopNumber value={value} />
      </p>
      {supporting && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{supporting}</p>}

      <div className="mt-3">
        {trendData ? (
          <MiniSparkline data={trendData} color={t.spark} width="100%" height={26} />
        ) : percent !== undefined ? (
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full transition-all duration-700", t.bar)} style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
          </div>
        ) : null}
      </div>
    </button>
  );
}
