// Static, backend-ready seed data for the real-time messaging module.
// Shape mirrors what a WebSocket/REST backend would eventually serve — see
// lib/messagesService.ts and lib/realtimeService.ts for the mutation/pub-sub
// layer built on top of this seed.

export type ChatRole = "Super Admin" | "Admin" | "Principal" | "Teacher" | "Parent" | "Student" | "Staff";
export type PresenceStatus = "online" | "offline" | "away";

export interface ChatUser {
  id: string;
  name: string;
  role: ChatRole;
  email: string;
  avatar: string;
  status: PresenceStatus;
  lastSeen: string;
}

export type ConversationType =
  | "direct" | "group" | "class_group" | "staff_group"
  | "parent_teacher" | "admin_broadcast" | "support_request";

export type ConversationPriority = "low" | "normal" | "high" | "urgent";

export interface GroupPermissions {
  whoCanSend: "everyone" | "admins";
  whoCanAddMembers: "everyone" | "admins";
  whoCanUploadFiles: "everyone" | "admins";
  whoCanDeleteMessages: "everyone" | "admins" | "own";
  whoCanViewMembers: "everyone" | "admins";
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  avatar: string;
  participantIds: string[];
  adminIds: string[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  locked: boolean;
  priority: ConversationPriority;
  permissions?: GroupPermissions;
  /** Optional context line under the title (e.g. "Guardian of Aarav Khan · Grade 8-A"). */
  subtitle?: string;
  /** Links this conversation back to a specific student/class for context panels (e.g. a teacher's parent chat). */
  relatedStudentId?: string;
  relatedClassId?: string;
}

export type MessageContentType = "text" | "image" | "file" | "audio" | "system";
export type MessageDeliveryStatus = "sent" | "delivered" | "seen";

export interface MessageAttachment {
  id: string;
  name: string;
  kind: "image" | "pdf" | "doc" | "sheet" | "audio" | "video" | "other";
  size: string;
}

export interface MessageReaction {
  emoji: string;
  userIds: string[];
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  type: MessageContentType;
  attachments: MessageAttachment[];
  createdAt: string;
  editedAt: string | null;
  status: MessageDeliveryStatus;
  reactions: MessageReaction[];
  replyTo: string | null;
  deleted: boolean;
  pinned: boolean;
  flagged: boolean;
}

export interface Broadcast {
  id: string;
  title: string;
  body: string;
  audience: string;
  audienceCount: number;
  sentBy: string;
  sentAt: string;
  delivered: number;
  read: number;
  allowReplies: boolean;
}

export type MessageRequestStatus = "pending" | "approved" | "rejected" | "blocked";

export interface MessageRequestItem {
  id: string;
  fromUserId: string;
  toUserId: string;
  reason: string;
  status: MessageRequestStatus;
  requestedAt: string;
}

export type ModerationStatus = "open" | "reviewed" | "dismissed" | "actioned";

export interface ModerationReport {
  id: string;
  messageId: string;
  conversationId: string;
  senderId: string;
  reportedById: string;
  reason: string;
  priority: "low" | "normal" | "high";
  status: ModerationStatus;
  reportedAt: string;
}

export type AuditEventType =
  | "admin_opened_conversation" | "message_exported" | "message_deleted_by_admin"
  | "conversation_locked" | "member_removed" | "file_downloaded" | "moderation_action";

export interface MessageAuditEvent {
  id: string;
  type: AuditEventType;
  actorId: string;
  conversationId: string;
  detail: string;
  timestamp: string;
}

/* ─── Users ───────────────────────────────────────────────────────────── */

export const CHAT_USERS: ChatUser[] = [
  { id: "u-admin",      name: "Platform Admin",   role: "Super Admin", email: "admin@platform.test",       avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-principal",  name: "Demo Principal",   role: "Principal",   email: "principal@demo.school",     avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-accountant",  name: "Demo Accountant",  role: "Admin",        email: "accountant@demo.school",    avatar: "", status: "away",    lastSeen: "12 min ago" },
  { id: "u-teacher-01", name: "Kazi Fahim",       role: "Teacher",     email: "kffahim@schoolos.np",       avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-teacher-02", name: "Sita Rai",         role: "Teacher",     email: "srai@schoolos.np",          avatar: "", status: "offline", lastSeen: "2h ago" },
  { id: "u-teacher-03", name: "Demo Teacher",     role: "Teacher",     email: "teacher@demo.school",       avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-parent-01",  name: "Anita Gurung",     role: "Parent",      email: "anita.gurung@gmail.com",    avatar: "", status: "offline", lastSeen: "1d ago" },
  { id: "u-parent-02",  name: "Bishnu Adhikari",  role: "Parent",      email: "bishnu.a@gmail.com",        avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-parent-03",  name: "Rita Shrestha",    role: "Parent",      email: "rita.s@gmail.com",          avatar: "", status: "away",    lastSeen: "30 min ago" },
  { id: "u-student-01", name: "Liam Smith",       role: "Student",     email: "student@demo.school",       avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-student-02", name: "Priya Karki",      role: "Student",     email: "priya.k@student.schoolos.np", avatar: "", status: "offline", lastSeen: "3h ago" },
  { id: "u-staff-01",   name: "Front Desk",       role: "Staff",       email: "reception@demo.school",     avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-staff-02",   name: "Mira Shrestha",    role: "Staff",       email: "mshrestha@schoolos.np",     avatar: "", status: "offline", lastSeen: "5h ago" },
  { id: "u-staff-03",   name: "Academic Coordinator", role: "Staff",   email: "coordinator@demo.school",    avatar: "", status: "online",  lastSeen: "now" },

  // Guardians of Demo Teacher's assigned students (teacherDashboardData.ts) —
  // used by Teacher Messages / Parent Communication so those pages have real,
  // pre-seeded conversations rather than only being populated on first click.
  { id: "u-parent-david-khan",    name: "David Khan",     role: "Parent", email: "david.khan@example.com",    avatar: "", status: "offline", lastSeen: "2h ago" },
  { id: "u-parent-ravi-sharma",   name: "Ravi Sharma",    role: "Parent", email: "ravi.sharma@example.com",   avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-parent-michael-brown", name: "Michael Brown",  role: "Parent", email: "michael.brown@example.com", avatar: "", status: "offline", lastSeen: "1d ago" },

  // Students in Demo Teacher's assigned classes
  { id: "u-student-aarav-khan",   name: "Aarav Khan",     role: "Student", email: "aarav.khan@example.com",   avatar: "", status: "online",  lastSeen: "now" },
  { id: "u-student-aisha-sharma", name: "Aisha Sharma",   role: "Student", email: "aisha.sharma@example.com", avatar: "", status: "offline", lastSeen: "3h ago" },
  { id: "u-student-arjun-patel",  name: "Arjun Patel",    role: "Student", email: "arjun.patel@example.com",  avatar: "", status: "offline", lastSeen: "1d ago" },
];

export function chatUserById(id: string): ChatUser | undefined {
  return CHAT_USERS.find((u) => u.id === id);
}

/* ─── Conversations ───────────────────────────────────────────────────── */

const EVERYONE_SEND: GroupPermissions = {
  whoCanSend: "everyone", whoCanAddMembers: "admins", whoCanUploadFiles: "everyone", whoCanDeleteMessages: "own", whoCanViewMembers: "everyone",
};
const ADMINS_ONLY_SEND: GroupPermissions = {
  whoCanSend: "admins", whoCanAddMembers: "admins", whoCanUploadFiles: "admins", whoCanDeleteMessages: "admins", whoCanViewMembers: "everyone",
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c-001", type: "direct", title: "Kazi Fahim", avatar: "",
    participantIds: ["u-admin", "u-teacher-01"], adminIds: [],
    lastMessage: "Please review Grade 8 attendance.", lastMessageAt: "2026-07-10T10:30:00",
    unreadCount: 2, pinned: true, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-002", type: "direct", title: "Anita Gurung", avatar: "",
    participantIds: ["u-teacher-03", "u-parent-01"], adminIds: [],
    lastMessage: "Thank you, I'll speak with her tonight.", lastMessageAt: "2026-07-10T09:05:00",
    unreadCount: 0, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-003", type: "class_group", title: "Grade 8 Section A", avatar: "",
    participantIds: ["u-admin", "u-principal", "u-teacher-01", "u-teacher-03", "u-parent-01", "u-parent-02", "u-student-01"],
    adminIds: ["u-teacher-01"],
    lastMessage: "Reminder: science project due Friday.", lastMessageAt: "2026-07-10T08:40:00",
    unreadCount: 5, pinned: true, muted: false, archived: false, locked: false, priority: "normal",
    permissions: EVERYONE_SEND,
  },
  {
    id: "c-004", type: "staff_group", title: "Teachers Staff Room", avatar: "",
    participantIds: ["u-admin", "u-principal", "u-teacher-01", "u-teacher-02", "u-teacher-03"],
    adminIds: ["u-principal"],
    lastMessage: "Staff meeting moved to 3 PM tomorrow.", lastMessageAt: "2026-07-09T16:20:00",
    unreadCount: 0, pinned: false, muted: true, archived: false, locked: false, priority: "normal",
    permissions: EVERYONE_SEND,
  },
  {
    id: "c-005", type: "parent_teacher", title: "Grade 10 Parents", avatar: "",
    participantIds: ["u-teacher-02", "u-teacher-03", "u-parent-02", "u-parent-03"],
    adminIds: ["u-teacher-02"],
    lastMessage: "Result cards will be ready by Friday.", lastMessageAt: "2026-07-09T14:10:00",
    unreadCount: 1, pinned: false, muted: false, archived: false, locked: false, priority: "high",
    permissions: EVERYONE_SEND,
  },
  {
    id: "c-006", type: "group", title: "Exam Committee", avatar: "",
    participantIds: ["u-admin", "u-principal", "u-teacher-01", "u-teacher-02"],
    adminIds: ["u-admin", "u-principal"],
    lastMessage: "Final schedule approved.", lastMessageAt: "2026-07-08T11:00:00",
    unreadCount: 0, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
    permissions: ADMINS_ONLY_SEND,
  },
  {
    id: "c-007", type: "group", title: "Accounts Department", avatar: "",
    participantIds: ["u-admin", "u-accountant", "u-staff-02"],
    adminIds: ["u-accountant"],
    lastMessage: "July invoices are now finalized.", lastMessageAt: "2026-07-07T09:00:00",
    unreadCount: 0, pinned: false, muted: false, archived: true, locked: false, priority: "low",
    permissions: EVERYONE_SEND,
  },
  {
    id: "c-008", type: "group", title: "Principal Office", avatar: "",
    participantIds: ["u-admin", "u-principal", "u-staff-01"],
    adminIds: ["u-principal"],
    lastMessage: "Visitor log updated for this week.", lastMessageAt: "2026-07-06T13:30:00",
    unreadCount: 0, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
    permissions: ADMINS_ONLY_SEND,
  },
  {
    id: "c-009", type: "support_request", title: "Priya Karki", avatar: "",
    participantIds: ["u-teacher-01", "u-student-02"],
    adminIds: [],
    lastMessage: "Can I ask about the homework deadline?", lastMessageAt: "2026-07-10T07:50:00",
    unreadCount: 1, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-010", type: "direct", title: "Bishnu Adhikari", avatar: "",
    participantIds: ["u-principal", "u-parent-02"],
    adminIds: [],
    lastMessage: "Thanks for the update, Principal.", lastMessageAt: "2026-07-05T15:00:00",
    unreadCount: 0, pinned: false, muted: false, archived: true, locked: true, priority: "low",
  },

  /* ── Demo Teacher's parent/student/staff conversations ──────────────── */
  {
    id: "c-parent-david-khan", type: "direct", title: "David Khan", avatar: "",
    subtitle: "Guardian of Aarav Khan · Grade 8-A",
    relatedStudentId: "1", relatedClassId: "class-8-a",
    participantIds: ["u-teacher-03", "u-parent-david-khan"], adminIds: [],
    lastMessage: "Could you share Aarav's progress in Mathematics this term?", lastMessageAt: "2026-07-14T09:12:00",
    unreadCount: 1, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-parent-ravi-sharma", type: "direct", title: "Ravi Sharma", avatar: "",
    subtitle: "Guardian of Aisha Sharma · Grade 8-A",
    relatedStudentId: "2", relatedClassId: "class-8-a",
    participantIds: ["u-teacher-03", "u-parent-ravi-sharma"], adminIds: [],
    lastMessage: "Thank you for the update on Aisha's project.", lastMessageAt: "2026-07-13T17:20:00",
    unreadCount: 0, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-parent-michael-brown", type: "direct", title: "Michael Brown", avatar: "",
    subtitle: "Guardian of Noah Brown · Grade 8-A",
    relatedStudentId: "3", relatedClassId: "class-8-a",
    participantIds: ["u-teacher-03", "u-parent-michael-brown"], adminIds: [],
    lastMessage: "We'll work on the missing homework this weekend.", lastMessageAt: "2026-07-12T18:05:00",
    unreadCount: 0, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-student-aarav-khan", type: "direct", title: "Aarav Khan", avatar: "",
    subtitle: "Grade 8-A",
    relatedStudentId: "1", relatedClassId: "class-8-a",
    participantIds: ["u-teacher-03", "u-student-aarav-khan"], adminIds: [],
    lastMessage: "Thank you, sir! I'll submit it tomorrow.", lastMessageAt: "2026-07-11T13:40:00",
    unreadCount: 0, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-student-aisha-sharma", type: "direct", title: "Aisha Sharma", avatar: "",
    subtitle: "Grade 8-A",
    relatedStudentId: "2", relatedClassId: "class-8-a",
    participantIds: ["u-teacher-03", "u-student-aisha-sharma"], adminIds: [],
    lastMessage: "Can I resubmit the worksheet with corrections?", lastMessageAt: "2026-07-10T15:10:00",
    unreadCount: 1, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-student-arjun-patel", type: "support_request", title: "Arjun Patel", avatar: "",
    subtitle: "Grade 8-A",
    relatedStudentId: "5", relatedClassId: "class-8-a",
    participantIds: ["u-teacher-03", "u-student-arjun-patel"], adminIds: [],
    lastMessage: "Sir, could you explain question 4 again?", lastMessageAt: "2026-07-09T12:30:00",
    unreadCount: 1, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-grade9-sectionb", type: "class_group", title: "Grade 9 Section B", avatar: "",
    participantIds: ["u-teacher-03", "u-parent-01", "u-parent-02"], adminIds: ["u-teacher-03"],
    lastMessage: "Unit test 3 results will be shared by Friday.", lastMessageAt: "2026-07-11T10:00:00",
    unreadCount: 0, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
    permissions: EVERYONE_SEND,
  },
  {
    id: "c-teacher-principal", type: "direct", title: "Principal Office", avatar: "",
    participantIds: ["u-teacher-03", "u-principal"], adminIds: [],
    lastMessage: "Please submit mid-term lesson plans by Friday.", lastMessageAt: "2026-07-09T08:30:00",
    unreadCount: 1, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
  {
    id: "c-academic-coord", type: "direct", title: "Academic Coordinator", avatar: "",
    participantIds: ["u-teacher-03", "u-staff-03"], adminIds: [],
    lastMessage: "Syllabus tracker updated for this term.", lastMessageAt: "2026-07-08T11:15:00",
    unreadCount: 0, pinned: false, muted: false, archived: false, locked: false, priority: "normal",
  },
];

export function conversationById(id: string): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.id === id);
}

/* ─── Messages ────────────────────────────────────────────────────────── */

export const CHAT_MESSAGES: ChatMessage[] = [
  // c-001 — direct, admin <-> teacher-01
  { id: "m-0011", conversationId: "c-001", senderId: "u-teacher-01", body: "Good morning! Grade 8 attendance for last week is ready for review.", type: "text", attachments: [], createdAt: "2026-07-10T09:58:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0012", conversationId: "c-001", senderId: "u-teacher-01", body: "", type: "file", attachments: [{ id: "a-1", name: "attendance-grade8-w27.xlsx", kind: "sheet", size: "84 KB" }], createdAt: "2026-07-10T09:59:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: true, flagged: false },
  { id: "m-0013", conversationId: "c-001", senderId: "u-admin", body: "Thanks Kazi, looking now.", type: "text", attachments: [], createdAt: "2026-07-10T10:05:00", editedAt: null, status: "seen", reactions: [{ emoji: "👍", userIds: ["u-teacher-01"] }], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0014", conversationId: "c-001", senderId: "u-teacher-01", body: "Please review Grade 8 attendance.", type: "text", attachments: [], createdAt: "2026-07-10T10:30:00", editedAt: null, status: "delivered", reactions: [], replyTo: "m-0012", deleted: false, pinned: false, flagged: false },

  // c-002 — direct, teacher-03 <-> parent-01
  { id: "m-0021", conversationId: "c-002", senderId: "u-teacher-03", body: "Hi Anita, Liam did great on today's quiz — 9/10!", type: "text", attachments: [], createdAt: "2026-07-10T08:55:00", editedAt: null, status: "seen", reactions: [{ emoji: "🎉", userIds: ["u-parent-01"] }], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0022", conversationId: "c-002", senderId: "u-parent-01", body: "That's wonderful news, thank you for letting me know!", type: "text", attachments: [], createdAt: "2026-07-10T09:00:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0023", conversationId: "c-002", senderId: "u-teacher-03", body: "He's a little behind on reading homework though — could you check in with him?", type: "text", attachments: [], createdAt: "2026-07-10T09:02:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0024", conversationId: "c-002", senderId: "u-parent-01", body: "Thank you, I'll speak with her tonight.", type: "text", attachments: [], createdAt: "2026-07-10T09:05:00", editedAt: "2026-07-10T09:06:00", status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-003 — class group Grade 8 Section A
  { id: "m-0031", conversationId: "c-003", senderId: "u-teacher-01", body: "Good morning everyone! A quick note about this week's schedule.", type: "text", attachments: [], createdAt: "2026-07-10T08:00:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0032", conversationId: "c-003", senderId: "u-teacher-01", body: "", type: "image", attachments: [{ id: "a-2", name: "science-fair-poster.png", kind: "image", size: "1.2 MB" }], createdAt: "2026-07-10T08:05:00", editedAt: null, status: "seen", reactions: [{ emoji: "🔥", userIds: ["u-parent-02", "u-student-01"] }], replyTo: null, deleted: false, pinned: true, flagged: false },
  { id: "m-0033", conversationId: "c-003", senderId: "u-parent-02", body: "Looks great, thanks for sharing!", type: "text", attachments: [], createdAt: "2026-07-10T08:10:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0034", conversationId: "c-003", senderId: "system", body: "Priya Karki added to the group by Kazi Fahim", type: "system", attachments: [], createdAt: "2026-07-10T08:15:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0035", conversationId: "c-003", senderId: "u-student-01", body: "Is the project group of 2 or 3?", type: "text", attachments: [], createdAt: "2026-07-10T08:30:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0036", conversationId: "c-003", senderId: "u-teacher-01", body: "Reminder: science project due Friday.", type: "text", attachments: [], createdAt: "2026-07-10T08:40:00", editedAt: null, status: "delivered", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-004 — staff group
  { id: "m-0041", conversationId: "c-004", senderId: "u-principal", body: "Staff meeting moved to 3 PM tomorrow.", type: "text", attachments: [], createdAt: "2026-07-09T16:20:00", editedAt: null, status: "seen", reactions: [{ emoji: "👍", userIds: ["u-teacher-01", "u-teacher-02", "u-teacher-03"] }], replyTo: null, deleted: false, pinned: true, flagged: false },
  { id: "m-0042", conversationId: "c-004", senderId: "u-teacher-02", body: "Got it, thank you.", type: "text", attachments: [], createdAt: "2026-07-09T16:22:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-005 — parent-teacher Grade 10 Parents
  { id: "m-0051", conversationId: "c-005", senderId: "u-teacher-02", body: "Result cards will be ready by Friday.", type: "text", attachments: [], createdAt: "2026-07-09T14:10:00", editedAt: null, status: "delivered", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0052", conversationId: "c-005", senderId: "u-parent-03", body: "Will they be available for pickup or emailed?", type: "text", attachments: [], createdAt: "2026-07-09T14:15:00", editedAt: null, status: "delivered", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-006 — Exam Committee
  { id: "m-0061", conversationId: "c-006", senderId: "u-admin", body: "Final schedule approved.", type: "text", attachments: [], createdAt: "2026-07-08T11:00:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-0062", conversationId: "c-006", senderId: "u-principal", body: "Great, publishing to admit cards now.", type: "text", attachments: [], createdAt: "2026-07-08T11:02:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-007 — Accounts Department (archived)
  { id: "m-0071", conversationId: "c-007", senderId: "u-accountant", body: "July invoices are now finalized.", type: "text", attachments: [], createdAt: "2026-07-07T09:00:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-008 — Principal Office
  { id: "m-0081", conversationId: "c-008", senderId: "u-staff-01", body: "Visitor log updated for this week.", type: "text", attachments: [], createdAt: "2026-07-06T13:30:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-009 — support request, teacher-01 <-> student-02
  { id: "m-0091", conversationId: "c-009", senderId: "u-student-02", body: "Hello sir, can I ask about the homework deadline?", type: "text", attachments: [], createdAt: "2026-07-10T07:50:00", editedAt: null, status: "delivered", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-010 — locked/archived direct
  { id: "m-0101", conversationId: "c-010", senderId: "u-parent-02", body: "Thanks for the update, Principal.", type: "text", attachments: [], createdAt: "2026-07-05T15:00:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-parent-david-khan — Demo Teacher <-> David Khan (guardian of Aarav Khan)
  { id: "m-pdk-1", conversationId: "c-parent-david-khan", senderId: "u-parent-david-khan", body: "Hello, hope you're doing well.", type: "text", attachments: [], createdAt: "2026-07-14T09:10:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-pdk-2", conversationId: "c-parent-david-khan", senderId: "u-parent-david-khan", body: "Could you share Aarav's progress in Mathematics this term?", type: "text", attachments: [], createdAt: "2026-07-14T09:12:00", editedAt: null, status: "delivered", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-parent-ravi-sharma — Demo Teacher <-> Ravi Sharma (guardian of Aisha Sharma)
  { id: "m-prs-1", conversationId: "c-parent-ravi-sharma", senderId: "u-teacher-03", body: "Aisha did excellent work on her project this week.", type: "text", attachments: [], createdAt: "2026-07-13T17:15:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-prs-2", conversationId: "c-parent-ravi-sharma", senderId: "u-parent-ravi-sharma", body: "Thank you for the update on Aisha's project.", type: "text", attachments: [], createdAt: "2026-07-13T17:20:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-parent-michael-brown — Demo Teacher <-> Michael Brown (guardian of Noah Brown)
  { id: "m-pmb-1", conversationId: "c-parent-michael-brown", senderId: "u-teacher-03", body: "Noah has a few missing homework submissions this week.", type: "text", attachments: [], createdAt: "2026-07-12T18:00:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-pmb-2", conversationId: "c-parent-michael-brown", senderId: "u-parent-michael-brown", body: "We'll work on the missing homework this weekend.", type: "text", attachments: [], createdAt: "2026-07-12T18:05:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-student-aarav-khan
  { id: "m-sak-1", conversationId: "c-student-aarav-khan", senderId: "u-teacher-03", body: "Please resubmit yesterday's worksheet by tomorrow.", type: "text", attachments: [], createdAt: "2026-07-11T13:35:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
  { id: "m-sak-2", conversationId: "c-student-aarav-khan", senderId: "u-student-aarav-khan", body: "Thank you, sir! I'll submit it tomorrow.", type: "text", attachments: [], createdAt: "2026-07-11T13:40:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-student-aisha-sharma
  { id: "m-sas-1", conversationId: "c-student-aisha-sharma", senderId: "u-student-aisha-sharma", body: "Can I resubmit the worksheet with corrections?", type: "text", attachments: [], createdAt: "2026-07-10T15:10:00", editedAt: null, status: "delivered", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-student-arjun-patel — support request
  { id: "m-sap-1", conversationId: "c-student-arjun-patel", senderId: "u-student-arjun-patel", body: "Sir, could you explain question 4 again?", type: "text", attachments: [], createdAt: "2026-07-09T12:30:00", editedAt: null, status: "delivered", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-grade9-sectionb
  { id: "m-g9b-1", conversationId: "c-grade9-sectionb", senderId: "u-teacher-03", body: "Unit test 3 results will be shared by Friday.", type: "text", attachments: [], createdAt: "2026-07-11T10:00:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-teacher-principal
  { id: "m-tp-1", conversationId: "c-teacher-principal", senderId: "u-principal", body: "Please submit mid-term lesson plans by Friday.", type: "text", attachments: [], createdAt: "2026-07-09T08:30:00", editedAt: null, status: "delivered", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },

  // c-academic-coord
  { id: "m-ac-1", conversationId: "c-academic-coord", senderId: "u-staff-03", body: "Syllabus tracker updated for this term.", type: "text", attachments: [], createdAt: "2026-07-08T11:15:00", editedAt: null, status: "seen", reactions: [], replyTo: null, deleted: false, pinned: false, flagged: false },
];

/* ─── Broadcasts ──────────────────────────────────────────────────────── */

export const BROADCASTS: Broadcast[] = [
  {
    id: "b-001", title: "Eid al-Adha Holiday Notice",
    body: "School will remain closed on July 17, 2026 for Eid al-Adha. Classes resume July 20.",
    audience: "All Users", audienceCount: 1200, sentBy: "Platform Admin", sentAt: "2026-07-14T11:00:00",
    delivered: 1195, read: 980, allowReplies: false,
  },
  {
    id: "b-002", title: "Emergency: School Closed Tomorrow",
    body: "Due to a water supply disruption, school will remain closed on July 7, 2026.",
    audience: "All Users", audienceCount: 1200, sentBy: "Principal", sentAt: "2026-07-06T16:00:00",
    delivered: 1198, read: 1150, allowReplies: false,
  },
  {
    id: "b-003", title: "Monthly Fee Reminder – July 2026",
    body: "School fees for July 2026 are due by July 10. Please clear dues to avoid late charges.",
    audience: "All Parents", audienceCount: 580, sentBy: "Accounts Office", sentAt: "2026-07-01T09:00:00",
    delivered: 578, read: 421, allowReplies: true,
  },
];

/* ─── Message Requests ────────────────────────────────────────────────── */

export const MESSAGE_REQUESTS: MessageRequestItem[] = [
  { id: "r-001", fromUserId: "u-student-02", toUserId: "u-teacher-01", reason: "Question about homework deadline extension.", status: "pending", requestedAt: "2026-07-10T07:49:00" },
  { id: "r-002", fromUserId: "u-parent-03", toUserId: "u-admin", reason: "Request to discuss transport route change.", status: "pending", requestedAt: "2026-07-09T18:20:00" },
  { id: "r-003", fromUserId: "u-student-01", toUserId: "u-principal", reason: "Asking about student council nomination.", status: "approved", requestedAt: "2026-07-08T10:00:00" },
  { id: "r-004", fromUserId: "u-parent-01", toUserId: "u-teacher-02", reason: "Unrelated promotional message flagged by filter.", status: "rejected", requestedAt: "2026-07-07T09:15:00" },
];

/* ─── Moderation ──────────────────────────────────────────────────────── */

export const MODERATION_REPORTS: ModerationReport[] = [
  { id: "mo-001", messageId: "m-0035", conversationId: "c-003", senderId: "u-student-01", reportedById: "u-teacher-01", reason: "Off-topic message during class hours", priority: "low", status: "dismissed", reportedAt: "2026-07-10T08:31:00" },
  { id: "mo-002", messageId: "m-0091", conversationId: "c-009", senderId: "u-student-02", reportedById: "u-teacher-01", reason: "Unclear intent, flagged for review before approval", priority: "normal", status: "open", reportedAt: "2026-07-10T07:51:00" },
  { id: "mo-003", messageId: "m-0101", conversationId: "c-010", senderId: "u-parent-02", reportedById: "u-principal", reason: "Suspicious external link shared in direct message", priority: "high", status: "actioned", reportedAt: "2026-07-05T15:05:00" },
];

/* ─── Audit Trail ─────────────────────────────────────────────────────── */

export const MESSAGE_AUDIT_EVENTS: MessageAuditEvent[] = [
  { id: "au-001", type: "admin_opened_conversation", actorId: "u-admin", conversationId: "c-010", detail: "Opened locked conversation for moderation review", timestamp: "2026-07-05T15:10:00" },
  { id: "au-002", type: "conversation_locked", actorId: "u-admin", conversationId: "c-010", detail: "Locked conversation after suspicious link report", timestamp: "2026-07-05T15:12:00" },
  { id: "au-003", type: "moderation_action", actorId: "u-admin", conversationId: "c-010", detail: "Flagged message actioned — sender warned", timestamp: "2026-07-05T15:15:00" },
  { id: "au-004", type: "message_exported", actorId: "u-admin", conversationId: "c-001", detail: "Exported conversation as JSON for record-keeping", timestamp: "2026-07-09T10:00:00" },
];

/* ─── Filters / options ───────────────────────────────────────────────── */

export const CONVERSATION_FILTER_TABS = ["All", "Unread", "Groups", "Parents", "Teachers", "Students", "Staff", "Archived"] as const;

/* ─── Teacher <-> guardian/student chat identity resolution ─────────────
 * The 3 guardians/students pre-seeded above (assignedStudents ids 1, 2, 5)
 * get their real chat identity; everyone else gets a stable, deterministic
 * one so "Message" always works for any assigned student, not just the
 * named examples. Shared by Parent Communication and the Teacher Help
 * center so both features resolve the same chat identity for a given
 * student. */
const KNOWN_GUARDIAN_CHAT_IDS: Record<number, string> = {
  1: "u-parent-david-khan",
  2: "u-parent-ravi-sharma",
  3: "u-parent-michael-brown",
};
const KNOWN_STUDENT_CHAT_IDS: Record<number, string> = {
  1: "u-student-aarav-khan",
  2: "u-student-aisha-sharma",
  5: "u-student-arjun-patel",
};

export function guardianChatUserIdForStudent(studentId: number): string {
  return KNOWN_GUARDIAN_CHAT_IDS[studentId] ?? `u-parent-guardian-${studentId}`;
}

export function studentChatUserId(studentId: number): string {
  return KNOWN_STUDENT_CHAT_IDS[studentId] ?? `u-student-${studentId}`;
}
export type ConversationFilterTab = (typeof CONVERSATION_FILTER_TABS)[number];
