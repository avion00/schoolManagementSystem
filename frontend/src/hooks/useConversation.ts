import { useCallback, useEffect, useState } from "react";

import type { ChatMessage } from "@/api/types/messages";
import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

/** Reactive view over a single conversation: its messages, typing state, and mutation helpers. */
export function useConversation(conversationId: string | undefined, currentUserId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [, bump] = useState(0);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setTypingUserIds([]);
      return;
    }
    const unsubMessages = realtimeService.subscribeToConversation(conversationId, setMessages);
    const unsubTyping = realtimeService.onTyping(conversationId, setTypingUserIds);
    const unsubMeta = realtimeService.subscribeToConversationsList(() => bump((n) => n + 1));
    realtimeService.markAsRead(conversationId);
    return () => {
      unsubMessages();
      unsubTyping();
      unsubMeta();
    };
  }, [conversationId]);

  /** Sends a message; resolves once the server has stored it (rejects with the server's reason). */
  const send = useCallback(
    (body: string, opts?: { attachmentIds?: string[]; replyTo?: string | null }) => {
      if (!conversationId) return Promise.resolve(undefined);
      return realtimeService.sendMessage({ conversationId, body, ...opts });
    },
    [conversationId],
  );

  const emitTyping = useCallback(() => {
    if (!conversationId) return;
    realtimeService.emitTyping(conversationId);
  }, [conversationId]);

  const loadOlder = useCallback(() => {
    if (conversationId) void messagesService.loadMessages(conversationId, true);
  }, [conversationId]);

  const conversation = conversationId ? messagesService.getConversation(conversationId) : undefined;
  const typingOthers = typingUserIds.filter((id) => id !== currentUserId);
  const hasOlder = conversationId ? messagesService.hasOlderMessages(conversationId) : false;

  return { conversation, messages, typingUserIds: typingOthers, send, emitTyping, loadOlder, hasOlder };
}
