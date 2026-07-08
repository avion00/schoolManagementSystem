import {
  BarChart3, CalendarCheck, CheckCircle2, CircleX, ClipboardCheck, CreditCard,
  GraduationCap, Megaphone, MessageSquare, ServerCog, ShieldAlert, TriangleAlert,
  UserPlus, UserRound, Users, Wallet, Info, type LucideIcon,
} from "lucide-react";

import type { NotificationCategory, NotificationType } from "@/data/notificationsData";

const CATEGORY_ICON: Record<NotificationCategory, LucideIcon> = {
  Admissions: UserPlus,
  Attendance: CalendarCheck,
  Exams: GraduationCap,
  Fees: CreditCard,
  Billing: CreditCard,
  Payroll: Wallet,
  Teachers: Users,
  Parents: UserRound,
  Notices: Megaphone,
  Messages: MessageSquare,
  Security: ShieldAlert,
  System: ServerCog,
  Reports: BarChart3,
  Approvals: ClipboardCheck,
};

const TYPE_ICON: Partial<Record<NotificationType, LucideIcon>> = {
  warning: TriangleAlert,
  error: CircleX,
  success: CheckCircle2,
  info: Info,
  security: ShieldAlert,
};

/** Type takes precedence for strong signal types (warning/error/success/security); otherwise fall back to category. */
export function iconFor(category: NotificationCategory, type: NotificationType): LucideIcon {
  return TYPE_ICON[type] ?? CATEGORY_ICON[category] ?? Info;
}
