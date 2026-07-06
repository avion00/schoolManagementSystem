export type MessageStatus   = "unread" | "read" | "replied" | "archived" | "draft" | "scheduled" | "sent" | "failed";
export type MessagePriority = "Low" | "Normal" | "High" | "Urgent";
export type MessageType     = "General" | "Announcement" | "Fee Reminder" | "Exam Notice" | "Attendance Alert" | "Parent Meeting" | "Emergency" | "Academic Notice";
export type SendMethod      = "In-app" | "Email" | "SMS" | "Push Notification";
export type RecipientType   =
  | "All Users" | "Students" | "Parents" | "Teachers" | "Staff"
  | "Specific Class" | "Specific Section" | "Specific Student"
  | "Specific Parent" | "Specific Teacher";

export interface MessageAttachment {
  id: number;
  name: string;
  type: "PDF" | "Image" | "Spreadsheet" | "Document";
  size: string;
}

export interface MessageActivityRecord {
  id: number;
  action: "sent" | "delivered" | "read" | "replied" | "failed" | "scheduled" | "draft_saved";
  actor: string;
  timestamp: string;
  note?: string;
}

export interface MessageStats {
  totalRecipients: number;
  delivered: number;
  read: number;
  unread: number;
  failed: number;
  replied?: number;
}

export interface Message {
  id: number;
  messageId: string;
  subject: string;
  type: MessageType;
  priority: MessagePriority;
  sendMethod: SendMethod;
  sender: string;
  senderRole: string;
  senderAvatar?: string;
  recipientType: RecipientType;
  recipients: string[];
  body: string;
  attachments: MessageAttachment[];
  status: MessageStatus;
  sentAt?: string;
  scheduledAt?: string;
  updatedAt: string;
  stats: MessageStats;
  activities: MessageActivityRecord[];
  isStarred: boolean;
  requireAcknowledgement: boolean;
  sendCopyToAdmin: boolean;
}

export interface MessageTemplate {
  id: number;
  title: string;
  category: MessageType;
  subject: string;
  body: string;
  tags: string[];
  usageCount: number;
  lastUsed?: string;
}

export interface MessageSummary {
  total: number;
  unread: number;
  sent: number;
  drafts: number;
  failed: number;
  scheduled: number;
  starred: number;
  archived: number;
}

/* ─── Messages ────────────────────────────────────────────────────────── */

export const MESSAGES: Message[] = [
  {
    id: 1,
    messageId: "MSG-2026-0001",
    subject: "Final Exam Routine Published",
    type: "Exam Notice",
    priority: "High",
    sendMethod: "In-app",
    sender: "Platform Admin",
    senderRole: "Administrator",
    recipientType: "Students",
    recipients: ["Grade 8", "Grade 9", "Grade 10"],
    body: "Dear Students and Parents,\n\nWe are pleased to announce that the Final Examination Routine for the academic session 2025–2026 has been officially published. Please review the schedule carefully and prepare accordingly.\n\nKey highlights:\n- Examinations will commence from July 15, 2026\n- Each paper is 3 hours duration\n- Students must arrive 30 minutes before the exam begins\n- All students must carry their admit cards\n\nPlease contact the examination office for any queries.\n\nBest regards,\nPlatform Admin",
    attachments: [{ id: 1, name: "exam-routine-2026.pdf", type: "PDF", size: "240 KB" }],
    status: "sent",
    sentAt: "2026-06-20 10:30 AM",
    updatedAt: "2026-06-20",
    stats: { totalRecipients: 420, delivered: 410, read: 312, unread: 98, failed: 10 },
    activities: [
      { id: 1, action: "sent",      actor: "Platform Admin", timestamp: "2026-06-20 10:30 AM" },
      { id: 2, action: "delivered", actor: "System",         timestamp: "2026-06-20 10:31 AM", note: "410 of 420 delivered" },
      { id: 3, action: "read",      actor: "System",         timestamp: "2026-06-20 11:00 AM", note: "312 recipients opened" },
    ],
    isStarred: true,
    requireAcknowledgement: false,
    sendCopyToAdmin: true,
  },
  {
    id: 2,
    messageId: "MSG-2026-0002",
    subject: "Monthly Fee Reminder – July 2026",
    type: "Fee Reminder",
    priority: "Urgent",
    sendMethod: "In-app",
    sender: "Accounts Office",
    senderRole: "Accounts",
    recipientType: "Parents",
    recipients: ["All Parents"],
    body: "Dear Parent/Guardian,\n\nThis is a reminder that the school fees for the month of July 2026 are due by July 10, 2026.\n\nFee Details:\n- Tuition Fee: NPR 4,500\n- Library Fee: NPR 200\n- Sports Fee: NPR 150\n\nPlease clear dues on time to avoid late charges. Payment can be made at the school accounts office or via online banking.\n\nThank you.\n\nAccounts Department",
    attachments: [],
    status: "sent",
    sentAt: "2026-07-01 09:00 AM",
    updatedAt: "2026-07-01",
    stats: { totalRecipients: 580, delivered: 578, read: 421, unread: 157, failed: 2 },
    activities: [
      { id: 1, action: "sent",      actor: "Accounts Office", timestamp: "2026-07-01 09:00 AM" },
      { id: 2, action: "delivered", actor: "System",          timestamp: "2026-07-01 09:01 AM", note: "578 of 580 delivered" },
    ],
    isStarred: false,
    requireAcknowledgement: true,
    sendCopyToAdmin: true,
  },
  {
    id: 3,
    messageId: "MSG-2026-0003",
    subject: "Parent-Teacher Meeting – Grade 9 & 10",
    type: "Parent Meeting",
    priority: "High",
    sendMethod: "In-app",
    sender: "Principal",
    senderRole: "Principal",
    recipientType: "Parents",
    recipients: ["Grade 9", "Grade 10"],
    body: "Dear Parents,\n\nWe cordially invite you to the Parent-Teacher Meeting scheduled for July 12, 2026 from 10:00 AM to 1:00 PM at the school auditorium.\n\nAgenda:\n- Academic performance review\n- Upcoming examination preparation\n- Attendance and discipline discussion\n- Q&A session\n\nYour presence is highly appreciated. Please confirm your attendance by July 10, 2026.\n\nWith regards,\nThe Principal",
    attachments: [{ id: 2, name: "ptm-agenda.pdf", type: "PDF", size: "185 KB" }],
    status: "sent",
    sentAt: "2026-07-03 08:45 AM",
    updatedAt: "2026-07-03",
    stats: { totalRecipients: 210, delivered: 210, read: 198, unread: 12, failed: 0, replied: 87 },
    activities: [
      { id: 1, action: "sent",      actor: "Principal", timestamp: "2026-07-03 08:45 AM" },
      { id: 2, action: "delivered", actor: "System",    timestamp: "2026-07-03 08:46 AM" },
      { id: 3, action: "replied",   actor: "System",    timestamp: "2026-07-04 10:00 AM", note: "87 parents confirmed attendance" },
    ],
    isStarred: true,
    requireAcknowledgement: true,
    sendCopyToAdmin: false,
  },
  {
    id: 4,
    messageId: "MSG-2026-0004",
    subject: "Eid al-Adha Holiday Notice",
    type: "Announcement",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "Platform Admin",
    senderRole: "Administrator",
    recipientType: "All Users",
    recipients: ["All Students", "All Parents", "All Teachers", "All Staff"],
    body: "Dear All,\n\nPlease be informed that the school will remain closed on July 17, 2026 (Friday) on account of Eid al-Adha. Classes will resume normally on July 20, 2026 (Monday).\n\nWe wish all celebrating families Eid Mubarak!\n\nManagement",
    attachments: [],
    status: "sent",
    sentAt: "2026-07-14 11:00 AM",
    updatedAt: "2026-07-14",
    stats: { totalRecipients: 1200, delivered: 1195, read: 980, unread: 215, failed: 5 },
    activities: [
      { id: 1, action: "sent",      actor: "Platform Admin", timestamp: "2026-07-14 11:00 AM" },
      { id: 2, action: "delivered", actor: "System",         timestamp: "2026-07-14 11:01 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 5,
    messageId: "MSG-2026-0005",
    subject: "Low Attendance Warning – Grade 7A",
    type: "Attendance Alert",
    priority: "High",
    sendMethod: "In-app",
    sender: "Class Teacher",
    senderRole: "Teacher",
    recipientType: "Parents",
    recipients: ["Grade 7A Parents"],
    body: "Dear Parent,\n\nThis is to inform you that your child's attendance for the month of June 2026 has fallen below the required 80% threshold.\n\nCurrent attendance: 68%\nRequired minimum: 80%\n\nPlease ensure regular attendance going forward. Continued absence may affect your child's eligibility to appear in the final examination.\n\nFor queries, please visit the school office.\n\nClass Teacher – Grade 7A",
    attachments: [],
    status: "sent",
    sentAt: "2026-07-01 10:15 AM",
    updatedAt: "2026-07-01",
    stats: { totalRecipients: 8, delivered: 8, read: 6, unread: 2, failed: 0 },
    activities: [
      { id: 1, action: "sent",      actor: "Sita Rai (Class Teacher)", timestamp: "2026-07-01 10:15 AM" },
      { id: 2, action: "delivered", actor: "System",                   timestamp: "2026-07-01 10:15 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: true,
    sendCopyToAdmin: true,
  },
  {
    id: 6,
    messageId: "MSG-2026-0006",
    subject: "Science Fair Registration Open",
    type: "Announcement",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "Academic Department",
    senderRole: "Academic Head",
    recipientType: "Students",
    recipients: ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"],
    body: "Dear Students,\n\nRegistrations for the Annual Science Fair 2026 are now open. The event will be held on August 5, 2026.\n\nParticipation Categories:\n- Physics & Technology\n- Biology & Environment\n- Chemistry & Materials\n- Computer Science & Robotics\n\nTeams of 2-4 students are encouraged. Deadline for registration is July 25, 2026.\n\nContact your class teacher to register.",
    attachments: [{ id: 3, name: "science-fair-guidelines.pdf", type: "PDF", size: "320 KB" }],
    status: "sent",
    sentAt: "2026-07-06 09:30 AM",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 650, delivered: 645, read: 512, unread: 133, failed: 5 },
    activities: [
      { id: 1, action: "sent",      actor: "Academic Department", timestamp: "2026-07-06 09:30 AM" },
      { id: 2, action: "delivered", actor: "System",              timestamp: "2026-07-06 09:31 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 7,
    messageId: "MSG-2026-0007",
    subject: "Emergency: School Closed Tomorrow (Water Supply Issue)",
    type: "Emergency",
    priority: "Urgent",
    sendMethod: "In-app",
    sender: "Principal",
    senderRole: "Principal",
    recipientType: "All Users",
    recipients: ["All Students", "All Parents", "All Teachers", "All Staff"],
    body: "URGENT NOTICE\n\nDue to a water supply disruption affecting the school premises, school will remain CLOSED on July 7, 2026 (Monday).\n\nAll classes and activities scheduled for the day are suspended. Online assignments may be issued by subject teachers.\n\nWe apologize for the inconvenience. Normal operations will resume on July 8, 2026.\n\nThank you for your understanding.\n\nPrincipal",
    attachments: [],
    status: "sent",
    sentAt: "2026-07-06 04:00 PM",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 1200, delivered: 1198, read: 1150, unread: 48, failed: 2 },
    activities: [
      { id: 1, action: "sent",      actor: "Principal", timestamp: "2026-07-06 04:00 PM" },
      { id: 2, action: "delivered", actor: "System",    timestamp: "2026-07-06 04:01 PM" },
    ],
    isStarred: true,
    requireAcknowledgement: false,
    sendCopyToAdmin: true,
  },
  {
    id: 8,
    messageId: "MSG-2026-0008",
    subject: "Staff Professional Development Workshop",
    type: "Announcement",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "HR Department",
    senderRole: "HR Manager",
    recipientType: "Teachers",
    recipients: ["All Teaching Staff"],
    body: "Dear Teaching Staff,\n\nWe are organising a Professional Development Workshop on Innovative Teaching Methodologies on July 19, 2026.\n\nVenue: Conference Room B, Admin Block\nTime: 9:00 AM – 4:00 PM\nFacilitator: Dr. Ramesh Sharma (Education Consultant)\n\nTopics covered:\n- Active Learning Strategies\n- Technology Integration in Classrooms\n- Assessment for Learning\n- Student Engagement Techniques\n\nAttendance is mandatory for all teaching staff. Please confirm by July 15.",
    attachments: [{ id: 4, name: "workshop-agenda.pdf", type: "PDF", size: "210 KB" }],
    status: "sent",
    sentAt: "2026-07-05 02:00 PM",
    updatedAt: "2026-07-05",
    stats: { totalRecipients: 42, delivered: 42, read: 38, unread: 4, failed: 0 },
    activities: [
      { id: 1, action: "sent",      actor: "HR Department", timestamp: "2026-07-05 02:00 PM" },
      { id: 2, action: "delivered", actor: "System",        timestamp: "2026-07-05 02:01 PM" },
    ],
    isStarred: false,
    requireAcknowledgement: true,
    sendCopyToAdmin: false,
  },
  {
    id: 9,
    messageId: "MSG-2026-0009",
    subject: "Scholarship Application Now Open – Merit 2026",
    type: "Academic Notice",
    priority: "High",
    sendMethod: "In-app",
    sender: "Academic Department",
    senderRole: "Academic Head",
    recipientType: "Students",
    recipients: ["Grade 10", "Grade 11", "Grade 12"],
    body: "Dear Students,\n\nApplications for the Merit Scholarship 2026 are now open. Eligible students with an aggregate of 80% or above in their most recent examinations are encouraged to apply.\n\nScholarship Benefits:\n- 50% tuition fee waiver\n- Certificate of Excellence\n- Priority consideration for leadership roles\n\nApplication forms are available at the admin office and on the school portal. Last date to apply: July 20, 2026.\n\nBest of luck!\nAcademic Department",
    attachments: [{ id: 5, name: "scholarship-form-2026.pdf", type: "PDF", size: "175 KB" }],
    status: "sent",
    sentAt: "2026-07-04 10:00 AM",
    updatedAt: "2026-07-04",
    stats: { totalRecipients: 280, delivered: 278, read: 220, unread: 58, failed: 2 },
    activities: [
      { id: 1, action: "sent",      actor: "Academic Department", timestamp: "2026-07-04 10:00 AM" },
      { id: 2, action: "delivered", actor: "System",              timestamp: "2026-07-04 10:01 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 10,
    messageId: "MSG-2026-0010",
    subject: "Library Book Return Reminder",
    type: "General",
    priority: "Low",
    sendMethod: "In-app",
    sender: "Library",
    senderRole: "Librarian",
    recipientType: "Students",
    recipients: ["All Students"],
    body: "Dear Students,\n\nThis is a gentle reminder to return all borrowed library books on or before July 10, 2026.\n\nStudents with overdue books will be charged a fine of NPR 5 per day.\n\nPlease visit the library during school hours (8:00 AM – 3:00 PM) to return your books.\n\nThank you,\nThe Librarian",
    attachments: [],
    status: "sent",
    sentAt: "2026-07-05 08:00 AM",
    updatedAt: "2026-07-05",
    stats: { totalRecipients: 780, delivered: 775, read: 480, unread: 295, failed: 5 },
    activities: [
      { id: 1, action: "sent",      actor: "Library",  timestamp: "2026-07-05 08:00 AM" },
      { id: 2, action: "delivered", actor: "System",   timestamp: "2026-07-05 08:01 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 11,
    messageId: "MSG-2026-0011",
    subject: "Sports Day 2026 – Event Schedule",
    type: "Announcement",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "Sports Department",
    senderRole: "Sports Coordinator",
    recipientType: "All Users",
    recipients: ["All Students", "All Parents", "All Teachers"],
    body: "Dear All,\n\nWe are excited to announce the Annual Sports Day 2026 to be held on August 2, 2026 (Saturday) from 8:00 AM onwards at the school grounds.\n\nEvents Include:\n- Track & Field events (100m, 200m, 400m, relay)\n- Football tournament\n- Basketball showcase\n- Volleyball competition\n- Tug of War\n\nParents are cordially invited to cheer for their children.\n\nSports Department",
    attachments: [{ id: 6, name: "sports-day-schedule.pdf", type: "PDF", size: "290 KB" }],
    status: "sent",
    sentAt: "2026-07-06 11:00 AM",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 1100, delivered: 1095, read: 820, unread: 275, failed: 5 },
    activities: [
      { id: 1, action: "sent",      actor: "Sports Department", timestamp: "2026-07-06 11:00 AM" },
      { id: 2, action: "delivered", actor: "System",            timestamp: "2026-07-06 11:01 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 12,
    messageId: "MSG-2026-0012",
    subject: "Uniform Policy Reminder – New Academic Year",
    type: "General",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "Platform Admin",
    senderRole: "Administrator",
    recipientType: "Students",
    recipients: ["All Students"],
    body: "Dear Students,\n\nAs we enter the new academic session, please note that the school uniform policy will be strictly enforced from July 8, 2026.\n\nAll students are required to:\n- Wear the complete school uniform daily\n- Wear ID cards at all times within the school premises\n- Maintain proper grooming standards\n\nStudents found in violation will face disciplinary action as per school rules.\n\nThank you for your cooperation.",
    attachments: [],
    status: "sent",
    sentAt: "2026-07-05 07:30 AM",
    updatedAt: "2026-07-05",
    stats: { totalRecipients: 780, delivered: 780, read: 650, unread: 130, failed: 0 },
    activities: [
      { id: 1, action: "sent",      actor: "Platform Admin", timestamp: "2026-07-05 07:30 AM" },
      { id: 2, action: "delivered", actor: "System",         timestamp: "2026-07-05 07:31 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 13,
    messageId: "MSG-2026-0013",
    subject: "Computer Lab Booking – July 2026",
    type: "General",
    priority: "Low",
    sendMethod: "In-app",
    sender: "IT Department",
    senderRole: "IT Coordinator",
    recipientType: "Teachers",
    recipients: ["All Teachers"],
    body: "Dear Teachers,\n\nThe computer lab booking sheet for July 2026 is now available. Please fill in your preferred slots to reserve lab time for your classes.\n\nBooking is on a first-come, first-served basis. Maximum two consecutive periods per class booking.\n\nPlease contact the IT department for any technical support requirements.\n\nIT Department",
    attachments: [{ id: 7, name: "lab-booking-july.xlsx", type: "Spreadsheet", size: "95 KB" }],
    status: "sent",
    sentAt: "2026-07-01 07:00 AM",
    updatedAt: "2026-07-01",
    stats: { totalRecipients: 42, delivered: 42, read: 35, unread: 7, failed: 0 },
    activities: [
      { id: 1, action: "sent",      actor: "IT Department", timestamp: "2026-07-01 07:00 AM" },
      { id: 2, action: "delivered", actor: "System",        timestamp: "2026-07-01 07:01 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 14,
    messageId: "MSG-2026-0014",
    subject: "Online Exam Portal – Access Instructions",
    type: "Exam Notice",
    priority: "High",
    sendMethod: "In-app",
    sender: "Examination Controller",
    senderRole: "Exam Controller",
    recipientType: "Students",
    recipients: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    body: "Dear Students,\n\nPlease find below the instructions for accessing the online examination portal for the upcoming Final Examinations 2026.\n\nPortal URL: examportal.schoolos.np\nLogin: Your student ID number\nPassword: First 4 digits of your mobile number + '@SMS'\n\nImportant:\n- Ensure stable internet before starting the exam\n- Clear browser cache before logging in\n- Contact the IT helpdesk if you face any issues\n\nTechnical support: it@schoolos.np | Extension: 105",
    attachments: [{ id: 8, name: "exam-portal-guide.pdf", type: "PDF", size: "450 KB" }],
    status: "sent",
    sentAt: "2026-07-02 09:00 AM",
    updatedAt: "2026-07-02",
    stats: { totalRecipients: 380, delivered: 375, read: 340, unread: 35, failed: 5 },
    activities: [
      { id: 1, action: "sent",      actor: "Examination Controller", timestamp: "2026-07-02 09:00 AM" },
      { id: 2, action: "delivered", actor: "System",                 timestamp: "2026-07-02 09:01 AM" },
    ],
    isStarred: true,
    requireAcknowledgement: false,
    sendCopyToAdmin: true,
  },
  {
    id: 15,
    messageId: "MSG-2026-0015",
    subject: "Grade 6 Welcome Back – New Session Begins",
    type: "General",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "Principal",
    senderRole: "Principal",
    recipientType: "Parents",
    recipients: ["Grade 6 Parents"],
    body: "Dear Parents of Grade 6,\n\nWelcome to the new academic session 2026–2027! We are delighted to have your children join us for another year of learning and growth.\n\nKey dates:\n- First day of classes: July 8, 2026\n- Orientation for new students: July 8, 10:00 AM – 11:30 AM\n- Stationery & book list: Attached\n\nWe look forward to a productive and enriching year ahead.\n\nWarm regards,\nThe Principal",
    attachments: [{ id: 9, name: "booklist-grade6-2026.pdf", type: "PDF", size: "130 KB" }],
    status: "sent",
    sentAt: "2026-07-06 10:00 AM",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 75, delivered: 75, read: 68, unread: 7, failed: 0 },
    activities: [
      { id: 1, action: "sent",      actor: "Principal", timestamp: "2026-07-06 10:00 AM" },
      { id: 2, action: "delivered", actor: "System",    timestamp: "2026-07-06 10:01 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 16,
    messageId: "MSG-2026-0016",
    subject: "Annual Report Cards – Distribution Schedule",
    type: "Academic Notice",
    priority: "High",
    sendMethod: "In-app",
    sender: "Academic Department",
    senderRole: "Academic Head",
    recipientType: "Parents",
    recipients: ["All Parents"],
    body: "Dear Parents,\n\nThe Annual Report Cards for 2025–2026 will be distributed as follows:\n\n- Grade 1–3: July 10, 2026 (9:00 AM – 11:00 AM)\n- Grade 4–6: July 10, 2026 (11:00 AM – 1:00 PM)\n- Grade 7–9: July 11, 2026 (9:00 AM – 11:00 AM)\n- Grade 10–12: July 11, 2026 (11:00 AM – 1:00 PM)\n\nParents are requested to collect the report cards in person. Kindly bring your ID card.\n\nAcademic Department",
    attachments: [],
    status: "sent",
    sentAt: "2026-07-06 08:00 AM",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 580, delivered: 578, read: 510, unread: 68, failed: 2 },
    activities: [
      { id: 1, action: "sent",      actor: "Academic Department", timestamp: "2026-07-06 08:00 AM" },
      { id: 2, action: "delivered", actor: "System",              timestamp: "2026-07-06 08:01 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 17,
    messageId: "MSG-2026-0017",
    subject: "Staff Salary Disbursement – July 2026",
    type: "General",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "HR Department",
    senderRole: "HR Manager",
    recipientType: "Staff",
    recipients: ["All Staff"],
    body: "Dear Staff Members,\n\nPlease be informed that the salary for the month of July 2026 will be disbursed on July 28, 2026.\n\nFor any discrepancies in your payslip, kindly contact the HR department by July 25, 2026.\n\nPlease ensure your bank account details are up to date in the HR portal.\n\nHR Department",
    attachments: [],
    status: "scheduled",
    scheduledAt: "2026-07-25 08:00 AM",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 85, delivered: 0, read: 0, unread: 0, failed: 0 },
    activities: [
      { id: 1, action: "scheduled", actor: "HR Department", timestamp: "2026-07-06 02:00 PM", note: "Scheduled for July 25" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 18,
    messageId: "MSG-2026-0018",
    subject: "Quiz Competition – Registration Deadline Extended",
    type: "Announcement",
    priority: "Low",
    sendMethod: "In-app",
    sender: "Academic Department",
    senderRole: "Academic Head",
    recipientType: "Students",
    recipients: ["Grade 7", "Grade 8", "Grade 9"],
    body: "Dear Students,\n\nThe registration deadline for the Inter-School Quiz Competition 2026 has been extended to July 15, 2026.\n\nEligibility: Students from Grade 7–9 with a minimum GPA of 3.0 in the last terminal examination.\n\nSubjects: Science, Mathematics, English, Social Studies\n\nInterested students should register with their class teacher by July 15, 2026.\n\nAcademic Department",
    attachments: [],
    status: "sent",
    sentAt: "2026-07-04 12:00 PM",
    updatedAt: "2026-07-04",
    stats: { totalRecipients: 240, delivered: 238, read: 185, unread: 53, failed: 2 },
    activities: [
      { id: 1, action: "sent",      actor: "Academic Department", timestamp: "2026-07-04 12:00 PM" },
      { id: 2, action: "delivered", actor: "System",              timestamp: "2026-07-04 12:01 PM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 19,
    messageId: "MSG-2026-0019",
    subject: "Transport Route Change – Sector 4 Bus",
    type: "General",
    priority: "High",
    sendMethod: "In-app",
    sender: "Transport Office",
    senderRole: "Transport Coordinator",
    recipientType: "Parents",
    recipients: ["Bus Route 4 Parents"],
    body: "Dear Parents using Bus Route 4,\n\nDue to road construction work on Main Street, Bus Route 4 will follow a detour effective from July 8, 2026 until further notice.\n\nNew pickup/drop points:\n- Sector 4A: 5 minutes earlier than usual\n- Sector 4B: Same timing via Ring Road\n- Sector 4C: Will now stop at Park Gate instead of Library Junction\n\nWe apologize for any inconvenience. Please plan accordingly.\n\nTransport Office",
    attachments: [{ id: 10, name: "route4-map-updated.pdf", type: "PDF", size: "380 KB" }],
    status: "sent",
    sentAt: "2026-07-06 03:00 PM",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 65, delivered: 65, read: 58, unread: 7, failed: 0 },
    activities: [
      { id: 1, action: "sent",      actor: "Transport Office", timestamp: "2026-07-06 03:00 PM" },
      { id: 2, action: "delivered", actor: "System",           timestamp: "2026-07-06 03:01 PM" },
    ],
    isStarred: false,
    requireAcknowledgement: true,
    sendCopyToAdmin: false,
  },
  {
    id: 20,
    messageId: "MSG-2026-0020",
    subject: "Hostel Admission Form – 2026–27",
    type: "General",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "Hostel Warden",
    senderRole: "Hostel Warden",
    recipientType: "Parents",
    recipients: ["Grade 6 Parents", "Grade 7 Parents"],
    body: "Dear Parents,\n\nHostel admission forms for the academic year 2026–27 are now available. Limited seats are available on a first-come, first-served basis.\n\nEligibility:\n- Currently enrolled in Grades 6–12\n- Minimum 75% attendance in previous year\n- Good academic standing\n\nMonthly hostel fee: NPR 8,500 (includes meals, laundry, and room)\n\nPlease collect forms from the hostel office (Room 201, Block C) between 9 AM – 4 PM.\n\nHostel Warden",
    attachments: [{ id: 11, name: "hostel-admission-form.pdf", type: "PDF", size: "195 KB" }],
    status: "sent",
    sentAt: "2026-07-03 09:00 AM",
    updatedAt: "2026-07-03",
    stats: { totalRecipients: 150, delivered: 149, read: 112, unread: 37, failed: 1 },
    activities: [
      { id: 1, action: "sent",      actor: "Hostel Warden", timestamp: "2026-07-03 09:00 AM" },
      { id: 2, action: "delivered", actor: "System",        timestamp: "2026-07-03 09:01 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 21,
    messageId: "MSG-2026-0021",
    subject: "Draft: Upcoming School Magazine – Submission Call",
    type: "Announcement",
    priority: "Low",
    sendMethod: "In-app",
    sender: "Platform Admin",
    senderRole: "Administrator",
    recipientType: "Students",
    recipients: ["All Students"],
    body: "Dear Students,\n\nThe editorial team for the school magazine 'EduVoice 2026' is calling for submissions.\n\nSubmissions open: [DATE TBD]\nCategories: Creative Writing, Poetry, Art & Illustration, Photography, Tech Insights\n\nSubmit your work to the editorial office or email to magazine@schoolos.np\n\nDo not miss this chance to showcase your talent!",
    attachments: [],
    status: "draft",
    updatedAt: "2026-07-05",
    stats: { totalRecipients: 0, delivered: 0, read: 0, unread: 0, failed: 0 },
    activities: [
      { id: 1, action: "draft_saved", actor: "Platform Admin", timestamp: "2026-07-05 01:30 PM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 22,
    messageId: "MSG-2026-0022",
    subject: "Draft: Term 2 Academic Calendar",
    type: "Academic Notice",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "Academic Department",
    senderRole: "Academic Head",
    recipientType: "All Users",
    recipients: [],
    body: "Dear All,\n\nPlease find the academic calendar for Term 2 (August–December 2026) attached below.\n\n[Content pending final approval from Principal]\n\nKey dates will include:\n- Term 2 commencement: August 1\n- Mid-term break: October [TBD]\n- Final exams: December [TBD]",
    attachments: [],
    status: "draft",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 0, delivered: 0, read: 0, unread: 0, failed: 0 },
    activities: [
      { id: 1, action: "draft_saved", actor: "Academic Department", timestamp: "2026-07-06 09:00 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 23,
    messageId: "MSG-2026-0023",
    subject: "Fee Payment Failed – Action Required",
    type: "Fee Reminder",
    priority: "Urgent",
    sendMethod: "In-app",
    sender: "Accounts Office",
    senderRole: "Accounts",
    recipientType: "Parents",
    recipients: ["Specific Parents"],
    body: "Dear Parent,\n\nWe regret to inform you that your recent online fee payment of NPR 4,850 failed to process.\n\nPossible reasons:\n- Insufficient balance\n- Bank server timeout\n- Payment gateway error\n\nPlease retry the payment or visit the school accounts office at the earliest. Continued non-payment may result in suspension of access to school services.\n\nAccounts Department",
    attachments: [],
    status: "failed",
    sentAt: "2026-07-05 03:45 PM",
    updatedAt: "2026-07-05",
    stats: { totalRecipients: 15, delivered: 0, read: 0, unread: 0, failed: 15 },
    activities: [
      { id: 1, action: "sent",   actor: "Accounts Office", timestamp: "2026-07-05 03:45 PM" },
      { id: 2, action: "failed", actor: "System",          timestamp: "2026-07-05 03:46 PM", note: "Delivery failed for all 15 recipients" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: true,
  },
  {
    id: 24,
    messageId: "MSG-2026-0024",
    subject: "New Canteen Menu – Healthy Eating Initiative",
    type: "Announcement",
    priority: "Low",
    sendMethod: "In-app",
    sender: "Canteen Committee",
    senderRole: "Staff",
    recipientType: "All Users",
    recipients: ["All Students", "All Staff"],
    body: "Dear Students and Staff,\n\nAs part of our Healthy Eating Initiative, the school canteen is introducing a new menu for July 2026.\n\nHighlights:\n- Fresh fruit cups available daily\n- No fried snacks on Tuesdays & Thursdays\n- New wholesome meals for NPR 80–120\n- Sugar-free drink options available\n\nWe encourage everyone to make healthier food choices. The full menu is displayed at the canteen counter.\n\nCanteen Committee",
    attachments: [{ id: 12, name: "july-canteen-menu.pdf", type: "PDF", size: "165 KB" }],
    status: "sent",
    sentAt: "2026-07-01 11:30 AM",
    updatedAt: "2026-07-01",
    stats: { totalRecipients: 865, delivered: 860, read: 620, unread: 240, failed: 5 },
    activities: [
      { id: 1, action: "sent",      actor: "Canteen Committee", timestamp: "2026-07-01 11:30 AM" },
      { id: 2, action: "delivered", actor: "System",            timestamp: "2026-07-01 11:31 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
  {
    id: 25,
    messageId: "MSG-2026-0025",
    subject: "Draft: Student Council Election 2026",
    type: "Announcement",
    priority: "Normal",
    sendMethod: "In-app",
    sender: "Platform Admin",
    senderRole: "Administrator",
    recipientType: "Students",
    recipients: ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    body: "Dear Students,\n\nNominations for the Student Council Election 2026 are now open.\n\nPositions Available:\n- President\n- Vice President\n- Secretary\n- Treasurer\n- House Captains (4 positions)\n\nNomination forms are available from your class teacher. Completed forms must be submitted by [DATE TBD].\n\nElection date: [TBD]\n\n[Pending final approval]",
    attachments: [],
    status: "draft",
    updatedAt: "2026-07-06",
    stats: { totalRecipients: 0, delivered: 0, read: 0, unread: 0, failed: 0 },
    activities: [
      { id: 1, action: "draft_saved", actor: "Platform Admin", timestamp: "2026-07-06 11:00 AM" },
    ],
    isStarred: false,
    requireAcknowledgement: false,
    sendCopyToAdmin: false,
  },
];

/* ─── Templates ───────────────────────────────────────────────────────── */

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 1,
    title: "Fee Reminder",
    category: "Fee Reminder",
    subject: "Monthly Fee Reminder – [Month] [Year]",
    body: "Dear Parent/Guardian,\n\nThis is a reminder that the school fees for the month of [Month] [Year] are due by [Due Date].\n\nFee Details:\n- Tuition Fee: NPR [Amount]\n- Additional Charges: NPR [Amount]\n\nPlease clear dues on time to avoid late charges.\n\nAccounts Department",
    tags: ["fees", "parents", "monthly"],
    usageCount: 12,
    lastUsed: "2026-07-01",
  },
  {
    id: 2,
    title: "Exam Notice",
    category: "Exam Notice",
    subject: "Examination Schedule – [Exam Name] [Year]",
    body: "Dear Students and Parents,\n\nWe are pleased to inform you that the [Exam Name] Examinations will be held from [Start Date] to [End Date].\n\nKey Instructions:\n- Carry admit card at all times\n- Arrive 30 minutes before exam time\n- No electronic devices permitted in the hall\n\nBest of luck!\n\nExamination Office",
    tags: ["exam", "students", "parents"],
    usageCount: 8,
    lastUsed: "2026-06-20",
  },
  {
    id: 3,
    title: "Attendance Alert",
    category: "Attendance Alert",
    subject: "Low Attendance Warning – [Student Name]",
    body: "Dear Parent/Guardian of [Student Name],\n\nThis is to inform you that [his/her] attendance has fallen to [X]%, which is below the required 80% threshold.\n\nPlease ensure regular attendance to maintain eligibility for examinations.\n\nFor any concerns, please visit the school office.\n\nClass Teacher",
    tags: ["attendance", "parents", "warning"],
    usageCount: 15,
    lastUsed: "2026-07-01",
  },
  {
    id: 4,
    title: "Parent Meeting Invitation",
    category: "Parent Meeting",
    subject: "Parent-Teacher Meeting – [Class/Grade] – [Date]",
    body: "Dear Parents,\n\nYou are cordially invited to the Parent-Teacher Meeting for [Class/Grade] on [Date] from [Start Time] to [End Time] at [Venue].\n\nAgenda:\n- Academic performance review\n- Student progress discussion\n- Upcoming events\n- Q&A session\n\nYour presence is greatly valued.\n\nWith regards,\nClass Teacher",
    tags: ["meeting", "parents", "teachers"],
    usageCount: 6,
    lastUsed: "2026-07-03",
  },
  {
    id: 5,
    title: "Holiday Notice",
    category: "Announcement",
    subject: "School Closed – [Holiday Name] – [Date]",
    body: "Dear All,\n\nPlease be informed that school will remain closed on [Date] on account of [Holiday Name].\n\nClasses will resume on [Resume Date].\n\nWe wish all celebrating families a joyful occasion!\n\nManagement",
    tags: ["holiday", "all users", "closure"],
    usageCount: 9,
    lastUsed: "2026-07-14",
  },
  {
    id: 6,
    title: "Result Published",
    category: "Academic Notice",
    subject: "Results Published – [Exam Name] – [Year]",
    body: "Dear Students and Parents,\n\nWe are pleased to announce that the results for [Exam Name] [Year] have been published.\n\nYou may view your results:\n- On the school portal (student login required)\n- At the school office during working hours\n\nReport cards will be distributed on [Distribution Date].\n\nAcademic Department",
    tags: ["results", "students", "parents"],
    usageCount: 4,
    lastUsed: "2026-06-15",
  },
  {
    id: 7,
    title: "Emergency Notice",
    category: "Emergency",
    subject: "URGENT: [Emergency Subject]",
    body: "URGENT NOTICE\n\n[Describe the emergency situation clearly and concisely.]\n\nAction Required:\n- [Action 1]\n- [Action 2]\n\nNormal operations will resume on [Date].\n\nWe apologize for any inconvenience.\n\nPrincipal",
    tags: ["emergency", "urgent", "all users"],
    usageCount: 2,
    lastUsed: "2026-07-06",
  },
];

/* ─── Summary ─────────────────────────────────────────────────────────── */

export const MESSAGE_SUMMARY: MessageSummary = {
  total:     MESSAGES.length,
  unread:    MESSAGES.filter(m => m.status === "unread").length
           + MESSAGES.filter(m => m.status === "sent" && m.stats.unread > 0).length,
  sent:      MESSAGES.filter(m => m.status === "sent").length,
  drafts:    MESSAGES.filter(m => m.status === "draft").length,
  failed:    MESSAGES.filter(m => m.status === "failed").length,
  scheduled: MESSAGES.filter(m => m.status === "scheduled").length,
  starred:   MESSAGES.filter(m => m.isStarred).length,
  archived:  0,
};

/* ─── Options ─────────────────────────────────────────────────────────── */

export const MESSAGE_TYPE_OPTIONS: MessageType[] = [
  "General", "Announcement", "Fee Reminder", "Exam Notice",
  "Attendance Alert", "Parent Meeting", "Emergency", "Academic Notice",
];
export const MESSAGE_PRIORITY_OPTIONS: MessagePriority[] = ["Low", "Normal", "High", "Urgent"];
export const SEND_METHOD_OPTIONS: SendMethod[] = ["In-app", "Email", "SMS", "Push Notification"];
export const RECIPIENT_TYPE_OPTIONS: RecipientType[] = [
  "All Users", "Students", "Parents", "Teachers", "Staff",
  "Specific Class", "Specific Section", "Specific Student",
  "Specific Parent", "Specific Teacher",
];
export const CLASS_OPTIONS_MESSAGES = [
  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
  "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12",
];
export const SECTION_OPTIONS_MESSAGES = ["A","B","C","D"];
