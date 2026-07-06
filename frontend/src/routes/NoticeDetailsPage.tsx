import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Pencil, Printer, Download, Copy,
  Pin, Users, CalendarDays, Clock, Paperclip,
  Eye, CheckCircle2, AlertCircle, FileText, Bell,
} from "lucide-react";
import { Card }   from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NoticeStatusBadge }       from "@/components/notices/NoticeStatusBadge";
import { NoticePriorityBadge }     from "@/components/notices/NoticePriorityBadge";
import { NoticeRecipientsTable }   from "@/components/notices/NoticeRecipientsTable";
import { NoticeActivityTimeline }  from "@/components/notices/NoticeActivityTimeline";
import { PrintableNotice }         from "@/components/notices/PrintableNotice";
import { NOTICES } from "@/data/noticesData";
import type { NoticeCategory } from "@/data/noticesData";
import { cn } from "@/lib/utils";

const CAT_GRADIENT: Record<NoticeCategory, string> = {
  General:   "from-slate-500 to-slate-700",
  Exam:      "from-indigo-500 to-indigo-700",
  Fees:      "from-orange-500 to-orange-700",
  Holiday:   "from-teal-500 to-teal-700",
  Event:     "from-pink-500 to-pink-700",
  Meeting:   "from-cyan-500 to-cyan-700",
  Emergency: "from-rose-500 to-rose-700",
  Academic:  "from-blue-500 to-blue-700",
  Transport: "from-amber-500 to-amber-700",
  Hostel:    "from-emerald-500 to-emerald-700",
  Library:   "from-violet-500 to-violet-700",
};

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={cn("rounded-xl p-4 text-center", color)}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px] font-medium mt-0.5">{label}</p>
    </div>
  );
}

export function NoticeDetailsPage() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const notice   = NOTICES.find((n) => n.id === Number(id));

  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-[15px] font-medium text-foreground">Notice not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/notices")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back to Notice Board
        </Button>
      </div>
    );
  }

  const grad = CAT_GRADIENT[notice.category] ?? "from-indigo-500 to-indigo-700";

  // Determine related notices (same category, different id, published)
  const related = NOTICES
    .filter((n) => n.category === notice.category && n.id !== notice.id && n.status === "Published")
    .slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Print-only component */}
      <PrintableNotice notice={notice} />

      {/* Hero banner */}
      <div className={cn("relative rounded-2xl bg-gradient-to-r p-6 text-white overflow-hidden print:hidden", grad)}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, white 0%, transparent 50%)",
        }} />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">
                  {notice.category}
                </span>
                <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">
                  {notice.noticeId}
                </span>
                {notice.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">
                    <Pin className="h-3 w-3 fill-white" />Pinned
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold leading-snug">{notice.title}</h1>
              <p className="mt-2 text-[13px] text-white/80 line-clamp-2">{notice.summary}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 items-end">
              <NoticeStatusBadge status={notice.status}
                className="bg-white/20 text-white ring-white/20 dark:bg-white/20 dark:text-white" />
              <NoticePriorityBadge priority={notice.priority}
                className="bg-white/20 text-white ring-white/20 dark:bg-white/20 dark:text-white" />
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-white/80">
            <span className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />By {notice.publishedBy}
            </span>
            {notice.publishDate && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />{notice.publishDate}
                {notice.publishTime && ` · ${notice.publishTime}`}
              </span>
            )}
            {notice.expiryDate && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />Expires: {notice.expiryDate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />{notice.audience}
            </span>
          </div>
        </div>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 print:hidden">
        {/* Left: 2/3 */}
        <div className="lg:col-span-2 space-y-5">
          {/* Notice body */}
          <Card className="p-6">
            <h2 className="text-[14px] font-semibold text-foreground mb-4">Notice Content</h2>
            <div className="text-[13px] text-foreground leading-relaxed whitespace-pre-line">
              {notice.body}
            </div>

            {notice.importantInstructions && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20 p-4">
                <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-300 mb-1">
                  Important Instructions
                </p>
                <p className="text-[12px] text-amber-700 dark:text-amber-400">
                  {notice.importantInstructions}
                </p>
              </div>
            )}

            {notice.externalLink && (
              <div className="mt-4">
                <a href={notice.externalLink} target="_blank" rel="noreferrer"
                  className="text-[12px] text-primary hover:underline">
                  {notice.externalLink}
                </a>
              </div>
            )}
          </Card>

          {/* Attachments */}
          {notice.attachments.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[14px] font-semibold text-foreground">
                  Attachments ({notice.attachments.length})
                </h2>
              </div>
              <div className="space-y-2">
                {notice.attachments.map((a) => (
                  <div key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-foreground truncate">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground">{a.type} · {a.size}</p>
                    </div>
                    <button className="text-[11px] text-primary hover:underline flex items-center gap-1">
                      <Download className="h-3 w-3" />Download
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Target classes */}
          {notice.targetClasses.length > 0 && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[14px] font-semibold text-foreground">Target Classes</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {notice.targetClasses.map((c) => (
                  <span key={c} className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[12px] font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                    {c}
                    {notice.targetSections.length > 0 && ` (${notice.targetSections.join(", ")})`}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Recipients */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">Recipients & Read Status</h2>
            </div>
            <NoticeRecipientsTable recipients={notice.recipients} />
          </Card>

          {/* Activity timeline */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">Activity Timeline</h2>
            </div>
            <NoticeActivityTimeline activities={notice.activities} />
          </Card>
        </div>

        {/* Right: 1/3 */}
        <div className="space-y-5">
          {/* Actions */}
          <Card className="p-5">
            <h2 className="text-[13px] font-semibold text-foreground mb-3">Actions</h2>
            <div className="space-y-2">
              <Button className="w-full justify-start gap-2 text-[12px]" size="sm"
                onClick={() => navigate(`/notices/${notice.id}/edit`)}>
                <Pencil className="h-3.5 w-3.5" />Edit Notice
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-[12px]" size="sm"
                onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" />Print Notice
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-[12px]" size="sm">
                <Download className="h-3.5 w-3.5" />Download PDF
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-[12px]" size="sm">
                <Copy className="h-3.5 w-3.5" />Duplicate
              </Button>
              {notice.sendNotification && (
                <Button variant="outline" className="w-full justify-start gap-2 text-[12px]" size="sm">
                  <Bell className="h-3.5 w-3.5" />Resend Notification
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start gap-2 text-[12px]" size="sm"
                onClick={() => navigate("/notices")}>
                <ArrowLeft className="h-3.5 w-3.5" />Back to Board
              </Button>
            </div>
          </Card>

          {/* Read stats */}
          {notice.stats.totalRecipients > 0 && (
            <Card className="p-5">
              <h2 className="text-[13px] font-semibold text-foreground mb-3">Read Statistics</h2>
              <div className="grid grid-cols-2 gap-2">
                <StatChip label="Recipients"   value={notice.stats.totalRecipients} color="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300" />
                <StatChip label="Read"         value={notice.stats.read}            color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" />
                <StatChip label="Unread"       value={notice.stats.unread}          color="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" />
                <StatChip label="Acknowledged" value={notice.stats.acknowledged}    color="bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300" />
              </div>

              {/* Read progress bar */}
              {notice.stats.totalRecipients > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Read rate</span>
                    <span className="font-semibold text-foreground">
                      {Math.round((notice.stats.read / notice.stats.totalRecipients) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.round((notice.stats.read / notice.stats.totalRecipients) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Internal notes (if any) */}
          {notice.internalNotes && (
            <Card className="p-5 border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/10">
              <h2 className="text-[13px] font-semibold text-amber-700 dark:text-amber-300 mb-2">Internal Notes</h2>
              <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">{notice.internalNotes}</p>
            </Card>
          )}

          {/* Notification channels */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-semibold text-foreground">Notifications Sent</h2>
            </div>
            <div className="space-y-2 text-[12px]">
              {([
                ["In-app notification", notice.sendNotification],
                ["Email notification",  notice.sendEmail],
                ["SMS notification",    notice.sendSms],
              ] as [string, boolean][]).map(([label, sent]) => (
                <div key={label} className="flex items-center gap-2">
                  {sent
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    : <span className="h-4 w-4 rounded-full border border-border flex items-center justify-center">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                      </span>}
                  <span className={sent ? "text-foreground" : "text-muted-foreground"}>{label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Related notices */}
          {related.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[13px] font-semibold text-foreground mb-3">
                Related {notice.category} Notices
              </h2>
              <div className="space-y-2">
                {related.map((r) => (
                  <button key={r.id} onClick={() => navigate(`/notices/${r.id}`)}
                    className="w-full text-left rounded-lg border border-border/40 p-3 hover:bg-muted/30 transition-colors">
                    <p className="text-[12px] font-medium text-foreground line-clamp-1">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{r.publishDate}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
