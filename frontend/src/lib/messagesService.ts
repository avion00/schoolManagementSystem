// In-memory CRUD layer over the messages seed data. This is the single
// source of truth the mock realtime layer (realtimeService.ts) and the UI
// hooks read/write through — swapping this for real REST/WebSocket calls
// later should not require changing any component.
import {
  BROADCASTS, CHAT_MESSAGES, CHAT_USERS, CONVERSATIONS, MESSAGE_AUDIT_EVENTS,
  MESSAGE_REQUESTS, MODERATION_REPORTS,
  type Broadcast, type ChatMessage, type ChatRole, type ChatUser, type Conversation,
  type MessageAttachment, type MessageAuditEvent, type MessageContentType,
  type MessageRequestItem, type ModerationReport,
} from "@/data/messagesData";
import type { User } from "@/lib/auth";

const VALID_CHAT_ROLES: ChatRole[] = ["Super Admin", "Admin", "Principal", "Teacher", "Parent", "Student", "Staff"];

/** Maps the real authenticated user onto a chat identity — by email when the demo
 *  seed has a matching entry, otherwise synthesizes one from their real roles. */
export function resolveCurrentChatUser(user: User): { id: string; role: ChatRole } {
  const seeded = CHAT_USERS.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (seeded) return { id: seeded.id, role: seeded.role };

  if (user.is_superuser || user.is_platform_admin) return { id: `real-${user.id}`, role: "Super Admin" };
  const matched = user.roles.find((r): r is ChatRole => VALID_CHAT_ROLES.includes(r as ChatRole));
  return { id: `real-${user.id}`, role: matched ?? "Staff" };
}

let conversations: Conversation[] = CONVERSATIONS.map((c) => ({ ...c }));
let messages: ChatMessage[] = CHAT_MESSAGES.map((m) => ({ ...m, attachments: [...m.attachments], reactions: [...m.reactions] }));
let broadcasts: Broadcast[] = BROADCASTS.map((b) => ({ ...b }));
let messageRequests: MessageRequestItem[] = MESSAGE_REQUESTS.map((r) => ({ ...r }));
let moderationReports: ModerationReport[] = MODERATION_REPORTS.map((r) => ({ ...r }));
let auditEvents: MessageAuditEvent[] = MESSAGE_AUDIT_EVENTS.map((e) => ({ ...e }));
let nextMessageSeq = messages.length + 1;
let nextConversationSeq = conversations.length + 1;

function logAudit(type: MessageAuditEvent["type"], actorId: string, conversationId: string, detail: string) {
  auditEvents = [{ id: `au-${Date.now()}`, type, actorId, conversationId, detail, timestamp: new Date().toISOString() }, ...auditEvents];
}

export const messagesService = {
  getUsers(): ChatUser[] {
    return CHAT_USERS;
  },
  getUserById(id: string): ChatUser | undefined {
    return CHAT_USERS.find((u) => u.id === id);
  },
  getConversations(): Conversation[] {
    return conversations;
  },
  getConversation(id: string): Conversation | undefined {
    return conversations.find((c) => c.id === id);
  },
  getMessages(conversationId: string): ChatMessage[] {
    return messages.filter((m) => m.conversationId === conversationId);
  },

  sendMessage(params: {
    conversationId: string;
    senderId: string;
    body: string;
    type?: MessageContentType;
    attachments?: MessageAttachment[];
    replyTo?: string | null;
  }): ChatMessage {
    const msg: ChatMessage = {
      id: `m-local-${nextMessageSeq++}`,
      conversationId: params.conversationId,
      senderId: params.senderId,
      body: params.body,
      type: params.type ?? "text",
      attachments: params.attachments ?? [],
      createdAt: new Date().toISOString(),
      editedAt: null,
      status: "sent",
      reactions: [],
      replyTo: params.replyTo ?? null,
      deleted: false,
      pinned: false,
      flagged: false,
    };
    messages = [...messages, msg];
    conversations = conversations.map((c) =>
      c.id === params.conversationId
        ? { ...c, lastMessage: params.type === "text" ? params.body : `Sent a ${params.type}`, lastMessageAt: msg.createdAt }
        : c,
    );
    return msg;
  },

  updateMessageStatus(messageId: string, status: ChatMessage["status"]) {
    messages = messages.map((m) => (m.id === messageId ? { ...m, status } : m));
  },

  editMessage(messageId: string, body: string) {
    messages = messages.map((m) => (m.id === messageId ? { ...m, body, editedAt: new Date().toISOString() } : m));
  },

  deleteMessage(messageId: string, deletedByAdmin = false, actorId?: string) {
    const msg = messages.find((m) => m.id === messageId);
    messages = messages.map((m) => (m.id === messageId ? { ...m, deleted: true, body: "" } : m));
    if (deletedByAdmin && msg && actorId) {
      logAudit("message_deleted_by_admin", actorId, msg.conversationId, `Deleted message ${messageId}`);
    }
  },

  toggleReaction(messageId: string, emoji: string, userId: string) {
    messages = messages.map((m) => {
      if (m.id !== messageId) return m;
      const existing = m.reactions.find((r) => r.emoji === emoji);
      if (!existing) return { ...m, reactions: [...m.reactions, { emoji, userIds: [userId] }] };
      const has = existing.userIds.includes(userId);
      const updated = has ? existing.userIds.filter((id) => id !== userId) : [...existing.userIds, userId];
      return {
        ...m,
        reactions: updated.length
          ? m.reactions.map((r) => (r.emoji === emoji ? { ...r, userIds: updated } : r))
          : m.reactions.filter((r) => r.emoji !== emoji),
      };
    });
  },

  togglePinMessage(messageId: string) {
    messages = messages.map((m) => (m.id === messageId ? { ...m, pinned: !m.pinned } : m));
  },

  flagMessage(messageId: string) {
    messages = messages.map((m) => (m.id === messageId ? { ...m, flagged: true } : m));
  },

  markConversationRead(conversationId: string) {
    conversations = conversations.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c));
  },

  togglePin(conversationId: string) {
    conversations = conversations.map((c) => (c.id === conversationId ? { ...c, pinned: !c.pinned } : c));
  },
  toggleMute(conversationId: string) {
    conversations = conversations.map((c) => (c.id === conversationId ? { ...c, muted: !c.muted } : c));
  },
  toggleArchive(conversationId: string) {
    conversations = conversations.map((c) => (c.id === conversationId ? { ...c, archived: !c.archived } : c));
  },
  toggleLock(conversationId: string, actorId: string) {
    conversations = conversations.map((c) => (c.id === conversationId ? { ...c, locked: !c.locked } : c));
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv?.locked) logAudit("conversation_locked", actorId, conversationId, `Locked conversation "${conv.title}"`);
  },
  deleteConversation(conversationId: string) {
    conversations = conversations.filter((c) => c.id !== conversationId);
    messages = messages.filter((m) => m.conversationId !== conversationId);
  },

  addMember(conversationId: string, userId: string) {
    conversations = conversations.map((c) =>
      c.id === conversationId && !c.participantIds.includes(userId)
        ? { ...c, participantIds: [...c.participantIds, userId] }
        : c,
    );
  },
  removeMember(conversationId: string, userId: string, actorId?: string) {
    conversations = conversations.map((c) =>
      c.id === conversationId ? { ...c, participantIds: c.participantIds.filter((id) => id !== userId) } : c,
    );
    if (actorId) logAudit("member_removed", actorId, conversationId, `Removed member ${userId}`);
  },

  createConversation(params: {
    type: Conversation["type"];
    title: string;
    participantIds: string[];
    creatorId: string;
    firstMessage?: string;
  }): Conversation {
    const conv: Conversation = {
      id: `c-local-${nextConversationSeq++}`,
      type: params.type,
      title: params.title,
      avatar: "",
      participantIds: params.participantIds,
      adminIds: [params.creatorId],
      lastMessage: params.firstMessage ?? "",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      pinned: false,
      muted: false,
      archived: false,
      locked: false,
      priority: "normal",
    };
    conversations = [conv, ...conversations];
    if (params.firstMessage) {
      this.sendMessage({ conversationId: conv.id, senderId: params.creatorId, body: params.firstMessage });
    }
    return conv;
  },

  logConversationOpened(conversationId: string, actorId: string) {
    logAudit("admin_opened_conversation", actorId, conversationId, "Opened conversation for oversight");
  },
  logExport(conversationId: string, actorId: string, format: string) {
    logAudit("message_exported", actorId, conversationId, `Exported conversation as ${format.toUpperCase()}`);
  },
  logFileDownload(conversationId: string, actorId: string, fileName: string) {
    logAudit("file_downloaded", actorId, conversationId, `Downloaded attachment "${fileName}"`);
  },

  getBroadcasts(): Broadcast[] {
    return broadcasts;
  },
  createBroadcast(b: Omit<Broadcast, "id" | "sentAt" | "delivered" | "read">): Broadcast {
    const created: Broadcast = { ...b, id: `b-local-${Date.now()}`, sentAt: new Date().toISOString(), delivered: b.audienceCount, read: 0 };
    broadcasts = [created, ...broadcasts];
    return created;
  },

  getMessageRequests(): MessageRequestItem[] {
    return messageRequests;
  },
  updateRequestStatus(id: string, status: MessageRequestItem["status"]) {
    messageRequests = messageRequests.map((r) => (r.id === id ? { ...r, status } : r));
  },

  getModerationReports(): ModerationReport[] {
    return moderationReports;
  },
  updateModerationStatus(id: string, status: ModerationReport["status"], actorId: string) {
    moderationReports = moderationReports.map((r) => (r.id === id ? { ...r, status } : r));
    const report = moderationReports.find((r) => r.id === id);
    if (report) logAudit("moderation_action", actorId, report.conversationId, `Moderation report ${id} marked ${status}`);
  },

  getAuditEvents(): MessageAuditEvent[] {
    return auditEvents;
  },
};
