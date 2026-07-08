import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { BulkTicketActions } from "@/components/helpdesk/BulkTicketActions";
import { CreateTicketModal, type NewTicketFormData } from "@/components/helpdesk/CreateTicketModal";
import { HelpDeskSummaryCards } from "@/components/helpdesk/HelpDeskSummaryCards";
import { DEFAULT_TICKET_FILTERS, HelpDeskToolbar, type TicketFilters } from "@/components/helpdesk/HelpDeskToolbar";
import { SupportAnalytics } from "@/components/helpdesk/SupportAnalytics";
import { TicketCategoryCards } from "@/components/helpdesk/TicketCategoryCards";
import { TicketDetailsDrawer } from "@/components/helpdesk/TicketDetailsDrawer";
import { TicketInboxTable, type TicketAction } from "@/components/helpdesk/TicketInboxTable";
import { Reveal, SlidingTabs } from "@/components/motion";
import {
  ASSIGNEE_DIRECTORY, SUPPORT_TICKETS, createTicketFromForm,
  type SupportTicket, type TicketPriority, type TicketStatus,
} from "@/data/helpDeskData";

const ROLE_TABS = [
  { value: "all", label: "All Tickets" },
  { value: "Student", label: "Students" },
  { value: "Parent", label: "Parents" },
  { value: "Teacher", label: "Teachers" },
  { value: "Staff", label: "Staff" },
  { value: "Accountant", label: "Accountant" },
  { value: "Librarian", label: "Library" },
  { value: "Transport Staff", label: "Transport" },
  { value: "Principal", label: "Principal" },
  { value: "technical", label: "Technical" },
];

export function HelpDeskPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>(SUPPORT_TICKETS);
  const [roleTab, setRoleTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_TICKET_FILTERS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [drawerTicketId, setDrawerTicketId] = useState<number | null>(null);
  const [drawerTab, setDrawerTab] = useState("details");
  const [createOpen, setCreateOpen] = useState(false);

  const drawerTicket = tickets.find((t) => t.id === drawerTicketId) ?? null;

  const filteredTickets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (roleTab === "technical") {
        if (t.category !== "Technical Bug" && t.category !== "Account/Login Issue") return false;
      } else if (roleTab !== "all" && t.requester.role !== roleTab) {
        return false;
      }
      if (q) {
        const haystack = `${t.ticketId} ${t.requester.name} ${t.subject} ${t.category}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (filters.priority !== "all" && t.priority !== filters.priority) return false;
      if (filters.role !== "all" && t.requester.role !== filters.role) return false;
      if (filters.category !== "all" && t.category !== filters.category) return false;
      if (filters.assignedTo !== "all") {
        if (filters.assignedTo === "unassigned" ? t.assignedTo !== null : t.assignedTo?.name !== filters.assignedTo) return false;
      }
      if (filters.slaStatus !== "all" && t.sla.status !== filters.slaStatus) return false;
      if (filters.department !== "all" && t.assignedTo?.department !== filters.department) return false;
      if (filters.source !== "all" && t.source !== filters.source) return false;
      if (filters.dateRange !== "all") {
        const ageMs = Date.now() - new Date(t.createdAt).getTime();
        const limit = filters.dateRange === "today" ? 24 : filters.dateRange === "7d" ? 24 * 7 : 24 * 30;
        if (ageMs > limit * 3600_000) return false;
      }
      return true;
    });
  }, [tickets, roleTab, search, filters]);

  function updateTicket(id: number, patch: Partial<SupportTicket> | ((t: SupportTicket) => SupportTicket)) {
    setTickets((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      return typeof patch === "function" ? patch(t) : { ...t, ...patch };
    }));
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleSelectAll(ids: number[], checked: boolean) {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, ...ids])) : prev.filter((id) => !ids.includes(id))));
  }

  function openTicket(ticket: SupportTicket, action?: TicketAction) {
    setDrawerTicketId(ticket.id);
    setDrawerTab(action === "assign" || action === "resolve" ? "assign" : "details");
  }

  function quickAction(ticket: SupportTicket, action: TicketAction) {
    if (action === "escalate") {
      updateTicket(ticket.id, (t) => ({
        ...t, status: "Escalated", priority: "Urgent", updatedAt: new Date().toISOString(),
        activities: [...t.activities, { id: Date.now(), action: "Escalated by Super Admin", by: "Super Admin", at: new Date().toISOString() }],
      }));
      console.log("Escalated ticket:", ticket.ticketId);
      toast.success(`${ticket.ticketId} escalated.`);
    } else if (action === "close") {
      updateTicket(ticket.id, (t) => ({
        ...t, status: "Closed", updatedAt: new Date().toISOString(),
        activities: [...t.activities, { id: Date.now(), action: "Closed by Super Admin", by: "Super Admin", at: new Date().toISOString() }],
      }));
      console.log("Closed ticket:", ticket.ticketId);
      toast.success(`${ticket.ticketId} closed.`);
    } else if (action === "delete") {
      if (!window.confirm(`Delete ${ticket.ticketId}? This cannot be undone.`)) return;
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
      console.log("Deleted ticket:", ticket.ticketId);
      toast.success(`${ticket.ticketId} deleted.`);
    }
  }

  function sendMessage(ticketId: number, body: string, isInternal: boolean, attachmentName?: string) {
    const now = new Date().toISOString();
    const attachments = attachmentName ? [{ id: Date.now(), name: attachmentName, size: "—", type: "File" }] : [];
    updateTicket(ticketId, (t) => ({
      ...t,
      updatedAt: now,
      messages: isInternal ? t.messages : [...t.messages, { id: Date.now(), author: "Super Admin", authorRole: "Support Team", body, isInternal: false, timestamp: now, attachments }],
      internalNotes: isInternal ? [...t.internalNotes, { id: Date.now(), author: "Super Admin", authorRole: "Support Team", body, isInternal: true, timestamp: now, attachments }] : t.internalNotes,
      activities: [...t.activities, { id: Date.now(), action: isInternal ? "Internal note added" : "Admin replied", by: "Super Admin", at: now }],
    }));
    console.log("Ticket message:", { ticketId, body, isInternal, attachmentName });
    toast.success(isInternal ? "Internal note added." : "Reply sent.");
  }

  function assignTicket(ticketId: number, assigneeName: string, dueDate: string, priority: TicketPriority, note: string, notify: boolean) {
    const assignee = ASSIGNEE_DIRECTORY.find((a) => a.name === assigneeName) ?? null;
    const now = new Date().toISOString();
    updateTicket(ticketId, (t) => ({
      ...t,
      assignedTo: assignee,
      priority,
      status: t.status === "New" || t.status === "Open" ? "Assigned" : t.status,
      updatedAt: now,
      internalNotes: note ? [...t.internalNotes, { id: Date.now(), author: "Super Admin", authorRole: "Support Team", body: note, isInternal: true, timestamp: now, attachments: [] }] : t.internalNotes,
      activities: [...t.activities, { id: Date.now(), action: `Assigned to ${assigneeName}${assignee ? ` (${assignee.department})` : ""}`, by: "Super Admin", at: now }],
    }));
    console.log("Assigned ticket:", { ticketId, assigneeName, dueDate, priority, note, notify });
  }

  function statusChange(ticketId: number, status: TicketStatus, resolution?: { summary: string; category: string; notifyRequester: boolean }) {
    const now = new Date().toISOString();
    updateTicket(ticketId, (t) => ({
      ...t,
      status,
      updatedAt: now,
      resolutionSummary: resolution?.summary ?? t.resolutionSummary,
      resolutionCategory: resolution?.category ?? t.resolutionCategory,
      messages: resolution ? [...t.messages, { id: Date.now(), author: "Super Admin", authorRole: "Support Team", body: resolution.summary, isInternal: false, timestamp: now, attachments: [] }] : t.messages,
      activities: [...t.activities, { id: Date.now(), action: `Status changed to ${status}`, by: "Super Admin", at: now }],
    }));
    console.log("Status changed:", { ticketId, status, resolution });
  }

  function escalateTicket(ticketId: number, target: string, reason: string, dueDate: string, markUrgent: boolean) {
    const now = new Date().toISOString();
    updateTicket(ticketId, (t) => ({
      ...t,
      status: "Escalated",
      priority: markUrgent ? "Urgent" : t.priority,
      escalationReason: reason,
      updatedAt: now,
      activities: [...t.activities, { id: Date.now(), action: `Escalated to ${target} — ${reason}`, by: "Super Admin", at: now }],
    }));
    console.log("Escalated ticket:", { ticketId, target, reason, dueDate, markUrgent });
  }

  function bulkAssign(assigneeName: string) {
    const assignee = ASSIGNEE_DIRECTORY.find((a) => a.name === assigneeName) ?? null;
    const now = new Date().toISOString();
    setTickets((prev) => prev.map((t) => (selectedIds.includes(t.id)
      ? { ...t, assignedTo: assignee, updatedAt: now, activities: [...t.activities, { id: Date.now(), action: `Bulk-assigned to ${assigneeName}`, by: "Super Admin", at: now }] }
      : t)));
    console.log("Bulk assign:", selectedIds, assigneeName);
    toast.success(`${selectedIds.length} ticket(s) assigned to ${assigneeName}.`);
    setSelectedIds([]);
  }
  function bulkPriority(priority: TicketPriority) {
    setTickets((prev) => prev.map((t) => (selectedIds.includes(t.id) ? { ...t, priority, updatedAt: new Date().toISOString() } : t)));
    console.log("Bulk priority:", selectedIds, priority);
    toast.success(`Priority set to ${priority} for ${selectedIds.length} ticket(s).`);
    setSelectedIds([]);
  }
  function bulkStatus(status: TicketStatus) {
    setTickets((prev) => prev.map((t) => (selectedIds.includes(t.id) ? { ...t, status, updatedAt: new Date().toISOString() } : t)));
    console.log("Bulk status:", selectedIds, status);
    toast.success(`Status set to ${status} for ${selectedIds.length} ticket(s).`);
    setSelectedIds([]);
  }
  function bulkClose() {
    setTickets((prev) => prev.map((t) => (selectedIds.includes(t.id) ? { ...t, status: "Closed" as TicketStatus, updatedAt: new Date().toISOString() } : t)));
    console.log("Bulk close:", selectedIds);
    toast.success(`${selectedIds.length} ticket(s) closed.`);
    setSelectedIds([]);
  }

  function handleCreateTicket(data: NewTicketFormData) {
    const ticket = createTicketFromForm(data);
    setTickets((prev) => [ticket, ...prev]);
    console.log("Created ticket:", ticket);
    toast.success(`${ticket.ticketId} created successfully.`);
  }

  return (
    <div className="space-y-4">
      <HelpDeskSummaryCards tickets={tickets} />

      <Reveal delay={60} className="overflow-x-auto">
        <SlidingTabs value={roleTab} onValueChange={setRoleTab} options={ROLE_TABS} className="w-max" />
      </Reveal>

      <HelpDeskToolbar
        search={search} onSearchChange={setSearch}
        filters={filters} onFiltersChange={setFilters}
        resultCount={filteredTickets.length}
        onNewTicket={() => setCreateOpen(true)}
      />

      <BulkTicketActions
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onBulkAssign={bulkAssign}
        onBulkPriority={bulkPriority}
        onBulkStatus={bulkStatus}
        onBulkClose={bulkClose}
      />

      <TicketInboxTable
        tickets={filteredTickets}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onOpenTicket={openTicket}
        onQuickAction={quickAction}
      />

      <div>
        <h2 className="mb-3 text-[14px] font-semibold text-foreground">Help by Category</h2>
        <TicketCategoryCards tickets={tickets} />
      </div>

      <div>
        <h2 className="mb-3 text-[14px] font-semibold text-foreground">Support Analytics</h2>
        <SupportAnalytics tickets={tickets} />
      </div>

      <TicketDetailsDrawer
        ticket={drawerTicket}
        open={drawerTicketId !== null}
        onOpenChange={(open) => { if (!open) setDrawerTicketId(null); }}
        defaultTab={drawerTab}
        onSendMessage={sendMessage}
        onAssign={assignTicket}
        onStatusChange={statusChange}
        onEscalate={escalateTicket}
      />

      <CreateTicketModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateTicket}
        onOpenFullPage={() => { setCreateOpen(false); navigate("/help/tickets/new"); }}
      />
    </div>
  );
}
