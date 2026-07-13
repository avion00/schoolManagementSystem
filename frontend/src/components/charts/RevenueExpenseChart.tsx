import { BarChartCard } from "@/components/charts/BarChartCard";
import { STATUS_COLORS } from "@/components/charts/palette";

export interface RevenueExpensePoint {
  label: string;
  revenue: number;
  expenses: number;
}

/** Revenue vs. expenses over time — preset on BarChartCard with fixed good/critical colors. */
export function RevenueExpenseChart({
  data,
  title = "Revenue vs. Expenses",
  subtitle,
  valueFormatter = (v) => `$${(v / 1000).toFixed(0)}k`,
}: {
  data: RevenueExpensePoint[];
  title?: string;
  subtitle?: string;
  valueFormatter?: (v: number) => string;
}) {
  return (
    <BarChartCard
      title={title}
      subtitle={subtitle}
      data={data}
      xKey="label"
      valueFormatter={valueFormatter}
      series={[
        { key: "revenue", label: "Revenue", color: STATUS_COLORS.good },
        { key: "expenses", label: "Expenses", color: STATUS_COLORS.critical },
      ]}
    />
  );
}
