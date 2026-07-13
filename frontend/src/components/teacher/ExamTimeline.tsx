import { FileUp, Printer, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { UpcomingExam } from "@/data/teacherDashboardData";

/** Chronological exam list — each entry shows the practical things a teacher needs to do before/after it. */
export function ExamTimeline({ exams }: { exams: UpcomingExam[] }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <PremiumCard key={exam.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[13.5px] font-semibold text-foreground">{exam.subject} — {exam.type}</p>
              <p className="text-[12px] text-muted-foreground">{exam.className}-{exam.section} · {exam.date}{exam.time ? ` · ${exam.time}` : ""}{exam.room ? ` · ${exam.room}` : ""}</p>
              {exam.marksDeadline && <p className="mt-1 text-[11.5px] text-amber-600 dark:text-amber-400">Marks submission deadline: {exam.marksDeadline}</p>}
            </div>
            {exam.syllabusCoverage !== undefined && (
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-muted-foreground">Syllabus covered</p>
                <PremiumBadge label={`${exam.syllabusCoverage}%`} tone={exam.syllabusCoverage >= 90 ? "success" : exam.syllabusCoverage >= 70 ? "warning" : "danger"} />
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
            <button type="button" onClick={() => toast.info(`${exam.subject} exam details — ${exam.date}`)} className="rounded-lg border border-border/60 px-2.5 py-1.5 text-[11.5px] font-medium text-foreground hover:bg-accent/60">
              View details
            </button>
            <button type="button" onClick={() => navigate("/teacher/materials")} className="flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11.5px] font-medium text-foreground hover:bg-accent/60">
              <Upload className="h-3 w-3" /> Upload material
            </button>
            <button type="button" onClick={() => navigate(`/teacher/marks?class=${exam.classId}`)} className="flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11.5px] font-medium text-foreground hover:bg-accent/60">
              <FileUp className="h-3 w-3" /> Enter marks
            </button>
            <button type="button" onClick={() => window.print()} className="flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11.5px] font-medium text-foreground hover:bg-accent/60">
              <Printer className="h-3 w-3" /> Print schedule
            </button>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}
