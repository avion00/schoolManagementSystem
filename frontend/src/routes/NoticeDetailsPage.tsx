import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft, Pencil, Printer, Download, Copy, Archive, Send,
  Pin, Users, CalendarDays, Clock, Paperclip,
  Eye, CheckCircle2, AlertCircle, FileText, Bell, StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/ui/DetailCard";
import { NoticeStatusBadge }       from "@/components/notices/NoticeStatusBadge";
import { NoticePriorityBadge }     from "@/components/notices/NoticePriorityBadge";
import { NoticeRecipientsTable }   from "@/components/notices/NoticeRecipientsTable";
import { NoticeActivityTimeline }  from "@/components/notices/NoticeActivityTimeline";
import { PrintableNotice }         from "@/components/notices/PrintableNotice";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useArchiveNotice, useNotice, useNoticeActions, useNotices, usePublishNotice } from "@/api/notices";
import { downloadFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import type { ActivityRecord, NoticeCategory } from "@/api/types/notices";
import { useAuth } from "@/lib/auth";
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
  const query    = useNotice(id);
  const all      = useNotices();
  const publish  = usePublishNotice();
  const archive  = useArchiveNotice();
  const actions  = useNoticeActions();
  const { hasPermission } = useAuth();
  const canManage  = hasPermission("notice.manage");
  const canPublish = hasPermission("notice.publish");
  const notice   = query.data?.notice;
  const fail = (e: unknown) => toast.error(errorMessage(e));

  if (query.isLoading) return <PremiumSkeleton className="h-96 w-full rounded-2xl" />;
  if (!notice) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <p className="text-[15px] font-medium text-foreground">{query.isError ? errorMessage(query.error) : "Notice not found"}</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/notices")}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back to Notice Board
        </Button>
      </div>
    );
  }

  const grad = CAT_GRADIENT[notice.category] ?? "from-indigo-500 to-indigo-700";

  // Determine related notices (same category, different id, published)
  const related = (all.data ?? [])
    .filter((n) => n.category === notice.category && n.id !== notice.id && n.status === "Published")
    .slice(0, 3);

  const recipients = query.data?.recipients ?? [];
  const stats = notice.stats;
  const activities: ActivityRecord[] = [
    { id: "created", action: "Notice created", by: notice.createdBy, at: notice.createdAt, icon: "create" as const },
    ...(notice.status !== "Draft" && notice.publishAt ? [{
      id: "published", action: notice.status === "Scheduled" ? "Scheduled for publishing" : "Published",
      by: notice.publishedBy, at: notice.publishAt, icon: "publish" as const,
    }] : []),
    ...(notice.status === "Archived" ? [{ id: "archived", action: "Archived", by: "", at: "", icon: "archive" as const }] : []),
  ];

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
              <FileText className="h-3.5 w-3.5" />By {notice.publishedBy || notice.createdBy || "—"}
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
          <DetailCard icon={FileText} title="Notice Content">
            <div className="text-[13px] text-foreground leading-relaxed whitespace-pre-line">
              {notice.body}
            </div>

            {notice.importantInstructions && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20 p-4">
                <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-300 mb-1">
                  Important Instructions
                </p>
                <p className="text-[12px] text-amber-700 dark:text-amber-400">
                  {notice.importantInstructions}
                </p>
              </div>
            )}

            {notice.externalLink && (
              <a href={notice.externalLink} target="_blank" rel="noreferrer"
                className="text-[12px] text-primary hover:underline">
                {notice.externalLink}
              </a>
            )}
          </DetailCard>

          {/* Attachments */}
          {notice.attachments.length > 0 && (
            <DetailCard icon={Paperclip} title={`Attachments (${notice.attachments.length})`}>
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
                    <button className="text-[11px] text-primary hover:underline flex items-center gap-1"
                      onClick={() => downloadFile({ id: a.id, original_name: a.name, download_url: a.downloadUrl } as Parameters<typeof downloadFile>[0]).catch(fail)}>
                      <Download className="h-3 w-3" />Download
                    </button>
                  </div>
                ))}
              </div>
            </DetailCard>
          )}

          {/* Target classes */}
          {notice.targetClasses.length > 0 && (
            <DetailCard icon={Users} title="Target Classes">
              <div className="flex flex-wrap gap-2">
                {notice.targetClasses.map((c: string) => (
                  <span key={c} className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[12px] font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300">
                    {c}
                  </span>
                ))}
              </div>
            </DetailCard>
          )}

          {notice.targetSections.length > 0 && (
            <DetailCard icon={Users} title="Target Sections">
              <div className="flex flex-wrap gap-2">
                {notice.targetSections.map((sct) => (
                  <span key={sct} className="inline-flex items-center rounded-full border border-border px-3 py-1 text-[12px] font-medium">{sct}</span>
                ))}
              </div>
            </DetailCard>
          )}

          {/* Recipients */}
          <DetailCard icon={Eye} title="Recipients & Read Status">
            {notice.status === "Draft"
              ? <p className="text-[12px] text-muted-foreground">Recipients are worked out when the notice is published.</p>
              : <NoticeRecipientsTable recipients={recipients} />}
          </DetailCard>

          {/* Activity timeline */}
          <DetailCard icon={Clock} title="Activity Timeline">
            <NoticeActivityTimeline activities={activities} />
          </DetailCard>
        </div>

        {/* Right: 1/3 */}
        <div className="space-y-5">
          {/* Actions */}
          <DetailCard icon={Pencil} title="Actions">
            <div className="space-y-2">
              {canPublish && notice.status === "Draft" && (
                <Button className="w-full justify-start gap-2 text-[12px]" size="sm" disabled={publish.isPending}
                  onClick={() => window.confirm("Publish this notice now (or at its scheduled time)?") && publish.mutate(notice.id, {
                    onSuccess: (r) => toast.success(r.status === "scheduled" ? "Notice scheduled." : `Published${r.notified ? `; ${r.notified} people notified` : ""}.`),
                    onError: fail,
                  })}>
                  <Send className="h-3.5 w-3.5" />Publish
                </Button>
              )}
              {canManage && notice.status !== "Archived" && (
                <Button variant={notice.status === "Draft" ? "outline" : "default"} className="w-full justify-start gap-2 text-[12px]" size="sm"
                  onClick={() => navigate(`/notices/${notice.id}/edit`)}>
                  <Pencil className="h-3.5 w-3.5" />Edit Notice
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start gap-2 text-[12px]" size="sm"
                onClick={() => window.print()}>
                <Printer className="h-3.5 w-3.5" />Print Notice
              </Button>
              {canManage && (
                <Button variant="outline" className="w-full justify-start gap-2 text-[12px]" size="sm" disabled={actions.pending}
                  onClick={() => actions.duplicate(notice.id)
                    .then((nid) => { toast.success("Copied as a new draft."); navigate(`/notices/${nid}/edit`); })
                    .catch(fail)}>
                  <Copy className="h-3.5 w-3.5" />Duplicate as Draft
                </Button>
              )}
              {canPublish && (notice.status === "Published" || notice.status === "Scheduled") && (
                <Button variant="outline" className="w-full justify-start gap-2 text-[12px] text-rose-600" size="sm" disabled={archive.isPending}
                  onClick={() => window.confirm("Archive this notice? Readers will no longer see it.") && archive.mutate(notice.id, {
                    onSuccess: () => toast.success("Notice archived."), onError: fail,
                  })}>
                  <Archive className="h-3.5 w-3.5" />Archive
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start gap-2 text-[12px]" size="sm"
                onClick={() => navigate("/notices")}>
                <ArrowLeft className="h-3.5 w-3.5" />Back to Board
              </Button>
            </div>
          </DetailCard>

          {/* Read stats */}
          {stats.totalRecipients !== null && stats.totalRecipients > 0 && (
            <DetailCard icon={Eye} title="Read Statistics">
              <div className="grid grid-cols-2 gap-2">
                <StatChip label="Recipients"   value={stats.totalRecipients} color="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300" />
                <StatChip label="Read"         value={notice.stats.read}            color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" />
                <StatChip label="Unread"       value={stats.unread ?? 0}             color="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" />
                <StatChip label="Acknowledged" value={notice.stats.acknowledged}    color="bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300" />
              </div>

              {/* Read progress bar */}
              {stats.totalRecipients > 0 && (
                <div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                    <span>Read rate</span>
                    <span className="font-semibold text-foreground">
                      {Math.round((stats.read / stats.totalRecipients) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.round((stats.read / stats.totalRecipients) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </DetailCard>
          )}

          {/* Internal notes (if any) */}
          {notice.internalNotes && (
            <DetailCard icon={StickyNote} title="Internal Notes">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">{notice.internalNotes}</p>
              </div>
            </DetailCard>
          )}

          {/* Notification channels */}
          <DetailCard icon={Bell} title="Notification Channels">
            <div className="space-y-2 text-[12px]">
              {([
                ["In-app notification", notice.sendNotification],
                ["Email to readers",    notice.sendEmail],
                ["Readers must acknowledge", notice.requiresAcknowledgement],
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
          </DetailCard>

          {/* Related notices */}
          {related.length > 0 && (
            <DetailCard icon={FileText} title={`Related ${notice.category} Notices`}>
              <div className="space-y-2">
                {related.map((r: { id: string; title: string; publishDate: string }) => (
                  <button key={r.id} onClick={() => navigate(`/notices/${r.id}`)}
                    className="w-full text-left rounded-lg border border-border/40 p-3 hover:bg-muted/30 transition-colors">
                    <p className="text-[12px] font-medium text-foreground line-clamp-1">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{r.publishDate}</p>
                  </button>
                ))}
              </div>
            </DetailCard>
          )}
        </div>
      </div>
    </div>
  );
}
