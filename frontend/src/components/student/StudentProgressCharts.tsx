import { BarChartCard } from "@/components/charts/BarChartCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { attendanceTrend, results, subjects } from "@/data/studentDashboardData";

export function StudentProgressCharts() {
  const termTrend = results
    .slice()
    .reverse()
    .map((r) => ({ term: r.term, percentage: r.percentage }));

  const subjectComparison = subjects.map((s) => ({
    subject: s.name.length > 10 ? `${s.name.slice(0, 9)}…` : s.name,
    marks: s.latestMarks,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <LineChartCard
        title="Performance over terms"
        subtitle="Overall percentage by term"
        data={termTrend}
        xKey="term"
        series={[{ key: "percentage", label: "Percentage", color: "#6366f1" }]}
        valueFormatter={(v) => `${v}%`}
      />
      <LineChartCard
        title="Attendance trend"
        subtitle="Present percentage by month"
        data={attendanceTrend}
        xKey="month"
        series={[{ key: "pct", label: "Attendance", color: "#10b981" }]}
        valueFormatter={(v) => `${v}%`}
      />
      <div className="lg:col-span-2">
        <BarChartCard
          title="Subject comparison"
          subtitle="Latest marks by subject"
          data={subjectComparison}
          xKey="subject"
          series={[{ key: "marks", label: "Marks", color: "#3b82f6" }]}
        />
      </div>
    </div>
  );
}
