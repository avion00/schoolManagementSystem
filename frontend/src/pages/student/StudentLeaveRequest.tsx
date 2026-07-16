import { useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { leaveRequests as initialRequests, submitLeaveRequest, type LeaveType } from "@/data/studentDashboardData";

const TYPES: LeaveType[] = ["Sick Leave", "Family Function", "Personal", "Other"];
const STATUS_TONE: Record<string, PremiumBadgeTone> = { Pending: "warning", Approved: "success", Rejected: "danger" };

export function StudentLeaveRequest() {
  const [requests, setRequests] = useState(initialRequests);
  const [type, setType] = useState<LeaveType>("Sick Leave");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");

  function submit() {
    if (!from || !to || !reason.trim()) return;
    submitLeaveRequest({ type, from, to, reason: reason.trim() });
    setRequests([...initialRequests]);
    setFrom(""); setTo(""); setReason("");
    toast.success("Leave request submitted for guardian/teacher approval.");
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Leave Request</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Submit a leave request and track its approval.</p>
      </Reveal>

      <Reveal delay={40}>
        <PremiumCard className="p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Leave type</label>
              <PremiumSelect value={type} onChange={(v) => setType(v as LeaveType)} options={TYPES.map((t) => ({ value: t, label: t }))} />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">From date</label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">To date</label>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1.5 block text-[12px] font-medium text-foreground">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Reason for leave…"
              className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button className="mt-3" onClick={submit} disabled={!from || !to || !reason.trim()}>Submit request</Button>
        </PremiumCard>
      </Reveal>

      <Reveal delay={80}>
        <PremiumCard className="overflow-hidden">
          <p className="border-b border-border/60 p-4 text-[13px] font-semibold text-foreground">My leave requests</p>
          <div className="divide-y divide-border/60">
            {requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-foreground">{r.type} · {r.from} to {r.to}</p>
                  <p className="truncate text-[11.5px] text-muted-foreground">{r.reason}</p>
                </div>
                <PremiumBadge label={r.status} tone={STATUS_TONE[r.status]} />
              </div>
            ))}
            {requests.length === 0 && <p className="p-6 text-center text-[12.5px] text-muted-foreground">No leave requests yet.</p>}
          </div>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
