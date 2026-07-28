import { BookOpen, CheckSquare, ListChecks, FlaskConical, Users, Layers } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { SUBJECT_STATS } from "@/data/subjectsData";

const SPARK = {
  up: [{ value: 22 }, { value: 23 }, { value: 24 }, { value: 25 }, { value: 26 }, { value: 27 }, { value: 28 }],
  upSlow: [{ value: 15 }, { value: 15 }, { value: 16 }, { value: 16 }, { value: 17 }, { value: 17 }, { value: 18 }],
  flat: [{ value: 10 }, { value: 11 }, { value: 10 }, { value: 11 }, { value: 10 }, { value: 11 }, { value: 11 }],
  upSharp: [{ value: 24 }, { value: 26 }, { value: 27 }, { value: 29 }, { value: 30 }, { value: 31 }, { value: 32 }],
  down: [{ value: 9 }, { value: 8 }, { value: 8 }, { value: 7 }, { value: 7 }, { value: 6 }, { value: 6 }],
};

export function SubjectsSummaryCards() {
  const stats = [
    {
      label: "Total Subjects", value: SUBJECT_STATS.total, icon: BookOpen, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.up,
      trend: { value: "+3.5%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Compulsory", value: SUBJECT_STATS.compulsory, icon: CheckSquare, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.flat,
      trend: { value: "0.0%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Optional", value: SUBJECT_STATS.optional, icon: ListChecks, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.upSlow,
      trend: { value: "+2.1%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Practical", value: SUBJECT_STATS.practical, icon: FlaskConical, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.upSharp,
      trend: { value: "+6.4%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Teachers", value: SUBJECT_STATS.teachers, icon: Users, tone: METRIC_TONES.cyan,
      sparkColor: CATEGORICAL_COLORS[5], sparkData: SPARK.upSlow,
      trend: { value: "+1.8%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Classes Covered", value: SUBJECT_STATS.classes, icon: Layers, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.down,
      trend: { value: "-1.0%", up: false, compareLabel: "vs last term" },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
