/** The signed-in user's notification inbox (/me/notifications). */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { get, getAll, post, type Schemas } from "./http";
import type {
  AppNotification, NotificationCategory, NotificationPriority, NotificationType,
} from "./types/notifications";

type ApiNotification = Schemas["Notification"];

const CATEGORY_LABEL: Record<string, NotificationCategory> = {
  attendance: "Attendance", exams: "Exams", fees: "Fees", notices: "Notices", messages: "Messages",
  approvals: "Approvals", security: "Security", system: "System",
};

const MODULE_LABEL: Record<string, string> = {
  notice: "Notices", invoice: "Fees", payment: "Fees", feediscount: "Fees", attendance: "Attendance",
  exam: "Exams", expense: "Finance", payslip: "Payroll", ticket: "Help Desk", conversation: "Messages",
  assignment: "Assignments", submission: "Assignments",
};

export function mapNotification(n: ApiNotification): AppNotification {
  const related = (n.related_type ?? "").split(".").pop() ?? "";
  return {
    id: n.id, title: n.title, description: n.body ?? "",
    category: CATEGORY_LABEL[n.category ?? "system"] ?? "System",
    type: (n.type ?? "info") as NotificationType,
    priority: (n.priority ?? "normal") as NotificationPriority,
    status: n.archived_at ? "archived" : n.is_read ? "read" : "unread",
    createdAt: n.created_at, relatedModule: MODULE_LABEL[related] ?? "", relatedId: n.related_id ?? "",
    actionUrl: n.action_url ?? "", readAt: n.read_at ?? null, archivedAt: n.archived_at ?? null,
  };
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications", "list"],
    queryFn: async () => {
      const [active, archived] = await Promise.all([
        getAll<ApiNotification>("/me/notifications/"),
        getAll<ApiNotification>("/me/notifications/", { status: "archived" }),
      ]);
      return [...active, ...archived].map(mapNotification).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    staleTime: 15_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: async () => (await get<{ unread: number }>("/me/notifications/unread-count/")).unread,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

export function useNotificationActions() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ["notifications"] });
  return {
    read: useMutation({ mutationFn: (id: string) => post(`/me/notifications/${id}/read/`), onSuccess: done }),
    archive: useMutation({ mutationFn: (id: string) => post(`/me/notifications/${id}/archive/`), onSuccess: done }),
    unread: useMutation({ mutationFn: (id: string) => post(`/me/notifications/${id}/unread/`), onSuccess: done }),
    restore: useMutation({ mutationFn: (id: string) => post(`/me/notifications/${id}/unarchive/`), onSuccess: done }),
    readAll: useMutation({ mutationFn: () => post<{ marked: number }>("/me/notifications/read-all/"), onSuccess: done }),
  };
}

/** Approval requests link to the page where the decision is made. */
export const isApproval = (n: AppNotification) => n.category === "Approvals" || n.type === "approval";
