import { Layers, Rows3, GraduationCap, User, Armchair } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { CLASS_STATS } from "@/data/classesData";

const SPARK = {
  up: [{ value: 9 }, { value: 10 }, { value: 10 }, { value: 11 }, { value: 11 }, { value: 12 }, { value: 12 }],
  upSlow: [{ value: 26 }, { value: 27 }, { value: 28 }, { value: 29 }, { value: 30 }, { value: 31 }, { value: 32 }],
  upSharp: [{ value: 900 }, { value: 950 }, { value: 980 }, { value: 1020 }, { value: 1060 }, { value: 1090 }, { value: 1116 }],
  flat: [{ value: 30 }, { value: 31 }, { value: 32 }, { value: 31 }, { value: 32 }, { value: 32 }, { value: 32 }],
  down: [{ value: 168 }, { value: 160 }, { value: 155 }, { value: 150 }, { value: 148 }, { value: 145 }, { value: 144 }],
};

export function ClassesSummaryCards() {
  const stats = [
    {
      label: "Total Classes", value: CLASS_STATS.totalClasses, icon: Layers, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.up,
      trend: { value: "+2.0%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Total Sections", value: CLASS_STATS.totalSections, icon: Rows3, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.flat,
      trend: { value: "0.0%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Total Students", value: CLASS_STATS.totalStudents, icon: GraduationCap, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.upSharp,
      trend: { value: "+6.1%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Class Teachers", value: CLASS_STATS.totalTeachers, icon: User, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.upSlow,
      trend: { value: "+3.2%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Available Seats", value: CLASS_STATS.availableSeats, icon: Armchair, tone: METRIC_TONES.cyan,
      sparkColor: CATEGORICAL_COLORS[5], sparkData: SPARK.down,
      trend: { value: "-4.5%", up: false, compareLabel: "vs last month" },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 40}>
          <KPITrendCard
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconCls={s.tone}
            trend={s.trend}
            sparklineData={s.sparkData}
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
