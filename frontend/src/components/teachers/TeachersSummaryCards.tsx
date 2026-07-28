import { Users, CheckCircle2, CalendarClock, UserMinus, UserX } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Teacher } from "@/data/teachersData";

const SPARK = {
  up: [{ value: 24 }, { value: 26 }, { value: 25 }, { value: 27 }, { value: 26 }, { value: 29 }, { value: 30 }],
  upSlow: [{ value: 22 }, { value: 23 }, { value: 24 }, { value: 23 }, { value: 25 }, { value: 26 }, { value: 26 }],
  flat: [{ value: 2 }, { value: 3 }, { value: 2 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 2 }],
  down: [{ value: 4 }, { value: 3 }, { value: 3 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 2 }],
  downFlat: [{ value: 3 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 2 }, { value: 1 }, { value: 2 }],
};

export function TeachersSummaryCards({ teachers }: { teachers: Teacher[] }) {
  const active = teachers.filter((t) => t.status === "active").length;
  const onLeave = teachers.filter((t) => t.status === "on leave").length;
  const inactive = teachers.filter((t) => t.status === "inactive").length;
  const resigned = teachers.filter((t) => t.status === "resigned").length;

  const stats = [
    {
      label: "Total Teachers", value: teachers.length, icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.up,
      trend: { value: "+4.1%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Active", value: active, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.upSlow,
      trend: { value: "+1.8%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "On Leave", value: onLeave, icon: CalendarClock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.flat,
      trend: { value: "0.0%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Inactive", value: inactive, icon: UserX, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.down,
      trend: { value: "-2.0%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Resigned", value: resigned, icon: UserMinus, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.downFlat,
      trend: { value: "-1.0%", up: false, compareLabel: "vs last term" },
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
