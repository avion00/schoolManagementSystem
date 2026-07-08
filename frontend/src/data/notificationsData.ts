// ── Enums / option lists ────────────────────────────────────────────────────────
export type NotificationCategory =
  | "Admissions" | "Attendance" | "Exams" | "Fees" | "Billing" | "Payroll"
  | "Teachers" | "Parents" | "Notices" | "Messages" | "Security" | "System"
  | "Reports" | "Approvals";

export const CATEGORY_OPTIONS: NotificationCategory[] = [
  "Admissions", "Attendance", "Exams", "Fees", "Billing", "Payroll",
  "Teachers", "Parents", "Notices", "Messages", "Security", "System",
  "Reports", "Approvals",
];

export type NotificationType =
  | "info" | "success" | "warning" | "error" | "approval" | "reminder" | "payment" | "security";
export const TYPE_OPTIONS: NotificationType[] = [
  "info", "success", "warning", "error", "approval", "reminder", "payment", "security",
];

export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export const PRIORITY_OPTIONS: NotificationPriority[] = ["low", "normal", "high", "urgent"];

export type NotificationStatus = "unread" | "read" | "archived";
export const STATUS_OPTIONS: NotificationStatus[] = ["unread", "read", "archived"];

export type NotificationChannel = "system" | "email" | "sms" | "push" | "in-app";
export const CHANNEL_OPTIONS: NotificationChannel[] = ["system", "email", "sms", "push", "in-app"];

export interface NotificationActivity {
  id: number;
  action: string;
  at: string;
}

export interface AppNotification {
  id: number;
  notificationId: string;
  title: string;
  description: string;
  category: NotificationCategory;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  channel: NotificationChannel;
  createdAt: string;
  createdBy: string;
  targetRole: string;
  relatedModule: string;
  relatedId: string;
  actionUrl: string;
  readAt: string | null;
  activity: NotificationActivity[];
  isApproval?: boolean;
  approvalDecision?: "approved" | "rejected" | null;
}

// ── Seeds ─────────────────────────────────────────────────────────────────────
interface Seed {
  title: string;
  description: string;
  category: NotificationCategory;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  createdBy: string;
  relatedModule: string;
  relatedId: string;
  actionUrl: string;
  hoursAgo: number;
  status?: NotificationStatus;
  isApproval?: boolean;
}

const SEEDS: Seed[] = [
  // Admissions
  { title: "New student admission submitted", description: "A new admission form for Aarav Khan is waiting for review.", category: "Admissions", type: "approval", priority: "high", channel: "system", createdBy: "Admission Office", relatedModule: "Students", relatedId: "ADM-2033", actionUrl: "/students/1", hoursAgo: 0.5, isApproval: true },
  { title: "Admission form incomplete", description: "Priya Thapa's admission form is missing guardian contact details.", category: "Admissions", type: "warning", priority: "normal", channel: "email", createdBy: "Admission Office", relatedModule: "Students", relatedId: "ADM-2041", actionUrl: "/students/2", hoursAgo: 5 },
  { title: "Admission approved", description: "Bishal Rai's admission was approved and enrolled in Grade 10-C.", category: "Admissions", type: "success", priority: "low", channel: "system", createdBy: "Super Admin", relatedModule: "Students", relatedId: "ADM-2019", actionUrl: "/students/3", hoursAgo: 30, status: "read" },
  { title: "Waitlisted applicant follow-up due", description: "Follow up with 3 waitlisted applicants before Friday's intake deadline.", category: "Admissions", type: "reminder", priority: "normal", channel: "in-app", createdBy: "Admission Office", relatedModule: "Students", relatedId: "ADM-WAITLIST", actionUrl: "/students", hoursAgo: 20 },

  // Attendance
  { title: "Class attendance not submitted", description: "Grade 7-B attendance has not been marked for today.", category: "Attendance", type: "warning", priority: "high", channel: "push", createdBy: "System", relatedModule: "Attendance", relatedId: "ATT-7B", actionUrl: "/attendance/daily", hoursAgo: 2 },
  { title: "Low attendance alert", description: "Sabina Lama's attendance has dropped below 75% this month.", category: "Attendance", type: "error", priority: "high", channel: "email", createdBy: "System", relatedModule: "Attendance", relatedId: "ATT-STU-18", actionUrl: "/attendance/student", hoursAgo: 14 },
  { title: "Monthly attendance report ready", description: "The July attendance summary report has been generated.", category: "Attendance", type: "info", priority: "low", channel: "system", createdBy: "System", relatedModule: "Attendance", relatedId: "ATT-JUL", actionUrl: "/attendance/reports", hoursAgo: 40, status: "read" },

  // Exams
  { title: "Exam schedule conflict detected", description: "Grade 8-A and Grade 8-B mathematics exams overlap in Room 3.", category: "Exams", type: "error", priority: "urgent", channel: "system", createdBy: "Exam Controller", relatedModule: "Exams", relatedId: "EXM-SCH-12", actionUrl: "/exams/schedule", hoursAgo: 1 },
  { title: "Marks entry pending", description: "Science marks for Grade 9 have not been entered yet — deadline is tomorrow.", category: "Exams", type: "reminder", priority: "high", channel: "email", createdBy: "Exam Controller", relatedModule: "Exams", relatedId: "EXM-MARKS-9", actionUrl: "/exams/marks-entry", hoursAgo: 8 },
  { title: "Exam results published", description: "Mid-term results for Grade 6 have been published to parents.", category: "Exams", type: "success", priority: "normal", channel: "system", createdBy: "Exam Controller", relatedModule: "Exams", relatedId: "EXM-RES-6", actionUrl: "/exams/results", hoursAgo: 50, status: "read" },

  // Fees
  { title: "Overdue fee payment", description: "Bishal Rai's tuition fee is overdue by 5 days ($8,800 outstanding).", category: "Fees", type: "warning", priority: "high", channel: "email", createdBy: "System", relatedModule: "Fees", relatedId: "INV-2026-0003", actionUrl: "/billing/invoices/3", hoursAgo: 3 },
  { title: "Invoice payment received", description: "Payment of $8,000 received for INV-2026-0001 (Aarav Khan).", category: "Fees", type: "payment", priority: "low", channel: "system", createdBy: "Ramesh Shrestha", relatedModule: "Fees", relatedId: "INV-2026-0001", actionUrl: "/billing/invoices/1", hoursAgo: 6, status: "read" },
  { title: "Scholarship discount applied", description: "A 100% scholarship discount was applied to Nabin Tamang's fee plan.", category: "Fees", type: "info", priority: "normal", channel: "system", createdBy: "Super Admin", relatedModule: "Fees", relatedId: "STU-FEE-9", actionUrl: "/billing/fees", hoursAgo: 26 },

  // Billing
  { title: "Expense approval required", description: "A $42,000 furniture expense from Himal Furniture House needs approval.", category: "Billing", type: "approval", priority: "high", channel: "system", createdBy: "Accounts Team", relatedModule: "Billing", relatedId: "EXP-2026-0008", actionUrl: "/billing/expenses", hoursAgo: 4, isApproval: true },
  { title: "Vendor bill due soon", description: "Valley Transport Co. invoice of $21,000 is due in 3 days.", category: "Billing", type: "reminder", priority: "normal", channel: "email", createdBy: "Accounts Team", relatedModule: "Billing", relatedId: "VEN-2026-0005", actionUrl: "/billing/vendors", hoursAgo: 16 },
  { title: "Monthly financial report generated", description: "The July profit & loss summary is ready for review.", category: "Billing", type: "info", priority: "low", channel: "system", createdBy: "System", relatedModule: "Billing", relatedId: "RPT-PL-JUL", actionUrl: "/billing/reports", hoursAgo: 45, status: "read" },

  // Payroll
  { title: "Payroll generation waiting approval", description: "July payroll for 15 staff members ($604,100 total) is ready for approval.", category: "Payroll", type: "approval", priority: "urgent", channel: "system", createdBy: "Accounts Team", relatedModule: "Payroll", relatedId: "PAYROLL-JUL", actionUrl: "/billing/payroll", hoursAgo: 2, isApproval: true },
  { title: "Payroll pending for 6 staff", description: "6 staff members still show a pending payroll status for July.", category: "Payroll", type: "warning", priority: "high", channel: "email", createdBy: "System", relatedModule: "Payroll", relatedId: "PAYROLL-PENDING", actionUrl: "/billing/payroll", hoursAgo: 10 },
  { title: "Payslips generated", description: "Payslips for 9 staff members have been generated and emailed.", category: "Payroll", type: "success", priority: "low", channel: "email", createdBy: "System", relatedModule: "Payroll", relatedId: "PAYSLIP-JUL", actionUrl: "/billing/payroll", hoursAgo: 48, status: "read" },

  // Teachers
  { title: "New teacher onboarding pending", description: "Kabir Joshi's onboarding paperwork is awaiting HR sign-off.", category: "Teachers", type: "reminder", priority: "normal", channel: "in-app", createdBy: "HR / Admin Office", relatedModule: "Teachers", relatedId: "EMP-2026-0013", actionUrl: "/teachers", hoursAgo: 18 },
  { title: "Teacher complaint received", description: "A parent complaint was filed regarding a teacher's classroom conduct.", category: "Teachers", type: "warning", priority: "high", channel: "system", createdBy: "Principal Office", relatedModule: "Teachers", relatedId: "TCH-COMPLAINT-4", actionUrl: "/teachers", hoursAgo: 9 },
  { title: "Subject assignment updated", description: "Deepak Shrestha was assigned to teach Physics for the new term.", category: "Teachers", type: "info", priority: "low", channel: "system", createdBy: "Academic Coordinator", relatedModule: "Teachers", relatedId: "TCH-ASSIGN-7", actionUrl: "/teachers", hoursAgo: 33, status: "read" },

  // Parents
  { title: "Parent portal login issue reported", description: "Meena Tamang reported repeated login failures on the parent portal.", category: "Parents", type: "error", priority: "normal", channel: "email", createdBy: "IT Support", relatedModule: "Parents", relatedId: "PAR-LOGIN-4", actionUrl: "/parents", hoursAgo: 7 },
  { title: "Parent feedback submitted", description: "New feedback about the parent mobile app was submitted by Kazi Fahim.", category: "Parents", type: "info", priority: "low", channel: "in-app", createdBy: "Kazi Fahim", relatedModule: "Parents", relatedId: "PAR-FEEDBACK-2", actionUrl: "/parents", hoursAgo: 60, status: "read" },

  // Notices
  { title: "Notice waiting publish approval", description: "\"Final Examination Routine\" notice is drafted and awaiting publish approval.", category: "Notices", type: "approval", priority: "high", channel: "system", createdBy: "Front Office", relatedModule: "Notices", relatedId: "NOT-2026-0012", actionUrl: "/notices", hoursAgo: 3, isApproval: true },
  { title: "Notice published", description: "\"Annual Sports Day\" notice was published to all parents and students.", category: "Notices", type: "success", priority: "low", channel: "system", createdBy: "Super Admin", relatedModule: "Notices", relatedId: "NOT-2026-0008", actionUrl: "/notices", hoursAgo: 52, status: "read" },

  // Messages
  { title: "Unread parent messages piling up", description: "12 parent messages in the inbox have been unread for over 24 hours.", category: "Messages", type: "reminder", priority: "normal", channel: "in-app", createdBy: "System", relatedModule: "Messages", relatedId: "MSG-INBOX", actionUrl: "/messages/inbox", hoursAgo: 12 },
  { title: "Message delivery failed", description: "A bulk SMS to Grade 10 parents failed to send due to a gateway error.", category: "Messages", type: "error", priority: "high", channel: "sms", createdBy: "System", relatedModule: "Messages", relatedId: "MSG-BULK-3", actionUrl: "/messages", hoursAgo: 5 },

  // Security
  { title: "New admin login detected", description: "A new login to the Super Admin account was detected from a new device.", category: "Security", type: "security", priority: "urgent", channel: "email", createdBy: "System", relatedModule: "Security", relatedId: "SEC-LOGIN-91", actionUrl: "/settings", hoursAgo: 1.5 },
  { title: "Failed login attempt", description: "5 consecutive failed login attempts were detected for admin@platform.test.", category: "Security", type: "security", priority: "urgent", channel: "email", createdBy: "System", relatedModule: "Security", relatedId: "SEC-FAIL-14", actionUrl: "/settings", hoursAgo: 9 },
  { title: "User role changed", description: "Ramesh Shrestha's role was changed from Staff to Accountant.", category: "Security", type: "info", priority: "normal", channel: "system", createdBy: "Super Admin", relatedModule: "Security", relatedId: "SEC-ROLE-6", actionUrl: "/users", hoursAgo: 22, status: "read" },
  { title: "Settings updated", description: "Billing settings (invoice numbering format) were updated.", category: "Security", type: "info", priority: "low", channel: "system", createdBy: "Super Admin", relatedModule: "Security", relatedId: "SEC-SET-3", actionUrl: "/billing/settings", hoursAgo: 36, status: "read" },

  // System
  { title: "Backup completed", description: "Nightly database backup completed successfully (2.4 GB).", category: "System", type: "success", priority: "low", channel: "system", createdBy: "System", relatedModule: "System", relatedId: "SYS-BACKUP-204", actionUrl: "/settings", hoursAgo: 11, status: "read" },
  { title: "Database sync failed", description: "Scheduled database sync to the reporting replica failed twice.", category: "System", type: "error", priority: "urgent", channel: "system", createdBy: "System", relatedModule: "System", relatedId: "SYS-SYNC-77", actionUrl: "/settings", hoursAgo: 4 },
  { title: "Server disk usage high", description: "Application server disk usage has reached 85% capacity.", category: "System", type: "warning", priority: "high", channel: "email", createdBy: "System", relatedModule: "System", relatedId: "SYS-DISK-12", actionUrl: "/settings", hoursAgo: 15 },
  { title: "Scheduled maintenance reminder", description: "Platform maintenance is scheduled for Sunday 2:00 AM – 3:00 AM.", category: "System", type: "reminder", priority: "normal", channel: "push", createdBy: "System", relatedModule: "System", relatedId: "SYS-MAINT-9", actionUrl: "/settings", hoursAgo: 28 },

  // Reports
  { title: "Weekly report digest ready", description: "The weekly admin digest covering fees, attendance, and exams is ready.", category: "Reports", type: "info", priority: "low", channel: "email", createdBy: "System", relatedModule: "Reports", relatedId: "RPT-DIGEST-27", actionUrl: "/billing/reports", hoursAgo: 24, status: "read" },
  { title: "Outstanding dues report flagged", description: "Outstanding dues have crossed $1,000,000 for the current term.", category: "Reports", type: "warning", priority: "high", channel: "system", createdBy: "System", relatedModule: "Reports", relatedId: "RPT-DUES-8", actionUrl: "/billing/reports", hoursAgo: 6 },

  // Approvals (generic, non-domain-specific catch-alls)
  { title: "Transport route change awaiting approval", description: "A change to Route 4's pickup schedule needs Super Admin sign-off.", category: "Approvals", type: "approval", priority: "normal", channel: "system", createdBy: "Transport Manager", relatedModule: "Transport", relatedId: "TRN-ROUTE-4", actionUrl: "/transport", hoursAgo: 13, isApproval: true },
  { title: "Hostel room reallocation approved", description: "Room 12B reallocation for new hostel intake was approved.", category: "Approvals", type: "success", priority: "low", channel: "system", createdBy: "Super Admin", relatedModule: "Hostel", relatedId: "HOS-ROOM-12B", actionUrl: "/hostel", hoursAgo: 54, status: "read" },

  // A few more to round out volume / older archived-looking items
  { title: "Library fine mismatch reported", description: "A returned book still shows an active overdue fine.", category: "Reports", type: "warning", priority: "low", channel: "in-app", createdBy: "Sita Lama", relatedModule: "Library", relatedId: "LIB-FINE-2", actionUrl: "/library", hoursAgo: 70, status: "read" },
  { title: "Class routine conflict resolved", description: "The Grade 9-A science period conflict has been resolved.", category: "System", type: "success", priority: "low", channel: "system", createdBy: "Academic Coordinator", relatedModule: "Class Routine", relatedId: "CR-CONFLICT-3", actionUrl: "/class-routine", hoursAgo: 90, status: "archived" },
  { title: "Old admission draft auto-archived", description: "An incomplete admission draft older than 30 days was auto-archived.", category: "Admissions", type: "info", priority: "low", channel: "system", createdBy: "System", relatedModule: "Students", relatedId: "ADM-DRAFT-OLD", actionUrl: "/students", hoursAgo: 400, status: "archived" },
  { title: "Expense request rejected", description: "The events budget expense request was rejected pending revision.", category: "Billing", type: "error", priority: "normal", channel: "system", createdBy: "Super Admin", relatedModule: "Billing", relatedId: "EXP-2026-0011", actionUrl: "/billing/expenses", hoursAgo: 120, status: "archived" },
  { title: "Fee structure updated", description: "The Grade 6–10 monthly tuition fee was updated for the new term.", category: "Fees", type: "info", priority: "low", channel: "system", createdBy: "Super Admin", relatedModule: "Fees", relatedId: "FEE-STRUCT-3", actionUrl: "/billing/fees", hoursAgo: 150, status: "archived" },
];

// ── Builder ───────────────────────────────────────────────────────────────────
const NOW = Date.now();
function hoursAgoIso(hours: number): string {
  return new Date(NOW - hours * 3600_000).toISOString();
}

function buildActivity(createdAt: string, status: NotificationStatus, readAt: string | null): NotificationActivity[] {
  const acts: NotificationActivity[] = [{ id: 1, action: "Notification created", at: createdAt }];
  if (status === "read" || status === "archived") {
    acts.push({ id: 2, action: "Marked as read", at: readAt ?? createdAt });
  }
  if (status === "archived") {
    acts.push({ id: 3, action: "Archived", at: readAt ?? createdAt });
  }
  return acts;
}

export const NOTIFICATIONS: AppNotification[] = SEEDS.map((seed, i) => {
  const createdAt = hoursAgoIso(seed.hoursAgo);
  const status: NotificationStatus = seed.status ?? "unread";
  const readAt = status === "unread" ? null : hoursAgoIso(Math.max(seed.hoursAgo - 0.5, 0));
  return {
    id: i + 1,
    notificationId: `NTF-2026-${String(i + 1).padStart(4, "0")}`,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    type: seed.type,
    priority: seed.priority,
    status,
    channel: seed.channel,
    createdAt,
    createdBy: seed.createdBy,
    targetRole: "Super Admin",
    relatedModule: seed.relatedModule,
    relatedId: seed.relatedId,
    actionUrl: seed.actionUrl,
    readAt,
    activity: buildActivity(createdAt, status, readAt),
    isApproval: seed.isApproval ?? false,
    approvalDecision: null,
  };
});
