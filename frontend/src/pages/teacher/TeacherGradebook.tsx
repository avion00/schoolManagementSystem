import { DonutChart } from "@/components/charts/DonutChart";
import { Reveal } from "@/components/motion";
import { PerformanceTrendChart } from "@/components/teacher/PerformanceTrendChart";
import { GradebookTable } from "@/components/teacher/GradebookTable";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { assignedStudents, gradebookSummary, marksForStudent } from "@/data/teacherDashboardData";

export function TeacherGradebook() {
  const gradeTotals = new Map<string, number>();
  for (const entry of gradebookSummary) {
    for (const g of entry.gradeDistribution) {
      gradeTotals.set(g.grade, (gradeTotals.get(g.grade) ?? 0) + g.count);
    }
  }
  const donutData = Array.from(gradeTotals.entries()).map(([label, value]) => ({ label, value }));

  const ranked = [...assignedStudents]
    .sort((a, b) => marksForStudent(b) - marksForStudent(a))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Marks &amp; Gradebook</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Class-wise marks status, averages, and grade distribution across your assigned classes. Final results are published by admin/principal.
          </p>
        </div>
      </Reveal>

      <Reveal delay={60}>
        <GradebookTable rows={gradebookSummary} />
      </Reveal>

      <Reveal delay={100} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceTrendChart />
        </div>
        <DonutChart title="Grade Distribution" subtitle="Across all assigned classes" data={donutData} centerLabel="students" />
      </Reveal>

      <Reveal delay={140}>
        <PremiumCard className="p-5">
          <p className="mb-3 text-[13.5px] font-semibold text-foreground">Student Rank — your subject</p>
          <div className="space-y-1.5">
            {ranked.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl p-2">
                <span className="w-5 shrink-0 text-center text-[12.5px] font-semibold text-muted-foreground">{i + 1}</span>
                <StudentAvatar name={s.name} />
                <p className="min-w-0 flex-1 truncate text-[13px] text-foreground">{s.name}</p>
                <span className="text-[11.5px] text-muted-foreground">{s.className}-{s.section}</span>
                <span className="font-semibold tabular-nums text-foreground">{marksForStudent(s)}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
