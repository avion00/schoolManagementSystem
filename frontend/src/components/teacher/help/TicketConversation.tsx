import { Paperclip, Send } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { TicketMessage } from "@/data/teacherHelpData";

function timeLabel(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function TicketConversation({
  messages,
  onReply,
}: {
  messages: TicketMessage[];
  onReply: (body: string) => void;
}) {
  const [text, setText] = useState("");

  function send() {
    if (!text.trim()) return;
    onReply(text.trim());
    setText("");
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-3 p-4">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((m) => {
            const mine = m.author === "Demo Teacher";
            return (
              <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5", mine ? "bg-primary text-primary-foreground" : "bg-muted/70 text-foreground")}>
                  <p className="text-[13px] leading-relaxed">{m.body}</p>
                  {m.attachments?.map((a) => (
                    <p key={a.id} className="mt-1 flex items-center gap-1 text-[11px] opacity-80"><Paperclip className="h-3 w-3" /> {a.name}</p>
                  ))}
                </div>
                <p className="mt-1 px-1 text-[10.5px] text-muted-foreground">{m.author} · {timeLabel(m.timestamp)}</p>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-end gap-2 border-t border-border/60 p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          placeholder="Write a reply… (Enter to send, Shift+Enter for new line)"
          className="max-h-32 flex-1 resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim()}
          aria-label="Send reply"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
