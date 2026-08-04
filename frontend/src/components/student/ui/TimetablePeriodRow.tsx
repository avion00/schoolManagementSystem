import type { LucideIcon } from "lucide-react";

import { IconTile, type IconTileTone } from "@/components/student/ui/IconTile";
import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import type { PeriodStatus } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<PeriodStatus, StudentPillTone> = {
  Completed: "success", Ongoing: "info", Upcoming: "warning",
};

export interface TimetablePeriodRowData {
  id: string;
  period: number;
  subject: string;
  teacher?: string;
  room?: string;
  time: string;
  status: PeriodStatus;
  isBreak?: boolean;
  icon: LucideIcon;
  tone: IconTileTone;
}

/** One row in the vertical "Today's Classes" timeline — period badge, connector line, subject tile, and status pill. */
export function TimetablePeriodRow({ data, isLast }: { data: TimetablePeriodRowData; isLast?: boolean }) {
  const ongoing = data.status === "Ongoing" && !data.isBreak;
  return (
    <div className="relative flex gap-3 pb-3 last:pb-0">
      {!isLast && <span className="absolute left-4 top-9 h-[calc(100%-1.25rem)] w-px bg-border" aria-hidden="true" />}
      <span
        className={cn(
          "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold transition-colors",
          ongoing ? "bg-primary text-primary-foreground shadow-[0_0_0_4px_hsl(var(--primary)/0.18)]" : "bg-muted text-muted-foreground",
        )}
      >
        {data.period}
      </span>
      <div
        className={cn(
          "t-lift flex min-h-[76px] flex-1 flex-wrap items-center gap-3 rounded-xl border p-3.5 transition-all sm:flex-nowrap",
          ongoing
            ? "border-primary/40 bg-primary/[0.06] shadow-[0_6px_24px_-8px_hsl(var(--primary)/0.4)]"
            : "border-border/60 bg-card hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-elevated",
        )}
      >
        <IconTile icon={data.icon} tone={data.tone} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-foreground">{data.subject}</p>
          {!data.isBreak && <p className="truncate text-[12px] text-muted-foreground">{data.teacher} · {data.room}</p>}
        </div>
        <span className="shrink-0 text-[12px] text-muted-foreground">{data.time}</span>
        <StudentStatusPill
          label={data.isBreak ? "Break" : data.status}
          tone={data.isBreak ? "neutral" : STATUS_TONE[data.status]}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
