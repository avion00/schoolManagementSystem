import { BarChartCard } from "@/components/charts/BarChartCard";
import { homeworkSubmissionTrend } from "@/data/teacherDashboardData";

/** Weekly homework submission rate across assigned classes. */
export function HomeworkSubmissionChart() {
  return (
    <BarChartCard
      title="Homework Submission Trend"
      subtitle="% of students submitting on time"
      data={homeworkSubmissionTrend}
      xKey="week"
      series={[{ key: "submitted", label: "Submitted %" }]}
      valueFormatter={(v) => `${v}%`}
      height={200}
    />
  );
}
