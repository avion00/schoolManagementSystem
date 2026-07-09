import { ArchiveRestore, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useConversations } from "@/hooks/useConversations";
import { chatUserById } from "@/data/messagesData";
import { messagesService } from "@/lib/messagesService";
import { realtimeService } from "@/lib/realtimeService";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase() : "?";
}

export function ArchivedMessagesPage() {
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const archived = conversations.filter((c) => c.archived);

  return (
    <div className="space-y-4">
      <p className="text-[13px] text-muted-foreground">{archived.length} archived conversation{archived.length !== 1 ? "s" : ""}</p>

      {archived.length === 0 ? (
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="py-10 text-center text-[12.5px] text-muted-foreground">No archived conversations.</CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {archived.map((c) => {
            const isDirect = c.type === "direct" || c.type === "support_request";
            const otherId = isDirect ? c.participantIds.find((id) => id !== "u-admin") : undefined;
            const other = otherId ? chatUserById(otherId) : undefined;
            return (
              <Card key={c.id} className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="flex items-center gap-3 p-3.5">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback>{isDirect ? initialsOf(other?.name ?? c.title) : <Users className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-foreground">{c.title}</p>
                    <p className="truncate text-[12px] text-muted-foreground">{c.lastMessage}</p>
                  </div>
                  <Button variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 text-[11.5px]" onClick={() => { messagesService.toggleArchive(c.id); realtimeService.refreshConversations(); }}>
                    <ArchiveRestore className="h-3.5 w-3.5" /> Unarchive
                  </Button>
                  <Button size="sm" className="h-8 shrink-0 text-[11.5px]" onClick={() => navigate(`/messages/chats/${c.id}`)}>
                    Open
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
