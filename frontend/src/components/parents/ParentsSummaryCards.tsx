import { Users, CheckCircle2, UsersRound, UserX, Ban } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Parent } from "@/api/types/parents";

const SPARK = {
  up: [{ value: 24 }, { value: 26 }, { value: 25 }, { value: 27 }, { value: 26 }, { value: 29 }, { value: 30 }],
  upSlow: [{ value: 22 }, { value: 23 }, { value: 24 }, { value: 23 }, { value: 25 }, { value: 26 }, { value: 27 }],
  flat: [{ value: 8 }, { value: 9 }, { value: 9 }, { value: 10 }, { value: 9 }, { value: 10 }, { value: 10 }],
  down: [{ value: 4 }, { value: 3 }, { value: 3 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 2 }],
  downFlat: [{ value: 2 }, { value: 2 }, { value: 1 }, { value: 2 }, { value: 1 }, { value: 1 }, { value: 1 }],
};

export function ParentsSummaryCards({ parents }: { parents: Parent[] }) {
  const active = parents.filter((p) => p.status === "active").length;
  const withMultiple = parents.filter((p) => p.linkedChildren.length > 1).length;
  const inactive = parents.filter((p) => p.status === "inactive").length;
  const blocked = parents.filter((p) => p.status === "blocked").length;

  const stats = [
    {
      label: "Total Parents", value: parents.length, icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.up,
      trend: { value: "+3.5%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Active", value: active, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.upSlow,
      trend: { value: "+1.4%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "With Multiple Children", value: withMultiple, icon: UsersRound, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.flat,
      trend: { value: "0.0%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Inactive", value: inactive, icon: UserX, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.down,
      trend: { value: "-1.5%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Blocked", value: blocked, icon: Ban, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.downFlat,
      trend: { value: "-0.5%", up: false, compareLabel: "vs last term" },
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
