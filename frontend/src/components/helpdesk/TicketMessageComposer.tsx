import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TicketMessageComposer({
  onSend,
}: {
  onSend: (body: string, isInternal: boolean, attachmentName?: string) => void;
}) {
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [attachmentName, setAttachmentName] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  function handleSend() {
    if (!body.trim()) {
      setError("Write a message before sending.");
      setShake(true);
      window.setTimeout(() => setShake(false), 450);
      return;
    }
    onSend(body.trim(), isInternal, attachmentName);
    setBody("");
    setAttachmentName(undefined);
    setError(null);
  }

  return (
    <div className={cn("space-y-2 rounded-xl border border-border/60 p-3", shake && "t-shake")}>
      <textarea
        value={body}
        onChange={(e) => { setBody(e.target.value); setError(null); }}
        rows={3}
        placeholder={isInternal ? "Write an internal note (not visible to the requester)…" : "Write a reply to the requester…"}
        className={cn(
          "w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-[12.5px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
          error && "border-rose-400",
        )}
      />
      {error && <p className="text-[11px] text-rose-500">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <button
            type="button"
            onClick={() => setIsInternal((v) => !v)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              isInternal ? "bg-amber-500" : "bg-muted",
            )}
          >
            <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", isInternal ? "translate-x-4" : "translate-x-0")} />
          </button>
          Post as internal note
        </label>

        <div className="flex items-center gap-2">
          <label htmlFor="reply-attachment" className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-input px-2.5 text-[11.5px] text-muted-foreground hover:border-primary/40 hover:text-foreground">
            <Paperclip className="h-3.5 w-3.5" />
            {attachmentName ?? "Attach"}
          </label>
          <input id="reply-attachment" type="file" className="hidden" onChange={(e) => setAttachmentName(e.target.files?.[0]?.name)} />
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={handleSend}>
            <Send className="h-3.5 w-3.5" />
            {isInternal ? "Add Note" : "Send Reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
