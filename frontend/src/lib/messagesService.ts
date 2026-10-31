// Messaging store: a client-side cache over the messaging API. Components read
// it synchronously (getConversations, getMessages, …) and re-render through the
// subscriptions in realtimeService.ts; loaders fill it from REST, WebSocket
// events keep it live, and mutations call the API and update it in place.
import { del, get, getAll, patch, post } from "@/api/http";
import type { StoredFile } from "@/api/files";
import { fileSize } from "@/api/notices";
import type {
  Broadcast, ChatMessage, ChatRole, ChatUser, Conversation, ConversationType, GroupPermissions,
  MessageAttachment, MessageAuditEvent, MessageContentType, MessageRequestItem, ModerationReport,
} from "@/api/types/messages";
import { api } from "@/lib/api";
import type { User } from "@/lib/auth";
import { setMessagingPermissions } from "@/lib/messagePermissions";

// ── API shapes ───────────────────────────────────────────────────────────────

interface ApiUser { id: string; name: string; email: string; role: string }
interface ApiConversation {
  id: string; type: string; title: string; display_title: string; is_locked: boolean; priority: string;
  related_student: string | null; related_section: string | null; last_message_at: string | null;
  last_message: { id: string; body: string; sender: string | null; created_at: string } | null;
  unread: number; pinned: boolean; muted: boolean; is_admin: boolean;
  members: (ApiUser & { is_admin: boolean })[];
  effective_permissions: Record<string, string>; created_at: string;
}
interface ApiMessage {
  id: string; conversation: string; sender: string | null; sender_name: string | null; type: string; body: string;
  attachments: StoredFile[]; reply_to: string | null; created_at: string; edited_at: string | null;
  is_deleted: boolean; is_pinned: boolean; reactions: { emoji: string; user_ids: string[] }[]; status: string | null;
}

// ── mapping ──────────────────────────────────────────────────────────────────

const ROLE: Record<string, ChatRole> = {
  super_admin: "Super Admin", admin: "Admin", principal: "Principal", teacher: "Teacher",
  parent: "Parent", student: "Student", staff: "Staff",
};

const TYPE: Record<string, ConversationType> = {
  direct: "direct", group: "group", class_group: "class_group", staff_group: "staff_group",
  parent_teacher: "parent_teacher", broadcast: "admin_broadcast", support: "support_request",
};

function mapUser(u: ApiUser): ChatUser {
  return { id: u.id, name: u.name, email: u.email, role: ROLE[u.role] ?? "Staff", avatar: "", status: "offline", lastSeen: "" };
}

function attachmentKind(f: StoredFile): MessageAttachment["kind"] {
  const k = f.kind ?? "";
  return (["image", "pdf", "doc", "sheet", "audio", "video"].includes(k) ? k : "other") as MessageAttachment["kind"];
}

export function mapAttachment(f: StoredFile): MessageAttachment {
  return { id: f.id, name: f.original_name, kind: attachmentKind(f), size: fileSize(f.size), downloadUrl: f.download_url };
}

function mapMessage(m: ApiMessage, flagged: Set<string>): ChatMessage {
  const attachments = (m.attachments ?? []).map(mapAttachment);
  let type: MessageContentType = m.type === "system" ? "system" : "text";
  if (type === "text" && attachments.length) {
    type = attachments.every((a) => a.kind === "image") ? "image" : attachments.some((a) => a.kind === "audio") ? "audio" : "file";
  }
  return {
    id: m.id, conversationId: m.conversation, senderId: m.sender ?? "system", body: m.body, type, attachments,
    createdAt: m.created_at, editedAt: m.edited_at, status: (m.status as ChatMessage["status"]) ?? "delivered",
    reactions: (m.reactions ?? []).map((r) => ({ emoji: r.emoji, userIds: r.user_ids })),
    replyTo: m.reply_to, deleted: m.is_deleted, pinned: m.is_pinned, flagged: flagged.has(m.id),
  };
}

function mapPermissions(p: Record<string, string>): GroupPermissions {
  return {
    whoCanSend: p.who_can_send === "admins" ? "admins" : "everyone",
    whoCanAddMembers: p.who_can_add_members === "everyone" ? "everyone" : "admins",
    whoCanUploadFiles: p.who_can_send === "admins" ? "admins" : "everyone",
    whoCanDeleteMessages: p.who_can_delete_messages === "admins" ? "admins" : "own",
    whoCanViewMembers: "everyone",
  };
}

function preview(last: ApiConversation["last_message"]): string {
  if (!last) return "";
  return last.body || "Sent an attachment";
}

// ── state ────────────────────────────────────────────────────────────────────

let me: { id: string; role: ChatRole } | null = null;
const users = new Map<string, ChatUser>();
let conversations: Conversation[] = [];
const messages = new Map<string, ChatMessage[]>();
const hasMore = new Map<string, boolean>();
let broadcasts: Broadcast[] = [];
let messageRequests: MessageRequestItem[] = [];
let moderationReports: ModerationReport[] = [];
let auditEvents: MessageAuditEvent[] = [];
const flagged = new Set<string>();
const loaded = new Set<string>();
const listeners = new Set<() => void>();
let lastError: string | null = null;

function emit() {
  listeners.forEach((cb) => cb());
}

function remember(list: ApiUser[]) {
  for (const u of list) users.set(u.id, mapUser(u));
}

function mapConversation(c: ApiConversation, archived: boolean): Conversation {
  remember(c.members);
  return {
    id: c.id, type: TYPE[c.type] ?? "group", title: c.display_title || c.title || "Conversation", avatar: "",
    participantIds: c.members.map((m) => m.id), adminIds: c.members.filter((m) => m.is_admin).map((m) => m.id),
    lastMessage: preview(c.last_message), lastMessageAt: c.last_message_at ?? c.created_at,
    unreadCount: c.unread ?? 0, pinned: c.pinned, muted: c.muted, archived, locked: c.is_locked,
    priority: (c.priority as Conversation["priority"]) ?? "normal", permissions: mapPermissions(c.effective_permissions ?? {}),
    relatedStudentId: c.related_student ?? undefined, relatedClassId: c.related_section ?? undefined,
  };
}

function upsertConversation(conv: Conversation) {
  conversations = [conv, ...conversations.filter((c) => c.id !== conv.id)];
}

function sortConversations() {
  conversations = [...conversations].sort((a, b) =>
    Number(b.pinned) - Number(a.pinned) || b.lastMessageAt.localeCompare(a.lastMessageAt));
}

function patchConversation(id: string, change: Partial<Conversation>) {
  conversations = conversations.map((c) => (c.id === id ? { ...c, ...change } : c));
}

function patchMessage(id: string, change: (m: ChatMessage) => ChatMessage) {
  for (const [cid, list] of messages) {
    if (list.some((m) => m.id === id)) messages.set(cid, list.map((m) => (m.id === id ? change(m) : m)));
  }
}

async function guard<T>(p: Promise<T>): Promise<T> {
  try {
    const r = await p;
    lastError = null;
    return r;
  } catch (e) {
    const data = (e as { response?: { data?: { detail?: string } } }).response?.data;
    lastError = data?.detail ?? "Something went wrong.";
    emit();
    throw e;
  }
}

/** The signed-in user's chat identity: their real user id and messaging role. */
export function resolveCurrentChatUser(user: User): { id: string; role: ChatRole } {
  if (user.is_superuser || user.is_platform_admin) return { id: user.id, role: "Super Admin" };
  const roles = user.roles;
  const role: ChatRole = roles.includes("Principal") ? "Principal" : roles.includes("Admin") ? "Admin"
    : roles.includes("Teacher") ? "Teacher" : roles.includes("Student") ? "Student"
    : roles.includes("Parent") ? "Parent" : "Staff";
  return { id: user.id, role };
}

export function chatUserById(id: string): ChatUser | undefined {
  return users.get(id);
}

export function conversationById(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id);
}

export const messagesService = {
  // ── session ────────────────────────────────────────────────────────────────
  /** Called once per signed-in user; clears another user's cache. */
  init(user: User) {
    const identity = resolveCurrentChatUser(user);
    setMessagingPermissions(user.permissions, user.is_superuser || user.is_platform_admin);
    if (me?.id === identity.id) return;
    me = identity;
    users.clear(); messages.clear(); hasMore.clear(); loaded.clear(); flagged.clear();
    conversations = []; broadcasts = []; messageRequests = []; moderationReports = []; auditEvents = [];
    users.set(user.id, { id: user.id, name: user.full_name || user.email, email: user.email, role: identity.role, avatar: "", status: "online", lastSeen: "" });
    void this.loadConversations();
  },
  currentUserId: () => me?.id ?? "",
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
  },
  isLoaded: (key: string) => loaded.has(key),
  lastError: () => lastError,

  // ── reads (synchronous, from the cache) ────────────────────────────────────
  getUsers(): ChatUser[] {
    return [...users.values()].filter((u) => u.id !== me?.id);
  },
  getUserById(id: string): ChatUser | undefined {
    return users.get(id);
  },
  getConversations(): Conversation[] {
    return conversations;
  },
  getConversation(id: string): Conversation | undefined {
    return conversations.find((c) => c.id === id);
  },
  getMessages(conversationId: string): ChatMessage[] {
    return messages.get(conversationId) ?? [];
  },
  hasOlderMessages: (conversationId: string) => hasMore.get(conversationId) ?? false,
  getBroadcasts(): Broadcast[] {
    if (!loaded.has("broadcasts")) void this.loadBroadcasts();
    return broadcasts;
  },
  getMessageRequests(): MessageRequestItem[] {
    if (!loaded.has("requests")) void this.loadRequests();
    return messageRequests;
  },
  getModerationReports(): ModerationReport[] {
    if (!loaded.has("reports")) void this.loadReports();
    return moderationReports;
  },
  getAuditEvents(): MessageAuditEvent[] {
    if (!loaded.has("audit")) void this.loadAudit();
    return auditEvents;
  },

  // ── loaders ────────────────────────────────────────────────────────────────
  async loadConversations() {
    const [active, archived] = await Promise.all([
      getAll<ApiConversation>("/messaging/conversations/"),
      getAll<ApiConversation>("/messaging/conversations/", { archived: 1 }),
    ]);
    conversations = [...active.map((c) => mapConversation(c, false)), ...archived.map((c) => mapConversation(c, true))];
    sortConversations();
    loaded.add("conversations");
    emit();
  },
  async loadConversation(id: string) {
    const c = await get<ApiConversation>(`/messaging/conversations/${id}/`);
    const existing = conversations.find((x) => x.id === id);
    upsertConversation(mapConversation(c, existing?.archived ?? false));
    sortConversations();
    emit();
    return conversations.find((x) => x.id === id)!;
  },
  async loadMessages(conversationId: string, older = false) {
    const current = messages.get(conversationId) ?? [];
    const before = older && current.length ? current[0].createdAt : undefined;
    const r = await get<{ results: ApiMessage[]; has_more: boolean }>(
      `/messaging/conversations/${conversationId}/messages/`, { limit: 50, before });
    for (const m of r.results) if (m.sender && m.sender_name && !users.has(m.sender)) {
      users.set(m.sender, { id: m.sender, name: m.sender_name, email: "", role: "Staff", avatar: "", status: "offline", lastSeen: "" });
    }
    const page = r.results.map((m) => mapMessage(m, flagged));
    messages.set(conversationId, older ? [...page, ...current] : page);
    hasMore.set(conversationId, r.has_more);
    emit();
  },
  /** People the user may message, with whether a request is needed. */
  async searchContacts(search: string): Promise<(ChatUser & { access: "allowed" | "request" })[]> {
    const rows = await get<(ApiUser & { access: "allowed" | "request" })[]>("/messaging/conversations/contacts/", { search });
    remember(rows);
    return rows.map((r) => ({ ...mapUser(r), access: r.access }));
  },
  async loadBroadcasts() {
    loaded.add("broadcasts");
    const rows = await get<{ id: string; title: string; body: string; sent_at: string; audience_count: number; read: number; allow_replies: boolean }[]>(
      "/messaging/broadcasts/").catch(() => []);
    broadcasts = rows.map((b) => ({
      id: b.id, title: b.title, body: b.body, audience: "", audienceCount: b.audience_count, sentBy: "",
      sentAt: b.sent_at, delivered: b.audience_count, read: b.read, allowReplies: b.allow_replies,
    }));
    emit();
  },
  async loadRequests() {
    loaded.add("requests");
    const [incoming, outgoing] = await Promise.all([
      get<{ id: string; from_user: ApiUser; to_user: ApiUser; reason: string; status: string; created_at: string }[]>("/messaging/requests/"),
      get<{ id: string; from_user: ApiUser; to_user: ApiUser; reason: string; status: string; created_at: string }[]>("/messaging/requests/", { box: "outgoing" }),
    ]);
    const all = [...incoming, ...outgoing];
    remember(all.flatMap((r) => [r.from_user, r.to_user]));
    messageRequests = all.map((r) => ({
      id: r.id, fromUserId: r.from_user.id, toUserId: r.to_user.id, reason: r.reason,
      status: r.status as MessageRequestItem["status"], requestedAt: r.created_at,
    }));
    emit();
  },
  async loadReports() {
    loaded.add("reports");
    const statuses = ["open", "dismissed", "actioned"];
    const rows = (await Promise.all(statuses.map((s) =>
      get<{ id: string; message: string; conversation: string; sender: ApiUser | null; reported_by: ApiUser; reason: string; priority: string; status: string; created_at: string }[]>(
        "/messaging/moderation/reports/", { status: s }).catch(() => [])))).flat();
    remember(rows.flatMap((r) => [r.reported_by, ...(r.sender ? [r.sender] : [])]));
    moderationReports = rows.map((r) => ({
      id: r.id, messageId: r.message, conversationId: r.conversation, senderId: r.sender?.id ?? "",
      reportedById: r.reported_by.id, reason: r.reason, priority: (r.priority as ModerationReport["priority"]) ?? "normal",
      status: r.status as ModerationReport["status"], reportedAt: r.created_at,
    })).sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
    emit();
  },
  async loadAudit() {
    loaded.add("audit");
    const TYPES: Record<string, MessageAuditEvent["type"]> = {
      "message.admin_opened_conversation": "admin_opened_conversation", "message.exported": "message_exported",
      "message.message_deleted_by_admin": "message_deleted_by_admin", "message.conversation_locked": "conversation_locked",
      "message.member_removed": "member_removed", "message.moderation_action": "moderation_action",
    };
    const rows = await get<{ results: { id: string; action: string; actor: string | null; actor_email: string | null; object_id: string; changes: Record<string, unknown>; created_at: string }[] }>(
      "/audit/logs/", { search: "message.", page_size: 200 }).catch(() => ({ results: [] }));
    auditEvents = rows.results.filter((r) => TYPES[r.action]).map((r) => ({
      id: r.id, type: TYPES[r.action], actorId: r.actor ?? "", conversationId: r.object_id ?? "",
      detail: [r.actor_email, Object.entries(r.changes ?? {}).map(([k, v]) => `${k}: ${String(v)}`).join(", ")].filter(Boolean).join(" · "),
      timestamp: r.created_at,
    }));
    emit();
  },

  // ── conversations ──────────────────────────────────────────────────────────
  /**
   * Opens (or reuses) a direct chat with someone. Resolves to the conversation,
   * or null when the school's rules need the recipient to approve a request first.
   */
  async findOrCreateDirectConversation(params: { otherUserId: string; message?: string; reason?: string; relatedStudentId?: string }): Promise<Conversation | null> {
    const r = await guard(post<ApiConversation | { request: unknown }>("/messaging/conversations/direct/", {
      user: params.otherUserId, message: params.message, reason: params.reason, related_student: params.relatedStudentId,
    }));
    if ("request" in r) {
      void this.loadRequests();
      return null;
    }
    upsertConversation(mapConversation(r as ApiConversation, false));
    sortConversations();
    emit();
    return conversations.find((c) => c.id === (r as ApiConversation).id)!;
  },
  async createConversation(params: { type: Conversation["type"]; title: string; participantIds: string[]; firstMessage?: string }): Promise<Conversation> {
    const type = params.type === "class_group" || params.type === "staff_group" ? params.type : "group";
    const c = await guard(post<ApiConversation>("/messaging/conversations/group/", {
      title: params.title, members: params.participantIds.filter((id) => id !== me?.id), type,
    }));
    upsertConversation(mapConversation(c, false));
    if (params.firstMessage) await this.sendMessage({ conversationId: c.id, body: params.firstMessage });
    emit();
    return conversations.find((x) => x.id === c.id)!;
  },
  async setPreference(id: string, change: { pinned?: boolean; muted?: boolean; archived?: boolean }) {
    patchConversation(id, change);
    sortConversations();
    emit();
    await guard(patch(`/messaging/conversations/${id}/preferences/`, change)).catch(() => this.loadConversations());
  },
  togglePin(id: string) {
    const c = conversationById(id);
    if (c) void this.setPreference(id, { pinned: !c.pinned });
  },
  toggleMute(id: string) {
    const c = conversationById(id);
    if (c) void this.setPreference(id, { muted: !c.muted });
  },
  toggleArchive(id: string) {
    const c = conversationById(id);
    if (c) void this.setPreference(id, { archived: !c.archived });
  },
  async toggleLock(id: string) {
    const c = conversationById(id);
    if (!c) return;
    const r = await guard(post<{ is_locked: boolean }>(`/messaging/conversations/${id}/${c.locked ? "unlock" : "lock"}/`));
    patchConversation(id, { locked: r.is_locked });
    emit();
  },
  /** Leaves the conversation (it stays for everyone else). */
  async deleteConversation(id: string) {
    await guard(post(`/messaging/conversations/${id}/leave/`));
    conversations = conversations.filter((c) => c.id !== id);
    messages.delete(id);
    emit();
  },
  async addMember(id: string, userId: string) {
    await guard(post(`/messaging/conversations/${id}/members/`, { users: [userId] }));
    await this.loadConversation(id);
  },
  async removeMember(id: string, userId: string) {
    await guard(api.delete(`/messaging/conversations/${id}/members/`, { data: { user: userId } }));
    await this.loadConversation(id);
  },
  async renameGroup(id: string, title: string) {
    await guard(patch(`/messaging/conversations/${id}/`, { title }));
    patchConversation(id, { title });
    emit();
  },

  // ── messages ───────────────────────────────────────────────────────────────
  async sendMessage(params: { conversationId: string; body: string; attachmentIds?: string[]; replyTo?: string | null }) {
    const m = await guard(post<ApiMessage>(`/messaging/conversations/${params.conversationId}/messages/`, {
      body: params.body, reply_to: params.replyTo ?? null, attachment_ids: params.attachmentIds ?? [],
    }));
    this.applyCreated(m);
    return m;
  },
  async editMessage(id: string, body: string) {
    const m = await guard(patch<ApiMessage>(`/messaging/messages/${id}/`, { body }));
    patchMessage(id, (x) => ({ ...x, body: m.body, editedAt: m.edited_at }));
    emit();
  },
  async deleteMessage(id: string) {
    await guard(del(`/messaging/messages/${id}/`));
    patchMessage(id, (x) => ({ ...x, deleted: true, body: "", attachments: [] }));
    emit();
  },
  async toggleReaction(id: string, emoji: string) {
    const m = await guard(post<ApiMessage>(`/messaging/messages/${id}/react/`, { emoji }));
    patchMessage(id, (x) => ({ ...x, reactions: m.reactions.map((r) => ({ emoji: r.emoji, userIds: r.user_ids })) }));
    emit();
  },
  async togglePinMessage(id: string) {
    const r = await guard(post<{ is_pinned: boolean }>(`/messaging/messages/${id}/pin/`));
    patchMessage(id, (x) => ({ ...x, pinned: r.is_pinned }));
    emit();
  },
  /** Reports a message to the school's moderators. */
  async flagMessage(id: string, reason = "Inappropriate") {
    await guard(post(`/messaging/messages/${id}/report/`, { reason }));
    flagged.add(id);
    patchMessage(id, (x) => ({ ...x, flagged: true }));
    emit();
  },
  async markConversationRead(id: string) {
    const c = conversationById(id);
    if (c && c.unreadCount) {
      patchConversation(id, { unreadCount: 0 });
      emit();
    }
    await post(`/messaging/conversations/${id}/read/`).catch(() => undefined);
  },

  // ── broadcasts, requests, moderation ───────────────────────────────────────
  async createBroadcast(b: { title: string; body: string; audience: string; classLevels?: string[]; sections?: string[]; allowReplies: boolean }) {
    const r = await guard(post<{ id: string; recipients: number }>("/messaging/broadcasts/", {
      title: b.title, body: b.body, audience: b.audience, class_levels: b.classLevels ?? [], sections: b.sections ?? [],
      allow_replies: b.allowReplies,
    }));
    await Promise.all([this.loadBroadcasts(), this.loadConversations()]);
    return r;
  },
  async updateRequestStatus(id: string, status: "approved" | "rejected" | "blocked") {
    const action = status === "approved" ? "approve" : status === "rejected" ? "reject" : "block";
    await guard(post(`/messaging/requests/${id}/${action}/`));
    messageRequests = messageRequests.map((r) => (r.id === id ? { ...r, status } : r));
    emit();
    if (status === "approved") void this.loadConversations();
  },
  async updateModerationStatus(id: string, status: "dismissed" | "actioned", resolution = "") {
    await guard(post(`/messaging/moderation/reports/${id}/${status === "actioned" ? "remove-message" : "dismiss"}/`, { resolution }));
    const report = moderationReports.find((r) => r.id === id);
    moderationReports = moderationReports.map((r) => (r.messageId === report?.messageId && r.status === "open" ? { ...r, status } : r));
    if (status === "actioned" && report) patchMessage(report.messageId, (x) => ({ ...x, deleted: true, body: "" }));
    emit();
  },
  /** Full transcript (staff with export rights; the server audits it). */
  exportConversation(id: string) {
    return guard(get<{ conversation: { title: string }; members: ApiUser[]; messages: { sender: string; body: string; created_at: string; deleted_at: string | null }[] }>(
      `/messaging/conversations/${id}/export/`));
  },

  // The server records these itself (opening someone else's chat, exports, file downloads).
  logConversationOpened(_conversationId: string, _actorId: string) {},
  logExport(_conversationId: string, _actorId: string, _format: string) {},
  logFileDownload(_conversationId: string, _actorId: string, _fileName: string) {},

  // ── realtime events (called by realtimeService) ────────────────────────────
  applyCreated(m: ApiMessage) {
    const list = messages.get(m.conversation);
    const msg = mapMessage(m, flagged);
    if (m.sender && m.sender_name && !users.has(m.sender)) {
      users.set(m.sender, { id: m.sender, name: m.sender_name, email: "", role: "Staff", avatar: "", status: "offline", lastSeen: "" });
    }
    if (list && !list.some((x) => x.id === m.id)) messages.set(m.conversation, [...list, msg]);
    const conv = conversationById(m.conversation);
    if (!conv) {
      void this.loadConversation(m.conversation).catch(() => undefined);
      return;
    }
    const mine = m.sender === me?.id;
    patchConversation(m.conversation, {
      lastMessage: m.body || (msg.attachments.length ? "Sent an attachment" : ""), lastMessageAt: m.created_at,
      unreadCount: mine || activeConversation === m.conversation ? conv.unreadCount : conv.unreadCount + 1,
      archived: false,
    });
    sortConversations();
    if (!mine && activeConversation === m.conversation) void this.markConversationRead(m.conversation);
    emit();
  },
  applyUpdated(p: { id: string; body?: string; edited_at?: string; reactions?: { emoji: string; user_ids: string[] }[] }) {
    patchMessage(p.id, (x) => ({
      ...x, ...(p.body !== undefined ? { body: p.body, editedAt: p.edited_at ?? x.editedAt } : {}),
      ...(p.reactions ? { reactions: p.reactions.map((r) => ({ emoji: r.emoji, userIds: r.user_ids })) } : {}),
    }));
    emit();
  },
  applyDeleted(p: { id: string }) {
    patchMessage(p.id, (x) => ({ ...x, deleted: true, body: "", attachments: [] }));
    emit();
  },
  applyRead(p: { conversation: string; user: string; read_at: string }) {
    if (p.user === me?.id) return;
    const list = messages.get(p.conversation);
    if (!list) return;
    const conv = conversationById(p.conversation);
    // "seen" once every other member has read past the message (exact for direct chats).
    const others = (conv?.participantIds ?? []).filter((id) => id !== me?.id);
    if (others.length <= 1) {
      messages.set(p.conversation, list.map((m) => (m.senderId === me?.id && m.createdAt <= p.read_at ? { ...m, status: "seen" } : m)));
      emit();
    }
  },
};

let activeConversation: string | null = null;
/** The conversation currently on screen: new messages there are marked read straight away. */
export function setActiveConversation(id: string | null) {
  activeConversation = id;
}

/** Every conversation in the school, for staff who may open or export any chat. */
export async function allConversations(): Promise<{ id: string; title: string; type: ConversationType }[]> {
  const rows = await getAll<ApiConversation>("/messaging/conversations/all/");
  return rows.map((c) => ({ id: c.id, title: c.display_title || c.title || "Conversation", type: TYPE[c.type] ?? "group" }));
}
