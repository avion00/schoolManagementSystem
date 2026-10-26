import { FileText, FileWarning, ReceiptText, Wallet } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import type { Invoice } from "@/api/types/billing";
import { useMoney } from "@/api/billing";

export function InvoicesSummaryCards({ invoices }: { invoices: Invoice[] }) {
  const money = useMoney();
  const totalAmount = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.reduce((s, i) => s + i.paid, 0);
  const totalBalance = invoices.reduce((s, i) => s + i.balance, 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  const stats = [
    {
      label: "Total Invoices", value: invoices.length, icon: FileText, cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Total Billed", value: `${money(totalAmount)}`, icon: ReceiptText, cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Total Collected", value: `${money(totalPaid)}`, icon: Wallet, cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Outstanding Balance", value: `${money(totalBalance)}`, icon: FileWarning, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      sparkColor: STATUS_COLORS.critical,
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
