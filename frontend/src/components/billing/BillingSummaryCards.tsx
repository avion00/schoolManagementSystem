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
      sparkData: [{ value: 2350000 }, { value: 2380000 }, { value: 2400000 }, { value: 2430000 }, { value: 2460000 }, { value: 2475000 }, { value: 2490000 }],
      trend: { value: "+5.7%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Fees Collected", value: money(billingSummary.feesCollected), icon: Banknote, tone: METRIC_TONES.green,
      sparkColor: CATEGORICAL_COLORS[1],
      sparkData: [{ value: 1200000 }, { value: 1230000 }, { value: 1260000 }, { value: 1290000 }, { value: 1310000 }, { value: 1325000 }, { value: 1340000 }],
      trend: { value: "+8.3%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Outstanding Dues", value: money(billingSummary.outstandingDues), icon: Clock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
      sparkData: [{ value: 1280000 }, { value: 1260000 }, { value: 1240000 }, { value: 1220000 }, { value: 1210000 }, { value: 1195000 }, { value: 1180000 }],
      trend: { value: "-6.5%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Expenses This Month", value: money(billingSummary.expensesThisMonth), icon: TrendingDown, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
      sparkData: [{ value: 320000 }, { value: 330000 }, { value: 338000 }, { value: 344000 }, { value: 348000 }, { value: 352000 }, { value: 356000 }],
      trend: { value: "+4.9%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Payroll Due", value: money(billingSummary.payrollDue), icon: Wallet, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
      sparkData: [{ value: 245000 }, { value: 242000 }, { value: 238000 }, { value: 236000 }, { value: 234000 }, { value: 232000 }, { value: 231000 }],
      trend: { value: "-2.1%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Net Balance", value: money(netBalance), icon: PiggyBank, tone: netBalance >= 0 ? METRIC_TONES.green : METRIC_TONES.red,
      sparkColor: netBalance >= 0 ? STATUS_COLORS.good : STATUS_COLORS.critical,
      sparkData: [{ value: 1750000 }, { value: 1790000 }, { value: 1820000 }, { value: 1850000 }, { value: 1875000 }, { value: 1890000 }, { value: 1902500 }],
      trend: { value: "+7.4%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Pending Invoices", value: String(billingSummary.pendingInvoices), icon: FileText, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
      sparkData: [{ value: 10 }, { value: 9 }, { value: 9 }, { value: 8 }, { value: 8 }, { value: 9 }, { value: 8 }],
      trend: { value: "-11.1%", up: false, compareLabel: "vs last month" },
    },
    {
      label: "Overdue Payments", value: String(billingSummary.overduePayments), icon: AlertTriangle, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
      sparkData: [{ value: 6 }, { value: 5 }, { value: 5 }, { value: 4 }, { value: 4 }, { value: 4 }, { value: 4 }],
      trend: { value: "-20.0%", up: false, compareLabel: "vs last month" },
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
            trend={stat.trend}
            sparklineData={stat.sparkData}
            sparklineColor={stat.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
