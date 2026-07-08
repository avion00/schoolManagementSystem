import { Paperclip } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { TicketMessage } from "@/data/helpDeskData";
import { cn } from "@/lib/utils";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function TicketConversation({ messages, requesterName }: { messages: TicketMessage[]; requesterName: string }) {
  if (messages.length === 0) {
    return <p className="text-[12px] text-muted-foreground">No messages yet.</p>;
  }
  return (
    <div className="space-y-3">
      {messages.map((m) => {
        const isRequester = m.author === requesterName;
        return (
          <div key={m.id} className={cn("flex gap-2.5", !isRequester && "flex-row-reverse")}>
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px] font-semibold">{initials(m.author)}</AvatarFallback>
            </Avatar>
            <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5", isRequester ? "rounded-tl-sm bg-muted" : "rounded-tr-sm bg-primary/10")}>
              <div className={cn("flex items-baseline gap-2", !isRequester && "flex-row-reverse")}>
                <span className="text-[12px] font-semibold text-foreground">{m.author}</span>
                <span className="text-[10.5px] text-muted-foreground">{m.authorRole}</span>
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">{m.body}</p>
              {m.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.attachments.map((a) => (
                    <span key={a.id} className="inline-flex items-center gap-1 rounded-md bg-background/70 px-2 py-1 text-[11px] text-muted-foreground">
                      <Paperclip className="h-3 w-3" /> {a.name}
                    </span>
                  ))}
                </div>
              )}
              <p className={cn("mt-1.5 text-[10.5px] text-muted-foreground/70", !isRequester && "text-right")}>{formatWhen(m.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
