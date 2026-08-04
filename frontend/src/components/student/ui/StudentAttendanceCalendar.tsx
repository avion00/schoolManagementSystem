import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import type { AttendanceRecord, AttendanceStatus } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500", absent: "bg-rose-500", late: "bg-amber-500", leave: "bg-blue-500",
  holiday: "bg-slate-300 dark:bg-slate-600",
};

const LEGEND: { code: string; status: AttendanceStatus; label: string }[] = [
  { code: "P", status: "present", label: "Present" },
  { code: "A", status: "absent", label: "Absent" },
  { code: "L", status: "late", label: "Late" },
  { code: "L", status: "leave", label: "Leave" },
];

/** Premium month calendar — prev/next navigation, a letter-coded legend, and colored status dots per day. */
export function StudentAttendanceCalendar({
  monthLabel,
  onPrev,
  onNext,
  canPrev,
  canNext,
  cells,
}: {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  cells: (AttendanceRecord | null)[];
}) {
  return (
    <Reveal>
      <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
        <StudentSectionHeader
          icon={CalendarDays}
          title="Attendance Calendar"
          action={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onPrev}
                disabled={!canPrev}
                aria-label="Previous month"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[104px] text-center text-[12.5px] font-medium text-foreground">{monthLabel}</span>
              <button
                type="button"
                onClick={onNext}
                disabled={!canNext}
                aria-label="Next month"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div className="mb-3 flex flex-wrap gap-3.5">
          {LEGEND.map((l, i) => (
            <span key={`${l.status}-${i}`} className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
              <span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white", STATUS_DOT[l.status])}>
                {l.code}
              </span>
              {l.label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="pb-1 text-[11px] font-medium text-muted-foreground">{d}</div>
          ))}
          {cells.map((rec, i) => (
            <div
              key={i}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-xl transition-colors",
                rec && "border border-border/50 hover:border-primary/40 hover:bg-muted/40",
              )}
            >
              {rec && (
                <>
                  <span className="text-[12px] font-medium text-foreground">{new Date(rec.date).getDate()}</span>
                  <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[rec.status])} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
