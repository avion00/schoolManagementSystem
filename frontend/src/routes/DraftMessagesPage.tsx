import { useNavigate } from "react-router-dom";
import { Edit, Trash2, FileText, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessagePriorityBadge } from "@/components/messages/MessagePriorityBadge";
import { MESSAGES } from "@/data/messagesData";

const drafts = MESSAGES.filter((m) => m.status === "draft");

export function DraftMessagesPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Drafts</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {drafts.length} saved draft{drafts.length !== 1 ? "s" : ""} — continue editing or discard
        </p>
      </div>

      {drafts.length === 0 && (
        <Card className="flex flex-col items-center gap-4 rounded-2xl py-16 text-center shadow-sm">
          <FileText className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-[15px] font-semibold text-foreground">No drafts saved</p>
          <p className="text-[13px] text-muted-foreground">Save a message as a draft to find it here.</p>
          <Button onClick={() => navigate("/messages/compose")} className="gap-2">
            <Edit className="h-4 w-4" /> Compose Message
          </Button>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => (
          <Card key={draft.id} className="flex flex-col gap-4 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                <FileText className="h-4.5 w-4.5 text-neutral-500" style={{ width: 18, height: 18 }} />
              </div>
              <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                Draft
              </span>
            </div>

            <div className="flex-1">
              <h3 className="text-[14px] font-semibold text-foreground line-clamp-2">{draft.subject}</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">{draft.type}</p>
              <p className="mt-2 text-[12px] text-muted-foreground line-clamp-2 leading-relaxed">
                {draft.body.slice(0, 120)}{draft.body.length > 120 ? "…" : ""}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <MessagePriorityBadge priority={draft.priority} />
              <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {draft.updatedAt}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Recipients: <span className="font-medium text-foreground">{draft.recipientType || "Not set"}</span>
            </p>

            <div className="flex gap-2 pt-1 border-t border-border">
              <Button size="sm" className="flex-1 h-8 text-[12px] gap-1.5"
                onClick={() => navigate("/messages/compose")}>
                <Edit className="h-3.5 w-3.5" /> Continue Editing
              </Button>
              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:border-rose-300">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
