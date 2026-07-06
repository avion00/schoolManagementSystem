import { Printer, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AttendanceGridCell } from "@/components/attendance/AttendanceStatusBadge";
import type { StudentRef, MonthlyAttendance, AttendanceStatus } from "@/data/attendanceData";
import { countStatuses, isWorkingDay, HOLIDAYS } from "@/data/attendanceData";
import { cn } from "@/lib/utils";

interface Props {
  students:    StudentRef[];
  attendance:  MonthlyAttendance[];
  year:        number;
  month:       number; // 1-based
  className?:  string;
  section?:    string;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getDayOfWeek(year: number, month: number, day: number) {
  return new Date(year, month - 1, day).getDay(); // 0=Sun, 6=Sat
}

const DAY_ABBR = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function dayHeaderCls(dow: number, isHoliday: boolean) {
  if (isHoliday) return "bg-violet-100 text-violet-600 dark:bg-violet-950/30";
  if (dow === 0 || dow === 6) return "bg-rose-50 text-rose-400 dark:bg-rose-950/20";
  return "bg-muted/40 text-muted-foreground";
}

export function MonthlyAttendanceGrid({ students, attendance, year, month, className, section }: Props) {
  const daysInMonth = getDaysInMonth(year, month);
  const monthName   = new Date(year, month - 1, 1).toLocaleString("en", { month: "long" });

  // Build lookup: studentId → MonthlyAttendance
  const attMap = new Map(attendance.map((a) => [a.studentId, a]));

  // Working days for totals column
  let totalWorkingDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (isWorkingDay(year, month, d)) totalWorkingDays++;
  }

  // Holiday lookup
  const holidayDays = new Set(
    HOLIDAYS
      .filter((h) => {
        const [y, m] = h.date.split("-").map(Number);
        return y === year && m === month;
      })
      .map((h) => Number(h.date.split("-")[2])),
  );

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[14px] font-semibold text-foreground">
            {monthName} {year} · {className ?? ""} {section ?? ""}
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {totalWorkingDays} working days · {students.length} students
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
            onClick={() => toast.info("Exporting CSV…")}>
            <Download className="h-3.5 w-3.5" />Export
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
            onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />Print Sheet
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground">
        {(["present","absent","late","half-day","leave"] as AttendanceStatus[]).map((s) => {
          const labels: Record<string, string> = { present:"P=Present", absent:"A=Absent", late:"L=Late", "half-day":"H=Half Day", leave:"LV=Leave" };
          const cls: Record<string, string> = {
            present:"bg-emerald-50 text-emerald-700", absent:"bg-rose-50 text-rose-700",
            late:"bg-amber-50 text-amber-700", "half-day":"bg-blue-50 text-blue-700",
            leave:"bg-violet-50 text-violet-700",
          };
          return (
            <span key={s} className={cn("inline-flex items-center gap-1 rounded px-1.5 py-0.5", cls[s])}>
              {labels[s]}
            </span>
          );
        })}
        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-rose-50 text-rose-400">WE=Weekend</span>
        <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 bg-violet-100 text-violet-600">H=Holiday</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
        <table className="min-w-full text-[11px] border-collapse">
          <thead>
            {/* Day number row */}
            <tr>
              <th className="sticky left-0 z-10 bg-muted/60 border-b border-r border-border/60 px-3 py-2 text-left text-[11px] font-semibold text-foreground whitespace-nowrap min-w-[160px]">
                Student
              </th>
              <th className="border-b border-r border-border/60 px-2 py-2 text-[10px] font-semibold text-muted-foreground bg-muted/40 whitespace-nowrap">
                Roll
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                const dow = getDayOfWeek(year, month, d);
                const isHoliday = holidayDays.has(d);
                const isNonWorking = dow === 0 || dow === 6 || isHoliday;
                return (
                  <th key={d}
                    className={cn(
                      "border-b border-r border-border/40 px-1 py-1 text-center font-semibold w-8",
                      dayHeaderCls(dow, isHoliday),
                    )}>
                    <div className="text-[11px]">{d}</div>
                    <div className={cn("text-[9px] font-normal", isNonWorking ? "" : "text-muted-foreground")}>
                      {DAY_ABBR[dow]}
                    </div>
                  </th>
                );
              })}
              <th className="border-b border-border/60 px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground bg-muted/40 whitespace-nowrap">
                Present
              </th>
              <th className="border-b border-border/60 px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground bg-muted/40 whitespace-nowrap">
                Absent
              </th>
              <th className="border-b border-border/60 px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground bg-muted/40 whitespace-nowrap">
                %
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {students.map((s, si) => {
              const att = attMap.get(s.id);
              const records = att?.records ?? {};
              const counts  = countStatuses(records);
              const total   = counts.present + counts.late + counts.absent + counts["half-day"] + counts.leave;
              const pct     = total > 0 ? Math.round(((counts.present + counts.late * 0.5 + counts["half-day"] * 0.5) / totalWorkingDays) * 100) : 0;

              return (
                <tr key={s.id} className={cn("hover:bg-muted/10", si % 2 === 0 ? "" : "bg-muted/5")}>
                  <td className="sticky left-0 z-10 bg-background border-r border-border/40 px-3 py-1.5 font-medium text-foreground whitespace-nowrap">
                    {s.name}
                  </td>
                  <td className="border-r border-border/30 px-2 py-1.5 text-center font-mono text-muted-foreground">
                    {s.rollNo.split("-")[1]}
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                    const dow = getDayOfWeek(year, month, d);
                    const isWeekend = dow === 0 || dow === 6;
                    const isHoliday = holidayDays.has(d);
                    const status = records[d];

                    return (
                      <td key={d}
                        className={cn(
                          "border-r border-border/20 px-0.5 py-1 text-center",
                          isWeekend  && "bg-rose-50/60 dark:bg-rose-950/10",
                          isHoliday  && "bg-violet-50/60 dark:bg-violet-950/10",
                        )}>
                        {status ? (
                          <AttendanceGridCell status={status} />
                        ) : (
                          <span className={cn(
                            "flex h-6 w-6 items-center justify-center text-[9px] mx-auto",
                            isWeekend || isHoliday ? "text-muted-foreground/40" : "",
                          )}>
                            {isWeekend ? "—" : isHoliday ? "H" : ""}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center font-semibold text-emerald-700">{counts.present}</td>
                  <td className="px-2 py-1.5 text-center font-semibold text-rose-600">{counts.absent}</td>
                  <td className={cn(
                    "px-2 py-1.5 text-center font-bold text-[11px]",
                    pct >= 90 ? "text-emerald-700" : pct >= 75 ? "text-amber-600" : "text-rose-600",
                  )}>
                    {totalWorkingDays > 0 ? `${pct}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
