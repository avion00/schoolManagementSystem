import { BarChartCard } from "@/components/charts/BarChartCard";
import { SEQUENTIAL_COLOR } from "@/components/charts/palette";

export interface FeeCollectionPoint {
  label: string;
  collected: number;
}

/** Single-series fee/amount-collected-by-category chart — preset on BarChartCard. */
export function FeeCollectionChart({
  data,
  title = "Fee Collection",
  subtitle,
  valueFormatter = (v) => `$${(v / 1000).toFixed(0)}k`,
}: {
  data: FeeCollectionPoint[];
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
      series={[{ key: "collected", label: "Collected", color: SEQUENTIAL_COLOR }]}
    />
  );
}
