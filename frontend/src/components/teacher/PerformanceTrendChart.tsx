import { LineChartCard } from "@/components/charts/LineChartCard";
import { performanceTrend } from "@/data/teacherDashboardData";

/** Class-average marks across the most recent exams. */
export function PerformanceTrendChart() {
  return (
    <LineChartCard
      title="Performance Trend"
      subtitle="Class average marks by exam"
      data={performanceTrend}
      xKey="exam"
      series={[{ key: "average", label: "Average marks" }]}
      valueFormatter={(v) => `${v}`}
      height={200}
    />
  );
}
