import { BellOff, Paperclip, Pin, Users } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatUserById, type Conversation } from "@/data/messagesData";
import { cn } from "@/lib/utils";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "?";
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const diffDays = Math.round((now.getTime() - d.getTime()) / 86_400_000);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString(undefined, { weekday: "short" });
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const PRIORITY_DOT: Record<Conversation["priority"], string> = {
  low: "", normal: "", high: "bg-amber-500", urgent: "bg-red-500",
};

export function ConversationListItem({
  conversation,
  currentUserId,
  active,
  onClick,
}: {
  conversation: Conversation;
  currentUserId: string;
  active: boolean;
  onClick: () => void;
}) {
  const isDirect = conversation.type === "direct" || conversation.type === "support_request";
  const otherUserId = isDirect ? conversation.participantIds.find((id) => id !== currentUserId) : undefined;
  const otherUser = otherUserId ? chatUserById(otherUserId) : undefined;
  const hasAttachmentPreview = conversation.lastMessage.toLowerCase().startsWith("sent a ");

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        active ? "bg-primary/[0.08]" : "hover:bg-muted/60",
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11">
          <AvatarFallback className={cn(!isDirect && "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300")}>
            {isDirect ? initialsOf(otherUser?.name ?? conversation.title) : <Users className="h-4.5 w-4.5" />}
          </AvatarFallback>
        </Avatar>
        {isDirect && otherUser?.status === "online" && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className={cn("truncate text-[13.5px]", conversation.unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground")}>
            {conversation.title}
          </p>
          {conversation.pinned && <Pin className="h-3 w-3 shrink-0 text-muted-foreground/60" />}
          {conversation.muted && <BellOff className="h-3 w-3 shrink-0 text-muted-foreground/60" />}
          {PRIORITY_DOT[conversation.priority] && (
            <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", PRIORITY_DOT[conversation.priority])} />
          )}
          <span className="ml-auto shrink-0 text-[10.5px] text-muted-foreground">{timeLabel(conversation.lastMessageAt)}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          {hasAttachmentPreview && <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground/70" />}
          <p className={cn("truncate text-[12px]", conversation.unreadCount > 0 ? "text-foreground/80" : "text-muted-foreground")}>
            {conversation.lastMessage || "No messages yet"}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="ml-auto flex h-4.5 min-w-[18px] shrink-0 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {conversation.unreadCount}
            </span>
          )}
        </div>
        {!isDirect && (
          <span className="mt-1 inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {conversation.type === "class_group" ? "Class group" : conversation.type === "staff_group" ? "Staff group" : conversation.type === "parent_teacher" ? "Parent-teacher" : "Group"}
          </span>
        )}
      </div>
    </button>
  );
}
