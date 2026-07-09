import { FileDown } from "lucide-react";

import { MessageExportPanel } from "@/components/messages/MessageExportPanel";
import { Card, CardContent } from "@/components/ui/card";
import { chatUserById } from "@/data/messagesData";
import { useAuth } from "@/lib/auth";
import { messagesService, resolveCurrentChatUser } from "@/lib/messagesService";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function MessageExportPage() {
  const { user } = useAuth();
  if (!user) return null;
  const { id: currentUserId } = resolveCurrentChatUser(user);
  const exportEvents = messagesService.getAuditEvents().filter((e) => e.type === "message_exported");

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-5">
          <MessageExportPanel currentUserId={currentUserId} />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="p-5">
          <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <FileDown className="h-4 w-4 text-muted-foreground" /> Recent export activity
          </p>
          {exportEvents.length === 0 ? (
            <p className="py-6 text-center text-[12px] text-muted-foreground">No exports recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {exportEvents.map((e) => (
                <div key={e.id} className="rounded-lg bg-muted/40 px-3 py-2 text-[12px]">
                  <p className="text-foreground">
                    <span className="font-medium">{chatUserById(e.actorId)?.name ?? e.actorId}</span> — {e.detail}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDateTime(e.timestamp)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
