import { FileText, FileWarning, ReceiptText, Wallet } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import type { Invoice } from "@/data/billingData";

export function InvoicesSummaryCards({ invoices }: { invoices: Invoice[] }) {
  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const totalBalance = invoices.reduce((s, i) => s + i.balance, 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  const stats = [
    {
      label: "Total Invoices", value: invoices.length, icon: FileText, cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      sparkColor: CATEGORICAL_COLORS[0],
      sparkData: [{ value: 24 }, { value: 26 }, { value: 27 }, { value: 28 }, { value: 29 }, { value: 29 }, { value: 30 }],
      trend: { value: "+8.7%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Total Billed", value: `$${totalAmount.toLocaleString()}`, icon: ReceiptText, cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      sparkColor: CATEGORICAL_COLORS[4],
      sparkData: [{ value: 310000 }, { value: 320000 }, { value: 330000 }, { value: 338000 }, { value: 344000 }, { value: 349000 }, { value: 352000 }],
      trend: { value: "+6.1%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Total Collected", value: `$${totalPaid.toLocaleString()}`, icon: Wallet, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparkColor: STATUS_COLORS.good,
      sparkData: [{ value: 180000 }, { value: 190000 }, { value: 195000 }, { value: 200000 }, { value: 205000 }, { value: 208000 }, { value: 211000 }],
      trend: { value: "+8.4%", up: true, compareLabel: "vs last month" },
    },
    {
      label: "Outstanding Balance", value: `$${totalBalance.toLocaleString()}`, icon: FileWarning, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      sparkColor: STATUS_COLORS.critical,
      sparkData: [{ value: 160000 }, { value: 155000 }, { value: 150000 }, { value: 148000 }, { value: 145000 }, { value: 143000 }, { value: 141000 }],
      trend: { value: "-4.2%", up: false, compareLabel: "vs last month" },
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 40}>
          <KPITrendCard
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconCls={s.cls}
            trend={s.trend}
            sparklineData={s.sparkData}
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
      {overdueCount > 0 && (
        <Reveal delay={160} className="col-span-2 sm:col-span-4">
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[12px] text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
            <FileWarning className="h-3.5 w-3.5 shrink-0" />
            {overdueCount} invoice{overdueCount !== 1 ? "s are" : " is"} overdue.
          </div>
        </Reveal>
      )}
    </div>
  );
}
