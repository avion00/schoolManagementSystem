import { useMemo } from "react";
import {
  AlertTriangle, Banknote, Clock, FileText, PiggyBank, TrendingDown, TrendingUp, Wallet,
} from "lucide-react";

import { PopNumber, Reveal } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { billingSummary } from "@/data/billingData";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  green:  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  red:    "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  amber:  "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  blue:   "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
} as const;

function money(n: number) { return `$${Math.round(n).toLocaleString()}`; }

export function BillingSummaryCards() {
  const netBalance = billingSummary.totalRevenue - billingSummary.expensesThisMonth - billingSummary.payrollDue;

  const stats = useMemo(() => [
    { label: "Total Revenue",        value: money(billingSummary.totalRevenue),     icon: TrendingUp,   tone: "green" as const },
    { label: "Fees Collected",       value: money(billingSummary.feesCollected),    icon: Banknote,     tone: "green" as const },
    { label: "Outstanding Dues",     value: money(billingSummary.outstandingDues),  icon: Clock,        tone: "amber" as const },
    { label: "Expenses This Month",  value: money(billingSummary.expensesThisMonth), icon: TrendingDown, tone: "red" as const },
    { label: "Payroll Due",          value: money(billingSummary.payrollDue),       icon: Wallet,       tone: "purple" as const },
    { label: "Net Balance",          value: money(netBalance),                      icon: PiggyBank,    tone: netBalance >= 0 ? "green" as const : "red" as const },
    { label: "Pending Invoices",     value: String(billingSummary.pendingInvoices), icon: FileText,     tone: "blue" as const },
    { label: "Overdue Payments",     value: String(billingSummary.overduePayments), icon: AlertTriangle, tone: "red" as const },
  ], [netBalance]);

  return (
    <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", TONE_STYLES[stat.tone])}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  <PopNumber value={stat.value} />
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </Reveal>
  );
}
