import { BarChartCard } from "@/components/charts/BarChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { Reveal } from "@/components/motion";
import { AttendanceTrendChart } from "@/components/teacher/AttendanceTrendChart";
import { HomeworkSubmissionChart } from "@/components/teacher/HomeworkSubmissionChart";
import { TeacherActivityTimeline } from "@/components/teacher/TeacherActivityTimeline";
import { TeacherMessagesPanel } from "@/components/teacher/TeacherMessagesPanel";
import { TeacherNoticesPanel } from "@/components/teacher/TeacherNoticesPanel";
import { TeacherSummaryCards } from "@/components/teacher/TeacherSummaryCards";
import { TeacherTodayTimetable } from "@/components/teacher/TeacherTodayTimetable";
import { TeacherWelcomeHero } from "@/components/teacher/TeacherWelcomeHero";
import { classPerformanceChart, riskDistribution } from "@/data/teacherDashboardData";

/** Overview page — a weekly/termly snapshot, not a daily to-do list (that's Today). */
export function TeacherDashboard() {
  return (
    <div className="space-y-4">
      <Reveal>
        <TeacherWelcomeHero />
      </Reveal>

      <Reveal delay={60}>
        <TeacherSummaryCards />
      </Reveal>

      <Reveal delay={100} className="grid gap-4 lg:grid-cols-3">
        <BarChartCard
          title="Class Performance"
          subtitle="Average marks by class"
          data={classPerformanceChart}
          xKey="name"
          series={[{ key: "average", label: "Average marks" }]}
          height={220}
        />
        <AttendanceTrendChart />
        <HomeworkSubmissionChart />
      </Reveal>

      <Reveal delay={140} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TeacherTodayTimetable />
        </div>
        <DonutChart title="Student Risk Distribution" subtitle="Across all assigned classes" data={riskDistribution} centerLabel="students" />
      </Reveal>

      <Reveal delay={180} className="grid gap-4 lg:grid-cols-3">
        <TeacherMessagesPanel />
        <TeacherNoticesPanel />
        <TeacherActivityTimeline />
      </Reveal>
    </div>
  );
}
