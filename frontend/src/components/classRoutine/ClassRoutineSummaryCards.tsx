import { AlertTriangle, BookOpen, CalendarCheck, Clock, Users2, Zap } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";

interface RoutineStats {
  total: number;
  activeClasses: number;
  teachers: number;
  weeklyPeriods: number;
  freePeriods: number;
  conflicts: number;
}


export function ClassRoutineSummaryCards({ stats }: { stats: RoutineStats }) {
  const cards = [
    {
      label: "Total Entries", value: stats.total, icon: BookOpen,
      tone: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Active Classes", value: stats.activeClasses, icon: CalendarCheck, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Teachers Assigned", value: stats.teachers, icon: Users2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Weekly Periods", value: stats.weeklyPeriods, icon: Zap, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Free Periods", value: stats.freePeriods, icon: Clock,
      tone: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
      sparkColor: CATEGORICAL_COLORS[5],
    },
    {
      label: "Conflicts Detected", value: stats.conflicts, icon: AlertTriangle,
      tone: stats.conflicts > 0 ? METRIC_TONES.red : METRIC_TONES.neutral,
      sparkColor: STATUS_COLORS.critical,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, i) => (
        <Reveal key={c.label} delay={i * 40}>
          <KPITrendCard
            label={c.label}
            value={c.value}
            icon={c.icon}
            iconCls={c.tone}
            sparklineColor={c.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
