import { DonutChart } from "@/components/charts/DonutChart";
import { computeAttendanceSummary } from "@/data/studentDashboardData";

export function StudentAttendanceChart() {
  const summary = computeAttendanceSummary();
  const data = [
    { label: "Present", value: summary.presentDays, color: "#10b981" },
    { label: "Absent", value: summary.absentDays, color: "#f43f5e" },
    { label: "Late", value: summary.lateDays, color: "#f59e0b" },
    { label: "Leave", value: summary.leaveDays, color: "#3b82f6" },
  ].filter((d) => d.value > 0);

  return (
    <DonutChart
      title="Attendance"
      subtitle={`${summary.presentPct}% present overall`}
      data={data}
      centerLabel="days recorded"
      valueFormatter={(v) => `${v}`}
    />
  );
}
