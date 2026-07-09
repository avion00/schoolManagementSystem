import { useCallback, useEffect, useState } from "react";

import type { ChatMessage, MessageAttachment } from "@/data/messagesData";
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

  const send = useCallback(
    (body: string, opts?: { type?: ChatMessage["type"]; attachments?: MessageAttachment[]; replyTo?: string | null }) => {
      if (!conversationId) return;
      realtimeService.sendMessage({ conversationId, senderId: currentUserId, body, ...opts });
    },
    [conversationId, currentUserId],
  );

  const emitTyping = useCallback(() => {
    if (!conversationId) return;
    realtimeService.emitTyping(conversationId, currentUserId);
  }, [conversationId, currentUserId]);

  const conversation = conversationId ? messagesService.getConversation(conversationId) : undefined;
  const typingOthers = typingUserIds.filter((id) => id !== currentUserId);

  return { conversation, messages, typingUserIds: typingOthers, send, emitTyping };
}
