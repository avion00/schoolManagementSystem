import { Users, Wallet, CheckCircle2, Clock, MinusCircle, Gift } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Payroll } from "@/data/billingData";

const SPARK = {
  totalStaff: [{ value: 13 }, { value: 13 }, { value: 14 }, { value: 14 }, { value: 15 }, { value: 15 }, { value: 15 }],
  payrollTotal: [{ value: 560000 }, { value: 572000 }, { value: 581000 }, { value: 590000 }, { value: 596000 }, { value: 601000 }, { value: 604100 }],
  paid: [{ value: 340000 }, { value: 348000 }, { value: 355000 }, { value: 360000 }, { value: 365000 }, { value: 369000 }, { value: 372800 }],
  pending: [{ value: 260000 }, { value: 252000 }, { value: 248000 }, { value: 242000 }, { value: 238000 }, { value: 234000 }, { value: 231300 }],
  deductions: [{ value: 17800 }, { value: 18100 }, { value: 18500 }, { value: 18900 }, { value: 19100 }, { value: 19300 }, { value: 19400 }],
  bonuses: [{ value: 4000 }, { value: 4000 }, { value: 6000 }, { value: 4000 }, { value: 6000 }, { value: 4000 }, { value: 6000 }],
};

export function PayrollSummaryCards({ payroll }: { payroll: Payroll[] }) {
  const paid = payroll.filter((p) => p.status === "Paid");
  const pending = payroll.filter((p) => p.status === "Pending");

  const cards = [
    {
      label: "Total Staff", value: String(payroll.length), icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.totalStaff,
      trend: { value: "+1.0%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Payroll This Month", value: `$${payroll.reduce((s, p) => s + p.netSalary, 0).toLocaleString()}`, icon: Wallet, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.payrollTotal,
      trend: { value: "+3.8%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Paid Salary", value: `$${paid.reduce((s, p) => s + p.netSalary, 0).toLocaleString()}`, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.paid,
      trend: { value: "+4.6%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Pending Salary", value: `$${pending.reduce((s, p) => s + p.netSalary, 0).toLocaleString()}`, icon: Clock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.pending,
      trend: { value: "-4.5%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Deductions", value: `$${payroll.reduce((s, p) => s + p.deduction, 0).toLocaleString()}`, icon: MinusCircle, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.deductions,
      trend: { value: "+3.2%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Bonuses", value: `$${payroll.reduce((s, p) => s + (p.bonus ?? 0), 0).toLocaleString()}`, icon: Gift, tone: METRIC_TONES.cyan,
      sparkColor: CATEGORICAL_COLORS[5], sparkData: SPARK.bonuses,
      trend: { value: "0.0%", up: true, compareLabel: "vs last month" },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c, i) => (
        <Reveal key={c.label} delay={i * 40}>
          <KPITrendCard
            label={c.label}
            value={c.value}
            icon={c.icon}
            iconCls={c.tone}
            trend={c.trend}
            sparklineData={c.sparkData}
            sparklineColor={c.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
