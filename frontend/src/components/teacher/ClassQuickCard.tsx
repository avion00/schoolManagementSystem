import { CalendarCheck, ClipboardList, MessageSquare, PenLine } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  assignedStudents,
  marksForStudent,
  pendingAttendance,
  type AssignedClass,
} from "@/data/teacherDashboardData";

/** The one practical class card — used by My Classes (grid) and the Dashboard/Today previews. */
export function ClassQuickCard({ cls, index }: { cls: AssignedClass; index: number }) {
  const navigate = useNavigate();
  const students = assignedStudents.filter((s) => s.classId === cls.id);
  const avgMarks = students.length ? Math.round(students.reduce((sum, s) => sum + marksForStudent(s), 0) / students.length) : 0;
  const attendanceMarked = !pendingAttendance.some((p) => p.classId === cls.id);

  return (
    <PremiumCard hoverable className="t-row-in flex flex-col gap-3 p-4" style={{ "--row-index": index } as React.CSSProperties}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" className="text-left" onClick={() => navigate(`/teacher/classes/${cls.id}`)}>
          <p className="text-[14px] font-semibold text-foreground hover:underline">{cls.className} · {cls.section}</p>
          <p className="text-[12px] text-muted-foreground">{cls.subject} · {cls.room}</p>
        </button>
        {cls.isClassTeacher && <PremiumBadge label="Class Teacher" tone="purple" />}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-muted/50 py-2">
          <p className="text-[15px] font-bold tabular-nums text-foreground">{cls.students}</p>
          <p className="text-[10.5px] text-muted-foreground">Students</p>
        </div>
        <div className="rounded-xl bg-muted/50 py-2">
          <p className="text-[15px] font-bold tabular-nums text-foreground">{avgMarks}</p>
          <p className="text-[10.5px] text-muted-foreground">Avg. performance</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11.5px]">
        <PremiumBadge label={attendanceMarked ? "Attendance marked" : "Attendance pending"} tone={attendanceMarked ? "success" : "warning"} />
        {cls.pendingMarks > 0 && <span className="text-muted-foreground">{cls.pendingMarks} pending marks</span>}
      </div>

      <p className="text-[11.5px] text-muted-foreground">
        Next class: <span className="font-medium text-foreground">{cls.nextClass}</span>
      </p>

      <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-3">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => navigate(`/teacher/attendance?class=${cls.id}`)}>
          <CalendarCheck className="h-3.5 w-3.5" /> Attendance
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => navigate(`/teacher/assignments?class=${cls.id}`)}>
          <ClipboardList className="h-3.5 w-3.5" /> Homework
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => navigate(`/teacher/marks?class=${cls.id}`)}>
          <PenLine className="h-3.5 w-3.5" /> Marks
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => toast.info(`Message composer for ${cls.className}-${cls.section} — coming soon`)}>
          <MessageSquare className="h-3.5 w-3.5" /> Parents
        </Button>
      </div>
    </PremiumCard>
  );
}
