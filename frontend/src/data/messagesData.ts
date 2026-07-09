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
    participantIds: ["u-admin", "u-principal", "u-teacher-01", "u-parent-01", "u-parent-02", "u-student-01"],
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
    participantIds: ["u-teacher-02", "u-parent-02", "u-parent-03"],
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
export type ConversationFilterTab = (typeof CONVERSATION_FILTER_TABS)[number];
