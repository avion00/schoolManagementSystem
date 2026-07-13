import { LineChartCard } from "@/components/charts/LineChartCard";
import { attendanceTrend } from "@/data/teacherDashboardData";

/** Weekly attendance-rate trend across the teacher's assigned classes. */
export function AttendanceTrendChart() {
  return (
    <LineChartCard
      title="Attendance Trend"
      subtitle="Last 6 weeks, all assigned classes"
      data={attendanceTrend}
      xKey="week"
      series={[{ key: "rate", label: "Attendance %" }]}
      valueFormatter={(v) => `${v}%`}
      height={200}
    />
  );
}
