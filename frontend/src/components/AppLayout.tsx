import {
  Award,
  BarChart2,
  BookOpen,
  Building2,
  Bus,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Landmark,
  Layers,
  LayoutDashboard,
  List,
  Megaphone,
  MessageSquare,
  PenLine,
  Plus,
  Receipt,
  Send,
  Settings,
  ShieldCheck,
  TrendingDown,
  UserPlus,
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
      {
        to: "/teachers", label: "Teachers", icon: Users, perm: "superuser",
        children: [
          { to: "/teachers",     label: "All Teachers", icon: List,     perm: "superuser" },
          { to: "/teachers/new", label: "Add Teacher",  icon: UserPlus, perm: "superuser" },
        ],
      },
      {
        to: "/parents", label: "Parents", icon: UserRound, perm: "superuser",
        children: [
          { to: "/parents",     label: "All Parents", icon: List,     perm: "superuser" },
          { to: "/parents/new", label: "Add Parent",  icon: UserPlus, perm: "superuser" },
        ],
      },
      { to: "/users",     label: "Access Control",  icon: ShieldCheck,   perm: "user.manage"      },
    ],
  },
  {
    label: "Academics",
    items: [
      {
        to: "/classes", label: "Classes", icon: Layers, perm: "superuser",
        children: [
          { to: "/classes",     label: "All Classes",   icon: List,     perm: "superuser" },
          { to: "/classes/new", label: "Add New Class", icon: UserPlus, perm: "superuser" },
        ],
      },
      {
        to: "/subjects", label: "Subjects", icon: FileText, perm: "superuser",
        children: [
          { to: "/subjects",     label: "All Subjects", icon: List,     perm: "superuser" },
          { to: "/subjects/new", label: "Add Subject",  icon: UserPlus, perm: "superuser" },
        ],
      },
      {
        to: "/class-routine", label: "Class Routine", icon: CalendarDays, perm: "superuser",
        children: [
          { to: "/class-routine",     label: "All Routines",  icon: List,     perm: "superuser" },
          { to: "/class-routine/new", label: "Add Routine",   icon: UserPlus, perm: "superuser" },
        ],
      },
      {
        to: "/exams", label: "Exam", icon: ClipboardList, perm: "superuser",
        children: [
          { to: "/exams",              label: "Exam Dashboard", icon: LayoutDashboard, perm: "superuser" },
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
          { to: "/attendance",         label: "Dashboard",      icon: LayoutDashboard, perm: "attendance.report" },
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
      {
        to: "/notices", label: "Notice", icon: Megaphone, perm: "superuser",
        children: [
          { to: "/notices",     label: "Notice Board",  icon: LayoutDashboard, perm: "superuser" },
          { to: "/notices/new", label: "Create Notice",  icon: Plus,            perm: "superuser" },
        ],
      },
      {
        to: "/messages", label: "Messages", icon: MessageSquare, perm: "superuser",
        children: [
          { to: "/messages",           label: "All Messages",    icon: LayoutDashboard, perm: "superuser" },
          { to: "/messages/inbox",     label: "Inbox",           icon: MessageSquare,   perm: "superuser" },
          { to: "/messages/compose",   label: "Compose Message", icon: Plus,            perm: "superuser" },
          { to: "/messages/sent",      label: "Sent Messages",   icon: Send,            perm: "superuser" },
          { to: "/messages/drafts",    label: "Drafts",          icon: FileText,        perm: "superuser" },
          { to: "/messages/templates", label: "Templates",       icon: List,            perm: "superuser" },
        ],
      },
    ],
  },
];

export function AppLayout() {
  return <Shell nav={NAV} brand="SchoolOS" />;
}
