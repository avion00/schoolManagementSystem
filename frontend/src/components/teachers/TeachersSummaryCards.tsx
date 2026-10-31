import { Users, CheckCircle2, CalendarClock, UserMinus, UserX } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Teacher } from "@/api/types/teachers";


export function TeachersSummaryCards({ teachers }: { teachers: Teacher[] }) {
  const active = teachers.filter((t) => t.status === "active").length;
  const onLeave = teachers.filter((t) => t.status === "on leave").length;
  const inactive = teachers.filter((t) => t.status === "inactive").length;
  const resigned = teachers.filter((t) => t.status === "resigned").length;

  const stats = [
    {
      label: "Total Teachers", value: teachers.length, icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Active", value: active, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "On Leave", value: onLeave, icon: CalendarClock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Inactive", value: inactive, icon: UserX, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
    {
      label: "Resigned", value: resigned, icon: UserMinus, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
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
