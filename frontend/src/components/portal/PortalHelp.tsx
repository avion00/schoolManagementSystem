import { useState } from "react";
import { LifeBuoy, Plus, Send } from "lucide-react";
import { toast } from "sonner";

import { CreateTicketForm } from "@/components/helpdesk/CreateTicketModal";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useTicket, useTicketActions, useTickets } from "@/api/helpdesk";
import { errorMessage } from "@/api/http";
import { PortalHeader } from "./PortalViews";

function TicketThread({ id }: { id: string }) {
  const query = useTicket(id);
  const { reply, rate } = useTicketActions();
  const [text, setText] = useState("");
  const t = query.data;
  if (!t) return <PremiumSkeleton className="h-40 w-full rounded-xl" />;
  const closed = t.status === "Closed";
  return (
    <div className="space-y-3">
      <div className="max-h-80 space-y-2 overflow-y-auto">
        <div className="rounded-lg bg-muted/40 p-3 text-[12.5px]"><p className="font-semibold">You</p><p className="whitespace-pre-line">{t.description}</p></div>
        {t.messages.map((m) => (
          <div key={m.id} className="rounded-lg border border-border/60 p-3 text-[12.5px]">
            <p className="font-semibold">{m.author} <span className="font-normal text-muted-foreground">· {new Date(m.timestamp).toLocaleString()}</span></p>
            <p className="whitespace-pre-line">{m.body}</p>
          </div>
        ))}
      </div>
      {t.resolutionSummary && <p className="rounded-lg bg-emerald-50 p-3 text-[12.5px] text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">Resolution: {t.resolutionSummary}</p>}
      {(t.status === "Resolved" || t.status === "Closed") && t.rating == null && (
        <div className="flex items-center gap-2 text-[12px]">
          How did we do?
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} className="rounded border px-2 py-0.5 hover:bg-muted"
              onClick={() => rate.mutate({ id, rating: n }, { onSuccess: () => toast.success("Thanks for the feedback."), onError: (e) => toast.error(errorMessage(e)) })}>{n}★</button>
          ))}
        </div>
      )}
      {!closed && (
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a reply…"
            className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-[12.5px] focus:outline-none focus:ring-1 focus:ring-ring" />
          <Button size="sm" className="h-9 gap-1.5" disabled={!text.trim() || reply.isPending}
            onClick={() => reply.mutate({ id, body: text.trim() }, { onSuccess: () => setText(""), onError: (e) => toast.error(errorMessage(e)) })}>
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

/** Help requests for students, parents and teachers: raise a ticket and follow it. */
export function PortalHelp() {
  const query = useTickets();
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const tickets = query.data ?? [];
  return (
    <div className="space-y-5">
      <PortalHeader title="Help & Support" description="Ask the school office for help and follow your requests."
        actions={<Button size="sm" className="h-9 gap-1.5" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New Request</Button>} />
      {query.isLoading && <PremiumSkeleton className="h-48 w-full rounded-2xl" />}
      {query.isSuccess && tickets.length === 0 && (
        <PremiumEmptyState icon={LifeBuoy} title="No requests yet" description="Raise a request and the school office will get back to you." />
      )}
      <div className="space-y-2">
        {tickets.map((t) => (
          <PremiumCard key={t.id} className="p-4">
            <button type="button" className="flex w-full flex-wrap items-center gap-3 text-left" onClick={() => setOpenId(openId === t.id ? null : t.id)}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{t.subject}</p>
                <p className="text-[11.5px] text-muted-foreground">{t.ticketId} · {t.category} · {new Date(t.createdAt).toLocaleDateString()}</p>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium">{t.status}</span>
            </button>
            {openId === t.id && <div className="mt-3"><TicketThread id={t.id} /></div>}
          </PremiumCard>
        ))}
      </div>
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Help Request</DialogTitle>
            <DialogDescription>Describe what you need; you'll be notified when the office replies.</DialogDescription>
          </DialogHeader>
          <CreateTicketForm submitLabel="Send Request" onCancel={() => setCreating(false)} onCreated={(id) => { setCreating(false); setOpenId(id); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
