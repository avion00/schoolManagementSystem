import { RevenueExpenseChart as GenericRevenueExpenseChart } from "@/components/charts/RevenueExpenseChart";
import { MONTHLY_FINANCE_TREND } from "@/data/billingData";

/** Billing-specific data wiring around the reusable charts/RevenueExpenseChart. */
export function RevenueExpenseChart() {
  const data = MONTHLY_FINANCE_TREND.map((d) => ({ label: d.month, revenue: d.revenue, expenses: d.expenses }));
  return <GenericRevenueExpenseChart data={data} subtitle="Last 6 months" />;
}
