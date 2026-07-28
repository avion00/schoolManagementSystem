import { Award, CheckCircle2, CircleDollarSign, Users, XCircle, AlertTriangle } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { StudentFee } from "@/data/billingData";

const SPARK = {
  totalStudents: [{ value: 22 }, { value: 23 }, { value: 23 }, { value: 24 }, { value: 24 }, { value: 25 }, { value: 25 }],
  fullyPaid: [{ value: 5 }, { value: 6 }, { value: 6 }, { value: 7 }, { value: 7 }, { value: 8 }, { value: 8 }],
  partiallyPaid: [{ value: 8 }, { value: 7 }, { value: 7 }, { value: 6 }, { value: 6 }, { value: 6 }, { value: 6 }],
  unpaid: [{ value: 9 }, { value: 8 }, { value: 7 }, { value: 6 }, { value: 6 }, { value: 5 }, { value: 5 }],
  overdue: [{ value: 7 }, { value: 6 }, { value: 6 }, { value: 5 }, { value: 5 }, { value: 5 }, { value: 5 }],
  scholarship: [{ value: 3 }, { value: 3 }, { value: 4 }, { value: 4 }, { value: 4 }, { value: 4 }, { value: 4 }],
};

export function StudentFeesSummaryCards({ studentFees }: { studentFees: StudentFee[] }) {
  const stats = [
    {
      label: "Total Students", value: studentFees.length, icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.totalStudents,
      trend: { value: "+4.2%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Fully Paid", value: studentFees.filter((s) => s.status === "Paid").length, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.fullyPaid,
      trend: { value: "+14.3%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Partially Paid", value: studentFees.filter((s) => s.status === "Partial").length, icon: CircleDollarSign, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.partiallyPaid,
      trend: { value: "-5.0%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Unpaid", value: studentFees.filter((s) => s.status === "Due").length, icon: XCircle, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.unpaid,
      trend: { value: "-15.0%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Overdue", value: studentFees.filter((s) => s.status === "Overdue").length, icon: AlertTriangle, tone: METRIC_TONES.red,
      sparkColor: CATEGORICAL_COLORS[2], sparkData: SPARK.overdue,
      trend: { value: "-12.5%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Scholarship Students", value: studentFees.filter((s) => s.discount > 0).length, icon: Award, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.scholarship,
      trend: { value: "+8.0%", up: true, compareLabel: "vs last term" },
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
