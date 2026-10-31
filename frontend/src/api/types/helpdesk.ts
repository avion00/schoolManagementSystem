/** Help desk view models, built by `src/api/helpdesk.ts`. */
export type TicketRequesterRole =
  | "Student" | "Parent" | "Teacher" | "Staff" | "Accountant" | "Librarian"
  | "Transport Staff" | "Hostel Staff" | "Principal" | "Admin";

export const ROLE_OPTIONS: TicketRequesterRole[] = [
  "Student", "Parent", "Teacher", "Staff", "Accountant", "Librarian",
  "Transport Staff", "Hostel Staff", "Principal", "Admin",
];

export type TicketCategory =
  | "Student Issue" | "Parent Issue" | "Teacher Complaint" | "Staff Request"
  | "Attendance Problem" | "Exam / Result Problem" | "Fee / Payment Problem"
  | "Library Issue" | "Transport Issue" | "Hostel Issue" | "Account/Login Issue"
  | "Technical Bug" | "Data Correction Request"
  | "Emergency / Safety" | "Other";

export const CATEGORY_OPTIONS: TicketCategory[] = [
  "Student Issue", "Parent Issue", "Teacher Complaint", "Staff Request",
  "Attendance Problem", "Exam / Result Problem", "Fee / Payment Problem",
  "Library Issue", "Transport Issue", "Hostel Issue", "Account/Login Issue",
  "Technical Bug", "Data Correction Request",
  "Emergency / Safety", "Other",
];

export type TicketPriority = "Low" | "Normal" | "High" | "Urgent";
export const PRIORITY_OPTIONS: TicketPriority[] = ["Low", "Normal", "High", "Urgent"];

export type TicketStatus =
  | "New" | "Open" | "Assigned" | "In Progress" | "Waiting for User"
  | "Waiting for Department" | "Escalated" | "Resolved" | "Closed" | "Reopened";

export const STATUS_OPTIONS: TicketStatus[] = [
  "New", "Open", "Assigned", "In Progress", "Waiting for User",
  "Waiting for Department", "Escalated", "Resolved", "Closed", "Reopened",
];

export const OPEN_STATUSES: TicketStatus[] = [
  "New", "Open", "Assigned", "In Progress", "Waiting for User", "Waiting for Department", "Escalated", "Reopened",
];

export type SlaStatus = "On Track" | "Due Soon" | "Overdue" | "Met" | "Breached" | "—";
export const SLA_STATUS_OPTIONS: SlaStatus[] = ["On Track", "Due Soon", "Overdue", "Met", "Breached"];

export type TicketSource =
  | "Web Portal" | "Mobile App" | "Email" | "Phone Call" | "Walk-in Office" | "Admin Created";
export const SOURCE_OPTIONS: TicketSource[] = [
  "Web Portal", "Mobile App", "Email", "Phone Call", "Walk-in Office", "Admin Created",
];

export type Department =
  | "Academics" | "Accounts" | "Library" | "Transport" | "Hostel"
  | "Administration" | "IT";
export const DEPARTMENT_OPTIONS: Department[] = [
  "Academics", "Accounts", "Library", "Transport", "Hostel", "Administration", "IT",
];

export const MODULE_OPTIONS = [
  "Dashboard", "Students", "Teachers", "Parents", "Classes", "Subjects", "Attendance",
  "Exams", "Fees", "Notices", "Library", "Transport", "Hostel", "Settings", "Account",
] as const;

export const RESOLUTION_CATEGORY_OPTIONS = [
  "Data Correction", "Billing Correction", "Technical Fix", "Policy Clarification", "Safety", "Feedback", "Escalated Resolution",
] as const;

// SLA response targets, in hours, by priority.
export const SLA_HOURS: Record<TicketPriority, number> = { Urgent: 2, High: 8, Normal: 24, Low: 48 };
export const SLA_LABEL: Record<TicketPriority, string> = {
  Urgent: "2 hours", High: "8 hours", Normal: "24 hours", Low: "48 hours",
};

// ── Interfaces ────────────────────────────────────────────────────────────────
export interface Assignee {
  id: string;
  name: string;
  email: string;
}

export interface Requester {
  id: string;
  name: string;
  role: TicketRequesterRole;
  email: string;
  phone: string;
  className?: string;
  section?: string;
  department?: string;
  relatedChildName?: string;
}

export interface RelatedRecord {
  type: string;
  label: string;
  path: string;
}

export interface TicketAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  downloadUrl: string;
}

export interface TicketMessage {
  id: string;
  author: string;
  authorRole: string;
  body: string;
  isInternal: boolean;
  timestamp: string;
  attachments: TicketAttachment[];
}

export interface TicketActivity {
  id: string;
  action: string;
  by: string;
  at: string;
}

export interface TicketSla {
  status: SlaStatus;
  dueAt: string | null;
  responseTarget: string;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  requester: Requester;
  category: TicketCategory;
  module: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  assignedTo: Assignee | null;
  sla: TicketSla;
  relatedRecords: RelatedRecord[];
  attachments: TicketAttachment[];
  messages: TicketMessage[];
  internalNotes: TicketMessage[];
  activities: TicketActivity[];
  createdAt: string;
  updatedAt: string;
  resolutionSummary?: string;
  resolutionCategory?: string;
  escalationReason?: string;
  department: Department | "";
  rating: number | null;
  relatedStudentId: string | null;
}

