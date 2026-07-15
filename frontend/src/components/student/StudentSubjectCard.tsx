import { ClipboardList, FolderOpen } from "lucide-react";

import { PremiumCard } from "@/components/ui/PremiumCard";
import type { StudentSubject } from "@/data/studentDashboardData";

export function StudentSubjectCard({ subject, onClick }: { subject: StudentSubject; onClick: () => void }) {
  const pct = Math.round((subject.syllabusCompleted / subject.syllabusTotal) * 100);

  return (
    <PremiumCard hoverable className="cursor-pointer p-4" onClick={onClick}>
      <div className="flex items-center justify-between">
        <p className="text-[14px] font-semibold text-foreground">{subject.name}</p>
        <span className="text-[11.5px] font-medium text-foreground">{subject.latestMarks}/{subject.latestFullMarks}</span>
      </div>
      <p className="mt-0.5 text-[11.5px] text-muted-foreground">{subject.teacher} · {subject.weeklyClasses} classes/week</p>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Syllabus progress</span>
          <span>{subject.syllabusCompleted}/{subject.syllabusTotal} ({pct}%)</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 border-t border-border/60 pt-2.5 text-[11.5px] text-muted-foreground">
        <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5" /> {subject.homeworkPending} pending</span>
        <span className="flex items-center gap-1"><FolderOpen className="h-3.5 w-3.5" /> {subject.materialsCount} materials</span>
      </div>
    </PremiumCard>
  );
}
