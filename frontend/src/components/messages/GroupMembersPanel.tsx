import { Crown, UserMinus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { chatUserById, type Conversation } from "@/data/messagesData";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "?";
}

export function GroupMembersPanel({
  conversation,
  canRemove,
  onRemoveMember,
}: {
  conversation: Conversation;
  canRemove: boolean;
  onRemoveMember?: (userId: string) => void;
}) {
  return (
    <div className="space-y-0.5">
      {conversation.participantIds.map((id) => {
        const user = chatUserById(id);
        if (!user) return null;
        const isAdmin = conversation.adminIds.includes(id);
        return (
          <div key={id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="text-[10.5px]">{initialsOf(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-[12.5px] font-medium text-foreground">
                {user.name}
                {isAdmin && <Crown className="h-3 w-3 shrink-0 text-amber-500" />}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{user.role}</p>
            </div>
            {canRemove && (
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => onRemoveMember?.(id)} aria-label={`Remove ${user.name}`}>
                <UserMinus className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
