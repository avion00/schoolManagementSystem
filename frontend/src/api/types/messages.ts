/**
 * Messaging view models, shared by the chat UI and the messaging store
 * (`src/lib/messagesService.ts`, which fills them from the API).
 */
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
  downloadUrl: string;
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

export const CONVERSATION_FILTER_TABS = ["All", "Unread", "Groups", "Parents", "Teachers", "Students", "Staff", "Archived"] as const;
export type ConversationFilterTab = (typeof CONVERSATION_FILTER_TABS)[number];
