import { useState } from "react";
import {
  Activity, Building2, ChevronLeft, ClipboardList, MessageSquare, Mail, Paperclip, Phone, Settings2, StickyNote, UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { RelatedRecordsCard } from "@/components/helpdesk/RelatedRecordsCard";
import { SlaBadge } from "@/components/helpdesk/SlaBadge";
import { TicketActivityTimeline } from "@/components/helpdesk/TicketActivityTimeline";
import { TicketAssignmentPanel } from "@/components/helpdesk/TicketAssignmentPanel";
import { TicketConversation } from "@/components/helpdesk/TicketConversation";
import { TicketInternalNotes } from "@/components/helpdesk/TicketInternalNotes";
import { TicketMessageComposer } from "@/components/helpdesk/TicketMessageComposer";
import { TicketPriorityBadge } from "@/components/helpdesk/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/helpdesk/TicketStatusBadge";
import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/ui/DetailCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  ASSIGNEE_DIRECTORY, SUPPORT_TICKETS,
  type SupportTicket, type TicketPriority, type TicketStatus,
} from "@/data/helpDeskData";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function HelpTicketDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<SupportTicket | undefined>(() => SUPPORT_TICKETS.find((t) => String(t.id) === id));

  if (!ticket) {
    return (
      <PremiumCard className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-[13px] font-medium text-foreground">Ticket not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/help")}>Back to Help Desk</Button>
      </PremiumCard>
    );
  }

  function update(patch: Partial<SupportTicket> | ((t: SupportTicket) => SupportTicket)) {
    setTicket((prev) => {
      if (!prev) return prev;
      return typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
    });
  }

  function sendMessage(_ticketId: number, body: string, isInternal: boolean, attachmentName?: string) {
    const now = new Date().toISOString();
    const attachments = attachmentName ? [{ id: Date.now(), name: attachmentName, size: "—", type: "File" }] : [];
    update((t) => ({
      ...t,
      updatedAt: now,
      messages: isInternal ? t.messages : [...t.messages, { id: Date.now(), author: "Super Admin", authorRole: "Support Team", body, isInternal: false, timestamp: now, attachments }],
      internalNotes: isInternal ? [...t.internalNotes, { id: Date.now(), author: "Super Admin", authorRole: "Support Team", body, isInternal: true, timestamp: now, attachments }] : t.internalNotes,
      activities: [...t.activities, { id: Date.now(), action: isInternal ? "Internal note added" : "Admin replied", by: "Super Admin", at: now }],
    }));
    console.log("Ticket message:", { body, isInternal, attachmentName });
    toast.success(isInternal ? "Internal note added." : "Reply sent.");
  }

  function assign(_ticketId: number, assigneeName: string, dueDate: string, priority: TicketPriority, note: string, notify: boolean) {
    const assignee = ASSIGNEE_DIRECTORY.find((a) => a.name === assigneeName) ?? null;
    const now = new Date().toISOString();
    update((t) => ({
      ...t,
      assignedTo: assignee,
      priority,
      status: t.status === "New" || t.status === "Open" ? "Assigned" : t.status,
      updatedAt: now,
      internalNotes: note ? [...t.internalNotes, { id: Date.now(), author: "Super Admin", authorRole: "Support Team", body: note, isInternal: true, timestamp: now, attachments: [] }] : t.internalNotes,
      activities: [...t.activities, { id: Date.now(), action: `Assigned to ${assigneeName}${assignee ? ` (${assignee.department})` : ""}`, by: "Super Admin", at: now }],
    }));
    console.log("Assigned ticket:", { assigneeName, dueDate, priority, note, notify });
  }

  function statusChange(_ticketId: number, status: TicketStatus, resolution?: { summary: string; category: string; notifyRequester: boolean }) {
    const now = new Date().toISOString();
    update((t) => ({
      ...t,
      status,
      updatedAt: now,
      resolutionSummary: resolution?.summary ?? t.resolutionSummary,
      resolutionCategory: resolution?.category ?? t.resolutionCategory,
      messages: resolution ? [...t.messages, { id: Date.now(), author: "Super Admin", authorRole: "Support Team", body: resolution.summary, isInternal: false, timestamp: now, attachments: [] }] : t.messages,
      activities: [...t.activities, { id: Date.now(), action: `Status changed to ${status}`, by: "Super Admin", at: now }],
    }));
    console.log("Status changed:", { status, resolution });
  }

  function escalate(_ticketId: number, target: string, reason: string, dueDate: string, markUrgent: boolean) {
    const now = new Date().toISOString();
    update((t) => ({
      ...t,
      status: "Escalated",
      priority: markUrgent ? "Urgent" : t.priority,
      escalationReason: reason,
      updatedAt: now,
      activities: [...t.activities, { id: Date.now(), action: `Escalated to ${target} — ${reason}`, by: "Super Admin", at: now }],
    }));
    console.log("Escalated ticket:", { target, reason, dueDate, markUrgent });
  }

  const r = ticket.requester;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[12.5px]" onClick={() => navigate("/help")}>
        <ChevronLeft className="h-3.5 w-3.5" /> Back to Help Desk
      </Button>

      <PremiumCard className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[12px] text-muted-foreground">{ticket.ticketId}</p>
            <h1 className="mt-0.5 text-lg font-semibold text-foreground">{ticket.subject}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <TicketPriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
            <SlaBadge dueAt={ticket.sla.dueAt} status={ticket.sla.status} ticketStatus={ticket.status} />
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11.5px] text-muted-foreground">
          <span>Created {formatDateTime(ticket.createdAt)}</span>
          <span>Updated {formatDateTime(ticket.updatedAt)}</span>
          <span>Requester role: {r.role}</span>
          <span>Category: {ticket.category}</span>
          <span>Module: {ticket.module}</span>
          <span>Source: {ticket.source}</span>
        </div>
      </PremiumCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-4 lg:col-span-2">
          <DetailCard icon={ClipboardList} title="Issue Details">
            <p className="text-[12.5px] leading-relaxed text-foreground">{ticket.description}</p>
            {ticket.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ticket.attachments.map((a) => (
                  <span key={a.id} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                    <Paperclip className="h-3 w-3" /> {a.name} · {a.size}
                  </span>
                ))}
              </div>
            )}
            {ticket.relatedRecords.length > 0 && (
              <div className="mt-3">
                <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">Related Records</p>
                <RelatedRecordsCard records={ticket.relatedRecords} />
              </div>
            )}
          </DetailCard>

          <DetailCard icon={MessageSquare} title="Conversation">
            <div className="space-y-3">
              <TicketConversation messages={ticket.messages} requesterName={r.name} />
              <TicketMessageComposer onSend={(body, isInternal, attachmentName) => sendMessage(ticket.id, body, isInternal, attachmentName)} />
            </div>
          </DetailCard>

          <DetailCard icon={StickyNote} title="Internal Notes">
            <TicketInternalNotes notes={ticket.internalNotes} />
          </DetailCard>

          <DetailCard icon={Activity} title="Activity Timeline">
            <TicketActivityTimeline activities={ticket.activities} />
          </DetailCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <DetailCard icon={UserRound} title="Requester Information">
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center gap-2 text-foreground"><UserRound className="h-3.5 w-3.5 text-muted-foreground" /> {r.name} <span className="text-muted-foreground">· {r.role}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {r.email}</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {r.phone}</div>
              {r.className && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-3.5 w-3.5" /> {r.className} — Section {r.section}</div>}
              {r.relatedChildName && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-3.5 w-3.5" /> Related student: {r.relatedChildName}</div>}
              {r.department && !r.className && <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-3.5 w-3.5" /> Department: {r.department}</div>}
              <Button variant="outline" size="sm" className="mt-1 h-7 text-[11.5px]" onClick={() => toast.info(`Opening profile — ${r.name}`)}>View Profile</Button>
            </div>
          </DetailCard>

          <DetailCard icon={Settings2} title="Manage Ticket">
            <TicketAssignmentPanel
              ticket={ticket}
              onAssign={(assigneeName, dueDate, priority, note, notify) => assign(ticket.id, assigneeName, dueDate, priority, note, notify)}
              onStatusChange={(status, resolution) => statusChange(ticket.id, status, resolution)}
              onEscalate={(target, reason, dueDate, markUrgent) => escalate(ticket.id, target, reason, dueDate, markUrgent)}
            />
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
