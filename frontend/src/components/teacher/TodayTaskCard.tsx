import { CalendarCheck, FolderOpen, MessageSquare, NotebookPen, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { PeriodStatus, TimetableEntry } from "@/data/teacherDashboardData";

const STATUS_TONE: Record<PeriodStatus, PremiumBadgeTone> = {
  Upcoming: "info",
  Ongoing: "warning",
  Completed: "success",
  Cancelled: "danger",
};

/** One class in today's timeline, with the actions a teacher actually needs for that period. */
export function TodayTaskCard({ entry, index }: { entry: TimetableEntry; index: number }) {
  const navigate = useNavigate();

  return (
    <PremiumCard className="t-row-in p-4" style={{ "--row-index": index } as React.CSSProperties}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-[11.5px] font-semibold text-muted-foreground">{entry.period}</span>
          <div>
            <p className="text-[13.5px] font-medium text-foreground">{entry.subject} — {entry.className}-{entry.section}</p>
            <p className="text-[11px] text-muted-foreground">{entry.time} · {entry.room}</p>
          </div>
        </div>
        <PremiumBadge label={entry.status} tone={STATUS_TONE[entry.status]} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-5">
        <button type="button" onClick={() => toast.success(`Started ${entry.subject} — ${entry.className}-${entry.section}`)} className="flex items-center justify-center gap-1 rounded-lg border border-border/60 px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent/60">
          <Play className="h-3 w-3" /> Start
        </button>
        <button type="button" onClick={() => navigate(`/teacher/attendance?class=${entry.classId}`)} className="flex items-center justify-center gap-1 rounded-lg border border-border/60 px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent/60">
          <CalendarCheck className="h-3 w-3" /> Attendance
        </button>
        <button type="button" onClick={() => navigate("/teacher/materials")} className="flex items-center justify-center gap-1 rounded-lg border border-border/60 px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent/60">
          <FolderOpen className="h-3 w-3" /> Materials
        </button>
        <button type="button" onClick={() => toast.info(`Message composer for ${entry.className}-${entry.section} — coming soon`)} className="flex items-center justify-center gap-1 rounded-lg border border-border/60 px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent/60">
          <MessageSquare className="h-3 w-3" /> Message
        </button>
        <button type="button" onClick={() => toast.success("Class note added (demo)")} className="flex items-center justify-center gap-1 rounded-lg border border-border/60 px-2 py-1.5 text-[11px] font-medium text-foreground hover:bg-accent/60">
          <NotebookPen className="h-3 w-3" /> Note
        </button>
      </div>
    </PremiumCard>
  );
}
