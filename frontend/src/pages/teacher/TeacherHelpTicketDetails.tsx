import { ArrowLeft, CheckCircle2, ShieldQuestion, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { TicketConversation } from "@/components/teacher/help/TicketConversation";
import { TicketPriorityBadge } from "@/components/teacher/help/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/teacher/help/TicketStatusBadge";
import { TicketTimeline } from "@/components/teacher/help/TicketTimeline";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  addTicketReply,
  assignedTickets,
  closeMyRequest,
  findTicket,
  markAssignedHandled,
  requestAdminSupportFor,
  ticketConversations,
} from "@/data/teacherHelpData";

export function TeacherHelpTicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [, forceRender] = useState(0);

  const ticket = ticketId ? findTicket(ticketId) : undefined;
  const thread = ticketId ? ticketConversations[ticketId] : undefined;

  if (!ticket) {
    return (
      <PremiumCard className="flex flex-col items-center gap-2 p-10 text-center">
        <p className="text-[13.5px] font-medium text-foreground">Ticket not found</p>
        <Button variant="outline" onClick={() => navigate("/teacher/help")}>Back to Help Center</Button>
      </PremiumCard>
    );
  }

  function refresh() {
    forceRender((n) => n + 1);
  }

  function reply(body: string) {
    addTicketReply(ticket!.id, body);
    refresh();
  }

  function markResolved() {
    markAssignedHandled(ticket!.id);
    refresh();
    toast.success("Marked as handled.");
  }

  function closeRequest() {
    closeMyRequest(ticket!.id);
    refresh();
    toast.success("Request closed.");
  }

  function askAdmin() {
    const full = assignedTickets.find((t) => t.id === ticket!.id);
    if (!full) return;
    requestAdminSupportFor(full);
    toast.success("Admin support requested — tracked under My Requests.");
    navigate("/teacher/help");
  }

  function escalateToPrincipal() {
    addTicketReply(ticket!.id, "Escalating this to Principal for review.", "Demo Teacher");
    refresh();
    toast.success("Escalated to Principal.");
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-[12.5px]" onClick={() => navigate("/teacher/help")}>
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Help Center
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <PremiumCard className="p-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[11px] text-muted-foreground">{ticket.id}</span>
              <TicketPriorityBadge priority={ticket.priority} />
              <TicketStatusBadge status={ticket.status} />
            </div>
            <h1 className="mt-1.5 text-[16px] font-semibold text-foreground">{ticket.title}</h1>
            <p className="mt-1 text-[13px] text-muted-foreground">{ticket.description}</p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t border-border/60 pt-3 text-[12px] text-muted-foreground">
              <span>{ticket.kind === "mine" ? "Sent to" : "Requester"}: <span className="text-foreground">{ticket.counterpartLabel}</span></span>
              {ticket.relatedClass && <span>Class: <span className="text-foreground">{ticket.relatedClass}</span></span>}
              {ticket.relatedStudent && <span>Student: <span className="text-foreground">{ticket.relatedStudent}</span></span>}
              {ticket.dueDate && <span>Due: <span className="text-foreground">{ticket.dueDate}</span></span>}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 border-t border-border/60 pt-3">
              {ticket.kind === "assigned" && ticket.status !== "Resolved" && (
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={markResolved}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark resolved
                </Button>
              )}
              {ticket.kind === "mine" && ticket.status !== "Closed" && (
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={closeRequest}>
                  <X className="h-3.5 w-3.5" /> Close request
                </Button>
              )}
              {ticket.kind === "assigned" && (
                <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-[12px] text-muted-foreground" onClick={askAdmin}>
                  <ShieldQuestion className="h-3.5 w-3.5" /> Ask admin for help
                </Button>
              )}
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-[12px] text-muted-foreground" onClick={escalateToPrincipal}>
                Escalate to principal
              </Button>
            </div>
          </PremiumCard>

          <PremiumCard className="overflow-hidden">
            <TicketConversation messages={thread?.messages ?? []} onReply={reply} />
          </PremiumCard>
        </div>

        <PremiumCard className="p-4">
          <p className="mb-3 text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">Activity</p>
          <TicketTimeline activities={thread?.activities ?? []} />
        </PremiumCard>
      </div>
    </div>
  );
}
