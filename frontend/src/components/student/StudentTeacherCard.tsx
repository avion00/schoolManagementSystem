import { Clock, MessageCircle, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Button } from "@/components/ui/button";
import type { StudentTeacher } from "@/data/studentDashboardData";
import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

export function StudentTeacherCard({ teacher, currentUserId }: { teacher: StudentTeacher; currentUserId: string }) {
  const navigate = useNavigate();

  function message() {
    const conv = messagesService.findOrCreateDirectConversation({
      currentUserId, otherUserId: teacher.chatUserId, otherUserName: teacher.name, otherUserRole: "Teacher",
      subtitle: `${teacher.subject} teacher`,
    });
    realtimeService.refreshConversations();
    navigate(`/student/messages/${conv.id}`);
  }

  return (
    <PremiumCard className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <StudentAvatar name={teacher.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[13px] font-medium text-foreground">{teacher.name}</p>
            {teacher.isClassTeacher && <PremiumBadge label="Class Teacher" tone="info" />}
          </div>
          <p className="truncate text-[11.5px] text-muted-foreground">{teacher.subject} · {teacher.department}</p>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {teacher.officeHours}</p>
      {teacher.latestMaterial && <p className="truncate text-[11.5px] text-muted-foreground">Latest: {teacher.latestMaterial}</p>}
      <div className="mt-auto flex gap-2 border-t border-border/60 pt-3">
        <Button size="sm" variant="outline" className="h-8 flex-1 gap-1.5 text-[12px]" onClick={message}>
          <MessageSquare className="h-3.5 w-3.5" /> Message
        </Button>
        <Button size="sm" variant="ghost" className="h-8 flex-1 gap-1.5 text-[12px]" onClick={() => navigate("/student/ask-teacher")}>
          <MessageCircle className="h-3.5 w-3.5" /> Ask
        </Button>
      </div>
    </PremiumCard>
  );
}
