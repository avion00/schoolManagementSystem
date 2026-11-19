import { useMemo } from "react";
import {
  AlertTriangle, Banknote, Clock, FileText, PiggyBank, TrendingDown, TrendingUp, Wallet,
} from "lucide-react";

import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { useMoney, type FeeSummary, type FinanceSummary } from "@/api/billing";


/** This month's fee and finance figures (finance cards show "—" without finance access). */
export function BillingSummaryCards({ fees, finance }: { fees: FeeSummary | undefined; finance: FinanceSummary | undefined }) {
  const money = useMoney();
  const net = fees && finance ? fees.collected - finance.paidThisMonth : null;

  const stats = useMemo(() => [
    { label: "Billed This Month", value: money(fees ? fees.billed - fees.discounts : null), icon: TrendingUp, tone: METRIC_TONES.green },
    { label: "Collected This Month", value: money(fees?.collected), icon: Banknote, tone: METRIC_TONES.green },
    { label: "Outstanding Dues", value: money(fees?.outstanding), icon: Clock, tone: METRIC_TONES.amber },
    { label: "Expenses Paid This Month", value: money(finance?.paidThisMonth), icon: TrendingDown, tone: METRIC_TONES.red },
    { label: "Payroll Due", value: money(finance?.payrollDue), icon: Wallet, tone: METRIC_TONES.purple },
    { label: "Net This Month", value: money(net), icon: PiggyBank, tone: (net ?? 0) >= 0 ? METRIC_TONES.green : METRIC_TONES.red },
    { label: "Open Invoices", value: fees ? String(fees.openInvoices) : "—", icon: FileText, tone: METRIC_TONES.blue },
    { label: "Overdue Invoices", value: fees ? String(fees.overdueInvoices) : "—", icon: AlertTriangle, tone: METRIC_TONES.red },
  ], [fees, finance, net, money]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 40}>
          <KPITrendCard
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconCls={stat.tone}
          />
        </Reveal>
      ))}
    </div>
  );
}
