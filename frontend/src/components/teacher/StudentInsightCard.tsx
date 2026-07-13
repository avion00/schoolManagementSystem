import { useNavigate } from "react-router-dom";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { StudentRiskBadge } from "@/components/teacher/StudentRiskBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { computeRiskLevel, marksForStudent, type AssignedStudent } from "@/data/teacherDashboardData";

export function StudentInsightCard({ student, lastParentContact }: { student: AssignedStudent; lastParentContact?: string }) {
  const navigate = useNavigate();
  const risk = computeRiskLevel(student);

  return (
    <PremiumCard
      hoverable
      className="cursor-pointer p-4"
      onClick={() => navigate(`/teacher/students/${student.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <StudentAvatar name={student.name} />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{student.name}</p>
            <p className="text-[11px] text-muted-foreground">{student.className}-{student.section} · Roll {student.roll}</p>
          </div>
        </div>
        <StudentRiskBadge level={risk} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 py-1.5">
          <p className="text-[13px] font-bold tabular-nums text-foreground">{student.attendancePercentage.toFixed(0)}%</p>
          <p className="text-[10px] text-muted-foreground">Attendance</p>
        </div>
        <div className="rounded-lg bg-muted/50 py-1.5">
          <p className="text-[13px] font-bold tabular-nums text-foreground">{marksForStudent(student)}</p>
          <p className="text-[10px] text-muted-foreground">Avg marks</p>
        </div>
        <div className="rounded-lg bg-muted/50 py-1.5">
          <p className="text-[13px] font-bold tabular-nums text-foreground">{student.pendingHomework}</p>
          <p className="text-[10px] text-muted-foreground">HW pending</p>
        </div>
      </div>

      {lastParentContact && (
        <p className="mt-2 text-[11px] text-muted-foreground">Last parent contact: {lastParentContact}</p>
      )}
    </PremiumCard>
  );
}
