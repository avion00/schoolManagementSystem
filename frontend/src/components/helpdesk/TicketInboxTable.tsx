import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Inbox, Lock } from "lucide-react";

import { BulkTicketActions } from "@/components/helpdesk/BulkTicketActions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { RowActionMenu } from "@/components/ui/RowActionMenu";
import { SlaBadge } from "@/components/helpdesk/SlaBadge";
import { TicketPriorityBadge } from "@/components/helpdesk/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/helpdesk/TicketStatusBadge";
import type {
  SupportTicket, TicketPriority, TicketStatus,
} from "@/data/helpDeskData";

const PAGE_SIZE = 10;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export type TicketAction = "view" | "assign" | "reply" | "escalate" | "resolve" | "close" | "delete";

export function TicketInboxTable({
  tickets,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onOpenTicket,
  onQuickAction,
  onBulkAssign,
  onBulkPriority,
  onBulkStatus,
  onBulkClose,
}: {
  tickets: SupportTicket[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: (ids: number[], checked: boolean) => void;
  onOpenTicket: (ticket: SupportTicket, action?: TicketAction) => void;
  onQuickAction: (ticket: SupportTicket, action: TicketAction) => void;
  onBulkAssign: (assigneeName: string) => void;
  onBulkPriority: (priority: TicketPriority) => void;
  onBulkStatus: (status: TicketStatus) => void;
  onBulkClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  useEffect(() => { setPage(1); }, [tickets.length]);

  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = tickets.slice(start, start + PAGE_SIZE);
  const selectedKeys = new Set<string | number>(selectedIds);

  function handleSelectionChange(keys: Set<string | number>) {
    const pageIds = pageRows.map((t) => t.id);

    // Full clear (from the bulk-actions bar's "Deselect all"): keys is empty
    // regardless of page — clear every currently-selected id, not just this page's.
    if (keys.size === 0 && selectedIds.length > 0) {
      onToggleSelectAll(selectedIds, false);
      return;
    }

    const nextSelectedOnPage = new Set([...keys].filter((k) => pageRows.some((t) => t.id === k)));
    const wasAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
    const isNowAllSelected = pageIds.length > 0 && pageIds.every((id) => nextSelectedOnPage.has(id));
    if (!wasAllSelected && isNowAllSelected) {
      onToggleSelectAll(pageIds, true);
    } else if (wasAllSelected && !isNowAllSelected && nextSelectedOnPage.size === 0) {
      onToggleSelectAll(pageIds, false);
    } else {
      // Single-row toggle: find the one id whose membership changed.
      const changed = pageIds.find((id) => selectedIds.includes(id) !== nextSelectedOnPage.has(id));
      if (changed !== undefined) onToggleSelect(changed);
    }
  }

  const columns: PremiumDataTableColumn<SupportTicket>[] = [
    { key: "ticketId", header: "Ticket ID", width: "w-[110px]", render: (t) => <span className="font-mono text-[12px] font-medium text-foreground">{t.ticketId}</span> },
    {
      key: "requester", header: "Requester", width: "w-[190px]", render: (t) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarFallback className="text-[10px] font-semibold">{initials(t.requester.name)}</AvatarFallback>
          </Avatar>
          <span className="max-w-[140px] truncate text-[12.5px] font-medium text-foreground">{t.requester.name}</span>
        </div>
      ),
    },
    { key: "role", header: "Role", width: "w-[100px]", render: (t) => <span className="text-[12px] text-muted-foreground">{t.requester.role}</span> },
    { key: "category", header: "Category", width: "w-[150px]", render: (t) => <span className="max-w-[150px] truncate text-[12px] text-muted-foreground">{t.category}</span> },
    { key: "subject", header: "Subject", render: (t) => <span className="max-w-[220px] truncate text-[12.5px] text-foreground">{t.subject}</span> },
    { key: "priority", header: "Priority", width: "w-[90px]", render: (t) => <TicketPriorityBadge priority={t.priority} /> },
    {
      key: "assignedTo", header: "Assigned To", width: "w-[140px]", render: (t) => (
        t.assignedTo ? <span className="text-[12px] text-muted-foreground">{t.assignedTo.name}</span> : <span className="text-[12px] italic text-muted-foreground/60">Unassigned</span>
      ),
    },
    { key: "status", header: "Status", width: "w-[120px]", render: (t) => <TicketStatusBadge status={t.status} /> },
    { key: "sla", header: "SLA", width: "w-[140px]", render: (t) => <SlaBadge dueAt={t.sla.dueAt} status={t.sla.status} ticketStatus={t.status} /> },
    { key: "updatedAt", header: "Last Updated", width: "w-[100px]", render: (t) => <span className="whitespace-nowrap text-[12px] text-muted-foreground">{relativeTime(t.updatedAt)}</span> },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={pageRows}
      rowKey={(t) => t.id}
      selectable
      selectedKeys={selectedKeys}
      onSelectionChange={handleSelectionChange}
      emptyIcon={Inbox}
      emptyTitle="No tickets match your filters"
      emptyDescription="Try adjusting search or resetting filters."
      pagination={{ page: safePage, pageSize: PAGE_SIZE, total: tickets.length, onPage: setPage, itemLabel: "tickets" }}
      bulkActions={(_count, clear) => (
        <BulkTicketActions
          selectedIds={selectedIds}
          onClear={clear}
          onBulkAssign={onBulkAssign}
          onBulkPriority={onBulkPriority}
          onBulkStatus={onBulkStatus}
          onBulkClose={onBulkClose}
        />
      )}
      rowActions={(t) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-600"
            title="Escalate" onClick={() => onQuickAction(t, "escalate")}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-emerald-600"
            title="Resolve" onClick={() => onOpenTicket(t, "resolve")}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"
            title="Close" onClick={() => onQuickAction(t, "close")}
          >
            <Lock className="h-3.5 w-3.5" />
          </Button>
          <RowActionMenu
            entityLabel="ticket"
            onView={() => onOpenTicket(t, "view")}
            onEdit={() => onOpenTicket(t, "assign")}
            onMessage={() => onOpenTicket(t, "reply")}
            messageLabel="Reply"
            onDelete={() => onQuickAction(t, "delete")}
          />
        </div>
      )}
    />
  );
}
