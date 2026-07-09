// Mock real-time transport. Hooks talk ONLY to this abstraction — never to
// messagesService directly for live updates — so the mock timer/pub-sub
// implementation below can be swapped for a WebSocket/Socket.IO/SSE client
// later without touching any component or hook.
import type { ChatMessage, ChatUser } from "@/data/messagesData";
import { messagesService } from "@/lib/messagesService";

type MessageListener = (messages: ChatMessage[]) => void;
type TypingListener = (typingUserIds: string[]) => void;
type ConversationsListener = () => void;

const messageListeners = new Map<string, Set<MessageListener>>();
const typingListeners = new Map<string, Set<TypingListener>>();
const typingState = new Map<string, Set<string>>();
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();
const conversationsListeners = new Set<ConversationsListener>();

let connected = false;

function notifyMessages(conversationId: string) {
  const set = messageListeners.get(conversationId);
  if (!set) return;
  const msgs = messagesService.getMessages(conversationId);
  set.forEach((cb) => cb(msgs));
}

function notifyConversations() {
  conversationsListeners.forEach((cb) => cb());
}

function notifyTyping(conversationId: string) {
  const set = typingListeners.get(conversationId);
  if (!set) return;
  const ids = Array.from(typingState.get(conversationId) ?? []);
  set.forEach((cb) => cb(ids));
}

/** Occasionally simulates the other participant replying, purely for demo liveliness. */
function maybeSimulateReply(conversationId: string, excludeUserId: string) {
  const conv = messagesService.getConversation(conversationId);
  if (!conv) return;
  const others = conv.participantIds.filter((id) => id !== excludeUserId && id !== "system");
  if (others.length === 0 || Math.random() > 0.45) return;
  const replier = others[Math.floor(Math.random() * others.length)];

  const typingTimeout = setTimeout(() => {
    typingState.set(conversationId, new Set([replier]));
    notifyTyping(conversationId);

    const replyTimeout = setTimeout(() => {
      typingState.set(conversationId, new Set());
      notifyTyping(conversationId);
      const replies = ["Got it, thanks!", "Sounds good.", "I'll check and get back to you.", "👍", "Noted, thank you."];
      messagesService.sendMessage({
        conversationId,
        senderId: replier,
        body: replies[Math.floor(Math.random() * replies.length)],
      });
      notifyMessages(conversationId);
      notifyConversations();
    }, 1400 + Math.random() * 900);
    typingTimers.set(`${conversationId}-reply`, replyTimeout);
  }, 500);
  typingTimers.set(`${conversationId}-typing`, typingTimeout);
}

export const realtimeService = {
  connect() {
    connected = true;
  },
  disconnect() {
    connected = false;
    typingTimers.forEach((t) => clearTimeout(t));
    typingTimers.clear();
  },
  isConnected() {
    return connected;
  },

  subscribeToConversation(conversationId: string, callback: MessageListener): () => void {
    if (!messageListeners.has(conversationId)) messageListeners.set(conversationId, new Set());
    messageListeners.get(conversationId)!.add(callback);
    callback(messagesService.getMessages(conversationId));
    return () => messageListeners.get(conversationId)?.delete(callback);
  },

  subscribeToConversationsList(callback: ConversationsListener): () => void {
    conversationsListeners.add(callback);
    return () => conversationsListeners.delete(callback);
  },

  sendMessage(params: {
    conversationId: string;
    senderId: string;
    body: string;
    type?: ChatMessage["type"];
    attachments?: ChatMessage["attachments"];
    replyTo?: string | null;
  }) {
    const msg = messagesService.sendMessage(params);
    notifyMessages(params.conversationId);
    notifyConversations();

    // Simulate delivery/read acking, like a real transport would push back.
    setTimeout(() => {
      messagesService.updateMessageStatus(msg.id, "delivered");
      notifyMessages(params.conversationId);
    }, 500);
    setTimeout(() => {
      messagesService.updateMessageStatus(msg.id, "seen");
      notifyMessages(params.conversationId);
    }, 1600);

    maybeSimulateReply(params.conversationId, params.senderId);
    return msg;
  },

  onTyping(conversationId: string, callback: TypingListener): () => void {
    if (!typingListeners.has(conversationId)) typingListeners.set(conversationId, new Set());
    typingListeners.get(conversationId)!.add(callback);
    return () => typingListeners.get(conversationId)?.delete(callback);
  },

  emitTyping(conversationId: string, userId: string) {
    if (!typingState.has(conversationId)) typingState.set(conversationId, new Set());
    typingState.get(conversationId)!.add(userId);
    notifyTyping(conversationId);
    const key = `${conversationId}-self-${userId}`;
    const existing = typingTimers.get(key);
    if (existing) clearTimeout(existing);
    typingTimers.set(
      key,
      setTimeout(() => {
        typingState.get(conversationId)?.delete(userId);
        notifyTyping(conversationId);
      }, 2000),
    );
  },

  markAsRead(conversationId: string) {
    messagesService.markConversationRead(conversationId);
    notifyConversations();
  },

  refreshConversations() {
    notifyConversations();
  },
};

export function chatUserLabel(user: ChatUser | undefined): string {
  return user?.name ?? "Unknown";
}
