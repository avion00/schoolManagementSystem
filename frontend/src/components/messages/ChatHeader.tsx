import { ArrowLeft, Info, MoreVertical, Phone, Search, Users, Video } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { chatUserById, type ChatUser, type Conversation } from "@/data/messagesData";
import { cn } from "@/lib/utils";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "?";
}

const TYPE_LABEL: Record<Conversation["type"], string> = {
  direct: "", group: "Group", class_group: "Class group", staff_group: "Staff group",
  parent_teacher: "Parent-teacher group", admin_broadcast: "Broadcast", support_request: "Support request",
};

export function ChatHeader({
  conversation,
  currentUserId,
  onBack,
  onOpenDetails,
  onSearchInChat,
}: {
  conversation: Conversation;
  currentUserId: string;
  onBack?: () => void;
  onOpenDetails: () => void;
  onSearchInChat: () => void;
}) {
  const isDirect = conversation.type === "direct" || conversation.type === "support_request";
  const otherUserId = isDirect ? conversation.participantIds.find((id) => id !== currentUserId) : undefined;
  const otherUser: ChatUser | undefined = otherUserId ? chatUserById(otherUserId) : undefined;

  const subtitle = isDirect
    ? otherUser?.status === "online"
      ? "Online"
      : otherUser?.status === "away"
        ? `Away · last seen ${otherUser.lastSeen}`
        : `Last seen ${otherUser?.lastSeen ?? "recently"}`
    : `${TYPE_LABEL[conversation.type]} · ${conversation.participantIds.length} members`;

  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border/60 bg-card px-4 py-3">
      {onBack && (
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 md:hidden" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={onOpenDetails}>
        <div className="relative shrink-0">
          <Avatar className="h-10 w-10">
            <AvatarFallback className={cn(isDirect ? "" : "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300")}>
              {isDirect ? initialsOf(otherUser?.name ?? conversation.title) : <Users className="h-4.5 w-4.5" />}
            </AvatarFallback>
          </Avatar>
          {isDirect && otherUser?.status === "online" && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-foreground">{conversation.title}</p>
          <p className="truncate text-[11.5px] text-muted-foreground">{subtitle}</p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onSearchInChat} aria-label="Search in chat">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden h-8 w-8 text-muted-foreground sm:inline-flex" aria-label="Voice call (coming soon)" disabled>
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden h-8 w-8 text-muted-foreground sm:inline-flex" aria-label="Video call (coming soon)" disabled>
          <Video className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="More">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpenDetails}>
              <Info className="mr-2 h-3.5 w-3.5" /> View details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
