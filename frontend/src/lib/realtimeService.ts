// Realtime transport for messaging. Hooks talk to this module for live
// updates: it holds the WebSocket to /ws/messaging/ (authenticated by the same
// HttpOnly cookie as the API), applies server events to the messaging store,
// and fans out typing indicators. Sending goes through REST (messagesService).
import type { ChatMessage, ChatUser } from "@/api/types/messages";
import { messagesService, setActiveConversation } from "@/lib/messagesService";

type MessageListener = (messages: ChatMessage[]) => void;
type TypingListener = (typingUserIds: string[]) => void;
type ConversationsListener = () => void;

const typingListeners = new Map<string, Set<TypingListener>>();
const typingState = new Map<string, Map<string, ReturnType<typeof setTimeout>>>();
let socket: WebSocket | null = null;
let users = 0;               // components holding the connection open
let retry = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
let lastTypingSent = 0;

function socketUrl(): string {
  const base = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://127.0.0.1:8000/api/v1";
  const origin = /^https?:\/\//.test(base) ? new URL(base).origin : window.location.origin;
  return `${origin.replace(/^http/, "ws")}/ws/messaging/`;
}

function notifyTyping(conversationId: string) {
  const ids = [...(typingState.get(conversationId)?.keys() ?? [])];
  typingListeners.get(conversationId)?.forEach((cb) => cb(ids));
}

function onTypingEvent(conversationId: string, userId: string) {
  if (!typingState.has(conversationId)) typingState.set(conversationId, new Map());
  const map = typingState.get(conversationId)!;
  const existing = map.get(userId);
  if (existing) clearTimeout(existing);
  map.set(userId, setTimeout(() => { map.delete(userId); notifyTyping(conversationId); }, 3000));
  notifyTyping(conversationId);
}

function open() {
  if (socket && socket.readyState <= WebSocket.OPEN) return;
  socket = new WebSocket(socketUrl());
  socket.onopen = () => {
    retry = 0;
    // Catch up on anything missed while disconnected.
    void messagesService.loadConversations().catch(() => undefined);
  };
  socket.onmessage = (e) => {
    let data: { event: string; payload: Record<string, unknown> };
    try { data = JSON.parse(e.data as string); } catch { return; }
    const p = data.payload;
    switch (data.event) {
      case "message.created":
        messagesService.applyCreated(p as never);
        if (typeof p.sender === "string") {
          typingState.get(String(p.conversation))?.delete(p.sender);
          notifyTyping(String(p.conversation));
        }
        break;
      case "message.updated": messagesService.applyUpdated(p as never); break;
      case "message.deleted": messagesService.applyDeleted(p as never); break;
      case "conversation.read": messagesService.applyRead(p as never); break;
      case "typing": onTypingEvent(String(p.conversation), String(p.user)); break;
    }
  };
  socket.onclose = (e) => {
    socket = null;
    if (users === 0 || e.code === 4401) return;            // closed on purpose, or signed out
    const delay = Math.min(30_000, 1000 * 2 ** retry++);     // back off: 1s, 2s, 4s … 30s
    retryTimer = setTimeout(open, delay);
  };
}

export const realtimeService = {
  /** Open the socket (reference-counted: pair every connect with a disconnect). */
  connect() {
    users += 1;
    open();
  },
  disconnect() {
    users = Math.max(0, users - 1);
    if (users === 0) {
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
      socket = null;
    }
  },
  isConnected() {
    return socket?.readyState === WebSocket.OPEN;
  },

  subscribeToConversation(conversationId: string, callback: MessageListener): () => void {
    setActiveConversation(conversationId);
    callback(messagesService.getMessages(conversationId));
    const unsub = messagesService.subscribe(() => callback(messagesService.getMessages(conversationId)));
    void messagesService.loadMessages(conversationId).catch(() => undefined);
    return () => {
      unsub();
      setActiveConversation(null);
    };
  },

  subscribeToConversationsList(callback: ConversationsListener): () => void {
    return messagesService.subscribe(callback);
  },

  sendMessage(params: { conversationId: string; body: string; attachmentIds?: string[]; replyTo?: string | null }) {
    return messagesService.sendMessage(params);
  },

  onTyping(conversationId: string, callback: TypingListener): () => void {
    if (!typingListeners.has(conversationId)) typingListeners.set(conversationId, new Set());
    typingListeners.get(conversationId)!.add(callback);
    return () => { typingListeners.get(conversationId)?.delete(callback); };
  },

  /** Tell the other members we're typing (throttled to one event every 2s). */
  emitTyping(conversationId: string) {
    const now = Date.now();
    if (now - lastTypingSent < 2000 || socket?.readyState !== WebSocket.OPEN) return;
    lastTypingSent = now;
    socket.send(JSON.stringify({ action: "typing", conversation: conversationId }));
  },

  markAsRead(conversationId: string) {
    void messagesService.markConversationRead(conversationId);
  },

  refreshConversations() {
    void messagesService.loadConversations().catch(() => undefined);
  },
};

export function chatUserLabel(user: ChatUser | undefined): string {
  return user?.name ?? "Unknown";
}
