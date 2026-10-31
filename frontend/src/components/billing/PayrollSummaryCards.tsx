import { Users, Wallet, CheckCircle2, Clock, MinusCircle, Gift } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { Payroll } from "@/api/types/billing";
import { useMoney } from "@/api/billing";


export function PayrollSummaryCards({ payroll }: { payroll: Payroll[] }) {
  const money = useMoney();
  const paid = payroll.filter((p) => p.status === "Paid");
  const pending = payroll.filter((p) => p.status !== "Paid");

  const cards = [
    {
      label: "Staff in Run", value: String(payroll.length), icon: Users, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Net Payroll", value: `${money(payroll.reduce((s, p) => s + p.netSalary, 0))}`, icon: Wallet, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Paid Salary", value: `${money(paid.reduce((s, p) => s + p.netSalary, 0))}`, icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Pending Salary", value: `${money(pending.reduce((s, p) => s + p.netSalary, 0))}`, icon: Clock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Deductions", value: `${money(payroll.reduce((s, p) => s + p.deduction, 0))}`, icon: MinusCircle, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
    {
      label: "Bonuses", value: `${money(payroll.reduce((s, p) => s + (p.bonus ?? 0), 0))}`, icon: Gift, tone: METRIC_TONES.cyan,
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
