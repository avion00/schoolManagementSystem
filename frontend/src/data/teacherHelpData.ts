/**
 * Mock data for the Teacher Help Center (/teacher/help). Scoped entirely to
 * the one demo teacher and the students/classes already seeded in
 * teacherDashboardData.ts — never reaches into the school-wide admin help
 * desk dataset (helpDeskData.ts), so teachers never see global tickets.
 */

export type HelpRequestType =
  | "Technical" | "Attendance" | "Student Support" | "Parent Concern"
  | "Class Issue" | "Exam / Marks" | "Materials" | "Admin Approval" | "Other";

export const HELP_REQUEST_TYPES: HelpRequestType[] = [
  "Technical", "Attendance", "Student Support", "Parent Concern",
  "Class Issue", "Exam / Marks", "Materials", "Admin Approval", "Other",
];

export type HelpPriority = "Low" | "Normal" | "High" | "Urgent";
export const HELP_PRIORITIES: HelpPriority[] = ["Low", "Normal", "High", "Urgent"];

export type SendToOption = "Admin Office" | "Principal" | "IT Support" | "Academic Coordinator" | "Accounts Office";
export const SEND_TO_OPTIONS: SendToOption[] = [
  "Admin Office", "Principal", "IT Support", "Academic Coordinator", "Accounts Office",
];

export type MyRequestStatus = "Open" | "Waiting Reply" | "In Progress" | "Resolved" | "Closed";
export const MY_REQUEST_STATUS_TABS: MyRequestStatus[] = ["Open", "Waiting Reply", "In Progress", "Resolved", "Closed"];

export type AssignedTicketStatus = "Assigned" | "In Progress" | "Waiting Parent" | "Resolved";

/* ── Quick request cards ─────────────────────────────────────────────────── */

export interface QuickRequestType {
  id: string;
  label: string;
  description: string;
  category: HelpRequestType;
  sendTo: SendToOption;
  iconKey: "lock" | "calendar-check" | "user-cog" | "calendar-clock" | "award" | "clipboard-list" | "folder-up" | "message-warning" | "laptop" | "shield-check";
}

export const quickRequestTypes: QuickRequestType[] = [
  { id: "login",         label: "Login / password problem",        description: "Can't sign in or need a password reset",        category: "Technical",       sendTo: "IT Support",             iconKey: "lock" },
  { id: "attendance",    label: "Attendance issue",                 description: "Wrong mark or a missing attendance entry",       category: "Attendance",      sendTo: "Admin Office",           iconKey: "calendar-check" },
  { id: "student-record",label: "Student record correction",        description: "A student detail needs to be fixed",            category: "Student Support", sendTo: "Admin Office",           iconKey: "user-cog" },
  { id: "timetable",     label: "Class timetable conflict",         description: "Overlapping or incorrect period on your routine", category: "Class Issue",   sendTo: "Academic Coordinator",   iconKey: "calendar-clock" },
  { id: "exam-marks",    label: "Exam / marks issue",               description: "Marks entry problem or exam schedule conflict",  category: "Exam / Marks",   sendTo: "Academic Coordinator",   iconKey: "award" },
  { id: "homework",      label: "Homework / assignment issue",      description: "Trouble creating, grading, or publishing homework", category: "Class Issue", sendTo: "Admin Office",           iconKey: "clipboard-list" },
  { id: "materials",     label: "Teaching material upload issue",  description: "File upload failing or material missing",       category: "Materials",       sendTo: "IT Support",             iconKey: "folder-up" },
  { id: "complaint",     label: "Parent/student complaint",         description: "Escalate a concern that was raised to you",      category: "Parent Concern", sendTo: "Principal",              iconKey: "message-warning" },
  { id: "technical",     label: "Technical problem",                description: "App bug, slow page, or a broken feature",        category: "Technical",      sendTo: "IT Support",             iconKey: "laptop" },
  { id: "approval",      label: "Request admin approval",           description: "Ask admin or principal to approve something",    category: "Admin Approval", sendTo: "Principal",              iconKey: "shield-check" },
];

/* ── Ticket conversation thread (shared by My Requests + Assigned tickets) ── */

export interface TicketMessage {
  id: number;
  author: string;
  authorRole: string;
  body: string;
  timestamp: string;
  attachments?: { id: number; name: string }[];
}

export interface TicketActivity {
  id: number;
  action: string;
  by: string;
  at: string;
}

export interface TicketThread {
  messages: TicketMessage[];
  activities: TicketActivity[];
}

export const ticketConversations: Record<string, TicketThread> = {
  "TH-2026-0001": {
    messages: [
      { id: 1, author: "Demo Teacher", authorRole: "Teacher", body: "The upload keeps failing for a 12MB PDF worksheet on Grade 8-A.", timestamp: "2026-07-15T09:20:00" },
      { id: 2, author: "IT Support", authorRole: "Support Team", body: "Thanks — looking into the upload size limit now.", timestamp: "2026-07-15T10:05:00" },
    ],
    activities: [
      { id: 1, action: "Request created", by: "Demo Teacher", at: "2026-07-15T09:20:00" },
      { id: 2, action: "IT Support replied", by: "IT Support", at: "2026-07-15T10:05:00" },
    ],
  },
  "TH-2026-0002": {
    messages: [
      { id: 1, author: "Demo Teacher", authorRole: "Teacher", body: "Aisha Sharma's attendance for July 10 is marked Absent but she was present — I have the seating chart photo.", timestamp: "2026-07-11T08:15:00" },
      { id: 2, author: "Admin Office", authorRole: "Support Team", body: "Corrected. Thanks for flagging this with the photo attached.", timestamp: "2026-07-11T13:40:00" },
    ],
    activities: [
      { id: 1, action: "Request created", by: "Demo Teacher", at: "2026-07-11T08:15:00" },
      { id: 2, action: "Marked Resolved by Admin Office", by: "Admin Office", at: "2026-07-11T13:40:00" },
    ],
  },
  "TH-2026-0003": {
    messages: [
      { id: 1, author: "Demo Teacher", authorRole: "Teacher", body: "My Grade 9-A Science period on Tuesday overlaps with the Grade 10-A Maths period — can this be fixed before next week?", timestamp: "2026-07-14T16:00:00" },
    ],
    activities: [
      { id: 1, action: "Request created", by: "Demo Teacher", at: "2026-07-14T16:00:00" },
    ],
  },
  "TH-2026-0012": {
    messages: [
      { id: 1, author: "David Khan", authorRole: "Parent", body: "Could you share a quick update on Aarav's progress in Mathematics this term?", timestamp: "2026-07-14T18:30:00" },
    ],
    activities: [
      { id: 1, action: "Assigned to Demo Teacher by Admin Office", by: "Admin Office", at: "2026-07-14T18:35:00" },
    ],
  },
  "TH-2026-0013": {
    messages: [
      { id: 1, author: "Admin Office", authorRole: "Support Team", body: "Noah Brown's attendance correction for July 9 needs your confirmation before we update the record.", timestamp: "2026-07-13T11:00:00" },
    ],
    activities: [
      { id: 1, action: "Assigned to Demo Teacher by Admin Office", by: "Admin Office", at: "2026-07-13T11:00:00" },
    ],
  },
  "TH-2026-0014": {
    messages: [
      { id: 1, author: "Admin Office", authorRole: "Support Team", body: "A behavior note was filed for Arjun Patel during Grade 8-A period 3 — please review and follow up.", timestamp: "2026-07-12T09:10:00" },
    ],
    activities: [
      { id: 1, action: "Assigned to Demo Teacher by Principal", by: "Principal", at: "2026-07-12T09:10:00" },
    ],
  },
  "TH-2026-0015": {
    messages: [
      { id: 1, author: "Ryan Ahmed", authorRole: "Student", body: "Sir, I'm falling behind in Grade 10-A Maths — can we set up extra help sessions?", timestamp: "2026-07-13T14:20:00" },
    ],
    activities: [
      { id: 1, action: "Assigned to Demo Teacher by Academic Coordinator", by: "Academic Coordinator", at: "2026-07-13T14:25:00" },
    ],
  },
};

/* ── My Requests (submitted by the teacher) ─────────────────────────────── */

export interface MyRequest {
  id: string;
  title: string;
  category: HelpRequestType;
  priority: HelpPriority;
  status: MyRequestStatus;
  sentTo: SendToOption;
  createdAt: string;
  lastUpdated: string;
  relatedClass: string | null;
  relatedStudent: string | null;
  description: string;
}

export let myRequests: MyRequest[] = [
  {
    id: "TH-2026-0001", title: "Cannot upload Grade 8 worksheet", category: "Materials", priority: "Normal", status: "In Progress",
    sentTo: "IT Support", createdAt: "2026-07-15 09:20 AM", lastUpdated: "1h ago",
    relatedClass: "Grade 8-A", relatedStudent: null,
    description: "Uploading a 12MB PDF worksheet to Materials keeps failing at ~80%.",
  },
  {
    id: "TH-2026-0002", title: "Attendance entry needs correction", category: "Attendance", priority: "High", status: "Resolved",
    sentTo: "Admin Office", createdAt: "2026-07-11 08:15 AM", lastUpdated: "3d ago",
    relatedClass: "Grade 8-A", relatedStudent: "Aisha Sharma",
    description: "July 10 attendance for Aisha Sharma was marked Absent by mistake.",
  },
  {
    id: "TH-2026-0003", title: "Timetable conflict on Tuesdays", category: "Class Issue", priority: "Normal", status: "Open",
    sentTo: "Academic Coordinator", createdAt: "2026-07-14 04:00 PM", lastUpdated: "22h ago",
    relatedClass: "Grade 9-A", relatedStudent: null,
    description: "Grade 9-A Science overlaps with Grade 10-A Maths on the Tuesday routine.",
  },
];

/* ── Assigned to Me (tickets admin/principal routed to this teacher) ────── */

export interface AssignedTicket {
  id: string;
  title: string;
  requester: string;
  requesterRole: "Parent" | "Student" | "Admin" | "Principal";
  relatedStudent: string | null;
  relatedClass: string | null;
  priority: HelpPriority;
  status: AssignedTicketStatus;
  dueDate: string;
  assignedTo: string;
  description: string;
}

export let assignedTickets: AssignedTicket[] = [
  {
    id: "TH-2026-0012", title: "Parent requested progress update", requester: "David Khan", requesterRole: "Parent",
    relatedStudent: "Aarav Khan", relatedClass: "Grade 8-A", priority: "High", status: "Assigned",
    dueDate: "Today", assignedTo: "Demo Teacher",
    description: "David Khan is asking for a quick note on Aarav's Mathematics progress this term.",
  },
  {
    id: "TH-2026-0013", title: "Attendance correction needs confirmation", requester: "Admin Office", requesterRole: "Admin",
    relatedStudent: "Noah Brown", relatedClass: "Grade 8-A", priority: "Normal", status: "In Progress",
    dueDate: "Tomorrow", assignedTo: "Demo Teacher",
    description: "Confirm the July 9 attendance correction for Noah Brown before it's finalized.",
  },
  {
    id: "TH-2026-0014", title: "Class behavior follow-up", requester: "Principal Office", requesterRole: "Principal",
    relatedStudent: "Arjun Patel", relatedClass: "Grade 8-A", priority: "Normal", status: "Assigned",
    dueDate: "Jul 17", assignedTo: "Demo Teacher",
    description: "A behavior note was filed during period 3 — please follow up with the student.",
  },
  {
    id: "TH-2026-0015", title: "Student needs extra academic support", requester: "Ryan Ahmed", requesterRole: "Student",
    relatedStudent: "Ryan Ahmed", relatedClass: "Grade 10-A", priority: "High", status: "Waiting Parent",
    dueDate: "Jul 18", assignedTo: "Demo Teacher",
    description: "Ryan is falling behind in Mathematics and asked about extra help sessions.",
  },
];

/* ── Student / Parent support (practical day-to-day follow-up) ──────────── */

export interface StudentSupportCase {
  id: string;
  studentId: number;
  studentName: string;
  className: string;
  section: string;
  issueType: "Attendance concern" | "Homework concern" | "Academic support" | "Follow-up";
  note: string;
  resolved: boolean;
}

export let studentSupportCases: StudentSupportCase[] = [
  { id: "ssc-1", studentId: 3, studentName: "Noah Brown",   className: "Grade 8",  section: "A", issueType: "Attendance concern", note: "Attendance dropped to 74% this month.", resolved: false },
  { id: "ssc-2", studentId: 5, studentName: "Arjun Patel",  className: "Grade 8",  section: "A", issueType: "Homework concern",   note: "2 pending homework submissions.", resolved: false },
  { id: "ssc-3", studentId: 14, studentName: "Liam Johnson", className: "Grade 8", section: "B", issueType: "Academic support",   note: "Needs Improvement in recent assessments.", resolved: false },
  { id: "ssc-4", studentId: 36, studentName: "Ryan Ahmed",  className: "Grade 10", section: "A", issueType: "Follow-up",          note: "Requested extra help sessions in Mathematics.", resolved: false },
];

export interface ParentConcern {
  id: string;
  parentName: string;
  studentName: string;
  studentId: number;
  className: string;
  question: string;
  receivedAt: string;
  status: "Pending" | "Answered";
}

export let parentConcerns: ParentConcern[] = [
  { id: "pc-1", parentName: "David Khan",   studentName: "Aarav Khan", studentId: 1, className: "Grade 8-A", question: "Could you share Aarav's progress in Mathematics this term?", receivedAt: "Yesterday", status: "Pending" },
  { id: "pc-2", parentName: "Michael Brown", studentName: "Noah Brown", studentId: 3, className: "Grade 8-A", question: "We'd like an update on the missing homework this weekend.", receivedAt: "Sun", status: "Pending" },
  { id: "pc-3", parentName: "Ravi Sharma",   studentName: "Aisha Sharma", studentId: 2, className: "Grade 8-A", question: "Thank you for the update on Aisha's project.", receivedAt: "Mon", status: "Answered" },
];

/* ── Knowledge base / FAQ ────────────────────────────────────────────────── */

export type HelpArticleCategory =
  | "Attendance" | "Marks Entry" | "Homework" | "Materials"
  | "Messages" | "Parent Communication" | "Technical Issues" | "Account & Login";

export interface HelpArticle {
  id: string;
  title: string;
  category: HelpArticleCategory;
  readMins: number;
  summary: string;
  steps: string[];
}

export const helpArticles: HelpArticle[] = [
  { id: "kb-1", title: "How to mark daily attendance", category: "Attendance", readMins: 2,
    summary: "Mark present/absent/late for a class in under a minute.",
    steps: ["Open Mark Attendance from the sidebar.", "Pick the class and date.", "Tap each student's status chip.", "Press Save — done."] },
  { id: "kb-2", title: "How to correct a wrong attendance entry", category: "Attendance", readMins: 2,
    summary: "Fix a mistaken mark for a past date.",
    steps: ["Open Attendance Reports and find the date.", "If it's today, edit it directly on Mark Attendance.", "For an earlier date, submit a Help request under Attendance so Admin Office can apply the correction."] },
  { id: "kb-3", title: "How to create homework", category: "Homework", readMins: 3,
    summary: "Publish a new homework assignment to a class.",
    steps: ["Go to Homework & Assignments.", "Click New Assignment.", "Fill in class, subject, due date and instructions.", "Publish — students and parents are notified."] },
  { id: "kb-4", title: "How to enter marks", category: "Marks Entry", readMins: 3,
    summary: "Submit marks for an exam or assessment.",
    steps: ["Open Marks & Gradebook.", "Select the exam and class.", "Enter marks per student.", "Submit for review."] },
  { id: "kb-5", title: "How to message a parent", category: "Messages", readMins: 2,
    summary: "Start or continue a conversation with a guardian.",
    steps: ["Open Parent Communication.", "Find the guardian's card and press Message.", "Or use a quick template to prefill a common message."] },
  { id: "kb-6", title: "How to upload teaching materials", category: "Materials", readMins: 2,
    summary: "Share a file with a class.",
    steps: ["Open Materials.", "Click Upload.", "Choose the class and attach the file.", "If upload fails, check the file size — large PDFs may need a Help request to IT Support."] },
  { id: "kb-7", title: "How to report a student concern", category: "Parent Communication", readMins: 2,
    summary: "Flag an attendance, homework, or behavior concern for follow-up.",
    steps: ["Open Help Center.", "Choose the matching quick request card (e.g. Attendance issue).", "Fill in the student and description, then submit."] },
  { id: "kb-8", title: "What to do if a parent complains", category: "Parent Communication", readMins: 3,
    summary: "Escalate a parent complaint the right way.",
    steps: ["Reply calmly and acknowledge the concern first.", "If it needs admin attention, use the \"Parent/student complaint\" quick request.", "Principal Office will follow up if escalation is required."] },
  { id: "kb-9", title: "Fixing a login or password problem", category: "Account & Login", readMins: 1,
    summary: "Can't sign in, or need a password reset.",
    steps: ["Try Forgot Password on the login screen first.", "Still stuck? Submit a Login / password problem quick request to IT Support."] },
  { id: "kb-10", title: "Reporting a technical bug", category: "Technical Issues", readMins: 2,
    summary: "Something in the portal is broken or slow.",
    steps: ["Note what page and action caused it.", "Submit a Technical problem quick request with a short description.", "Attach a screenshot if you have one."] },
];

/* ── Quick contacts ──────────────────────────────────────────────────────── */

export interface QuickContact {
  id: string;
  name: string;
  department: string;
  availability: string;
  sendTo: SendToOption;
  /** Chat identity to open a real conversation with — see messagesData.ts CHAT_USERS. */
  chatUserId: string;
}

export const quickContacts: QuickContact[] = [
  { id: "qc-principal", name: "Principal Office",        department: "Administration",      availability: "Mon–Fri, 8am–4pm", sendTo: "Principal",            chatUserId: "u-principal" },
  { id: "qc-admin",     name: "Admin Office",             department: "School Administration", availability: "Mon–Fri, 8am–5pm", sendTo: "Admin Office",          chatUserId: "u-admin" },
  { id: "qc-it",        name: "IT Support",                department: "Technical",            availability: "Mon–Sat, 9am–6pm", sendTo: "IT Support",            chatUserId: "u-staff-01" },
  { id: "qc-coord",     name: "Academic Coordinator",      department: "Academics",            availability: "Mon–Fri, 8am–4pm", sendTo: "Academic Coordinator", chatUserId: "u-staff-03" },
  { id: "qc-exam",      name: "Exam Department",           department: "Examinations",         availability: "Mon–Fri, 9am–3pm", sendTo: "Academic Coordinator", chatUserId: "u-staff-03" },
];

/* ── Stats (derived — always consistent with the arrays above) ──────────── */

export interface TeacherHelpStats {
  myOpenRequests: number;
  assignedToMe: number;
  waitingReply: number;
  resolvedThisMonth: number;
  studentSupportCases: number;
  parentConcerns: number;
}

export function computeTeacherHelpStats(): TeacherHelpStats {
  return {
    myOpenRequests: myRequests.filter((r) => r.status === "Open" || r.status === "In Progress").length,
    assignedToMe: assignedTickets.filter((t) => t.status !== "Resolved").length,
    waitingReply: myRequests.filter((r) => r.status === "Waiting Reply").length,
    resolvedThisMonth: myRequests.filter((r) => r.status === "Resolved").length,
    studentSupportCases: studentSupportCases.filter((c) => !c.resolved).length,
    parentConcerns: parentConcerns.filter((c) => c.status === "Pending").length,
  };
}

/* ── Mutations (mirrors the mutable-array pattern used by messagesService) ─ */

let ticketSeq = 16;
function nextTicketId() {
  return `TH-2026-${String(ticketSeq++).padStart(4, "0")}`;
}

export interface CreateHelpRequestInput {
  category: HelpRequestType;
  priority: HelpPriority;
  title: string;
  description: string;
  sendTo: SendToOption;
  relatedClass?: string | null;
  relatedStudent?: string | null;
}

export function createHelpRequest(input: CreateHelpRequestInput): MyRequest {
  const id = nextTicketId();
  const now = new Date();
  const request: MyRequest = {
    id,
    title: input.title || input.category,
    category: input.category,
    priority: input.priority,
    status: "Open",
    sentTo: input.sendTo,
    createdAt: now.toLocaleString(undefined, { year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "2-digit" }),
    lastUpdated: "Just now",
    relatedClass: input.relatedClass ?? null,
    relatedStudent: input.relatedStudent ?? null,
    description: input.description,
  };
  myRequests = [request, ...myRequests];
  ticketConversations[id] = {
    messages: input.description ? [{ id: 1, author: "Demo Teacher", authorRole: "Teacher", body: input.description, timestamp: now.toISOString() }] : [],
    activities: [{ id: 1, action: `Request created — sent to ${input.sendTo}`, by: "Demo Teacher", at: now.toISOString() }],
  };
  return request;
}

export function addTicketReply(ticketId: string, body: string, author = "Demo Teacher", authorRole = "Teacher") {
  const thread = ticketConversations[ticketId] ?? { messages: [], activities: [] };
  const now = new Date().toISOString();
  thread.messages = [...thread.messages, { id: Date.now(), author, authorRole, body, timestamp: now }];
  thread.activities = [...thread.activities, { id: Date.now(), action: `${author} replied`, by: author, at: now }];
  ticketConversations[ticketId] = thread;

  const req = myRequests.find((r) => r.id === ticketId);
  if (req) {
    req.status = author === "Demo Teacher" ? "Waiting Reply" : "In Progress";
    req.lastUpdated = "Just now";
  }
}

export function closeMyRequest(id: string) {
  myRequests = myRequests.map((r) => (r.id === id ? { ...r, status: "Closed" as MyRequestStatus, lastUpdated: "Just now" } : r));
  const thread = ticketConversations[id];
  if (thread) thread.activities = [...thread.activities, { id: Date.now(), action: "Closed by Demo Teacher", by: "Demo Teacher", at: new Date().toISOString() }];
}

export function markAssignedHandled(id: string) {
  assignedTickets = assignedTickets.map((t) => (t.id === id ? { ...t, status: "Resolved" as AssignedTicketStatus } : t));
  const thread = ticketConversations[id];
  if (thread) thread.activities = [...thread.activities, { id: Date.now(), action: "Marked handled by Demo Teacher", by: "Demo Teacher", at: new Date().toISOString() }];
}

export function requestAdminSupportFor(ticket: AssignedTicket): MyRequest {
  return createHelpRequest({
    category: "Admin Approval",
    priority: ticket.priority,
    title: `Need admin support: ${ticket.title}`,
    description: `Escalating assigned ticket ${ticket.id} (${ticket.title}) — I need admin support to resolve this.`,
    sendTo: "Admin Office",
    relatedClass: ticket.relatedClass,
    relatedStudent: ticket.relatedStudent,
  });
}

export function markSupportCaseResolved(id: string) {
  studentSupportCases = studentSupportCases.map((c) => (c.id === id ? { ...c, resolved: true } : c));
}

export function markParentConcernAnswered(id: string) {
  parentConcerns = parentConcerns.map((c) => (c.id === id ? { ...c, status: "Answered" as const } : c));
}

/* ── Ticket detail lookup (normalizes My Requests + Assigned tickets) ───── */

export interface NormalizedTicket {
  id: string;
  title: string;
  kind: "mine" | "assigned";
  category?: HelpRequestType;
  priority: HelpPriority;
  status: string;
  counterpartLabel: string;
  relatedClass: string | null;
  relatedStudent: string | null;
  description: string;
  dueDate?: string;
}

export function findTicket(id: string): NormalizedTicket | undefined {
  const mine = myRequests.find((r) => r.id === id);
  if (mine) {
    return {
      id: mine.id, title: mine.title, kind: "mine", category: mine.category, priority: mine.priority,
      status: mine.status, counterpartLabel: mine.sentTo, relatedClass: mine.relatedClass,
      relatedStudent: mine.relatedStudent, description: mine.description,
    };
  }
  const assigned = assignedTickets.find((t) => t.id === id);
  if (assigned) {
    return {
      id: assigned.id, title: assigned.title, kind: "assigned", priority: assigned.priority,
      status: assigned.status, counterpartLabel: `${assigned.requester} (${assigned.requesterRole})`,
      relatedClass: assigned.relatedClass, relatedStudent: assigned.relatedStudent,
      description: assigned.description, dueDate: assigned.dueDate,
    };
  }
  return undefined;
}
