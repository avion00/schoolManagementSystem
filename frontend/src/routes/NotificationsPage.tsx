import { useMemo, useState } from "react";
import { Archive, Bell, MailWarning, SearchX } from "lucide-react";
import { toast } from "sonner";

import { NotificationDetailsPanel } from "@/components/notifications/NotificationDetailsPanel";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationSettingsPanel } from "@/components/notifications/NotificationSettingsPanel";
import { NotificationSummaryCards } from "@/components/notifications/NotificationSummaryCards";
import { matchesTab, NotificationTabs, type NotificationTab } from "@/components/notifications/NotificationTabs";
import {
  DEFAULT_NOTIFICATION_FILTERS, NotificationToolbar, type NotificationFilters,
} from "@/components/notifications/NotificationToolbar";
import { Reveal } from "@/components/motion";
import { NOTIFICATIONS, type AppNotification } from "@/data/notificationsData";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(NOTIFICATIONS);
  const [tab, setTab] = useState<NotificationTab>("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<NotificationFilters>(DEFAULT_NOTIFICATION_FILTERS);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [detailsId, setDetailsId] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const detailsNotification = notifications.find((n) => n.id === detailsId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return notifications.filter((n) => {
      if (!matchesTab(n, tab)) return false;
      if (filters.category !== "all" && n.category !== filters.category) return false;
      if (filters.priority !== "all" && n.priority !== filters.priority) return false;
      if (filters.status !== "all" && n.status !== filters.status) return false;
      if (filters.type !== "all" && n.type !== filters.type) return false;
      if (filters.channel !== "all" && n.channel !== filters.channel) return false;
      if (filters.dateRange !== "all") {
        const ageMs = Date.now() - new Date(n.createdAt).getTime();
        const limit = filters.dateRange === "today" ? 24 : filters.dateRange === "7d" ? 24 * 7 : 24 * 30;
        if (ageMs > limit * 3600_000) return false;
      }
      if (q && !`${n.title} ${n.description} ${n.relatedModule} ${n.createdBy} ${n.notificationId}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [notifications, tab, search, filters]);

  function updateOne(id: number, patch: Partial<AppNotification> | ((n: AppNotification) => AppNotification)) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? (typeof patch === "function" ? patch(n) : { ...n, ...patch }) : n)));
  }

  function toggleSelect(id: number) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function openDetails(n: AppNotification) {
    setDetailsId(n.id);
    if (n.status === "unread") {
      updateOne(n.id, (row) => ({ ...row, status: "read", readAt: new Date().toISOString(), activity: [...row.activity, { id: Date.now(), action: "Marked as read", at: new Date().toISOString() }] }));
    }
  }

  function toggleRead(n: AppNotification) {
    const now = new Date().toISOString();
    const nextStatus = n.status === "unread" ? "read" : "unread";
    updateOne(n.id, (row) => ({
      ...row, status: nextStatus, readAt: nextStatus === "read" ? now : null,
      activity: [...row.activity, { id: Date.now(), action: `Marked as ${nextStatus}`, at: now }],
    }));
  }

  function archive(n: AppNotification) {
    updateOne(n.id, (row) => ({ ...row, status: "archived", activity: [...row.activity, { id: Date.now(), action: "Archived", at: new Date().toISOString() }] }));
    console.log("Archived notification:", n.notificationId);
    toast.success("Notification archived.");
  }

  function del(n: AppNotification) {
    setNotifications((prev) => prev.filter((row) => row.id !== n.id));
    setSelectedIds((prev) => prev.filter((id) => id !== n.id));
    if (detailsId === n.id) setDetailsId(null);
    console.log("Deleted notification:", n.notificationId);
    toast.success("Notification deleted.");
  }

  function approve(n: AppNotification) {
    updateOne(n.id, (row) => ({
      ...row, approvalDecision: "approved", status: "read",
      activity: [...row.activity, { id: Date.now(), action: "Approved by Super Admin", at: new Date().toISOString() }],
    }));
    console.log("Approved:", n.notificationId);
    toast.success(`Approved: ${n.title}`);
  }

  function reject(n: AppNotification) {
    updateOne(n.id, (row) => ({
      ...row, approvalDecision: "rejected", status: "read",
      activity: [...row.activity, { id: Date.now(), action: "Rejected by Super Admin", at: new Date().toISOString() }],
    }));
    console.log("Rejected:", n.notificationId);
    toast.success(`Rejected: ${n.title}`);
  }

  function markAllRead() {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.status === "unread"
      ? { ...n, status: "read", readAt: now, activity: [...n.activity, { id: Date.now(), action: "Marked as read", at: now }] }
      : n)));
    console.log("Marked all as read");
    toast.success("All notifications marked as read.");
  }

  function archiveSelected() {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (selectedIds.includes(n.id)
      ? { ...n, status: "archived", activity: [...n.activity, { id: Date.now(), action: "Archived", at: now }] }
      : n)));
    console.log("Archived selected:", selectedIds);
    toast.success(`${selectedIds.length} notification(s) archived.`);
    setSelectedIds([]);
  }

  function deleteSelected() {
    setNotifications((prev) => prev.filter((n) => !selectedIds.includes(n.id)));
    console.log("Deleted selected:", selectedIds);
    toast.success(`${selectedIds.length} notification(s) deleted.`);
    setSelectedIds([]);
  }

  function refresh() {
    setSelectedIds([]);
    toast.success("Notifications refreshed.");
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
        onDeleteSelected={deleteSelected}
        onRefresh={refresh}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <NotificationList
        notifications={filtered}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onOpen={openDetails}
        onToggleRead={toggleRead}
        onArchive={archive}
        onDelete={del}
        onApprove={approve}
        onReject={reject}
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
        onDelete={del}
        onApprove={approve}
        onReject={reject}
      />

      <NotificationSettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
