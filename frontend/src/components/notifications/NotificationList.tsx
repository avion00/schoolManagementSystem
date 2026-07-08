import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { NotificationEmptyState } from "@/components/notifications/NotificationEmptyState";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/data/notificationsData";

const PAGE_SIZE = 15;

export function NotificationList({
  notifications, selectedIds, onToggleSelect, onOpen, onToggleRead, onArchive, onDelete, onApprove, onReject,
  emptyIcon, emptyTitle, emptyDescription, onResetFilters,
}: {
  notifications: AppNotification[];
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onOpen: (n: AppNotification) => void;
  onToggleRead: (n: AppNotification) => void;
  onArchive: (n: AppNotification) => void;
  onDelete: (n: AppNotification) => void;
  onApprove: (n: AppNotification) => void;
  onReject: (n: AppNotification) => void;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  onResetFilters?: () => void;
}) {
  const [page, setPage] = useState(0);
  useEffect(() => { setPage(0); }, [notifications.length]);

  if (notifications.length === 0) {
    return <NotificationEmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} onReset={onResetFilters} />;
  }

  const pageCount = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const rows = notifications.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-2">
      {rows.map((n, i) => (
        <div key={n.id} style={{ animationDelay: `${i * 20}ms` }}>
          <NotificationItem
            notification={n}
            selected={selectedIds.includes(n.id)}
            onToggleSelect={() => onToggleSelect(n.id)}
            onOpen={() => onOpen(n)}
            onToggleRead={() => onToggleRead(n)}
            onArchive={() => onArchive(n)}
            onDelete={() => onDelete(n)}
            onApprove={() => onApprove(n)}
            onReject={() => onReject(n)}
          />
        </div>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
        <span className="text-[12px] text-muted-foreground">
          Showing {start + 1}–{Math.min(start + PAGE_SIZE, notifications.length)} of {notifications.length} notifications
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted-foreground">Page {page + 1} of {pageCount}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
          <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    </div>
  );
}
