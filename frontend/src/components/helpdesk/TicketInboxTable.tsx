import { useEffect, useState } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Eye,
  Lock, MessageSquareReply, MoreVertical, SearchX, Trash2, UserPlus,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { SlaBadge } from "@/components/helpdesk/SlaBadge";
import { TicketPriorityBadge } from "@/components/helpdesk/TicketPriorityBadge";
import { TicketStatusBadge } from "@/components/helpdesk/TicketStatusBadge";
import type { SupportTicket } from "@/data/helpDeskData";

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
}: {
  tickets: SupportTicket[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: (ids: number[], checked: boolean) => void;
  onOpenTicket: (ticket: SupportTicket, action?: TicketAction) => void;
  onQuickAction: (ticket: SupportTicket, action: TicketAction) => void;
}) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));

  useEffect(() => { setPage(0); }, [tickets.length]);

  const start = page * PAGE_SIZE;
  const pageRows = tickets.slice(start, start + PAGE_SIZE);
  const pageIds = pageRows.map((t) => t.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
  const somePageSelected = pageIds.some((id) => selectedIds.includes(id));

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card py-16 text-center shadow-sm">
        <SearchX className="h-6 w-6 text-muted-foreground/50" />
        <p className="text-[13px] font-medium text-foreground">No tickets match your filters</p>
        <p className="text-[12px] text-muted-foreground">Try adjusting search or resetting filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-9 px-3">
              <Checkbox
                checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false}
                onCheckedChange={(v) => onToggleSelectAll(pageIds, !!v)}
                aria-label="Select all on page"
              />
            </TableHead>
            <TableHead className="text-[11px]">Ticket ID</TableHead>
            <TableHead className="text-[11px]">Requester</TableHead>
            <TableHead className="text-[11px]">Role</TableHead>
            <TableHead className="text-[11px]">Category</TableHead>
            <TableHead className="text-[11px]">Subject</TableHead>
            <TableHead className="text-[11px]">Priority</TableHead>
            <TableHead className="text-[11px]">Assigned To</TableHead>
            <TableHead className="text-[11px]">Status</TableHead>
            <TableHead className="text-[11px]">SLA</TableHead>
            <TableHead className="text-[11px]">Last Updated</TableHead>
            <TableHead className="w-9 text-[11px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((t, i) => (
            <TableRow
              key={t.id}
              className="t-content-in cursor-pointer"
              style={{ animationDelay: `${i * 25}ms` }}
              data-state={selectedIds.includes(t.id) ? "selected" : undefined}
              onClick={() => onOpenTicket(t, "view")}
            >
              <TableCell className="px-3" onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.includes(t.id)}
                  onCheckedChange={() => onToggleSelect(t.id)}
                  aria-label={`Select ${t.ticketId}`}
                />
              </TableCell>
              <TableCell className="font-mono text-[12px] font-medium text-foreground">{t.ticketId}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[10px] font-semibold">{initials(t.requester.name)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[140px] truncate text-[12.5px] font-medium text-foreground">{t.requester.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-[12px] text-muted-foreground">{t.requester.role}</TableCell>
              <TableCell className="max-w-[150px] truncate text-[12px] text-muted-foreground">{t.category}</TableCell>
              <TableCell className="max-w-[220px] truncate text-[12.5px] text-foreground">{t.subject}</TableCell>
              <TableCell><TicketPriorityBadge priority={t.priority} /></TableCell>
              <TableCell className="text-[12px] text-muted-foreground">
                {t.assignedTo ? t.assignedTo.name : <span className="italic text-muted-foreground/60">Unassigned</span>}
              </TableCell>
              <TableCell><TicketStatusBadge status={t.status} /></TableCell>
              <TableCell><SlaBadge dueAt={t.sla.dueAt} status={t.sla.status} ticketStatus={t.status} /></TableCell>
              <TableCell className="whitespace-nowrap text-[12px] text-muted-foreground">{relativeTime(t.updatedAt)}</TableCell>
              <TableCell className="px-2" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onOpenTicket(t, "view")}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenTicket(t, "assign")}>
                      <UserPlus className="h-3.5 w-3.5" /> Assign
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenTicket(t, "reply")}>
                      <MessageSquareReply className="h-3.5 w-3.5" /> Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onQuickAction(t, "escalate")}>
                      <AlertTriangle className="h-3.5 w-3.5" /> Escalate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onOpenTicket(t, "resolve")}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onQuickAction(t, "close")}>
                      <Lock className="h-3.5 w-3.5" /> Close
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => onQuickAction(t, "delete")}>
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3">
        <span className="text-[12px] text-muted-foreground">
          Showing {start + 1}–{Math.min(start + PAGE_SIZE, tickets.length)} of {tickets.length}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">Page {page + 1} of {pageCount}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
