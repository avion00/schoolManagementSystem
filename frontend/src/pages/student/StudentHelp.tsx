import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Reveal, SuccessCheck } from "@/components/motion";
import { StudentHelpCards } from "@/components/student/StudentHelpCards";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  createStudentHelpTicket, helpTickets as initialTickets, type HelpRequestType, type HelpTicketStatus,
} from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const FAQS = [
  { q: "How do I submit homework?", a: "Go to Homework & Assignments, open the assignment, type or attach your answer, and press Submit." },
  { q: "Why does my attendance look wrong?", a: "Open My Attendance and use \"Request correction\" — your class teacher will review it." },
  { q: "Where can I see my results?", a: "Go to Results, choose the term, and view your subject-wise marks and grade." },
  { q: "How do I message my teacher?", a: "Go to Messages, pick your teacher, and send your question directly." },
];

const STATUS_STYLE: Record<HelpTicketStatus, string> = {
  Open: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  "In Progress": "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  Resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  Closed: "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
};
function TicketStatusPill({ status }: { status: HelpTicketStatus }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_STYLE[status])}>{status}</span>;
}

export function StudentHelp() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState(initialTickets);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<HelpRequestType>("Other");
  const [sentTo, setSentTo] = useState("Admin Office");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);

  function startCreate(help: { category: HelpRequestType; sentTo: string; label: string }) {
    if (help.category === "Message Teacher") {
      navigate("/student/messages");
      return;
    }
    setCategory(help.category);
    setSentTo(help.sentTo);
    setTitle(help.label);
    setDescription("");
    setSuccess(false);
    setOpen(true);
  }

  function submit() {
    if (!description.trim()) return;
    createStudentHelpTicket({ category, sentTo, title, description: description.trim() });
    setTickets([...initialTickets]);
    setSuccess(true);
    window.setTimeout(() => setOpen(false), 900);
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Help Center</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Ask for help, track your requests, or find quick answers.</p>
      </Reveal>

      <Reveal delay={40}>
        <StudentHelpCards onCreate={startCreate} />
      </Reveal>

      <Reveal delay={80}>
        <PremiumCard className="overflow-hidden">
          <p className="border-b border-border/60 p-4 text-[13px] font-semibold text-foreground">My tickets</p>
          <div className="divide-y divide-border/60">
            {tickets.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-foreground">{t.title}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{t.category} · Sent to {t.sentTo} · {t.lastUpdated}</p>
                </div>
                <TicketStatusPill status={t.status} />
              </div>
            ))}
            {tickets.length === 0 && <p className="p-6 text-center text-[12.5px] text-muted-foreground">No help requests yet.</p>}
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={120}>
        <p className="mb-2 text-[13px] font-semibold text-foreground">Frequently asked questions</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {FAQS.map((f) => (
            <PremiumCard key={f.q} className="p-3.5">
              <p className="text-[12.5px] font-medium text-foreground">{f.q}</p>
              <p className="mt-1 text-[12px] text-muted-foreground">{f.a}</p>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {success ? (
            <div className="flex flex-col items-center gap-1 py-6">
              <SuccessCheck label="Request submitted" />
              <p className="text-[12.5px] text-muted-foreground">Track it under My Tickets.</p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{title || "Get help"}</DialogTitle>
                <DialogDescription>This will be sent to {sentTo}.</DialogDescription>
              </DialogHeader>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what's going on…"
                className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit} disabled={!description.trim()}>Submit</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
