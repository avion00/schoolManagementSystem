import { CheckCircle2, MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { Button } from "@/components/ui/button";
import { assignedStudents } from "@/data/teacherDashboardData";
import { guardianChatUserIdForStudent } from "@/data/messagesData";
import type { StudentSupportCase } from "@/data/teacherHelpData";
import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

const ISSUE_TONE: Record<StudentSupportCase["issueType"], PremiumBadgeTone> = {
  "Attendance concern": "warning",
  "Homework concern": "info",
  "Academic support": "purple",
  "Follow-up": "neutral",
};

export function StudentSupportCases({
  cases,
  currentUserId,
  onResolve,
}: {
  cases: StudentSupportCase[];
  currentUserId: string;
  onResolve: (id: string) => void;
}) {
  const navigate = useNavigate();

  function messageGuardian(c: StudentSupportCase) {
    const student = assignedStudents.find((s) => s.id === c.studentId);
    if (!student) return;
    const conv = messagesService.findOrCreateDirectConversation({
      currentUserId,
      otherUserId: guardianChatUserIdForStudent(student.id),
      otherUserName: student.guardian,
      otherUserRole: "Parent",
      subtitle: `Guardian of ${student.name} · ${student.className}-${student.section}`,
      relatedStudentId: String(student.id),
      relatedClassId: student.classId,
    });
    realtimeService.refreshConversations();
    navigate(`/teacher/messages/${conv.id}`);
  }

  const open = cases.filter((c) => !c.resolved);

  if (open.length === 0) {
    return <PremiumEmptyState icon={Users} title="All caught up" description="No open student or parent follow-ups right now." />;
  }

  return (
    <div className="space-y-2.5">
      {open.map((c) => (
        <PremiumCard key={c.id} className="p-3.5">
          <div className="flex items-center gap-3">
            <StudentAvatar name={c.studentName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{c.studentName}</p>
              <p className="truncate text-[11.5px] text-muted-foreground">{c.className}-{c.section} · {c.note}</p>
            </div>
            <PremiumBadge label={c.issueType} tone={ISSUE_TONE[c.issueType]} className="shrink-0" />
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border/60 pt-2.5">
            <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11.5px]" onClick={() => messageGuardian(c)}>
              <MessageSquare className="h-3.5 w-3.5" /> Message parent
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11.5px]" onClick={() => toast.success(`Note added for ${c.studentName}.`)}>
              Add note
            </Button>
            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-[11.5px] text-muted-foreground" onClick={() => onResolve(c.id)}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
            </Button>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}
