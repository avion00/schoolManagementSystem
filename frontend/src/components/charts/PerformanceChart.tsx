import { BarChartCard } from "@/components/charts/BarChartCard";
import { CATEGORICAL_COLORS } from "@/components/charts/palette";

export interface PerformancePoint {
  label: string;
  score: number;
}

/** Average score/performance by class, subject, or teacher — preset on BarChartCard. */
export function PerformanceChart({
  data,
  title = "Performance Overview",
  subtitle,
  valueFormatter = (v) => `${v}%`,
}: {
  data: PerformancePoint[];
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
      series={[{ key: "score", label: "Score", color: CATEGORICAL_COLORS[0] }]}
    />
  );
}
