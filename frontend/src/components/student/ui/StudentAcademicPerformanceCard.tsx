import { Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { StudentStatusPill } from "@/components/student/ui/StudentStatusPill";
import { cn } from "@/lib/utils";

export interface StudentSubjectResult {
  subject: string;
  total: number;
  fullMarks: number;
  grade: string;
  result: "Pass" | "Fail";
}

/** Wide "academic performance" report summary — term header + per-subject progress rows. */
export function StudentAcademicPerformanceCard({
  term,
  percentage,
  gpa,
  subjects,
  viewAllTo = "/student/results",
}: {
  term: string;
  percentage: number;
  gpa: number;
  subjects: StudentSubjectResult[];
  viewAllTo?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
      <StudentSectionHeader
        icon={Award}
        title={`Academic Performance · ${term}`}
        action={
          <button type="button" onClick={() => navigate(viewAllTo)} className="text-[12px] font-medium text-primary hover:underline">
            View all results
          </button>
        }
      />
      <div className="mb-4 flex items-center gap-6 rounded-xl bg-muted/40 px-4 py-3">
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Overall</p>
          <p className="font-display text-xl font-bold tabular-nums text-foreground">{percentage}%</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">GPA</p>
          <p className="font-display text-xl font-bold tabular-nums text-foreground">{gpa}</p>
        </div>
      </div>
      <div className="space-y-3">
        {subjects.map((s) => {
          const pct = Math.round((s.total / s.fullMarks) * 100);
          return (
            <div key={s.subject}>
              <div className="mb-1 flex items-center justify-between text-[12.5px]">
                <span className="font-medium text-foreground">{s.subject}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-muted-foreground">{s.total}/{s.fullMarks}</span>
                  <StudentStatusPill label={s.grade} tone={s.result === "Pass" ? "success" : "danger"} />
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-700", pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-500")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
