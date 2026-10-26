import { GraduationCap, CheckCircle2, Award, ArrowRightLeft, UserX } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Student } from "@/api/types/students";

const SPARK = {
  up: [{ value: 30 }, { value: 33 }, { value: 31 }, { value: 35 }, { value: 34 }, { value: 37 }, { value: 40 }],
  upSlow: [{ value: 28 }, { value: 29 }, { value: 31 }, { value: 30 }, { value: 32 }, { value: 33 }, { value: 34 }],
  upSharp: [{ value: 1 }, { value: 1 }, { value: 2 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 3 }],
  down: [{ value: 6 }, { value: 5 }, { value: 6 }, { value: 4 }, { value: 3 }, { value: 4 }, { value: 2 }],
  downFlat: [{ value: 4 }, { value: 4 }, { value: 3 }, { value: 4 }, { value: 3 }, { value: 2 }, { value: 2 }],
};

export function StudentsSummaryCards({ students }: { students: Student[] }) {
  const active = students.filter((s) => s.status === "active").length;
  const graduated = students.filter((s) => s.status === "graduated").length;
  const transferred = students.filter((s) => s.status === "transferred").length;
  const inactive = students.filter((s) => s.status === "inactive").length;

  const stats = [
    {
      label: "Total Students", value: students.length, icon: GraduationCap, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.up,
      trend: { value: "+8.2%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Active", value: active, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.upSlow,
      trend: { value: "+2.1%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Graduated", value: graduated, icon: Award, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.upSharp,
      trend: { value: "+5.4%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Transferred", value: transferred, icon: ArrowRightLeft, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.downFlat,
      trend: { value: "-1.2%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Inactive", value: inactive, icon: UserX, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.down,
      trend: { value: "-3.0%", up: false, compareLabel: "vs last month" },
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
