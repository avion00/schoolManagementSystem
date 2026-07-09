import { useState } from "react";
import { Megaphone, Plus } from "lucide-react";

import { BroadcastComposer } from "@/components/messages/BroadcastComposer";
import { BroadcastStats } from "@/components/messages/BroadcastStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { messagesService, resolveCurrentChatUser } from "@/lib/messagesService";
import { useAuth } from "@/lib/auth";
import { canSendBroadcast } from "@/data/messagePermissions";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function BroadcastsPage() {
  const { user } = useAuth();
  const [, bump] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);

  if (!user) return null;
  const { role } = resolveCurrentChatUser(user);
  const broadcasts = messagesService.getBroadcasts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">One-to-many announcements with delivery and read tracking</p>
        {canSendBroadcast(role) && (
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setComposerOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Create broadcast
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {broadcasts.map((b) => (
          <Card key={b.id} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Megaphone className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-foreground">{b.title}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">{b.body}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {b.sentBy} · {formatDateTime(b.sentAt)} · {b.audience} {b.allowReplies && "· Replies allowed"}
                  </p>
                </div>
              </div>
              <BroadcastStats broadcast={b} />
            </CardContent>
          </Card>
        ))}
      </div>

      <BroadcastComposer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        sentBy={user.full_name || user.email}
        onCreated={() => bump((n) => n + 1)}
      />
    </div>
  );
}
