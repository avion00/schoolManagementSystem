import { StickyNote } from "lucide-react";

import type { TicketMessage } from "@/data/helpDeskData";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function TicketInternalNotes({ notes }: { notes: TicketMessage[] }) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <StickyNote className="h-5 w-5 text-muted-foreground/50" />
        <p className="text-[12px] text-muted-foreground">No internal notes yet. Use "Post as internal note" in the conversation composer.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2.5">
      {notes.map((n) => (
        <div key={n.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] font-semibold text-foreground">{n.author}</span>
            <span className="text-[10.5px] text-muted-foreground">{formatWhen(n.timestamp)}</span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-foreground">{n.body}</p>
        </div>
      ))}
    </div>
  );
}
