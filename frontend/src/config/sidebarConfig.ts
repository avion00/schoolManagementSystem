import {
  Archive,
  Award,
  BarChart2,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  CircleUser,
  ClipboardList,
  CreditCard,
  Download,
  FileText,
  FolderOpen,
  GraduationCap,
  Landmark,
  Laptop2,
  Layers,
  LayoutDashboard,
  Lock,
  Megaphone,
  MessageSquare,
  NotebookPen,
  PenLine,
  Radio,
  Receipt,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  UserCheck,
  UserRound,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";

import type { NavGroup } from "@/components/Shell";

/**
 * All role-based sidebar configs in one place. Super Admin / Admin / Principal
 * all share this one permission-gated nav (Shell hides any item the signed-in
 * user lacks the permission for), so `adminSidebar` is an alias of
 * `superAdminSidebar` rather than a second hand-maintained copy. Principal
 * reaches this same nav via App.tsx's role branching (falls through to
 * AppLayout) and sees the same items as Admin because `hasPermission`
 * (lib/auth.tsx) treats Principal as a school-admin role for the
 * "superuser"-gated items below — see `isSchoolAdminRole`.
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
  {
    label: "Administration",
    items: [
      { to: "/settings/my-profile",        label: "Account",             icon: CircleUser, perm: "superuser" },
      { to: "/settings/roles-permissions", label: "Roles & Permissions", icon: ShieldCheck, perm: "superuser" },
      { to: "/settings/security",          label: "Security",            icon: Lock,       perm: "superuser" },
      { to: "/settings/my-sessions",       label: "Sessions",            icon: Laptop2,    perm: "superuser" },
      { to: "/settings/audit-logs",        label: "Audit Logs",          icon: ScrollText, perm: "superuser" },
      { to: "/settings",                   label: "Settings",            icon: Settings,   perm: "superuser" },
    ],
  },
];

/** Same nav tree as Super Admin — permission gating already narrows it per-user. */
export const adminSidebar: NavGroup[] = superAdminSidebar;

/**
 * Student workspace nav — deliberately excludes any admin/teacher tooling
 * (mark attendance, marks entry, class/student/parent management, access
 * control, payroll, all-school finance/reports). Every route lives under
 * /student/* so it never collides with the shared admin routes.
 */
export const studentSidebar: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/student/today",     label: "Today",     icon: CalendarClock },
      { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "My School",
    items: [
      { to: "/student/profile",    label: "My Profile",    icon: UserRound },
      { to: "/student/attendance", label: "My Attendance", icon: CalendarCheck },
      { to: "/student/timetable",  label: "My Timetable",  icon: CalendarDays },
      { to: "/student/fees",       label: "Fees",          icon: Wallet },
    ],
  },
  {
    label: "Learning",
    items: [
      { to: "/student/assignments", label: "Homework & Assignments", icon: ClipboardList },
      { to: "/student/materials",   label: "Learning Materials",     icon: FolderOpen },
      { to: "/student/results",     label: "Results",                icon: Award },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/student/messages", label: "Messages",    icon: MessageSquare },
      { to: "/student/notices",  label: "Notices",     icon: Megaphone },
      { to: "/student/help",     label: "Help Center", icon: CircleHelp },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/student/account", label: "My Account", icon: CircleUser }],
  },
];

/**
 * Teacher workspace nav. Attendance, marks and the exam schedule reuse the
 * staff screens, which the server scopes to the teacher's own sections.
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
      { to: "/teacher/classes",      label: "My Classes",   icon: Layers },
      { to: "/teacher/timetable",    label: "Timetable",    icon: CalendarDays },
      { to: "/teacher/lesson-plans", label: "Lesson Plans", icon: NotebookPen },
      { to: "/teacher/materials",    label: "Materials",    icon: FolderOpen },
    ],
  },
  {
    label: "Attendance",
    items: [
      { to: "/attendance/daily",   label: "Mark Attendance", icon: CalendarCheck },
      { to: "/attendance/monthly", label: "Monthly Sheet",   icon: BarChart2 },
    ],
  },
  {
    label: "Academics",
    items: [
      { to: "/teacher/assignments", label: "Homework & Assignments", icon: ClipboardList },
      { to: "/exams/marks-entry",   label: "Marks Entry",            icon: Award },
      { to: "/exams/schedule",      label: "Exam Schedule",          icon: CalendarDays },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/teacher/messages", label: "Messages",             icon: MessageSquare },
      { to: "/teacher/parents",  label: "Parent Communication", icon: UsersRound },
      { to: "/teacher/notices",  label: "Notices",              icon: Megaphone },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/teacher/account", label: "My Account", icon: UserRound },
      { to: "/teacher/help",    label: "Help",       icon: CircleHelp },
    ],
  },
];

/** Guardian portal nav: their children, school notices, messages and help. */
export const parentSidebar: NavGroup[] = [
  {
    label: "Overview",
    items: [{ to: "/parent", label: "My Children", icon: Users }],
  },
  {
    label: "Communication",
    items: [
      { to: "/parent/messages", label: "Messages",    icon: MessageSquare },
      { to: "/parent/notices",  label: "Notices",     icon: Megaphone },
      { to: "/parent/help",     label: "Help Center", icon: CircleHelp },
    ],
  },
  {
    label: "Account",
    items: [{ to: "/parent/account", label: "My Account", icon: CircleUser }],
  },
];
