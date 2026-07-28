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

const SPARK = {
  up: [{ value: 30 }, { value: 31 }, { value: 32 }, { value: 33 }, { value: 34 }, { value: 35 }, { value: 36 }],
  upSlow: [{ value: 18 }, { value: 18 }, { value: 19 }, { value: 19 }, { value: 20 }, { value: 20 }, { value: 21 }],
  flat: [{ value: 40 }, { value: 41 }, { value: 40 }, { value: 42 }, { value: 41 }, { value: 42 }, { value: 42 }],
  down: [{ value: 9 }, { value: 8 }, { value: 8 }, { value: 7 }, { value: 6 }, { value: 6 }, { value: 5 }],
  downSharp: [{ value: 6 }, { value: 5 }, { value: 5 }, { value: 4 }, { value: 3 }, { value: 2 }, { value: 1 }],
};

export function ClassRoutineSummaryCards({ stats }: { stats: RoutineStats }) {
  const cards = [
    {
      label: "Total Entries", value: stats.total, icon: BookOpen,
      tone: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.up,
      trend: { value: "+4.0%", up: true, compareLabel: "vs last week" },
    },
    {
      label: "Active Classes", value: stats.activeClasses, icon: CalendarCheck, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.flat,
      trend: { value: "0.0%", up: true, compareLabel: "vs last week" },
    },
    {
      label: "Teachers Assigned", value: stats.teachers, icon: Users2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.upSlow,
      trend: { value: "+2.5%", up: true, compareLabel: "vs last week" },
    },
    {
      label: "Weekly Periods", value: stats.weeklyPeriods, icon: Zap, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.up,
      trend: { value: "+3.1%", up: true, compareLabel: "vs last week" },
    },
    {
      label: "Free Periods", value: stats.freePeriods, icon: Clock,
      tone: "bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400",
      sparkColor: CATEGORICAL_COLORS[5], sparkData: SPARK.down,
      trend: { value: "-2.0%", up: false, compareLabel: "vs last week" },
    },
    {
      label: "Conflicts Detected", value: stats.conflicts, icon: AlertTriangle,
      tone: stats.conflicts > 0 ? METRIC_TONES.red : METRIC_TONES.neutral,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.downSharp,
      trend: { value: "-12.0%", up: false, compareLabel: "vs last week" },
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
            trend={c.trend}
            sparklineData={c.sparkData}
            sparklineColor={c.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
