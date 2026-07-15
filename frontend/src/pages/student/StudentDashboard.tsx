import { Reveal } from "@/components/motion";
import { StudentAttendanceChart } from "@/components/student/StudentAttendanceChart";
import { StudentFeeSummary } from "@/components/student/StudentFeeSummary";
import { StudentHomeworkPanel } from "@/components/student/StudentHomeworkPanel";
import { StudentMessagesPanel } from "@/components/student/StudentMessagesPanel";
import { StudentNoticePanel } from "@/components/student/StudentNoticePanel";
import { StudentResultsPreview } from "@/components/student/StudentResultsPreview";
import { StudentSummaryCards } from "@/components/student/StudentSummaryCards";
import { StudentTimetablePreview } from "@/components/student/StudentTimetablePreview";
import { StudentWelcomeHero } from "@/components/student/StudentWelcomeHero";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { learningMaterials } from "@/data/studentDashboardData";

export function StudentDashboard() {
  const recentMaterials = [...learningMaterials].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div className="space-y-4">
      <StudentWelcomeHero />

      <StudentSummaryCards />

      <Reveal delay={80} className="grid gap-4 lg:grid-cols-3">
        <StudentAttendanceChart />
        <div className="lg:col-span-2"><StudentResultsPreview /></div>
      </Reveal>

      <Reveal delay={120} className="grid gap-4 lg:grid-cols-3">
        <StudentHomeworkPanel />
        <StudentTimetablePreview />
        <PremiumCard className="p-4">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Learning Materials</p>
          <div className="space-y-2">
            {recentMaterials.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-[12px]">
                <span className="truncate text-foreground">{m.title}</span>
                <span className="shrink-0 text-muted-foreground">{m.type}</span>
              </div>
            ))}
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={160} className="grid gap-4 lg:grid-cols-3">
        <StudentNoticePanel />
        <StudentMessagesPanel />
        <StudentFeeSummary />
      </Reveal>
    </div>
  );
}
