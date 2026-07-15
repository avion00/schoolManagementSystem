import { ScrollText } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentExamCard } from "@/components/student/StudentExamCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { exams } from "@/data/studentDashboardData";

export function StudentExams() {
  const upcoming = exams.filter((e) => e.status === "Upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const completed = exams.filter((e) => e.status === "Completed");

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Exams</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{upcoming.length} upcoming · {completed.length} completed</p>
      </Reveal>

      <Reveal delay={40}>
        <p className="mb-2 text-[13px] font-semibold text-foreground">Upcoming</p>
        {upcoming.length === 0 ? (
          <PremiumEmptyState icon={ScrollText} title="No upcoming exams" description="You're all clear for now." />
        ) : (
          <div className="space-y-2.5">{upcoming.map((e) => <StudentExamCard key={e.id} exam={e} />)}</div>
        )}
      </Reveal>

      {completed.length > 0 && (
        <Reveal delay={80}>
          <p className="mb-2 text-[13px] font-semibold text-foreground">Completed</p>
          <div className="space-y-2.5">{completed.map((e) => <StudentExamCard key={e.id} exam={e} />)}</div>
        </Reveal>
      )}
    </div>
  );
}
