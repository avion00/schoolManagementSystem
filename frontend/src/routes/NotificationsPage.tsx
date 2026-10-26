import { useMemo, useState } from "react";
import { Archive, Bell, MailWarning, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { NotificationDetailsPanel } from "@/components/notifications/NotificationDetailsPanel";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationSummaryCards } from "@/components/notifications/NotificationSummaryCards";
import { matchesTab, NotificationTabs, type NotificationTab } from "@/components/notifications/NotificationTabs";
import {
  DEFAULT_NOTIFICATION_FILTERS, NotificationToolbar, type NotificationFilters,
} from "@/components/notifications/NotificationToolbar";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useNotificationActions, useNotifications } from "@/api/notifications";
import { errorMessage } from "@/api/http";
import type { AppNotification } from "@/api/types/notifications";
import { useAuth } from "@/lib/auth";

export function NotificationsPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const query = useNotifications();
  const actions = useNotificationActions();
  const notifications = useMemo(() => query.data ?? [], [query.data]);
  const [tab, setTab] = useState<NotificationTab>("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<NotificationFilters>(DEFAULT_NOTIFICATION_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailsId, setDetailsId] = useState<string | null>(null);

  const detailsNotification = notifications.find((n) => n.id === detailsId) ?? null;
  const fail = (e: unknown) => toast.error(errorMessage(e));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((n) => {
      if (!matchesTab(n, tab)) return false;
      if (filters.category !== "all" && n.category !== filters.category) return false;
      if (filters.priority !== "all" && n.priority !== filters.priority) return false;
      if (filters.status !== "all" && n.status !== filters.status) return false;
      if (filters.type !== "all" && n.type !== filters.type) return false;
      if (filters.dateRange !== "all") {
        const ageMs = Date.now() - new Date(n.createdAt).getTime();
        const limit = filters.dateRange === "today" ? 24 : filters.dateRange === "7d" ? 24 * 7 : 24 * 30;
        if (ageMs > limit * 3600_000) return false;
      }
      if (q && !`${n.title} ${n.description} ${n.relatedModule}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notifications, tab, search, filters]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function openDetails(n: AppNotification) {
    setDetailsId(n.id);
    if (n.status === "unread") actions.read.mutate(n.id, { onError: fail });
  }

  function toggleRead(n: AppNotification) {
    (n.status === "unread" ? actions.read : actions.unread).mutate(n.id, { onError: fail });
  }

  function archive(n: AppNotification) {
    actions.archive.mutate(n.id, { onSuccess: () => toast.success("Notification archived."), onError: fail });
  }

  function restore(n: AppNotification) {
    actions.restore.mutate(n.id, { onSuccess: () => toast.success("Notification restored."), onError: fail });
  }

  function markAllRead() {
    actions.readAll.mutate(undefined, {
      onSuccess: (r) => toast.success(r.marked ? `${r.marked} marked as read.` : "Everything was already read."),
      onError: fail,
    });
  }

  async function archiveSelected() {
    const ids = selectedIds;
    try {
      await Promise.all(ids.map((id) => actions.archive.mutateAsync(id)));
      toast.success(`${ids.length} notification(s) archived.`);
      setSelectedIds([]);
    } catch (e) {
      fail(e);
    }
  }

  function resetFilters() {
    setSearch("");
    setFilters(DEFAULT_NOTIFICATION_FILTERS);
  }

  const emptyContent = search.trim()
    ? { icon: SearchX, title: "No matching notifications", description: "Try a different search term or reset your filters." }
    : tab === "unread"
    ? { icon: MailWarning, title: "No unread notifications", description: "You're all caught up — nothing new to review." }
    : tab === "archived"
    ? { icon: Archive, title: "No archived notifications", description: "Notifications you archive will appear here." }
    : { icon: Bell, title: "No notifications", description: "Nothing matches the current filters right now." };

  if (query.isLoading) return <PremiumSkeleton className="h-96 w-full rounded-2xl" />;
  if (query.isError) {
    return <PremiumEmptyState title="Couldn't load notifications" description={errorMessage(query.error)}
      action={<Button size="sm" variant="outline" onClick={() => query.refetch()}>Try again</Button>} />;
  }

  return (
    <div className="space-y-4">
      <NotificationSummaryCards notifications={notifications} />

      <Reveal delay={60} className="overflow-x-auto">
        <NotificationTabs notifications={notifications} value={tab} onValueChange={setTab} />
      </Reveal>

      <NotificationToolbar
        search={search} onSearchChange={setSearch}
        filters={filters} onFiltersChange={setFilters}
        selectedCount={selectedIds.length}
        onMarkAllRead={markAllRead}
        onArchiveSelected={archiveSelected}
        onRefresh={() => { setSelectedIds([]); query.refetch(); }}
        onOpenSettings={() => (hasPermission("settings.manage")
          ? navigate("/settings/notifications")
          : toast.info("Notification channels and events are set by your school administrator."))}
      />

      <NotificationList
        notifications={filtered}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onOpen={openDetails}
        onToggleRead={toggleRead}
        onArchive={archive}
        onRestore={restore}
        emptyIcon={emptyContent.icon}
        emptyTitle={emptyContent.title}
        emptyDescription={emptyContent.description}
        onResetFilters={resetFilters}
      />

      <NotificationDetailsPanel
        notification={detailsNotification}
        open={detailsId !== null}
        onOpenChange={(open) => { if (!open) setDetailsId(null); }}
        onToggleRead={toggleRead}
        onArchive={archive}
        onRestore={restore}
      />
    </div>
  );
}
