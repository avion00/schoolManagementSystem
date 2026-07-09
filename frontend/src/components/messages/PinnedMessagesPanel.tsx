import { Pin } from "lucide-react";

import { chatUserById, type ChatMessage } from "@/data/messagesData";

export function PinnedMessagesPanel({ messages, onJumpTo }: { messages: ChatMessage[]; onJumpTo?: (messageId: string) => void }) {
  const pinned = messages.filter((m) => m.pinned && !m.deleted);

  if (pinned.length === 0) {
    return <p className="py-4 text-center text-[12px] text-muted-foreground">No pinned messages.</p>;
  }

  return (
    <div className="space-y-2">
      {pinned.map((m) => {
        const sender = chatUserById(m.senderId);
        return (
          <button
            key={m.id}
            onClick={() => onJumpTo?.(m.id)}
            className="flex w-full items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-left hover:bg-muted/60"
          >
            <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11.5px] font-medium text-foreground">{sender?.name ?? "Unknown"}</p>
              <p className="truncate text-[12px] text-muted-foreground">{m.body || (m.attachments[0]?.name ?? "Attachment")}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
