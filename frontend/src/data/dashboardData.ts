/**
 * Static mock data for the dashboard.
 * All values and events are representative fixtures ready to be replaced
 * with real API responses when backend integration is wired up.
 */
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  GraduationCap,
  MessageSquare,
  Receipt,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

// ── Type definitions ──────────────────────────────────────────────────────────

export interface Stat {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  iconCls: string; // Tailwind classes applied to the icon wrapper + icon
  trend?: { value: string; up: boolean };
}

export interface FeeDataPoint {
  month: string;
  collections: number;
  fees: number;
  expenses: number;
}

export interface FeeLegendItem {
  label: string;
  value: string;
  color: string; // CSS color string (passed to recharts fill & inline style)
}

export interface SummaryCardItem {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  from: string; // Tailwind gradient-from-* class
  to: string;   // Tailwind gradient-to-* class
}

export interface CalendarEvent {
  date: number;  // day-of-month (July 2026)
  title: string;
  color: string; // Tailwind bg-* class for the dot indicator
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string; // Tailwind bg + text classes for badge
  date: string;
  author: string;
  isNew?: boolean;
}

export interface Activity {
  id: string;
  icon: LucideIcon;
  iconCls: string;
  action: string;
  description: string;
  time: string;
}

export interface QuickActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  iconCls: string;
  to?: string; // router path — omit for not-yet-implemented routes
}

export interface ExamItem {
  id: string;
  subject: string;
  grade: string;
  date: string;
  time: string;
}

// ── Top KPI cards ─────────────────────────────────────────────────────────────

export const stats: Stat[] = [
  {
    id: "students",
    label: "Total Students",
    value: "50,000",
    sub: "Active enrollment",
    icon: GraduationCap,
    iconCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    trend: { value: "+8.2%", up: true },
  },
  {
    id: "teachers",
    label: "Teachers",
    value: "10,000",
    sub: "Teaching & non-teaching",
    icon: Users,
    iconCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    trend: { value: "+2.1%", up: true },
  },
  {
    id: "parents",
    label: "Parents / Guardians",
    value: "15,000",
    sub: "Registered on portal",
    icon: UserRound,
    iconCls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    trend: { value: "+5.4%", up: true },
  },
  {
    id: "earnings",
    label: "Total Earnings",
    value: "$30,000",
    sub: "This academic year",
    icon: DollarSign,
    iconCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    trend: { value: "+12.5%", up: true },
  },
];

// ── Fee collection grouped bar chart ─────────────────────────────────────────

export const feeChartData: FeeDataPoint[] = [
  { month: "Jan", collections: 8500,  fees: 7000, expenses: 4200 },
  { month: "Feb", collections: 9200,  fees: 7800, expenses: 4800 },
  { month: "Mar", collections: 10100, fees: 8500, expenses: 5100 },
  { month: "Apr", collections: 9800,  fees: 8200, expenses: 4900 },
  { month: "May", collections: 11200, fees: 9000, expenses: 5500 },
  { month: "Jun", collections: 10800, fees: 8800, expenses: 5300 },
  { month: "Jul", collections: 12000, fees: 9500, expenses: 5800 },
];

// Colors must match the Bar fill props exactly so the legend dots match.
export const feeLegend: FeeLegendItem[] = [
  { label: "Collections", value: "$10,000", color: "hsl(var(--primary))" },
  { label: "Fees",        value: "$8,000",  color: "#10b981"              },
  { label: "Expenses",    value: "$5,000",  color: "#f59e0b"              },
];

// ── Colored summary cards ─────────────────────────────────────────────────────

export const summaryCards: SummaryCardItem[] = [
  {
    id: "admissions",
    label: "New Admissions",
    value: "1,250",
    sub: "This term",
    icon: UserPlus,
    from: "from-violet-500",
    to: "to-indigo-600",
  },
  {
    id: "classes",
    label: "Active Classes",
    value: "48",
    sub: "Across all grades",
    icon: BookOpen,
    from: "from-emerald-500",
    to: "to-teal-600",
  },
  {
    id: "online",
    label: "Online Users",
    value: "342",
    sub: "Currently active",
    icon: Globe,
    from: "from-sky-500",
    to: "to-blue-600",
  },
  {
    id: "messages",
    label: "Messages",
    value: "128",
    sub: "Unread this week",
    icon: MessageSquare,
    from: "from-rose-500",
    to: "to-pink-600",
  },
];

// ── Event calendar (July 2026) ────────────────────────────────────────────────
// July 1 2026 = Wednesday (index 3 if Sun=0). 31 days total.

export const CALENDAR_MONTH = "July 2026";
export const CALENDAR_FIRST_DAY = 3; // 0=Sun … 6=Sat
export const CALENDAR_DAYS = 31;
export const CALENDAR_TODAY = 1;     // current day (July 1)

export const calendarEvents: CalendarEvent[] = [
  { date: 5,  title: "Parent Meeting",   color: "bg-blue-500"    },
  { date: 10, title: "Exam Week",         color: "bg-amber-500"   },
  { date: 11, title: "Exam Week",         color: "bg-amber-500"   },
  { date: 12, title: "Exam Week",         color: "bg-amber-500"   },
  { date: 14, title: "Exam Week",         color: "bg-amber-500"   },
  { date: 18, title: "Sports Day",        color: "bg-emerald-500" },
  { date: 25, title: "Fee Deadline",      color: "bg-rose-500"    },
  { date: 28, title: "Teacher Training",  color: "bg-violet-500"  },
];

// ── Notice board ──────────────────────────────────────────────────────────────

export const notices: Notice[] = [
  {
    id: "n1",
    title: "Final Exam Routine Published",
    description: "The July 2026 examination schedule is now available. Students must check their assigned timeslots.",
    category: "Academic",
    categoryColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    date: "Jul 1, 2026",
    author: "Academic Office",
    isNew: true,
  },
  {
    id: "n2",
    title: "Fee Payment Deadline – July 25",
    description: "All pending fees must be cleared before July 25. Late payments will incur a daily penalty.",
    category: "Finance",
    categoryColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    date: "Jun 28, 2026",
    author: "Accounts Dept.",
    isNew: true,
  },
  {
    id: "n3",
    title: "Parent-Teacher Meeting – July 5",
    description: "Annual parent-teacher conference on July 5. Confirm attendance through the portal by July 3.",
    category: "Event",
    categoryColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    date: "Jun 25, 2026",
    author: "Principal's Office",
  },
  {
    id: "n4",
    title: "Library Books Return Notice",
    description: "All students must return borrowed books by July 10. Overdue books attract fines.",
    category: "Library",
    categoryColor: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    date: "Jun 22, 2026",
    author: "Library Dept.",
  },
  {
    id: "n5",
    title: "Annual Sports Day – July 18",
    description: "Sports Day will be held July 18. All students are encouraged to participate.",
    category: "Event",
    categoryColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    date: "Jun 20, 2026",
    author: "Sports Dept.",
  },
];

// ── Recent activity timeline ──────────────────────────────────────────────────

export const activities: Activity[] = [
  {
    id: "a1",
    icon: UserPlus,
    iconCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    action: "New student admitted",
    description: "Aarav Khan enrolled in Grade 8 · Section A",
    time: "2 min ago",
  },
  {
    id: "a2",
    icon: Receipt,
    iconCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    action: "Fee payment received",
    description: "$2,500 collected from Olivia Garcia (ADM-0002)",
    time: "18 min ago",
  },
  {
    id: "a3",
    icon: FileText,
    iconCls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    action: "Assignment uploaded",
    description: "Math Assignment for Grade 8 by Demo Teacher",
    time: "45 min ago",
  },
  {
    id: "a4",
    icon: CalendarCheck,
    iconCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    action: "Attendance marked",
    description: "Grade 9-A: 28 present, 2 absent",
    time: "1h ago",
  },
  {
    id: "a5",
    icon: Bell,
    iconCls: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    action: "Notice published",
    description: "Exam routine published by Academic Office",
    time: "2h ago",
  },
  {
    id: "a6",
    icon: MessageSquare,
    iconCls: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    action: "Parent message received",
    description: "Robert Smith enquired about Liam's attendance",
    time: "3h ago",
  },
];

// ── Quick action buttons ──────────────────────────────────────────────────────

export const quickActions: QuickActionItem[] = [
  { id: "student",    label: "Add Student",    icon: UserPlus,      iconCls: "text-blue-600 dark:text-blue-400",    to: "/students"   },
  { id: "attendance", label: "Attendance",     icon: CalendarCheck, iconCls: "text-emerald-600 dark:text-emerald-400", to: "/attendance" },
  { id: "fee",        label: "Collect Fee",    icon: CreditCard,    iconCls: "text-amber-600 dark:text-amber-400",  to: "/fees"       },
  { id: "teacher",    label: "Add Teacher",    icon: Users,         iconCls: "text-violet-600 dark:text-violet-400"                   },
  { id: "notice",     label: "Post Notice",    icon: Bell,          iconCls: "text-rose-600 dark:text-rose-400"                       },
  { id: "report",     label: "View Report",    icon: FileText,      iconCls: "text-sky-600 dark:text-sky-400"                         },
];

// ── Upcoming exams ────────────────────────────────────────────────────────────

export const upcomingExams: ExamItem[] = [
  { id: "e1", subject: "Mathematics",    grade: "Grade 10", date: "Jul 10", time: "9:00 AM"  },
  { id: "e2", subject: "Science",        grade: "Grade 9",  date: "Jul 11", time: "9:00 AM"  },
  { id: "e3", subject: "English",        grade: "Grade 8",  date: "Jul 12", time: "10:00 AM" },
  { id: "e4", subject: "Social Studies", grade: "Grade 10", date: "Jul 13", time: "9:00 AM"  },
  { id: "e5", subject: "Computer Sci.",  grade: "Grade 9",  date: "Jul 14", time: "11:00 AM" },
];
