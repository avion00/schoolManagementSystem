// ── Enums / option lists ────────────────────────────────────────────────────────
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
  | "Technical Bug" | "Data Correction Request" | "Principal Request"
  | "Emergency / Safety" | "Other";

export const CATEGORY_OPTIONS: TicketCategory[] = [
  "Student Issue", "Parent Issue", "Teacher Complaint", "Staff Request",
  "Attendance Problem", "Exam / Result Problem", "Fee / Payment Problem",
  "Library Issue", "Transport Issue", "Hostel Issue", "Account/Login Issue",
  "Technical Bug", "Data Correction Request", "Principal Request",
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

export type SlaStatus = "On Track" | "Due Soon" | "Overdue";
export const SLA_STATUS_OPTIONS: SlaStatus[] = ["On Track", "Due Soon", "Overdue"];

export type TicketSource =
  | "Web Portal" | "Mobile App" | "Email" | "Phone Call" | "Walk-in Office" | "Admin Created";
export const SOURCE_OPTIONS: TicketSource[] = [
  "Web Portal", "Mobile App", "Email", "Phone Call", "Walk-in Office", "Admin Created",
];

export type Department =
  | "Academics" | "Accounts" | "Library" | "Transport" | "Hostel"
  | "Administration" | "IT" | "Examination" | "HR";
export const DEPARTMENT_OPTIONS: Department[] = [
  "Academics", "Accounts", "Library", "Transport", "Hostel", "Administration", "IT", "Examination", "HR",
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
  id: number;
  name: string;
  department: Department;
}

export interface Requester {
  id: number;
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
  id: number;
  name: string;
  size: string;
  type: string;
}

export interface TicketMessage {
  id: number;
  author: string;
  authorRole: string;
  body: string;
  isInternal: boolean;
  timestamp: string;
  attachments: TicketAttachment[];
}

export interface TicketActivity {
  id: number;
  action: string;
  by: string;
  at: string;
}

export interface TicketSla {
  status: SlaStatus;
  dueAt: string;
  responseTarget: string;
}

export interface SupportTicket {
  id: number;
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
}

// ── Assignee directory (for the assignment panel) ──────────────────────────────
export const ASSIGNEE_DIRECTORY: Assignee[] = [
  { id: 1, name: "Academic Coordinator", department: "Academics" },
  { id: 2, name: "Principal", department: "Administration" },
  { id: 3, name: "Class Teacher", department: "Academics" },
  { id: 4, name: "Subject Teacher", department: "Academics" },
  { id: 5, name: "Ramesh Shrestha", department: "Accounts" },
  { id: 6, name: "Sita Lama", department: "Library" },
  { id: 7, name: "Transport Manager", department: "Transport" },
  { id: 8, name: "Hostel Warden", department: "Hostel" },
  { id: 9, name: "Exam Controller", department: "Examination" },
  { id: 10, name: "IT Admin", department: "IT" },
  { id: 11, name: "HR / Admin Office", department: "HR" },
];

function assignee(name: string): Assignee {
  const found = ASSIGNEE_DIRECTORY.find((a) => a.name === name);
  if (!found) throw new Error(`Unknown assignee: ${name}`);
  return found;
}

// ── Requester directory ─────────────────────────────────────────────────────────
const REQUESTERS = {
  aaravKhan:       { id: 101, name: "Aarav Khan",       role: "Student" as const, email: "aarav.khan@example.com",       phone: "+977 9841000001", className: "Grade 8",  section: "A" },
  priyaThapa:      { id: 102, name: "Priya Thapa",      role: "Student" as const, email: "priya.thapa@example.com",      phone: "+977 9841000002", className: "Grade 6",  section: "B" },
  bishalRai:       { id: 103, name: "Bishal Rai",       role: "Student" as const, email: "bishal.rai@example.com",       phone: "+977 9841000003", className: "Grade 10", section: "C" },
  snehaGurung:     { id: 104, name: "Sneha Gurung",     role: "Student" as const, email: "sneha.gurung@example.com",     phone: "+977 9841000004", className: "Grade 9",  section: "A" },
  karanMalla:      { id: 105, name: "Karan Malla",      role: "Student" as const, email: "karan.malla@example.com",      phone: "+977 9841000005", className: "Grade 7",  section: "B" },

  kaziFahim:       { id: 201, name: "Kazi Fahim",       role: "Parent" as const, email: "kazi.fahim@example.com",       phone: "+977 9851000001", relatedChildName: "Aarav Khan" },
  sunitaKoirala:   { id: 202, name: "Sunita Koirala",   role: "Parent" as const, email: "sunita.koirala@example.com",   phone: "+977 9851000002", relatedChildName: "Priya Thapa" },
  rajeshBhattarai: { id: 203, name: "Rajesh Bhattarai", role: "Parent" as const, email: "rajesh.bhattarai@example.com", phone: "+977 9851000003", relatedChildName: "Bishal Rai" },
  meenaTamang:     { id: 204, name: "Meena Tamang",     role: "Parent" as const, email: "meena.tamang@example.com",     phone: "+977 9851000004", relatedChildName: "Sneha Gurung" },

  andrewMartin:    { id: 301, name: "Andrew Martin",    role: "Teacher" as const, email: "andrew.martin@example.com",    phone: "+977 9861000001", department: "Academics" },
  laxmiAdhikari:   { id: 302, name: "Laxmi Adhikari",   role: "Teacher" as const, email: "laxmi.adhikari@example.com",   phone: "+977 9861000002", department: "Academics" },
  deepakShrestha:  { id: 303, name: "Deepak Shrestha",  role: "Teacher" as const, email: "deepak.shrestha@example.com",  phone: "+977 9861000003", department: "Academics" },
  nishaPoudel:     { id: 304, name: "Nisha Poudel",     role: "Teacher" as const, email: "nisha.poudel@example.com",     phone: "+977 9861000004", department: "Academics" },

  rameshShrestha:  { id: 401, name: "Ramesh Shrestha",  role: "Accountant" as const,      email: "ramesh.shrestha@example.com",  phone: "+977 9871000001", department: "Accounts" },
  sitaLama:        { id: 402, name: "Sita Lama",        role: "Librarian" as const,       email: "sita.lama@example.com",        phone: "+977 9871000002", department: "Library" },
  transportManager:{ id: 403, name: "Transport Manager",role: "Transport Staff" as const, email: "transport.manager@example.com",phone: "+977 9871000003", department: "Transport" },
  hariBahadur:     { id: 404, name: "Hari Bahadur",     role: "Transport Staff" as const, email: "hari.bahadur@example.com",     phone: "+977 9871000004", department: "Transport" },
  hostelWarden:    { id: 405, name: "Hostel Warden",    role: "Hostel Staff" as const,    email: "hostel.warden@example.com",    phone: "+977 9871000005", department: "Hostel" },
  officeAssistant: { id: 406, name: "Office Assistant", role: "Staff" as const,           email: "office.assistant@example.com", phone: "+977 9871000006", department: "Administration" },

  principalOffice: { id: 501, name: "Principal Office", role: "Principal" as const, email: "principal.office@example.com", phone: "+977 9881000001", department: "Administration" },
  adminOffice:     { id: 502, name: "Admin Office",     role: "Admin" as const,     email: "admin.office@example.com",     phone: "+977 9881000002", department: "Administration" },
} satisfies Record<string, Requester>;

// ── Seed tickets (compact — expanded into full SupportTicket objects below) ────
interface TicketSeed {
  requester: Requester;
  category: TicketCategory;
  module: (typeof MODULE_OPTIONS)[number];
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  source: TicketSource;
  assignedTo?: string; // name key into ASSIGNEE_DIRECTORY
  createdHoursAgo: number;
  updatedHoursAgo: number;
  resolutionSummary?: string;
  resolutionCategory?: (typeof RESOLUTION_CATEGORY_OPTIONS)[number];
  escalationReason?: string;
  relatedRecords?: RelatedRecord[];
  internalNote?: string;
  hasAttachment?: boolean;
}

const SEEDS: TicketSeed[] = [
  { requester: REQUESTERS.aaravKhan, category: "Teacher Complaint", module: "Teachers",
    subject: "Problem with mathematics teacher assignment",
    description: "Student says the assigned teacher is not visible in the class routine.",
    priority: "High", status: "Assigned", source: "Web Portal", assignedTo: "Academic Coordinator",
    createdHoursAgo: 26, updatedHoursAgo: 6,
    relatedRecords: [{ type: "Student", label: "Aarav Khan", path: "/students/1" }, { type: "Class", label: "Grade 8-A", path: "/classes/8" }],
    internalNote: "Student issue forwarded to class teacher for confirmation of routine slot." },

  { requester: REQUESTERS.kaziFahim, category: "Fee / Payment Problem", module: "Fees",
    subject: "Cannot see child's fee details",
    description: "Parent reports the fee summary tab is blank for their child's account.",
    priority: "Normal", status: "Open", source: "Web Portal",
    createdHoursAgo: 30, updatedHoursAgo: 30,
    relatedRecords: [{ type: "Student", label: "Aarav Khan", path: "/students/1" }] },

  { requester: REQUESTERS.priyaThapa, category: "Exam / Result Problem", module: "Exams",
    subject: "Cannot see exam result for Grade 6",
    description: "Student says the mid-term result page shows 'not available' after publish date.",
    priority: "High", status: "In Progress", source: "Mobile App", assignedTo: "Exam Controller",
    createdHoursAgo: 10, updatedHoursAgo: 2,
    relatedRecords: [{ type: "Student", label: "Priya Thapa", path: "/students/2" }, { type: "Exam Result", label: "Mid-Term — Grade 6", path: "/exams/results" }] },

  { requester: REQUESTERS.sunitaKoirala, category: "Exam / Result Problem", module: "Exams",
    subject: "Cannot download report card",
    description: "Parent gets a download error when trying to print the report card PDF.",
    priority: "Normal", status: "Waiting for Department", source: "Web Portal", assignedTo: "Exam Controller",
    createdHoursAgo: 52, updatedHoursAgo: 20,
    internalNote: "Parent complaint needs report-card template review by exam team." },

  { requester: REQUESTERS.bishalRai, category: "Attendance Problem", module: "Attendance",
    subject: "Attendance marked incorrectly for last week",
    description: "Student says he was marked absent on days he attended school.",
    priority: "Normal", status: "Resolved", source: "Web Portal", assignedTo: "Class Teacher",
    createdHoursAgo: 100, updatedHoursAgo: 60,
    resolutionSummary: "Attendance corrected for the affected dates after verifying with the class teacher's register.",
    resolutionCategory: "Data Correction" },

  { requester: REQUESTERS.rajeshBhattarai, category: "Attendance Problem", module: "Attendance",
    subject: "Child's attendance shows absent despite present",
    description: "Parent is upset that repeated incorrect absences are affecting the monthly attendance percentage.",
    priority: "Urgent", status: "Escalated", source: "Phone Call", assignedTo: "Principal",
    createdHoursAgo: 4, updatedHoursAgo: 1,
    escalationReason: "Parent indicated they may file a formal complaint if not resolved today.",
    internalNote: "Parent complaint needs principal review before responding." },

  { requester: REQUESTERS.andrewMartin, category: "Technical Bug", module: "Exams",
    subject: "Cannot enter marks for Grade 8 Mathematics",
    description: "Marks entry screen throws a validation error when saving for more than 20 students at once.",
    priority: "Urgent", status: "New", source: "Web Portal",
    createdHoursAgo: 1, updatedHoursAgo: 1 },

  { requester: REQUESTERS.laxmiAdhikari, category: "Staff Request", module: "Classes",
    subject: "Class routine conflict for Science periods",
    description: "Two Science periods are scheduled at the same time slot for Grade 9-A.",
    priority: "High", status: "Open", source: "Web Portal",
    createdHoursAgo: 28, updatedHoursAgo: 28,
    relatedRecords: [{ type: "Class Routine", label: "Grade 9-A", path: "/class-routine" }] },

  { requester: REQUESTERS.deepakShrestha, category: "Technical Bug", module: "Attendance",
    subject: "Attendance save issue for Grade 9 Section A",
    description: "Daily attendance register does not save changes for the last two rows in the class list.",
    priority: "High", status: "In Progress", source: "Web Portal", assignedTo: "IT Admin",
    createdHoursAgo: 8, updatedHoursAgo: 3 },

  { requester: REQUESTERS.nishaPoudel, category: "Staff Request", module: "Classes",
    subject: "Student list missing for Social Studies class",
    description: "Teacher cannot see the enrolled student list when opening the Social Studies class page.",
    priority: "Normal", status: "Assigned", source: "Web Portal", assignedTo: "Academic Coordinator",
    createdHoursAgo: 50, updatedHoursAgo: 15 },

  { requester: REQUESTERS.snehaGurung, category: "Account/Login Issue", module: "Account",
    subject: "Cannot login to student portal",
    description: "Student gets 'invalid credentials' even after a password reset.",
    priority: "High", status: "Waiting for User", source: "Web Portal", assignedTo: "IT Admin",
    createdHoursAgo: 24, updatedHoursAgo: 12,
    internalNote: "Asked student to confirm the email used at admission before resetting again." },

  { requester: REQUESTERS.karanMalla, category: "Student Issue", module: "Students",
    subject: "Wrong class/section shown in profile",
    description: "Student profile shows Section B, but he was moved to Section A at the start of the term.",
    priority: "Normal", status: "Resolved", source: "Web Portal", assignedTo: "Academic Coordinator",
    createdHoursAgo: 120, updatedHoursAgo: 90,
    resolutionSummary: "Section corrected from B to A after verifying admission records.",
    resolutionCategory: "Data Correction" },

  { requester: REQUESTERS.meenaTamang, category: "Transport Issue", module: "Transport",
    subject: "Bus pickup delayed every morning this week",
    description: "Parent reports the Route 4 bus has been 20+ minutes late every day this week.",
    priority: "High", status: "Open", source: "Phone Call",
    createdHoursAgo: 6, updatedHoursAgo: 6 },

  { requester: REQUESTERS.transportManager, category: "Transport Issue", module: "Transport",
    subject: "Driver assignment conflict for Route 4",
    description: "Two drivers were assigned to Route 4 for the same morning shift.",
    priority: "Normal", status: "In Progress", source: "Admin Created", assignedTo: "Transport Manager",
    createdHoursAgo: 22, updatedHoursAgo: 5,
    relatedRecords: [{ type: "Transport Route", label: "Route 4", path: "/transport" }] },

  { requester: REQUESTERS.hariBahadur, category: "Transport Issue", module: "Transport",
    subject: "Bus fee mismatch for Route 7 students",
    description: "Several Route 7 students are being billed the Route 4 fee rate.",
    priority: "Normal", status: "Waiting for Department", source: "Walk-in Office", assignedTo: "Ramesh Shrestha",
    createdHoursAgo: 46, updatedHoursAgo: 18 },

  { requester: REQUESTERS.sitaLama, category: "Library Issue", module: "Library",
    subject: "Student fine mismatch in library records",
    description: "A returned book is still showing as overdue with an active fine on the student's account.",
    priority: "Low", status: "Open", source: "Walk-in Office",
    createdHoursAgo: 30, updatedHoursAgo: 30 },

  { requester: REQUESTERS.sitaLama, category: "Library Issue", module: "Library",
    subject: "Missing book record for Grade 10 catalog",
    description: "A newly received set of reference books is not appearing in the catalog search.",
    priority: "Low", status: "New", source: "Web Portal",
    createdHoursAgo: 3, updatedHoursAgo: 3 },

  { requester: REQUESTERS.rameshShrestha, category: "Fee / Payment Problem", module: "Fees",
    subject: "Payment mismatch in fee collection report",
    description: "The daily collection report total doesn't match the sum of individual receipts for Tuesday.",
    priority: "High", status: "In Progress", source: "Web Portal", assignedTo: "IT Admin",
    createdHoursAgo: 14, updatedHoursAgo: 4,
    hasAttachment: true },

  { requester: REQUESTERS.rameshShrestha, category: "Fee / Payment Problem", module: "Fees",
    subject: "Fee discount approval pending for scholarship student",
    description: "A 50% scholarship discount needs principal sign-off before the invoice can be finalized.",
    priority: "Normal", status: "Waiting for Department", source: "Web Portal", assignedTo: "Principal",
    createdHoursAgo: 70, updatedHoursAgo: 30 },

  { requester: REQUESTERS.hostelWarden, category: "Hostel Issue", module: "Hostel",
    subject: "Room allocation conflict for new hostel intake",
    description: "Two incoming students were both allocated Room 12B for the new term.",
    priority: "Normal", status: "Assigned", source: "Admin Created", assignedTo: "HR / Admin Office",
    createdHoursAgo: 26, updatedHoursAgo: 10 },

  { requester: REQUESTERS.principalOffice, category: "Principal Request", module: "Notices",
    subject: "Urgent school notice needs to go out today",
    description: "Tomorrow's holiday announcement must be published and emailed to all parents before 5 PM.",
    priority: "Urgent", status: "Escalated", source: "Walk-in Office", assignedTo: "HR / Admin Office",
    createdHoursAgo: 3, updatedHoursAgo: 1,
    escalationReason: "Time-sensitive notice for tomorrow's holiday announcement." },

  { requester: REQUESTERS.officeAssistant, category: "Staff Request", module: "Exams",
    subject: "Staff assignment conflict for exam duty",
    description: "Two teachers were assigned invigilation duty for the same room and time slot.",
    priority: "Normal", status: "Open", source: "Admin Created",
    createdHoursAgo: 20, updatedHoursAgo: 20 },

  { requester: REQUESTERS.aaravKhan, category: "Data Correction Request", module: "Students",
    subject: "Profile information wrong (date of birth)",
    description: "Student's date of birth is incorrect on the profile, which affects the admit card.",
    priority: "Low", status: "Resolved", source: "Web Portal", assignedTo: "Academic Coordinator",
    createdHoursAgo: 140, updatedHoursAgo: 110,
    resolutionSummary: "Date of birth corrected after verifying the birth certificate copy on file.",
    resolutionCategory: "Data Correction" },

  { requester: REQUESTERS.kaziFahim, category: "Teacher Complaint", module: "Teachers",
    subject: "Complaint about teacher's classroom conduct",
    description: "Parent raised concerns about a teacher raising their voice at students during class.",
    priority: "High", status: "Waiting for Department", source: "Email", assignedTo: "Principal",
    createdHoursAgo: 48, updatedHoursAgo: 24,
    internalNote: "Forwarded to principal for a private conversation with the teacher." },

  { requester: REQUESTERS.priyaThapa, category: "Fee / Payment Problem", module: "Fees",
    subject: "Fee shown incorrectly on student dashboard",
    description: "Dashboard shows the full fee amount even though a scholarship discount was already applied.",
    priority: "Normal", status: "Resolved", source: "Web Portal", assignedTo: "Ramesh Shrestha",
    createdHoursAgo: 76, updatedHoursAgo: 50,
    resolutionSummary: "Fee structure correction applied; the amount now reflects the approved scholarship discount.",
    resolutionCategory: "Billing Correction" },

  { requester: REQUESTERS.sunitaKoirala, category: "Transport Issue", module: "Transport",
    subject: "Payment receipt missing for bus fee",
    description: "Parent paid the term bus fee at the office but never received an emailed receipt.",
    priority: "Low", status: "Closed", source: "Email", assignedTo: "Ramesh Shrestha",
    createdHoursAgo: 170, updatedHoursAgo: 150,
    resolutionSummary: "Duplicate receipt emailed to the parent directly.",
    resolutionCategory: "Billing Correction" },

  { requester: REQUESTERS.andrewMartin, category: "Exam / Result Problem", module: "Exams",
    subject: "Exam schedule conflict for two sections",
    description: "Grade 8-A and Grade 8-B mathematics exams are both scheduled in the same room at the same time.",
    priority: "High", status: "Escalated", source: "Web Portal", assignedTo: "Exam Controller",
    createdHoursAgo: 5, updatedHoursAgo: 1,
    escalationReason: "Two exams overlap in the same room; needs immediate reschedule approval." },

  { requester: REQUESTERS.bishalRai, category: "Emergency / Safety", module: "Students",
    subject: "Reported bullying incident in Grade 10",
    description: "Student reported a bullying incident involving another student during lunch break.",
    priority: "Urgent", status: "Escalated", source: "Walk-in Office", assignedTo: "Principal",
    createdHoursAgo: 2, updatedHoursAgo: 1,
    escalationReason: "Safety concern requires immediate principal review and parent notification." },

  { requester: REQUESTERS.karanMalla, category: "Emergency / Safety", module: "Students",
    subject: "Minor injury during sports period",
    description: "Student sustained a minor ankle injury during the physical education period.",
    priority: "High", status: "Resolved", source: "Phone Call", assignedTo: "Principal",
    createdHoursAgo: 30, updatedHoursAgo: 26,
    resolutionSummary: "Parent notified, first aid administered on site, and the incident was logged.",
    resolutionCategory: "Safety" },

  { requester: REQUESTERS.snehaGurung, category: "Technical Bug", module: "Exams",
    subject: "Page not loading on results page",
    description: "The exam results page has been reopened — it started failing to load again after the earlier fix.",
    priority: "Normal", status: "Reopened", source: "Web Portal", assignedTo: "IT Admin",
    createdHoursAgo: 96, updatedHoursAgo: 2 },

  { requester: REQUESTERS.meenaTamang, category: "Account/Login Issue", module: "Account",
    subject: "Login problem accessing parent portal",
    description: "Parent is redirected back to the login page repeatedly after entering correct credentials.",
    priority: "Normal", status: "New", source: "Mobile App",
    createdHoursAgo: 1, updatedHoursAgo: 1 },

  { requester: REQUESTERS.rajeshBhattarai, category: "Data Correction Request", module: "Exams",
    subject: "Child's name misspelled on report card",
    description: "The printed report card spells the student's middle name incorrectly.",
    priority: "Low", status: "Assigned", source: "Email", assignedTo: "Exam Controller",
    createdHoursAgo: 40, updatedHoursAgo: 16 },

  { requester: REQUESTERS.deepakShrestha, category: "Staff Request", module: "Subjects",
    subject: "Subject not assigned for new academic year",
    description: "Teacher was not assigned any subjects for the new academic year despite requesting Physics and Chemistry.",
    priority: "Normal", status: "Open", source: "Admin Created",
    createdHoursAgo: 60, updatedHoursAgo: 60 },

  { requester: REQUESTERS.laxmiAdhikari, category: "Technical Bug", module: "Notices",
    subject: "Notification not sent to parents after notice publish",
    description: "Publishing a notice to parents does not trigger the in-app or email notification as expected.",
    priority: "High", status: "In Progress", source: "Web Portal", assignedTo: "IT Admin",
    createdHoursAgo: 9, updatedHoursAgo: 3 },

  { requester: REQUESTERS.nishaPoudel, category: "Technical Bug", module: "Attendance",
    subject: "Permission error opening attendance register",
    description: "Teacher gets a 'permission denied' error opening the attendance register for her own class.",
    priority: "Urgent", status: "New", source: "Web Portal",
    createdHoursAgo: 0.5, updatedHoursAgo: 0.5 },

  { requester: REQUESTERS.adminOffice, category: "Technical Bug", module: "Settings",
    subject: "Data not saving on settings page",
    description: "School profile settings revert to the old values after saving and refreshing the page.",
    priority: "High", status: "In Progress", source: "Web Portal", assignedTo: "IT Admin",
    createdHoursAgo: 7, updatedHoursAgo: 2 },

  { requester: REQUESTERS.principalOffice, category: "Other", module: "Dashboard",
    subject: "Report access issue for board meeting",
    description: "Principal cannot export the enrollment summary report needed for tomorrow's board meeting.",
    priority: "Normal", status: "Waiting for Department", source: "Walk-in Office", assignedTo: "IT Admin",
    createdHoursAgo: 20, updatedHoursAgo: 8 },

  { requester: REQUESTERS.kaziFahim, category: "Parent Issue", module: "Dashboard",
    subject: "General feedback about the new parent app",
    description: "Parent shared general feedback and a few suggestions about the new parent mobile app layout.",
    priority: "Low", status: "Closed", source: "Mobile App",
    createdHoursAgo: 240, updatedHoursAgo: 220,
    resolutionSummary: "Feedback logged for the product team; no action required.",
    resolutionCategory: "Feedback" },

  { requester: REQUESTERS.hostelWarden, category: "Staff Request", module: "Hostel",
    subject: "Additional warden needed for night shift",
    description: "Hostel warden requests an additional staff member for the night shift given the increased intake.",
    priority: "Low", status: "Open", source: "Walk-in Office",
    createdHoursAgo: 68, updatedHoursAgo: 68 },

  { requester: REQUESTERS.transportManager, category: "Emergency / Safety", module: "Transport",
    subject: "Bus breakdown reported mid-route",
    description: "Route 2 bus broke down mid-route with students on board.",
    priority: "Urgent", status: "Resolved", source: "Phone Call", assignedTo: "Transport Manager",
    createdHoursAgo: 28, updatedHoursAgo: 27,
    resolutionSummary: "Backup vehicle dispatched immediately; all students reached school safely within 40 minutes.",
    resolutionCategory: "Safety" },
];

// ── Builders ─────────────────────────────────────────────────────────────────
const NOW = Date.now();
function hoursAgoIso(hours: number): string {
  return new Date(NOW - hours * 3600_000).toISOString();
}

function computeSlaStatus(dueAtIso: string, status: TicketStatus): SlaStatus {
  if (status === "Resolved" || status === "Closed") return "On Track";
  const dueAt = new Date(dueAtIso).getTime();
  const diff = dueAt - NOW;
  if (diff < 0) return "Overdue";
  if (diff < 3 * 3600_000) return "Due Soon";
  return "On Track";
}

const AUTHOR_LABEL: Record<string, string> = {
  Academics: "Academic Coordinator", Accounts: "Accounts Team", Library: "Library Desk",
  Transport: "Transport Office", Hostel: "Hostel Office", Administration: "Admin Office",
  IT: "IT Support", Examination: "Examination Office", HR: "HR / Admin Office",
};

let messageIdSeq = 1;
let activityIdSeq = 1;
let attachmentIdSeq = 1;

function buildTicket(seed: TicketSeed, index: number): SupportTicket {
  const createdAt = hoursAgoIso(seed.createdHoursAgo);
  const updatedAt = hoursAgoIso(seed.updatedHoursAgo);
  const dueAt = new Date(new Date(createdAt).getTime() + SLA_HOURS[seed.priority] * 3600_000).toISOString();
  const assignedTo = seed.assignedTo ? assignee(seed.assignedTo) : null;

  const messages: TicketMessage[] = [
    {
      id: messageIdSeq++,
      author: seed.requester.name,
      authorRole: seed.requester.role,
      body: seed.description,
      isInternal: false,
      timestamp: createdAt,
      attachments: seed.hasAttachment
        ? [{ id: attachmentIdSeq++, name: "supporting-document.pdf", size: "412 KB", type: "PDF" }]
        : [],
    },
  ];

  if (assignedTo && seed.status !== "New") {
    messages.push({
      id: messageIdSeq++,
      author: AUTHOR_LABEL[assignedTo.department] ?? assignedTo.name,
      authorRole: "Support Team",
      body: `Thanks for reaching out — this has been picked up by ${assignedTo.name} (${assignedTo.department}). We'll follow up shortly.`,
      isInternal: false,
      timestamp: hoursAgoIso(Math.max(seed.updatedHoursAgo + 1, 0)),
      attachments: [],
    });
  }

  if (seed.status === "Resolved" || seed.status === "Closed") {
    messages.push({
      id: messageIdSeq++,
      author: assignedTo ? assignedTo.name : "Support Team",
      authorRole: "Support Team",
      body: seed.resolutionSummary ?? "This issue has been resolved.",
      isInternal: false,
      timestamp: updatedAt,
      attachments: [],
    });
  }

  const internalNotes: TicketMessage[] = seed.internalNote
    ? [{
        id: messageIdSeq++,
        author: "Super Admin",
        authorRole: "Support Team",
        body: seed.internalNote,
        isInternal: true,
        timestamp: hoursAgoIso(Math.max(seed.updatedHoursAgo, 0.25)),
        attachments: [],
      }]
    : [];

  const activities: TicketActivity[] = [
    { id: activityIdSeq++, action: "Ticket created", by: seed.requester.name, at: createdAt },
  ];
  if (assignedTo) {
    activities.push({
      id: activityIdSeq++,
      action: `Assigned to ${assignedTo.name} (${assignedTo.department})`,
      by: "Super Admin",
      at: hoursAgoIso(Math.max(seed.updatedHoursAgo + 2, seed.createdHoursAgo - 1)),
    });
  }
  if (seed.status === "Escalated") {
    activities.push({ id: activityIdSeq++, action: `Escalated — ${seed.escalationReason ?? "urgent review required"}`, by: "Super Admin", at: updatedAt });
  }
  if (seed.status === "Resolved" || seed.status === "Closed") {
    activities.push({ id: activityIdSeq++, action: "Marked as resolved", by: assignedTo?.name ?? "Support Team", at: updatedAt });
  }
  if (seed.status === "Closed") {
    activities.push({ id: activityIdSeq++, action: "Closed by admin", by: "Super Admin", at: updatedAt });
  }
  if (seed.status === "Reopened") {
    activities.push({ id: activityIdSeq++, action: "Reopened by requester", by: seed.requester.name, at: updatedAt });
  }

  return {
    id: index + 1,
    ticketId: `SUP-2026-${String(index + 1).padStart(4, "0")}`,
    requester: seed.requester,
    category: seed.category,
    module: seed.module,
    subject: seed.subject,
    description: seed.description,
    priority: seed.priority,
    status: seed.status,
    source: seed.source,
    assignedTo,
    sla: {
      status: computeSlaStatus(dueAt, seed.status),
      dueAt,
      responseTarget: SLA_LABEL[seed.priority],
    },
    relatedRecords: seed.relatedRecords ?? [],
    attachments: seed.hasAttachment
      ? [{ id: attachmentIdSeq++, name: "supporting-document.pdf", size: "412 KB", type: "PDF" }]
      : [],
    messages,
    internalNotes,
    activities,
    createdAt,
    updatedAt,
    resolutionSummary: seed.resolutionSummary,
    resolutionCategory: seed.resolutionCategory,
    escalationReason: seed.escalationReason,
  };
}

export const SUPPORT_TICKETS: SupportTicket[] = SEEDS.map(buildTicket);

// ── Manual ticket creation (Create Ticket modal / page) ─────────────────────────
export interface NewTicketFormData {
  requesterRole: TicketRequesterRole | "";
  requesterName: string;
  relatedRecord: string;
  category: TicketCategory | "";
  module: string;
  subject: string;
  description: string;
  priority: TicketPriority | "";
  assignTo: string;
  dueDate: string;
  attachmentName?: string;
  notifyRequester: boolean;
}

let manualTicketSeq = 100000;

export function createTicketFromForm(data: NewTicketFormData): SupportTicket {
  const id = manualTicketSeq++;
  const now = new Date().toISOString();
  const priority = (data.priority || "Normal") as TicketPriority;
  const dueAt = new Date(Date.now() + SLA_HOURS[priority] * 3600_000).toISOString();
  const assignedTo = data.assignTo ? ASSIGNEE_DIRECTORY.find((a) => a.name === data.assignTo) ?? null : null;
  const slug = data.requesterName.trim().toLowerCase().replace(/\s+/g, ".") || "requester";

  return {
    id,
    ticketId: `SUP-2026-${String(id).slice(-4)}`,
    requester: {
      id,
      name: data.requesterName.trim(),
      role: data.requesterRole as TicketRequesterRole,
      email: `${slug}@example.com`,
      phone: "—",
      relatedChildName: data.relatedRecord || undefined,
    },
    category: data.category as TicketCategory,
    module: data.module,
    subject: data.subject.trim(),
    description: data.description.trim(),
    priority,
    status: assignedTo ? "Assigned" : "New",
    source: "Admin Created",
    assignedTo,
    sla: { status: "On Track", dueAt, responseTarget: `${SLA_HOURS[priority]} hours` },
    relatedRecords: [],
    attachments: data.attachmentName ? [{ id, name: data.attachmentName, size: "—", type: "File" }] : [],
    messages: [{ id, author: data.requesterName.trim(), authorRole: data.requesterRole, body: data.description.trim(), isInternal: false, timestamp: now, attachments: [] }],
    internalNotes: [],
    activities: [{ id, action: "Ticket created by Super Admin", by: "Super Admin", at: now }],
    createdAt: now,
    updatedAt: now,
  };
}
