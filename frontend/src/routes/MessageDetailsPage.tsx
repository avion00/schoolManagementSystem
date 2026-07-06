import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Reply, Forward, Printer, Download, Archive,
  Trash2, Star, Users, Paperclip, CheckCircle, Clock, Mail,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageStatusBadge } from "@/components/messages/MessageStatusBadge";
import { MessagePriorityBadge } from "@/components/messages/MessagePriorityBadge";
import { MessageActivityTimeline } from "@/components/messages/MessageActivityTimeline";
import { MESSAGES } from "@/data/messagesData";
import { cn } from "@/lib/utils";

const TYPE_GRADIENT: Record<string, string> = {
  "Exam Notice":      "from-blue-600 to-blue-500",
  "Fee Reminder":     "from-amber-600 to-amber-500",
  "Attendance Alert": "from-rose-600 to-rose-500",
  "Parent Meeting":   "from-violet-600 to-violet-500",
  "Emergency":        "from-red-700 to-red-500",
  "Announcement":     "from-emerald-600 to-emerald-500",
  "Academic Notice":  "from-indigo-600 to-indigo-500",
  "General":          "from-slate-600 to-slate-500",
};

/* ── Printable version ─────────────────────────────────────────────── */
function PrintableMessage({ msg }: { msg: NonNullable<ReturnType<typeof MESSAGES.find>> }) {
  return (
    <div className="hidden print:block p-8 text-black text-sm font-sans">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-xl font-bold">SchoolOS Management System</h1>
        <p className="text-sm text-gray-600">Official Communication Record</p>
      </div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
        {[
          ["Message ID", msg.messageId],
          ["Subject",    msg.subject],
          ["From",       `${msg.sender} (${msg.senderRole})`],
          ["Date",       msg.sentAt ?? msg.updatedAt],
          ["Type",       msg.type],
          ["Priority",   msg.priority],
          ["Recipients", msg.recipientType],
          ["Status",     msg.status],
        ].map(([label, value]) => (
          <div key={label}>
            <span className="font-semibold">{label}: </span>{value}
          </div>
        ))}
      </div>
      <div className="border-t border-gray-300 pt-4 mb-6">
        <h2 className="font-bold mb-2">Message:</h2>
        <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
      </div>
      {msg.attachments.length > 0 && (
        <div className="border-t border-gray-300 pt-4 mb-6">
          <h2 className="font-bold mb-2">Attachments:</h2>
          <ul className="list-disc ml-4">
            {msg.attachments.map((a) => <li key={a.id}>{a.name} ({a.size})</li>)}
          </ul>
        </div>
      )}
      <div className="mt-12 flex justify-between border-t border-gray-300 pt-6">
        <div><p className="font-semibold">Sender Signature</p><div className="mt-8 border-b border-black w-40" /></div>
        <div className="text-right"><p className="font-semibold">Date</p><div className="mt-8 border-b border-black w-40" /></div>
      </div>
    </div>
  );
}

export function MessageDetailsPage() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const msg = MESSAGES.find((m) => m.id === Number(id));

  if (!msg) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <Mail className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-[15px] font-semibold text-foreground">Message not found</p>
        <Button variant="outline" onClick={() => navigate("/messages")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Messages
        </Button>
      </div>
    );
  }

  const gradient = TYPE_GRADIENT[msg.type] ?? TYPE_GRADIENT["General"];
  const readRate = msg.stats.totalRecipients > 0
    ? Math.round((msg.stats.read / msg.stats.totalRecipients) * 100)
    : 0;

  return (
    <>
      <PrintableMessage msg={msg} />
      <div className="space-y-6 print:hidden">
        {/* Back */}
        <Button variant="ghost" size="sm" className="gap-1.5 text-[13px]"
          onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Hero banner */}
        <div className={cn("relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white", gradient)}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 60%)" }} />
          <div className="relative flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/30 bg-white/20 px-3 py-0.5 text-[12px] font-medium">
                {msg.type}
              </span>
              <span className="rounded-full border border-white/30 bg-white/20 px-3 py-0.5 text-[12px] font-medium">
                {msg.messageId}
              </span>
              {msg.isStarred && <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />}
            </div>
            <h1 className="text-xl font-bold leading-tight">{msg.subject}</h1>
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/80">
              <span>From: <span className="text-white font-medium">{msg.sender}</span> ({msg.senderRole})</span>
              <span>·</span>
              <span>{msg.sentAt ?? msg.updatedAt}</span>
              {msg.requireAcknowledgement && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Ack Required</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Left 2/3 ─────────────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-3">
              <MessageStatusBadge status={msg.status} />
              <MessagePriorityBadge priority={msg.priority} />
              <span className="text-[12px] text-muted-foreground">
                via <span className="font-medium text-foreground">{msg.sendMethod}</span>
              </span>
            </div>

            {/* Message body */}
            <Card className="rounded-2xl shadow-sm">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-[13px] font-semibold text-foreground">Message</h2>
              </div>
              <div className="p-5">
                <div className="rounded-xl bg-muted/20 p-5 text-[14px] text-foreground leading-7 whitespace-pre-wrap">
                  {msg.body}
                </div>
              </div>
            </Card>

            {/* Attachments */}
            {msg.attachments.length > 0 && (
              <Card className="rounded-2xl shadow-sm">
                <div className="border-b border-border px-5 py-3.5 flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[13px] font-semibold text-foreground">
                    Attachments ({msg.attachments.length})
                  </h2>
                </div>
                <div className="p-5 space-y-2">
                  {msg.attachments.map((a) => (
                    <div key={a.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-4 py-2.5">
                      <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 text-[13px] text-foreground">{a.name}</span>
                      <span className="text-[11px] text-muted-foreground">{a.size}</span>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recipients */}
            <Card className="rounded-2xl shadow-sm">
              <div className="border-b border-border px-5 py-3.5 flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[13px] font-semibold text-foreground">Recipients</h2>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-[13px] text-muted-foreground">
                  Type: <span className="font-medium text-foreground">{msg.recipientType}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {msg.recipients.map((r) => (
                    <span key={r} className="rounded-lg bg-muted px-3 py-1 text-[12px] font-medium text-foreground">
                      {r}
                    </span>
                  ))}
                  {msg.recipients.length === 0 && (
                    <span className="text-[13px] text-muted-foreground">All users in selected type</span>
                  )}
                </div>
                {/* Delivery stats */}
                <div className="grid grid-cols-4 gap-3 pt-2">
                  {[
                    { label: "Total",     val: msg.stats.totalRecipients, cls: "text-foreground"     },
                    { label: "Delivered", val: msg.stats.delivered,       cls: "text-emerald-600"    },
                    { label: "Read",      val: msg.stats.read,            cls: "text-blue-600"       },
                    { label: "Failed",    val: msg.stats.failed,          cls: "text-rose-600"       },
                  ].map(({ label, val, cls }) => (
                    <div key={label} className="rounded-xl bg-muted/30 p-3 text-center">
                      <p className={cn("text-xl font-bold tabular-nums", cls)}>{val}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Activity timeline */}
            <Card className="rounded-2xl shadow-sm">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-[13px] font-semibold text-foreground">Activity</h2>
              </div>
              <div className="p-5">
                <MessageActivityTimeline activities={msg.activities} />
              </div>
            </Card>
          </div>

          {/* ── Right 1/3 ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Actions */}
            <Card className="rounded-2xl shadow-sm">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-[13px] font-semibold text-foreground">Actions</h2>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { Icon: Reply,   label: "Reply",    cls: "bg-primary text-primary-foreground hover:bg-primary/90", action: () => navigate("/messages/compose") },
                  { Icon: Forward, label: "Forward",  cls: "bg-muted text-foreground hover:bg-muted/80", action: () => navigate("/messages/compose") },
                  { Icon: Printer, label: "Print",    cls: "bg-muted text-foreground hover:bg-muted/80", action: () => window.print() },
                  { Icon: Archive, label: "Archive",  cls: "bg-muted text-foreground hover:bg-muted/80", action: () => {} },
                  { Icon: Trash2,  label: "Delete",   cls: "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400", action: () => navigate("/messages") },
                ].map(({ Icon, label, cls, action }) => (
                  <button key={label} onClick={action}
                    className={cn("flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors", cls)}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Read stats */}
            <Card className="rounded-2xl shadow-sm">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-[13px] font-semibold text-foreground">Read Rate</h2>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold text-foreground tabular-nums">{readRate}%</span>
                  <span className="text-[12px] text-muted-foreground">{msg.stats.read} of {msg.stats.totalRecipients}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${readRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{msg.stats.unread} recipients haven't opened yet</p>
              </div>
            </Card>

            {/* Message meta */}
            <Card className="rounded-2xl shadow-sm">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-[13px] font-semibold text-foreground">Details</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Send Method", value: msg.sendMethod },
                  { label: "Scheduled",  value: msg.scheduledAt ?? "—" },
                  { label: "Copy Admin", value: msg.sendCopyToAdmin ? "Yes" : "No" },
                  { label: "Ack Required", value: msg.requireAcknowledgement ? "Yes" : "No" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-[12px] text-muted-foreground">{label}</span>
                    <span className="text-[12px] font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Scheduled indicator */}
            {msg.status === "scheduled" && msg.scheduledAt && (
              <Card className="rounded-2xl shadow-sm border-violet-200 dark:border-violet-900">
                <div className="p-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40">
                    <Clock className="h-4.5 w-4.5 text-violet-600" style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-foreground">Scheduled</p>
                    <p className="text-[11px] text-muted-foreground">{msg.scheduledAt}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
