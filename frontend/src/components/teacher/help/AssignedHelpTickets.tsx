import { CheckCircle2, ClipboardCheck, Inbox, MessageSquare, ShieldQuestion } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { TicketPriorityBadge } from "@/components/teacher/help/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/teacher/help/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { assignedStudents } from "@/data/teacherDashboardData";
import type { AssignedTicket } from "@/data/teacherHelpData";
import { guardianChatUserIdForStudent, studentChatUserId } from "@/data/messagesData";
import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

export function AssignedHelpTickets({
  tickets,
  currentUserId,
  onView,
  onMarkHandled,
  onRequestAdminSupport,
}: {
  tickets: AssignedTicket[];
  currentUserId: string;
  onView: (id: string) => void;
  onMarkHandled: (id: string) => void;
  onRequestAdminSupport: (ticket: AssignedTicket) => void;
}) {
  const navigate = useNavigate();

  function messageCounterpart(ticket: AssignedTicket) {
    const student = assignedStudents.find((s) => s.name === ticket.relatedStudent);
    if (!student) {
      toast.error("No linked student on this ticket to message.");
      return;
    }
    const isParent = ticket.requesterRole === "Parent";
    const otherUserId = isParent ? guardianChatUserIdForStudent(student.id) : studentChatUserId(student.id);
    const otherUserName = isParent ? student.guardian : student.name;
    const conv = messagesService.findOrCreateDirectConversation({
      currentUserId,
      otherUserId,
      otherUserName,
      otherUserRole: isParent ? "Parent" : "Student",
      subtitle: isParent ? `Guardian of ${student.name} · ${student.className}-${student.section}` : `${student.className}-${student.section}`,
      relatedStudentId: String(student.id),
      relatedClassId: student.classId,
    });
    realtimeService.refreshConversations();
    navigate(`/teacher/messages/${conv.id}`);
  }

  if (tickets.length === 0) {
    return <PremiumEmptyState icon={Inbox} title="Nothing assigned right now" description="Tickets admin or principal route to you will show up here." />;
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket, i) => (
        <PremiumCard key={ticket.id} className="t-row-in p-4" style={{ "--row-index": i } as React.CSSProperties}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[11px] text-muted-foreground">{ticket.id}</span>
                <TicketPriorityBadge priority={ticket.priority} />
                <TicketStatusBadge status={ticket.status} />
              </div>
              <button type="button" onClick={() => onView(ticket.id)} className="mt-1 block truncate text-left text-[13.5px] font-medium text-foreground hover:underline">
                {ticket.title}
              </button>
              <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                {ticket.requester} ({ticket.requesterRole})
                {ticket.relatedStudent && <> · {ticket.relatedStudent}</>}
                {ticket.relatedClass && <> · {ticket.relatedClass}</>}
              </p>
            </div>
            <span className="shrink-0 text-[11.5px] text-muted-foreground">Due {ticket.dueDate}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => onView(ticket.id)}>
              <ClipboardCheck className="h-3.5 w-3.5" /> Open
            </Button>
            {ticket.relatedStudent && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => messageCounterpart(ticket)}>
                <MessageSquare className="h-3.5 w-3.5" /> Message {ticket.requesterRole === "Parent" ? "parent" : "student"}
              </Button>
            )}
            {ticket.status !== "Resolved" && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => onMarkHandled(ticket.id)}>
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark as handled
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-[12px] text-muted-foreground" onClick={() => onRequestAdminSupport(ticket)}>
              <ShieldQuestion className="h-3.5 w-3.5" /> Request admin support
            </Button>
          </div>
        </PremiumCard>
      ))}
    </div>
  );
}
