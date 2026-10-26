import {
  CalendarCheck, CheckCircle2, CircleX, ClipboardCheck, CreditCard, GraduationCap, Megaphone, MessageSquare, ServerCog, ShieldAlert, TriangleAlert, Info, type LucideIcon,
} from "lucide-react";

import type { NotificationCategory, NotificationType } from "@/api/types/notifications";

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  Attendance: CalendarCheck,
  Exams: GraduationCap,
  Fees: CreditCard,
  Notices: Megaphone,
  Messages: MessageSquare,
  Security: ShieldAlert,
  System: ServerCog,
  Approvals: ClipboardCheck,
};

const TYPE_ICON: Partial<Record<NotificationType, LucideIcon>> = {
  warning: TriangleAlert,
  error: CircleX,
  success: CheckCircle2,
  info: Info,
};

/** Type takes precedence for strong signal types (warning/error/success); otherwise fall back to category. */
export function iconFor(category: NotificationCategory, type: NotificationType): LucideIcon {
  return TYPE_ICON[type] ?? CATEGORY_ICON[category] ?? Info;
}
