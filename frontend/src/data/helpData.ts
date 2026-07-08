import {
  Activity,
  BookOpen,
  Bug,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  Headphones,
  Layers,
  Lightbulb,
  Megaphone,
  PlayCircle,
  Settings,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

// ── Support ticket form options ────────────────────────────────────────────────
export type TicketRole = "Admin" | "Teacher" | "Student" | "Parent" | "Accountant" | "Librarian";
export const TICKET_ROLE_OPTIONS: TicketRole[] = [
  "Admin", "Teacher", "Student", "Parent", "Accountant", "Librarian",
];

export type TicketModule =
  | "Dashboard" | "Students" | "Teachers" | "Parents" | "Classes" | "Subjects"
  | "Attendance" | "Exams" | "Fees" | "Notices" | "Settings";
export const TICKET_MODULE_OPTIONS: TicketModule[] = [
  "Dashboard", "Students", "Teachers", "Parents", "Classes", "Subjects",
  "Attendance", "Exams", "Fees", "Notices", "Settings",
];

export type TicketPriority = "Low" | "Normal" | "High" | "Urgent";
export const TICKET_PRIORITY_OPTIONS: TicketPriority[] = ["Low", "Normal", "High", "Urgent"];

export interface SupportTicketData {
  fullName:    string;
  email:       string;
  role:        TicketRole | "";
  module:      TicketModule | "";
  priority:    TicketPriority | "";
  subject:     string;
  description: string;
  attachmentName?: string;
}

// ── Help hero quick tags ────────────────────────────────────────────────────────
export const HELP_QUICK_TAGS = [
  "Students", "Teachers", "Attendance", "Fees", "Exams", "Notices", "Settings",
];

// ── Quick help cards ─────────────────────────────────────────────────────────────
export type QuickHelpActionId =
  | "contact-support" | "documentation" | "report-problem"
  | "request-feature" | "tutorials" | "system-status";

export interface QuickHelpCard {
  id:          QuickHelpActionId;
  title:       string;
  description: string;
  icon:        LucideIcon;
}

export const QUICK_HELP_CARDS: QuickHelpCard[] = [
  { id: "contact-support", title: "Contact Support",   description: "Get help from the support team.",            icon: Headphones },
  { id: "documentation",   title: "Read Documentation", description: "Browse guides for each module.",             icon: BookOpen   },
  { id: "report-problem",  title: "Report a Problem",   description: "Tell us about bugs or technical issues.",    icon: Bug        },
  { id: "request-feature", title: "Request a Feature",  description: "Suggest improvements for the system.",       icon: Lightbulb  },
  { id: "tutorials",       title: "Watch Tutorials",    description: "Learn with short video guides.",             icon: PlayCircle },
  { id: "system-status",   title: "System Status",      description: "Check if all services are running.",        icon: Activity   },
];

// ── FAQ ────────────────────────────────────────────────────────────────────────
export interface FaqItem {
  id:       string;
  question: string;
  answer:   string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-add-student",
    question: "How do I add a new student?",
    answer:
      "Go to Students → Add Student, fill in personal, academic, and guardian details across the form sections, then save. The student will appear in the Students list with an auto-generated admission number.",
  },
  {
    id: "faq-edit-student",
    question: "How do I edit student details?",
    answer:
      "Open the student's profile from the Students list and click Edit. Update any section — personal info, contact, academics, or documents — then save your changes.",
  },
  {
    id: "faq-mark-attendance",
    question: "How do I mark daily attendance?",
    answer:
      "Navigate to Attendance → Daily Marking, choose the class and section, then mark each student Present, Absent, or Late. Submit to save the day's register.",
  },
  {
    id: "faq-print-attendance",
    question: "How do I print an attendance sheet?",
    answer:
      "Open Attendance → Monthly Sheet, select the class, section, and month, then use the print action to generate a printable attendance sheet for records.",
  },
  {
    id: "faq-create-exam-schedule",
    question: "How do I create an exam schedule?",
    answer:
      "Go to Exam → Exam Schedule → Add Schedule. Pick the exam, classes, subjects, dates, and time slots, then save. The schedule becomes visible to teachers and students once published.",
  },
  {
    id: "faq-publish-results",
    question: "How do I publish exam results?",
    answer:
      "After marks entry is complete under Exam → Marks Entry, open Exam → Results, review the computed grades, and use the publish action to make results visible to students and parents.",
  },
  {
    id: "faq-add-teacher",
    question: "How do I add a new teacher?",
    answer:
      "Go to Teachers → Add Teacher and complete the personal, employment, and subject/class assignment sections. Once saved, the teacher receives access based on their assigned role.",
  },
  {
    id: "faq-manage-sections",
    question: "How do I manage class sections?",
    answer:
      "Open Classes, select a class, and use the Sections card on the class details page to add, rename, or remove sections and adjust their capacity.",
  },
  {
    id: "faq-create-notice",
    question: "How do I create notices for parents?",
    answer:
      "Go to Notice Board → Create Notice, write the content, choose the target audience (e.g. Parents or specific classes), set a publish date, and publish. Parents are notified in-app and by email if enabled.",
  },
  {
    id: "faq-theme-switch",
    question: "How do I switch between light, dark, and system theme?",
    answer:
      "Use the appearance toggle in the top header (next to the notification bell) to switch instantly between Light, Dark, and System theme — your choice is remembered on this device.",
  },
];

// ── Help by module ────────────────────────────────────────────────────────────
export interface ModuleGuide {
  id:          string;
  title:       string;
  description: string;
  icon:        LucideIcon;
  to?:         string;
}

export const MODULE_GUIDES: ModuleGuide[] = [
  { id: "students",   title: "Students Management", description: "Admissions, profiles, documents, and academic records.",       icon: GraduationCap, to: "/students" },
  { id: "teachers",    title: "Teachers Management", description: "Staff profiles, assignments, and employment records.",        icon: Users,          to: "/teachers" },
  { id: "parents",     title: "Parents Management",  description: "Guardian records linked to one or more children.",            icon: UserRound,      to: "/parents" },
  { id: "classes",     title: "Class Management",    description: "Grades, sections, capacity, and class teacher assignment.",   icon: Layers,         to: "/classes" },
  { id: "subjects",    title: "Subject Management",  description: "Subject catalog, class mapping, and syllabus tracking.",      icon: FileText,       to: "/subjects" },
  { id: "routine",     title: "Class Routine",       description: "Weekly timetables with conflict detection.",                 icon: CalendarDays,   to: "/class-routine" },
  { id: "attendance",  title: "Attendance",          description: "Daily marking, monthly sheets, and attendance reports.",      icon: CalendarCheck,  to: "/attendance" },
  { id: "exams",       title: "Exams",               description: "Schedules, grading, marks entry, and result publishing.",    icon: ClipboardList,  to: "/exams" },
  { id: "notices",     title: "Notice Board",        description: "Announcements to students, parents, and staff.",             icon: Megaphone,      to: "/notices" },
  { id: "settings",    title: "Settings",            description: "School profile, roles, permissions, and system preferences.", icon: Settings,       to: "/settings" },
];

// ── Support contact info ───────────────────────────────────────────────────────
export const SUPPORT_CONTACT = {
  email:       "support@schoolportal.test",
  phone:       "+977 9800000000",
  officeHours: "Sunday – Friday, 9:00 AM – 5:00 PM",
  responseNormal: "within 24 hours",
  responseUrgent: "within 2 hours",
};

// ── System status ──────────────────────────────────────────────────────────────
export type ServiceStatus = "Operational" | "Degraded" | "Down";

export interface SystemService {
  id:     string;
  name:   string;
  status: ServiceStatus;
}

export const SYSTEM_SERVICES: SystemService[] = [
  { id: "web-app",       name: "Web App",       status: "Operational" },
  { id: "database",      name: "Database",      status: "Operational" },
  { id: "notifications", name: "Notifications", status: "Operational" },
  { id: "reports",       name: "Reports",       status: "Operational" },
  { id: "backup",        name: "Backup",        status: "Operational" },
  { id: "sms-gateway",   name: "SMS Gateway",   status: "Degraded"    },
];

// ── Recent help articles ───────────────────────────────────────────────────────
export interface HelpArticle {
  id:       string;
  title:    string;
  category: string;
  readTime: string;
}

export const RECENT_HELP_ARTICLES: HelpArticle[] = [
  { id: "art-1", title: "Getting started with the admin dashboard", category: "Getting Started", readTime: "4 min read" },
  { id: "art-2", title: "How to add students in bulk",              category: "Students",        readTime: "6 min read" },
  { id: "art-3", title: "How attendance reports work",               category: "Attendance",      readTime: "5 min read" },
  { id: "art-4", title: "How to create exam schedules",              category: "Exams",           readTime: "7 min read" },
  { id: "art-5", title: "How to publish notices",                    category: "Notices",         readTime: "3 min read" },
  { id: "art-6", title: "How to print student profiles",             category: "Students",        readTime: "2 min read" },
  { id: "art-7", title: "How to manage fees and invoices",           category: "Fees",            readTime: "8 min read" },
];
