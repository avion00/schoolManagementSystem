import { Flame, TrendingUp } from "lucide-react";

import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { StudentRingStat } from "@/components/student/ui/StudentProgressCard";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { cn } from "@/lib/utils";

export interface StudentOverviewBar {
  label: string;
  value: number;
  colorCls: string;
}

/** The dashboard's flagship visual — attendance ring, key progress bars, a 6-month trend sparkline, and a streak badge. */
export function StudentLearningOverviewCard({
  attendancePct,
  bars,
  trendData,
  currentStreakDays,
  bestStreakDays,
}: {
  attendancePct: number;
  bars: StudentOverviewBar[];
  trendData: Record<string, number>[];
  currentStreakDays: number;
  bestStreakDays: number;
}) {
  return (
    <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-card to-violet-500/[0.05] p-4 shadow-[0_1px_2px_rgb(15_23_42/0.06),0_16px_36px_-16px_rgb(79_70_229/0.2)] dark:from-primary/[0.09] dark:via-card dark:to-violet-500/[0.07] sm:p-5">
      <StudentSectionHeader icon={TrendingUp} title="Learning Overview" />

      <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center rounded-2xl border border-white/40 bg-white/40 px-6 py-4 dark:border-white/10 dark:bg-white/[0.03] sm:px-8">
          <StudentRingStat percent={attendancePct} label="Attendance" size={104} strokeCls="stroke-emerald-500" />
        </div>

        <div className="space-y-3.5">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="mb-1.5 flex items-center justify-between text-[12.5px]">
                <span className="font-medium text-foreground">{b.label}</span>
                <span className="tabular-nums text-muted-foreground">{b.value}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full transition-all duration-700", b.colorCls)} style={{ width: `${Math.min(100, Math.max(0, b.value))}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent px-3.5 py-3 text-[12.5px] text-foreground ring-1 ring-amber-500/15">
          <Flame className="h-4 w-4 shrink-0 text-amber-500" />
          <span><span className="font-semibold">{currentStreakDays}-day</span> study streak — best is {bestStreakDays} days.</span>
        </div>
        <div className="rounded-xl border border-white/40 bg-white/40 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
          <p className="mb-1 text-[10.5px] uppercase tracking-wide text-muted-foreground">6-month attendance trend</p>
          <MiniSparkline data={trendData} color="#6366f1" width="100%" height={28} />
        </div>
      </div>
    </div>
  );
}
