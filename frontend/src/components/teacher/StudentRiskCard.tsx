import { CalendarClock, MessageSquare, NotebookPen, ShieldPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { StudentRiskBadge } from "@/components/teacher/StudentRiskBadge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { RiskLevel } from "@/data/teacherDashboardData";

export interface StudentInsightEntry {
  studentId: number;
  name: string;
  className: string;
  section: string;
  reason: string;
  attendancePercentage?: number;
  avgMarks?: number;
  missingHomework?: number;
  guardian?: string;
  riskLevel?: RiskLevel;
}

/** One student in any Student Insights tab — same card shape everywhere so teachers learn it once. */
export function StudentRiskCard({ entry, index }: { entry: StudentInsightEntry; index: number }) {
  const navigate = useNavigate();

  return (
    <PremiumCard className="t-row-in flex flex-col gap-3 p-4" style={{ "--row-index": index } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <StudentAvatar name={entry.name} />
          <div className="min-w-0">
            <button type="button" className="truncate text-[13px] font-medium text-foreground hover:underline" onClick={() => navigate(`/teacher/students/${entry.studentId}`)}>
              {entry.name}
            </button>
            <p className="text-[11px] text-muted-foreground">{entry.className}-{entry.section}</p>
          </div>
        </div>
        {entry.riskLevel && <StudentRiskBadge level={entry.riskLevel} />}
      </div>

      <p className="rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11.5px] text-muted-foreground">{entry.reason}</p>

      <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
        {entry.attendancePercentage !== undefined && (
          <div><p className="font-semibold tabular-nums text-foreground">{entry.attendancePercentage.toFixed(0)}%</p><p className="text-muted-foreground">Attendance</p></div>
        )}
        {entry.avgMarks !== undefined && (
          <div><p className="font-semibold tabular-nums text-foreground">{entry.avgMarks}</p><p className="text-muted-foreground">Avg marks</p></div>
        )}
        {entry.missingHomework !== undefined && (
          <div><p className="font-semibold tabular-nums text-foreground">{entry.missingHomework}</p><p className="text-muted-foreground">Missing HW</p></div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 border-t border-border/60 pt-3">
        <Button variant="outline" size="sm" className="h-8 gap-1 px-1 text-[10.5px]" onClick={() => toast.success(`Note added for ${entry.name} (demo)`)}>
          <NotebookPen className="h-3.5 w-3.5" /> Note
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-1 text-[10.5px]" onClick={() => toast.info(`Opening a message to ${entry.guardian ?? "the guardian"} — coming soon`)}>
          <MessageSquare className="h-3.5 w-3.5" /> Message
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1 px-1 text-[10.5px]" onClick={() => navigate("/teacher/parents")}>
          <CalendarClock className="h-3.5 w-3.5" /> Meeting
        </Button>
      </div>
      {entry.riskLevel === "High Risk" && (
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[11px] text-muted-foreground" onClick={() => toast.success(`Support plan started for ${entry.name} (demo)`)}>
          <ShieldPlus className="h-3.5 w-3.5" /> Create support plan
        </Button>
      )}
    </PremiumCard>
  );
}
