import { Copy, Flag, MoreHorizontal, Pencil, Pin, Reply, Trash2 } from "lucide-react";

import { AttachmentPreview } from "@/components/messages/AttachmentPreview";
import { ReadReceipt } from "@/components/messages/ReadReceipt";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ChatMessage, ChatUser } from "@/data/messagesData";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["👍", "❤️", "😂", "🎉"];

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "?";
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function MessageBubble({
  message,
  sender,
  isOwn,
  showSenderName,
  replyToMessage,
  replyToSender,
  onReply,
  onPin,
  onDelete,
  onReact,
  onReport,
  canModerate,
}: {
  message: ChatMessage;
  sender: ChatUser | undefined;
  isOwn: boolean;
  showSenderName: boolean;
  replyToMessage?: ChatMessage;
  replyToSender?: ChatUser;
  onReply: (message: ChatMessage) => void;
  onPin: (messageId: string) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onReport?: (messageId: string) => void;
  canModerate?: boolean;
}) {
  if (message.type === "system") {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-muted/70 px-3 py-1 text-[11px] text-muted-foreground">{message.body}</span>
      </div>
    );
  }

  if (message.deleted) {
    return (
      <div className={cn("flex gap-2.5", isOwn ? "flex-row-reverse" : "flex-row")}>
        {!isOwn && <div className="w-8 shrink-0" />}
        <div className="max-w-[70%] rounded-2xl border border-dashed border-border/60 px-4 py-2 text-[12.5px] italic text-muted-foreground">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={cn("group flex gap-2.5", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0 self-end">
          <AvatarFallback className="text-[10.5px]">{initialsOf(sender?.name ?? "?")}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex max-w-[72%] flex-col gap-1", isOwn ? "items-end" : "items-start")}>
        {showSenderName && !isOwn && (
          <span className="px-1 text-[11px] font-medium text-muted-foreground">{sender?.name}</span>
        )}

        <div
          className={cn(
            "relative rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm",
            isOwn
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border/60 bg-muted/60 text-foreground",
          )}
        >
          {replyToMessage && (
            <div
              className={cn(
                "mb-1.5 rounded-lg border-l-2 px-2 py-1 text-[11.5px]",
                isOwn ? "border-primary-foreground/40 bg-white/10" : "border-primary/40 bg-background/60",
              )}
            >
              <p className={cn("font-medium", isOwn ? "text-primary-foreground/80" : "text-primary")}>{replyToSender?.name ?? "Unknown"}</p>
              <p className={cn("truncate", isOwn ? "text-primary-foreground/70" : "text-muted-foreground")}>{replyToMessage.body || "Attachment"}</p>
            </div>
          )}

          {message.type === "text" && <p className="whitespace-pre-wrap">{message.body}</p>}

          {message.type === "image" && message.attachments[0] && (
            <div className="w-56 overflow-hidden rounded-lg border border-black/5">
              <div className="flex aspect-video items-center justify-center bg-black/10 text-[11px] text-muted-foreground">
                {message.attachments[0].name}
              </div>
            </div>
          )}

          {(message.type === "file" || message.type === "audio") &&
            message.attachments.map((a) => <AttachmentPreview key={a.id} attachment={a} dense onDownload={() => {}} />)}

          <div className={cn("mt-1 flex items-center gap-1 text-[10.5px]", isOwn ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground")}>
            {message.editedAt && <span className="italic">edited</span>}
            <span>{timeOf(message.createdAt)}</span>
            {isOwn && <ReadReceipt status={message.status} />}
          </div>
        </div>

        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(message.id, r.emoji)}
                className="flex items-center gap-1 rounded-full border border-border/60 bg-card px-1.5 py-0.5 text-[11px] hover:bg-muted"
              >
                <span>{r.emoji}</span>
                <span className="text-muted-foreground">{r.userIds.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex items-center gap-0.5">
          {QUICK_REACTIONS.slice(0, 2).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[13px] hover:bg-muted"
              aria-label={`React ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted" aria-label="More actions">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-44">
            <DropdownMenuItem onClick={() => onReply(message)}>
              <Reply className="mr-2 h-3.5 w-3.5" /> Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(message.body)}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Copy text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onPin(message.id)}>
              <Pin className="mr-2 h-3.5 w-3.5" /> {message.pinned ? "Unpin" : "Pin"} message
            </DropdownMenuItem>
            {isOwn && (
              <DropdownMenuItem>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {!isOwn && onReport && (
              <DropdownMenuItem onClick={() => onReport(message.id)} className="text-amber-600 focus:text-amber-600">
                <Flag className="mr-2 h-3.5 w-3.5" /> Report message
              </DropdownMenuItem>
            )}
            {(isOwn || canModerate) && (
              <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete message
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
