import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Building2, ExternalLink, Mail, Paperclip, Phone, UserRound, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  SupportTicket, TicketPriority, TicketStatus,
} from "@/data/helpDeskData";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function TicketDetailsDrawer({
  ticket,
  open,
  onOpenChange,
  defaultTab = "details",
  onSendMessage,
  onAssign,
  onStatusChange,
  onEscalate,
}: {
  ticket: SupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: string;
  onSendMessage: (ticketId: number, body: string, isInternal: boolean, attachmentName?: string) => void;
  onAssign: (ticketId: number, assigneeName: string, dueDate: string, priority: TicketPriority, note: string, notify: boolean) => void;
  onStatusChange: (ticketId: number, status: TicketStatus, resolution?: { summary: string; category: string; notifyRequester: boolean }) => void;
  onEscalate: (ticketId: number, target: string, reason: string, dueDate: string, markUrgent: boolean) => void;
}) {
  const navigate = useNavigate();
  if (!ticket) return null;
  const r = ticket.requester;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col border-l border-border/60 bg-card shadow-2xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=open]:duration-300 data-[state=closed]:duration-200",
          )}
        >
          {/* Header */}
          <div className="shrink-0 border-b border-border/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[11.5px] text-muted-foreground">{ticket.ticketId}</p>
                <DialogPrimitive.Title className="mt-0.5 text-[15px] font-semibold leading-snug text-foreground">
                  {ticket.subject}
                </DialogPrimitive.Title>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" title="Open full page"
                  onClick={() => { onOpenChange(false); navigate(`/help/tickets/${ticket.id}`); }}>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <DialogPrimitive.Close asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><X className="h-4 w-4" /></Button>
                </DialogPrimitive.Close>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <TicketPriorityBadge priority={ticket.priority} />
              <TicketStatusBadge status={ticket.status} />
              <SlaBadge dueAt={ticket.sla.dueAt} status={ticket.sla.status} ticketStatus={ticket.status} />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>Created {formatDateTime(ticket.createdAt)}</span>
              <span>Updated {formatDateTime(ticket.updatedAt)}</span>
              <span>Requester role: {r.role}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {/* Requester info */}
            <div className="rounded-xl border border-border/60 p-3.5">
              <p className="text-[12.5px] font-semibold text-foreground">Requester Information</p>
              <div className="mt-2 grid grid-cols-2 gap-2.5 text-[12px]">
                <div className="col-span-2 flex items-center gap-2 text-foreground">
                  <UserRound className="h-3.5 w-3.5 text-muted-foreground" /> {r.name} <span className="text-muted-foreground">· {r.role}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {r.email}</div>
                <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {r.phone}</div>
                {r.className && (
                  <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> {r.className} — Section {r.section}
                  </div>
                )}
                {r.relatedChildName && (
                  <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> Related student: {r.relatedChildName}
                  </div>
                )}
                {r.department && !r.className && (
                  <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" /> Department: {r.department}
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" className="mt-3 h-7 text-[11.5px]" onClick={() => toast.info(`Opening profile — ${r.name}`)}>
                View Profile
              </Button>
            </div>

            {/* Issue details */}
            <div className="mt-4 rounded-xl border border-border/60 p-3.5">
              <p className="text-[12.5px] font-semibold text-foreground">Issue Details</p>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
                <span className="rounded-md bg-muted px-2 py-0.5">{ticket.category}</span>
                <span className="rounded-md bg-muted px-2 py-0.5">Module: {ticket.module}</span>
                <span className="rounded-md bg-muted px-2 py-0.5">Source: {ticket.source}</span>
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-foreground">{ticket.description}</p>
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
            </div>

            {/* Tabs */}
            <Tabs defaultValue={defaultTab} key={ticket.id} className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details" className="text-[11.5px]">Conversation</TabsTrigger>
                <TabsTrigger value="notes" className="text-[11.5px]">Notes</TabsTrigger>
                <TabsTrigger value="assign" className="text-[11.5px]">Assign</TabsTrigger>
                <TabsTrigger value="activity" className="text-[11.5px]">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-3">
                <TicketConversation messages={ticket.messages} requesterName={r.name} />
                <TicketMessageComposer onSend={(body, isInternal, attachmentName) => onSendMessage(ticket.id, body, isInternal, attachmentName)} />
              </TabsContent>

              <TabsContent value="notes">
                <TicketInternalNotes notes={ticket.internalNotes} />
              </TabsContent>

              <TabsContent value="assign">
                <TicketAssignmentPanel
                  ticket={ticket}
                  onAssign={(assigneeName, dueDate, priority, note, notify) => onAssign(ticket.id, assigneeName, dueDate, priority, note, notify)}
                  onStatusChange={(status, resolution) => onStatusChange(ticket.id, status, resolution)}
                  onEscalate={(target, reason, dueDate, markUrgent) => onEscalate(ticket.id, target, reason, dueDate, markUrgent)}
                />
              </TabsContent>

              <TabsContent value="activity">
                <TicketActivityTimeline activities={ticket.activities} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
