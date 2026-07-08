import { useState } from "react";
import { AlertTriangle, CheckCircle2, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { SuccessCheck } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  ASSIGNEE_DIRECTORY,
  PRIORITY_OPTIONS,
  RESOLUTION_CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  type SupportTicket,
  type TicketPriority,
  type TicketStatus,
} from "@/data/helpDeskData";
import { cn } from "@/lib/utils";

const inputClass = (hasError?: boolean) => cn(
  "h-8 w-full rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring",
  hasError && "border-rose-400",
);

function SectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-border/60 p-3.5">
      <p className="text-[12.5px] font-semibold text-foreground">{title}</p>
      {children}
    </div>
  );
}

export function TicketAssignmentPanel({
  ticket,
  onAssign,
  onStatusChange,
  onEscalate,
}: {
  ticket: SupportTicket;
  onAssign: (assigneeName: string, dueDate: string, priority: TicketPriority, note: string, notify: boolean) => void;
  onStatusChange: (status: TicketStatus, resolution?: { summary: string; category: string; notifyRequester: boolean }) => void;
  onEscalate: (target: string, reason: string, dueDate: string, markUrgent: boolean) => void;
}) {
  // ── Assignment ──────────────────────────────────────────────────────────────
  const [assignTo, setAssignTo] = useState(ticket.assignedTo?.name ?? "");
  const [dueDate, setDueDate] = useState("");
  const [assignPriority, setAssignPriority] = useState<TicketPriority>(ticket.priority);
  const [assignNote, setAssignNote] = useState("");
  const [notify, setNotify] = useState(true);
  const [assignError, setAssignError] = useState<string | null>(null);

  function submitAssign() {
    if (!assignTo) { setAssignError("Select who this ticket should be assigned to."); return; }
    setAssignError(null);
    onAssign(assignTo, dueDate, assignPriority, assignNote, notify);
    toast.success(`Ticket assigned to ${assignTo}.`);
    setAssignNote("");
  }

  // ── Status management ────────────────────────────────────────────────────────
  const [nextStatus, setNextStatus] = useState<TicketStatus>(ticket.status);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const [resolutionCategory, setResolutionCategory] = useState<string>("");
  const [notifyRequester, setNotifyRequester] = useState(true);
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [justResolved, setJustResolved] = useState(false);

  function submitStatus() {
    if (nextStatus === "Resolved" && !resolutionSummary.trim()) {
      setResolutionError("A resolution summary is required to mark this ticket resolved.");
      return;
    }
    setResolutionError(null);
    if (nextStatus === "Resolved") {
      onStatusChange(nextStatus, { summary: resolutionSummary.trim(), category: resolutionCategory, notifyRequester });
      setJustResolved(true);
      window.setTimeout(() => setJustResolved(false), 2200);
    } else {
      onStatusChange(nextStatus);
    }
    toast.success(`Status updated to "${nextStatus}".`);
  }

  // ── Escalation ────────────────────────────────────────────────────────────────
  const [escalateTo, setEscalateTo] = useState("Principal");
  const [escalationReason, setEscalationReason] = useState("");
  const [escalateDueDate, setEscalateDueDate] = useState("");
  const [markUrgent, setMarkUrgent] = useState(true);
  const [escalateError, setEscalateError] = useState<string | null>(null);
  const [escalateShake, setEscalateShake] = useState(false);

  function submitEscalate() {
    if (!escalationReason.trim()) {
      setEscalateError("An escalation reason is required.");
      setEscalateShake(true);
      window.setTimeout(() => setEscalateShake(false), 450);
      return;
    }
    setEscalateError(null);
    onEscalate(escalateTo, escalationReason.trim(), escalateDueDate, markUrgent);
    toast.success(`Ticket escalated to ${escalateTo}.`);
    setEscalationReason("");
  }

  return (
    <div className="space-y-4">
      <SectionShell title="Assignment">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="col-span-2">
            <label className="text-[11px] font-medium text-muted-foreground">Assign To</label>
            <select value={assignTo} onChange={(e) => { setAssignTo(e.target.value); setAssignError(null); }} className={cn(inputClass(!!assignError), "mt-1")}>
              <option value="">Select assignee</option>
              {ASSIGNEE_DIRECTORY.map((a) => (
                <option key={a.id} value={a.name}>{a.name} — {a.department}</option>
              ))}
            </select>
            {assignError && <p className="mt-1 text-[11px] text-rose-500">{assignError}</p>}
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={cn(inputClass(), "mt-1")} />
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Priority</label>
            <select value={assignPriority} onChange={(e) => setAssignPriority(e.target.value as TicketPriority)} className={cn(inputClass(), "mt-1")}>
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-[11px] font-medium text-muted-foreground">Internal Note (optional)</label>
            <textarea value={assignNote} onChange={(e) => setAssignNote(e.target.value)} rows={2}
              placeholder="e.g. Please review and respond within SLA."
              className="mt-1 w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="h-3.5 w-3.5 rounded border-input" />
          Notify assigned person
        </label>
        <Button size="sm" className="h-8 w-full gap-1.5 text-[12px]" onClick={submitAssign}>
          <UserPlus className="h-3.5 w-3.5" /> Assign Ticket
        </Button>
      </SectionShell>

      <SectionShell title="Status Management">
        {justResolved ? (
          <div className="flex flex-col items-center gap-2 py-3">
            <SuccessCheck size={40} label="Ticket marked resolved" />
          </div>
        ) : (
          <>
            <select value={nextStatus} onChange={(e) => { setNextStatus(e.target.value as TicketStatus); setResolutionError(null); }} className={inputClass()}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {nextStatus === "Resolved" && (
              <div className={cn("space-y-2.5 rounded-lg bg-muted/40 p-2.5", resolutionError && "t-shake")}>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Resolution Summary <span className="text-rose-500">*</span></label>
                  <textarea value={resolutionSummary} onChange={(e) => setResolutionSummary(e.target.value)} rows={2}
                    placeholder="Summarize how this issue was resolved…"
                    className={cn("mt-1 w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring", resolutionError && "border-rose-400")} />
                  {resolutionError && <p className="mt-1 text-[11px] text-rose-500">{resolutionError}</p>}
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Resolution Category</label>
                  <select value={resolutionCategory} onChange={(e) => setResolutionCategory(e.target.value)} className={cn(inputClass(), "mt-1")}>
                    <option value="">Select category</option>
                    {RESOLUTION_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
                  <input type="checkbox" checked={notifyRequester} onChange={(e) => setNotifyRequester(e.target.checked)} className="h-3.5 w-3.5 rounded border-input" />
                  Notify requester
                </label>
              </div>
            )}
            <Button size="sm" variant="outline" className="h-8 w-full gap-1.5 text-[12px]" onClick={submitStatus}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Update Status
            </Button>
          </>
        )}
      </SectionShell>

      <SectionShell title="Escalation">
        <div className={cn("space-y-2.5", escalateShake && "t-shake")}>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Escalate To</label>
              <select value={escalateTo} onChange={(e) => setEscalateTo(e.target.value)} className={cn(inputClass(), "mt-1")}>
                <option>Principal</option>
                <option>Super Admin</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">Due Date</label>
              <input type="date" value={escalateDueDate} onChange={(e) => setEscalateDueDate(e.target.value)} className={cn(inputClass(), "mt-1")} />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium text-muted-foreground">Escalation Reason <span className="text-rose-500">*</span></label>
            <textarea value={escalationReason} onChange={(e) => { setEscalationReason(e.target.value); setEscalateError(null); }} rows={2}
              placeholder="Why does this need urgent, elevated attention?"
              className={cn("mt-1 w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring", escalateError && "border-rose-400")} />
            {escalateError && <p className="mt-1 text-[11px] text-rose-500">{escalateError}</p>}
          </div>
          <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <input type="checkbox" checked={markUrgent} onChange={(e) => setMarkUrgent(e.target.checked)} className="h-3.5 w-3.5 rounded border-input" />
            Mark ticket as Urgent priority
          </label>
          <Button size="sm" variant="outline" className="h-8 w-full gap-1.5 border-rose-300 text-[12px] text-rose-700 hover:bg-rose-50 dark:text-rose-400" onClick={submitEscalate}>
            <AlertTriangle className="h-3.5 w-3.5" /> Escalate Ticket
          </Button>
        </div>
      </SectionShell>
    </div>
  );
}
