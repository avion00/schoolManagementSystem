import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleRow } from "@/components/settings/SettingsSection";
import { messagesService } from "@/lib/messagesService";
import { cn } from "@/lib/utils";

const AUDIENCE_OPTIONS: { label: string; count: number }[] = [
  { label: "All Users", count: 1200 },
  { label: "All Students", count: 780 },
  { label: "All Parents", count: 580 },
  { label: "All Teachers", count: 42 },
  { label: "All Staff", count: 25 },
];

export function BroadcastComposer({
  open,
  onOpenChange,
  sentBy,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sentBy: string;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState(AUDIENCE_OPTIONS[0]);
  const [allowReplies, setAllowReplies] = useState(false);

  function reset() {
    setTitle("");
    setBody("");
    setAudience(AUDIENCE_OPTIONS[0]);
    setAllowReplies(false);
  }

  function handleSend() {
    if (!title.trim() || !body.trim()) return;
    messagesService.createBroadcast({
      title: title.trim(), body: body.trim(), audience: audience.label, audienceCount: audience.count, sentBy, allowReplies,
    });
    onOpenChange(false);
    reset();
    onCreated();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New broadcast</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Final Exam Routine Published"
              className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write the announcement..."
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <p className="mb-1.5 text-[12px] font-medium text-foreground">Audience</p>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCE_OPTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => setAudience(a)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11.5px] font-medium transition-colors",
                    audience.label === a.label ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {a.label} · {a.count.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <ToggleRow
            label="Allow replies"
            sublabel="Recipients can reply in-thread instead of one-way delivery"
            checked={allowReplies}
            onChange={setAllowReplies}
          />
          <Button className="w-full" onClick={handleSend} disabled={!title.trim() || !body.trim()}>
            Send broadcast to {audience.count.toLocaleString()} recipients
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
