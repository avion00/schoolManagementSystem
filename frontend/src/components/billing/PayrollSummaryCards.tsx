import { Users, Wallet, CheckCircle2, Clock, MinusCircle, Gift } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Payroll } from "@/data/billingData";


export function PayrollSummaryCards({ payroll }: { payroll: Payroll[] }) {
  const paid = payroll.filter((p) => p.status === "Paid");
  const pending = payroll.filter((p) => p.status === "Pending");

  const cards = [
    {
      label: "Total Staff", value: String(payroll.length), icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Payroll This Month", value: `$${payroll.reduce((s, p) => s + p.netSalary, 0).toLocaleString()}`, icon: Wallet, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Paid Salary", value: `$${paid.reduce((s, p) => s + p.netSalary, 0).toLocaleString()}`, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Pending Salary", value: `$${pending.reduce((s, p) => s + p.netSalary, 0).toLocaleString()}`, icon: Clock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Deductions", value: `$${payroll.reduce((s, p) => s + p.deduction, 0).toLocaleString()}`, icon: MinusCircle, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
    {
      label: "Bonuses", value: `$${payroll.reduce((s, p) => s + (p.bonus ?? 0), 0).toLocaleString()}`, icon: Gift, tone: METRIC_TONES.cyan,
      sparkColor: CATEGORICAL_COLORS[5],
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
            sparklineColor={c.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
