/** Notification inbox view models, built by `src/api/notifications.ts`. */
export type NotificationCategory =
  | "Attendance" | "Exams" | "Fees" | "Notices" | "Messages" | "Approvals" | "Security" | "System";
export const CATEGORY_OPTIONS: NotificationCategory[] = [
  "Attendance", "Exams", "Fees", "Notices", "Messages", "Approvals", "Security", "System",
];

export type NotificationType = "info" | "success" | "warning" | "error" | "approval" | "reminder";
export const TYPE_OPTIONS: NotificationType[] = ["info", "success", "warning", "error", "approval", "reminder"];

export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export const PRIORITY_OPTIONS: NotificationPriority[] = ["low", "normal", "high", "urgent"];

export type NotificationStatus = "unread" | "read" | "archived";
export const STATUS_OPTIONS: NotificationStatus[] = ["unread", "read", "archived"];

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  createdAt: string;
  relatedModule: string;
  relatedId: string;
  actionUrl: string;
  readAt: string | null;
  archivedAt: string | null;
}
