import { RevenueExpenseChart as GenericRevenueExpenseChart } from "@/components/charts/RevenueExpenseChart";
import { monthLabel, useMoney, type FinanceSummary } from "@/api/billing";

/** Fee income vs paid expenses per month (from /finance/summary/). */
export function RevenueExpenseChart({ trend }: { trend: FinanceSummary["trend"] }) {
  const money = useMoney();
  const data = trend.map((d) => ({ label: monthLabel(d.month).slice(0, 3), revenue: d.income, expenses: d.expenses }));
  return <GenericRevenueExpenseChart data={data} subtitle={`Last ${trend.length} months`} valueFormatter={money.short} />;
}
