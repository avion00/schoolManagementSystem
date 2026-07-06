import { useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, Printer, Copy, Paperclip, Pin, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card }   from "@/components/ui/card";
import { NoticeStatusBadge }   from "@/components/notices/NoticeStatusBadge";
import { NoticePriorityBadge } from "@/components/notices/NoticePriorityBadge";
import type { Notice, NoticeCategory } from "@/data/noticesData";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PAGE_SIZE = 9;

const CAT_COLORS: Record<NoticeCategory, string> = {
  General:   "bg-slate-100   text-slate-600   dark:bg-slate-800   dark:text-slate-300",
  Exam:      "bg-indigo-100  text-indigo-700  dark:bg-indigo-900  dark:text-indigo-300",
  Fees:      "bg-orange-100  text-orange-700  dark:bg-orange-900  dark:text-orange-300",
  Holiday:   "bg-teal-100    text-teal-700    dark:bg-teal-900    dark:text-teal-300",
  Event:     "bg-pink-100    text-pink-700    dark:bg-pink-900    dark:text-pink-300",
  Meeting:   "bg-cyan-100    text-cyan-700    dark:bg-cyan-900    dark:text-cyan-300",
  Emergency: "bg-rose-100    text-rose-700    dark:bg-rose-900    dark:text-rose-300",
  Academic:  "bg-blue-100    text-blue-700    dark:bg-blue-900    dark:text-blue-300",
  Transport: "bg-amber-100   text-amber-700   dark:bg-amber-900   dark:text-amber-300",
  Hostel:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  Library:   "bg-violet-100  text-violet-700  dark:bg-violet-900  dark:text-violet-300",
};

function NoticeCard({ notice }: { notice: Notice }) {
  const navigate = useNavigate();

  return (
    <Card className={cn(
      "p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200 group relative",
      notice.priority === "Urgent" && "border-rose-200 dark:border-rose-800",
    )}>
      {/* Pin indicator */}
      {notice.pinned && (
        <span className="absolute top-3 right-3">
          <Pin className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />
        </span>
      )}

      {/* Badges row */}
      <div className="flex flex-wrap items-center gap-1.5 pr-6">
        <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", CAT_COLORS[notice.category])}>
          {notice.category}
        </span>
        <NoticePriorityBadge priority={notice.priority} />
        <NoticeStatusBadge status={notice.status} />
      </div>

      {/* Title */}
      <h3
        className="text-[13px] font-bold text-foreground leading-snug line-clamp-2 cursor-pointer hover:text-primary transition-colors"
        onClick={() => navigate(`/notices/${notice.id}`)}
      >
        {notice.title}
      </h3>

      {/* Summary */}
      <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 flex-1">
        {notice.summary}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
        <span className="font-medium text-foreground">{notice.publishedBy}</span>
        <span>·</span>
        <span>{notice.publishDate || "Unpublished"}</span>
      </div>

      {/* Audience */}
      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Users className="h-3 w-3 shrink-0" />
        <span className="truncate">{notice.audience}</span>
        {notice.targetClasses.length > 0 && (
          <span className="text-[10px] text-muted-foreground/70">
            ({notice.targetClasses.slice(0, 2).join(", ")}{notice.targetClasses.length > 2 ? ` +${notice.targetClasses.length - 2}` : ""})
          </span>
        )}
      </div>

      {/* Footer: stats + actions */}
      <div className="flex items-center justify-between border-t border-border/40 pt-2">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {notice.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="h-3 w-3" />{notice.attachments.length}
            </span>
          )}
          {notice.stats.totalRecipients > 0 && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span className="font-medium text-foreground">{notice.stats.read}</span>
              <span>/{notice.stats.totalRecipients}</span>
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => navigate(`/notices/${notice.id}`)}
            className="rounded p-1.5 hover:bg-muted" title="View">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => navigate(`/notices/${notice.id}/edit`)}
            className="rounded p-1.5 hover:bg-muted" title="Edit">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="rounded p-1.5 hover:bg-muted" title="Print" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="rounded p-1.5 hover:bg-muted" title="Duplicate">
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button className="rounded p-1.5 hover:bg-rose-100" title="Delete">
            <Trash2 className="h-3.5 w-3.5 text-rose-400" />
          </button>
        </div>
      </div>
    </Card>
  );
}

export function NoticeCardGrid({ notices }: { notices: Notice[] }) {
  const [page, setPage] = useState(1);

  const total = notices.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pg    = Math.min(page, pages);
  const slice = notices.slice((pg - 1) * PAGE_SIZE, pg * PAGE_SIZE);

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
        <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-[14px] font-medium text-foreground">No notices found</p>
        <p className="text-[12px] text-muted-foreground mt-1">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slice.map((n) => <NoticeCard key={n.id} notice={n} />)}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-muted-foreground">
            Showing {(pg - 1) * PAGE_SIZE + 1}–{Math.min(pg * PAGE_SIZE, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={pg <= 1} onClick={() => setPage(pg - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Button key={n} variant={pg === n ? "default" : "outline"} size="icon"
                className="h-7 w-7 text-[11px]" onClick={() => setPage(n)}>
                {n}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={pg >= pages} onClick={() => setPage(pg + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
