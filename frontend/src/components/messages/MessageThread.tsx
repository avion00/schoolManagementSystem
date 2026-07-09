import { useEffect, useRef } from "react";

import { MessageBubble } from "@/components/messages/MessageBubble";
import { TypingIndicator } from "@/components/messages/TypingIndicator";
import { chatUserById, type ChatMessage } from "@/data/messagesData";

function dateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export function MessageThread({
  messages,
  currentUserId,
  isGroup,
  typingLabel,
  onReply,
  onPin,
  onDelete,
  onReact,
  onReport,
  canModerate,
}: {
  messages: ChatMessage[];
  currentUserId: string;
  isGroup: boolean;
  typingLabel?: string;
  onReply: (message: ChatMessage) => void;
  onPin: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onReport?: (messageId: string) => void;
  canModerate?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typingLabel]);

  let lastDate = "";

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
      {messages.map((message) => {
        const label = dateLabel(message.createdAt);
        const showDateDivider = label !== lastDate;
        lastDate = label;
        const sender = chatUserById(message.senderId);
        const replyToMessage = message.replyTo ? messages.find((m) => m.id === message.replyTo) : undefined;
        const replyToSender = replyToMessage ? chatUserById(replyToMessage.senderId) : undefined;

        return (
          <div key={message.id} className="t-content-in">
            {showDateDivider && (
              <div className="my-2 flex items-center justify-center">
                <span className="rounded-full bg-muted px-3 py-1 text-[10.5px] font-medium text-muted-foreground">{label}</span>
              </div>
            )}
            <MessageBubble
              message={message}
              sender={sender}
              isOwn={message.senderId === currentUserId}
              showSenderName={isGroup}
              replyToMessage={replyToMessage}
              replyToSender={replyToSender}
              onReply={onReply}
              onPin={onPin}
              onDelete={onDelete}
              onReact={onReact}
              onReport={onReport}
              canModerate={canModerate}
            />
          </div>
        );
      })}

      {typingLabel && <TypingIndicator label={typingLabel} />}
      <div ref={bottomRef} />
    </div>
  );
}
