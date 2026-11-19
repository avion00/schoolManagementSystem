import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CreateTicketModal } from "@/components/helpdesk/CreateTicketModal";
import { useTicketHandlers } from "@/components/helpdesk/useTicketHandlers";
import { Button } from "@/components/ui/button";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useTickets } from "@/api/helpdesk";
import { errorMessage } from "@/api/http";
import { HelpDeskSummaryCards } from "@/components/helpdesk/HelpDeskSummaryCards";
import { DEFAULT_TICKET_FILTERS, HelpDeskToolbar, type TicketFilters } from "@/components/helpdesk/HelpDeskToolbar";
import { SupportAnalytics } from "@/components/helpdesk/SupportAnalytics";
import { TicketCategoryCards } from "@/components/helpdesk/TicketCategoryCards";
import { TicketDetailsDrawer } from "@/components/helpdesk/TicketDetailsDrawer";
import { TicketInboxTable, type TicketAction } from "@/components/helpdesk/TicketInboxTable";
import { Reveal, SlidingTabs } from "@/components/motion";
import type { SupportTicket, TicketPriority, TicketStatus } from "@/api/types/helpdesk";

const ROLE_TABS = [
  { value: "all", label: "All Tickets" },
  { value: "Student", label: "Students" },
  { value: "Parent", label: "Parents" },
  { value: "Teacher", label: "Teachers" },
  { value: "Staff", label: "Staff" },
  { value: "Principal", label: "Principal" },
  { value: "technical", label: "Technical" },
];

export function HelpDeskPage() {
  const navigate = useNavigate();
  const query = useTickets();
  const tickets = useMemo(() => query.data ?? [], [query.data]);
  const h = useTicketHandlers(tickets);
  const [roleTab, setRoleTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<TicketFilters>(DEFAULT_TICKET_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drawerTicketId, setDrawerTicketId] = useState<string | null>(null);
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
      if (filters.department !== "all" && t.department !== filters.department) return false;
      if (filters.source !== "all" && t.source !== filters.source) return false;
      if (filters.dateRange !== "all") {
        const ageMs = Date.now() - new Date(t.createdAt).getTime();
        const limit = filters.dateRange === "today" ? 24 : filters.dateRange === "7d" ? 24 * 7 : 24 * 30;
        if (ageMs > limit * 3600_000) return false;
      }
      return true;
    });
  }, [tickets, roleTab, search, filters]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  function toggleSelectAll(ids: string[], checked: boolean) {
    setSelectedIds((prev) => (checked ? Array.from(new Set([...prev, ...ids])) : prev.filter((id) => !ids.includes(id))));
  }

  function openTicket(ticket: SupportTicket, action?: TicketAction) {
    setDrawerTicketId(ticket.id);
    setDrawerTab(action === "assign" || action === "resolve" ? "assign" : "details");
  }

  function quickAction(ticket: SupportTicket, action: TicketAction) {
    if (action === "escalate" || action === "close") h.quickAction(ticket, action);
  }

  const sendMessage = h.sendMessage;
  const assignTicket = h.assignTicket;
  const statusChange = h.statusChange;
  const escalateTicket = h.escalateTicket;

  function bulkAssign(assigneeName: string) {
    const ids = selectedIds;
    void h.bulk(ids, (t) => h.assignTo(t, assigneeName), `assigned to ${assigneeName}`).then(() => setSelectedIds([]));
  }
  function bulkPriority(priority: TicketPriority) {
    const ids = selectedIds;
    void h.bulk(ids, (t) => h.moveTo(t, t.status === "New" ? "Open" : t.status, "", priority), `set to ${priority}`)
      .then(() => setSelectedIds([]));
  }
  function bulkStatus(status: TicketStatus) {
    const ids = selectedIds;
    void h.bulk(ids, (t) => h.moveTo(t, status), `moved to ${status}`).then(() => setSelectedIds([]));
  }
  function bulkClose() {
    const ids = selectedIds;
    void h.bulk(ids, (t) => h.moveTo(t, "Closed"), "closed").then(() => setSelectedIds([]));
  }

  if (query.isLoading) return <PremiumSkeleton className="h-96 w-full rounded-2xl" />;
  if (query.isError) {
    return <PremiumEmptyState title="Couldn't load tickets" description={errorMessage(query.error)}
      action={<Button size="sm" variant="outline" onClick={() => query.refetch()}>Try again</Button>} />;
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

      <TicketInboxTable
        tickets={filteredTickets}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onOpenTicket={openTicket}
        onQuickAction={quickAction}
        onBulkAssign={bulkAssign}
        onBulkPriority={bulkPriority}
        onBulkStatus={bulkStatus}
        onBulkClose={bulkClose}
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
        onCreated={(id) => setDrawerTicketId(id)}
        onOpenFullPage={() => { setCreateOpen(false); navigate("/help/tickets/new"); }}
      />
    </div>
  );
}
