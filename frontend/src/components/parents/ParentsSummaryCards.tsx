import { Users, CheckCircle2, UsersRound, UserX, Ban } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Parent } from "@/api/types/parents";


export function ParentsSummaryCards({ parents }: { parents: Parent[] }) {
  const active = parents.filter((p) => p.status === "active").length;
  const withMultiple = parents.filter((p) => p.linkedChildren.length > 1).length;
  const inactive = parents.filter((p) => p.status === "inactive").length;
  const blocked = parents.filter((p) => p.status === "blocked").length;

  const stats = [
    {
      label: "Total Parents", value: parents.length, icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Active", value: active, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "With Multiple Children", value: withMultiple, icon: UsersRound, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Inactive", value: inactive, icon: UserX, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Blocked", value: blocked, icon: Ban, tone: METRIC_TONES.red,
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
