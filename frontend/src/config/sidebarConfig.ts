import {
  Archive,
  Award,
  BarChart2,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  Landmark,
  Layers,
  LayoutDashboard,
  LineChart,
  Megaphone,
  MessageSquare,
  NotebookPen,
  PenLine,
  Radio,
  Receipt,
  ReceiptText,
  ScrollText,
  Settings,
  ShieldAlert,
  TrendingDown,
  UserCheck,
  UserRound,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";

import type { NavGroup } from "@/components/Shell";

/**
 * All role-based sidebar configs in one place. Super Admin / Admin currently
 * share one permission-gated nav (Shell hides any item the signed-in user
 * lacks the permission for), so `adminSidebar` is an alias of
 * `superAdminSidebar` rather than a second hand-maintained copy.
 */

export const superAdminSidebar: NavGroup[] = [
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

/** Same nav tree as Super Admin — permission gating already narrows it per-user. */
export const adminSidebar: NavGroup[] = superAdminSidebar;

export const studentSidebar: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "My School",
    items: [
      { to: "/profile", label: "My Profile", icon: UserRound },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/results", label: "Results", icon: ScrollText },
      { to: "/fees", label: "Fees", icon: ReceiptText },
    ],
  },
];

/**
 * Teacher workspace nav — deliberately excludes Finance/Billing, Access
 * Control, Roles & Permissions, Payroll, and the full school-wide Students
 * list. Every route below lives under /teacher/* so it never collides with
 * the shared admin routes (/students, /attendance, …).
 *
 * Kept deliberately short (6 groups, ~18 items) — Weak/Top/Low-attendance
 * students and Student Performance were merged into one "Student Insights"
 * page, and Homework + Assignments were merged into one "Homework &
 * Assignments" page, so teachers aren't choosing between near-duplicate
 * nav items for the same daily task.
 */
export const teacherSidebar: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/teacher/today",     label: "Today",     icon: CalendarClock },
      { to: "/teacher/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "My Teaching",
    items: [
      { to: "/teacher/classes",      label: "My Classes",  icon: Layers },
      { to: "/teacher/students",     label: "My Students",  icon: GraduationCap },
      { to: "/teacher/timetable",    label: "Timetable",    icon: CalendarDays },
      { to: "/teacher/lesson-plans", label: "Lesson Plans", icon: NotebookPen },
      { to: "/teacher/materials",    label: "Materials",    icon: FolderOpen },
    ],
  },
  {
    label: "Attendance",
    items: [
      { to: "/teacher/attendance",         label: "Mark Attendance",   icon: CalendarCheck },
      { to: "/teacher/attendance/reports", label: "Attendance Reports", icon: BarChart2 },
    ],
  },
  {
    label: "Academics",
    items: [
      { to: "/teacher/assignments", label: "Homework & Assignments", icon: ClipboardList },
      { to: "/teacher/marks",       label: "Marks & Gradebook",      icon: Award },
      { to: "/teacher/exams",       label: "Exams",                  icon: CalendarDays },
      { to: "/teacher/insights",    label: "Student Insights",       icon: LineChart },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/teacher/messages", label: "Messages",             icon: MessageSquare },
      { to: "/teacher/parents",  label: "Parent Communication", icon: UsersRound },
      { to: "/teacher/notices",  label: "Notices",               icon: Megaphone },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/teacher/account", label: "My Account", icon: UserRound },
      { to: "/help",            label: "Help",        icon: CircleHelp },
    ],
  },
];

/**
 * Reserved for a future Parent self-service portal — no Parent login
 * exists yet (parents are managed today only via admin CRUD at /parents),
 * so this stays empty rather than shipping nav items with no routes behind
 * them.
 */
export const parentSidebar: NavGroup[] = [];
