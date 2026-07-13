import { AttendanceTrendChart } from "@/components/teacher/AttendanceTrendChart";
import { HomeworkSubmissionChart } from "@/components/teacher/HomeworkSubmissionChart";
import { PerformanceTrendChart } from "@/components/teacher/PerformanceTrendChart";

/** The three trend charts shown together on the Teacher Dashboard and Performance page. */
export function TeacherPerformanceCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <PerformanceTrendChart />
      <AttendanceTrendChart />
      <HomeworkSubmissionChart />
    </div>
  );
}
