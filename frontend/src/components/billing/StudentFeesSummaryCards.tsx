import { Award, CheckCircle2, CircleDollarSign, Users, XCircle, AlertTriangle } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { StudentFee } from "@/data/billingData";


export function StudentFeesSummaryCards({ studentFees }: { studentFees: StudentFee[] }) {
  const stats = [
    {
      label: "Total Students", value: studentFees.length, icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Fully Paid", value: studentFees.filter((s) => s.status === "Paid").length, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Partially Paid", value: studentFees.filter((s) => s.status === "Partial").length, icon: CircleDollarSign, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Unpaid", value: studentFees.filter((s) => s.status === "Due").length, icon: XCircle, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
    {
      label: "Overdue", value: studentFees.filter((s) => s.status === "Overdue").length, icon: AlertTriangle, tone: METRIC_TONES.red,
      sparkColor: CATEGORICAL_COLORS[2],
    },
    {
      label: "Scholarship Students", value: studentFees.filter((s) => s.discount > 0).length, icon: Award, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
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
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
