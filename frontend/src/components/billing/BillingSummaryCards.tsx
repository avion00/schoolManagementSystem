import { useMemo } from "react";
import {
  AlertTriangle, Banknote, Clock, FileText, PiggyBank, TrendingDown, TrendingUp, Wallet,
} from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { billingSummary } from "@/data/billingData";

function money(n: number) { return `$${Math.round(n).toLocaleString()}`; }

export function BillingSummaryCards() {
  const netBalance = billingSummary.totalRevenue - billingSummary.expensesThisMonth - billingSummary.payrollDue;

  const stats = useMemo(() => [
    {
      label: "Total Revenue", value: money(billingSummary.totalRevenue), icon: TrendingUp, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Fees Collected", value: money(billingSummary.feesCollected), icon: Banknote, tone: METRIC_TONES.green,
      sparkColor: CATEGORICAL_COLORS[1],
    },
    {
      label: "Outstanding Dues", value: money(billingSummary.outstandingDues), icon: Clock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Expenses This Month", value: money(billingSummary.expensesThisMonth), icon: TrendingDown, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
    {
      label: "Payroll Due", value: money(billingSummary.payrollDue), icon: Wallet, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Net Balance", value: money(netBalance), icon: PiggyBank, tone: netBalance >= 0 ? METRIC_TONES.green : METRIC_TONES.red,
      sparkColor: netBalance >= 0 ? STATUS_COLORS.good : STATUS_COLORS.critical,
    },
    {
      label: "Pending Invoices", value: String(billingSummary.pendingInvoices), icon: FileText, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Overdue Payments", value: String(billingSummary.overduePayments), icon: AlertTriangle, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
  ], [netBalance]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 40}>
          <KPITrendCard
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconCls={stat.tone}
            sparklineColor={stat.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
