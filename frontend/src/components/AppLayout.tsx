import {
  Archive,
  Award,
  BarChart2,
  BookOpen,
  Building2,
  Bus,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  GraduationCap,
  Landmark,
  Layers,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  PenLine,
  Radio,
  Receipt,
  Settings,
  ShieldAlert,
  TrendingDown,
  UserCheck,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { Shell, type NavGroup } from "@/components/Shell";

const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/students",  label: "Students",       icon: GraduationCap, perm: "student.view.all" },
      { to: "/teachers",  label: "Teachers",       icon: Users,         perm: "superuser" },
      { to: "/parents",   label: "Parents",        icon: UserRound,     perm: "superuser" },
    ],
  },
  {
    label: "Academics",
    items: [
      { to: "/classes",       label: "Classes",       icon: Layers,       perm: "superuser" },
      { to: "/subjects",      label: "Subjects",      icon: FileText,     perm: "superuser" },
      { to: "/class-routine", label: "Class Routine", icon: CalendarDays, perm: "superuser" },
      {
        to: "/exams", label: "Exam", icon: ClipboardList, perm: "superuser",
        children: [
          { to: "/exams/schedule",     label: "Exam Schedule",  icon: CalendarDays,    perm: "superuser" },
          { to: "/exams/grades",       label: "Exam Grades",    icon: Award,           perm: "superuser" },
          { to: "/exams/marks-entry",  label: "Marks Entry",    icon: PenLine,         perm: "superuser" },
          { to: "/exams/results",      label: "Results",        icon: BarChart2,       perm: "superuser" },
          { to: "/exams/report-cards", label: "Report Cards",   icon: FileText,        perm: "superuser" },
          { to: "/exams/admit-cards",  label: "Admit Cards",    icon: CreditCard,      perm: "superuser" },
        ],
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        to: "/attendance", label: "Attendance", icon: CalendarCheck, perm: "attendance.report",
        children: [
          { to: "/attendance/daily",   label: "Daily Marking",  icon: CalendarCheck,   perm: "attendance.report" },
          { to: "/attendance/monthly", label: "Monthly Sheet",  icon: CalendarDays,    perm: "attendance.report" },
          { to: "/attendance/student", label: "Student Report", icon: GraduationCap,   perm: "attendance.report" },
          { to: "/attendance/teacher", label: "Teacher Report", icon: Users,           perm: "attendance.report" },
          { to: "/attendance/class",   label: "Class Report",   icon: Layers,          perm: "attendance.report" },
          { to: "/attendance/reports", label: "Analytics",      icon: BarChart2,       perm: "attendance.report" },
        ],
      },
      { to: "/library",    label: "Library",    icon: BookOpen,      perm: "superuser"         },
      { to: "/transport",  label: "Transport",  icon: Bus,           perm: "superuser"         },
      { to: "/hostel",     label: "Hostel",     icon: Building2,     perm: "superuser"         },
    ],
  },
  {
    label: "Finance / Billing",
    items: [
      { to: "/billing",           label: "Billing Dashboard", icon: LayoutDashboard, perm: "fee.view" },
      { to: "/billing/fees",      label: "Student Fees",      icon: Wallet,          perm: "fee.view" },
      { to: "/billing/invoices",  label: "Invoices",           icon: Receipt,         perm: "fee.view" },
      { to: "/billing/payments",  label: "Payments",           icon: CreditCard,      perm: "fee.view" },
      { to: "/billing/expenses",  label: "Expenses",           icon: TrendingDown,    perm: "fee.view" },
      { to: "/billing/payroll",   label: "Payroll",            icon: Landmark,        perm: "fee.view" },
      { to: "/billing/vendors",   label: "Vendors",             icon: Building2,       perm: "fee.view" },
      { to: "/billing/reports",   label: "Reports",             icon: BarChart2,       perm: "fee.view" },
      { to: "/billing/settings",  label: "Billing Settings",    icon: Settings,        perm: "fee.view" },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/notices", label: "Notice", icon: Megaphone, perm: "superuser" },
      {
        to: "/messages", label: "Messages", icon: MessageSquare, perm: "superuser",
        children: [
          { to: "/messages/chats",      label: "Chats",            icon: MessageSquare, perm: "superuser" },
          { to: "/messages/groups",     label: "Groups",           icon: Users,         perm: "superuser" },
          { to: "/messages/broadcasts", label: "Broadcasts",       icon: Radio,         perm: "superuser" },
          { to: "/messages/archived",   label: "Archived",         icon: Archive,       perm: "superuser" },
          { to: "/messages/requests",   label: "Message Requests", icon: UserCheck,     perm: "superuser" },
          { to: "/messages/moderation", label: "Moderation",       icon: ShieldAlert,   perm: "message.moderate" },
          { to: "/messages/export",     label: "Export",           icon: Download,      perm: "message.export" },
          { to: "/messages/settings",   label: "Message Settings", icon: Settings,      perm: "message.settings" },
        ],
      },
    ],
  },
];

export function AppLayout() {
  return <Shell nav={NAV} brand="SchoolOS" />;
}
