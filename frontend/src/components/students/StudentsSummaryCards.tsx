import { GraduationCap, CheckCircle2, Award, ArrowRightLeft, UserX } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Student } from "@/api/types/students";


export function StudentsSummaryCards({ students }: { students: Student[] }) {
  const active = students.filter((s) => s.status === "active").length;
  const graduated = students.filter((s) => s.status === "graduated").length;
  const transferred = students.filter((s) => s.status === "transferred").length;
  const inactive = students.filter((s) => s.status === "inactive").length;

  const stats = [
    {
      label: "Total Students", value: students.length, icon: GraduationCap, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Active", value: active, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Graduated", value: graduated, icon: Award, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Transferred", value: transferred, icon: ArrowRightLeft, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Inactive", value: inactive, icon: UserX, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
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
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
