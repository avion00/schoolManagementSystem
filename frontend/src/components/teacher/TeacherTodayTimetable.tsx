import { Clock } from "lucide-react";

import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { todayTimetable, type PeriodStatus } from "@/data/teacherDashboardData";

const STATUS_TONE: Record<PeriodStatus, PremiumBadgeTone> = {
  Upcoming: "info",
  Ongoing: "warning",
  Completed: "success",
  Cancelled: "danger",
};

export function TeacherTodayTimetable() {
  return (
    <PremiumCard className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[13.5px] font-semibold text-foreground">Today's Timetable</h2>
      </div>

      {todayTimetable.length === 0 ? (
        <PremiumEmptyState title="No classes scheduled today" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-3 font-semibold">Period</th>
                <th className="pb-2 pr-3 font-semibold">Time</th>
                <th className="pb-2 pr-3 font-semibold">Class</th>
                <th className="pb-2 pr-3 font-semibold">Subject</th>
                <th className="pb-2 pr-3 font-semibold">Room</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {todayTimetable.map((row, i) => (
                <tr
                  key={row.id}
                  className="t-row-in border-b border-border/40 last:border-0"
                  style={{ "--row-index": i } as React.CSSProperties}
                >
                  <td className="py-2.5 pr-3 font-medium text-foreground">{row.period}</td>
                  <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">{row.time}</td>
                  <td className="py-2.5 pr-3 text-foreground">{row.className}-{row.section}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{row.subject}</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{row.room}</td>
                  <td className="py-2.5">
                    <PremiumBadge label={row.status} tone={STATUS_TONE[row.status]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PremiumCard>
  );
}
