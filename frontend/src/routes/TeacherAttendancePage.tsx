import { useMemo } from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import { TEACHERS_REF, TEACHER_JULY_ATT, countStatuses, calcRate, isWorkingDay } from "@/data/attendanceData";
import { cn } from "@/lib/utils";

// Working days in July 2026 through day 6: 1(W), 2(Th), 3(F), 6(M)
const WORKING_DAYS_SO_FAR = [1, 2, 3, 6].filter((d) => isWorkingDay(2026, 7, d)).length;

function TeacherRow({ idx, teacher }: { idx: number; teacher: typeof TEACHERS_REF[0] }) {
  const att = TEACHER_JULY_ATT.find((a) => a.teacherId === teacher.id);
  const records = att?.records ?? {};
  const counts  = countStatuses(records);
  const rate    = calcRate(records, WORKING_DAYS_SO_FAR);
  const todayStatus = records[6] ?? "present";

  return (
    <tr className="hover:bg-muted/20">
      <td className="px-4 py-3 text-muted-foreground text-[12px]">{idx + 1}</td>
      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{teacher.employeeId}</td>
      <td className="px-4 py-3">
        <p className="text-[12px] font-medium text-foreground">{teacher.name}</p>
        <p className="text-[10px] text-muted-foreground">{teacher.designation}</p>
      </td>
      <td className="px-4 py-3 text-[12px] text-muted-foreground">{teacher.subject}</td>
      <td className="px-4 py-3 text-center">
        <AttendanceStatusBadge status={todayStatus} />
      </td>
      <td className="px-4 py-3 text-center text-[12px] font-semibold text-emerald-600">{counts.present}</td>
      <td className="px-4 py-3 text-center text-[12px] font-semibold text-rose-600">{counts.absent}</td>
      <td className="px-4 py-3 text-center text-[12px] font-semibold text-amber-600">{counts.late}</td>
      <td className="px-4 py-3 text-center text-[12px] font-semibold text-blue-600">{counts["half-day"]}</td>
      <td className="px-4 py-3 text-center">
        <span className={cn("text-[12px] font-bold",
          rate >= 90 ? "text-emerald-600" : rate >= 75 ? "text-amber-600" : "text-rose-600"
        )}>
          {rate}%
        </span>
      </td>
    </tr>
  );
}

export function TeacherAttendancePage() {
  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, halfDay = 0;
    for (const att of TEACHER_JULY_ATT) {
      const s = att.records[6] ?? "present";
      if (s === "present") present++;
      else if (s === "absent") absent++;
      else if (s === "late") late++;
      else if (s === "half-day") halfDay++;
    }
    return { present, absent, late, halfDay };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Teacher Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Track attendance for all teaching staff · July 2026</p>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          ["Present",  stats.present,  "emerald"],
          ["Absent",   stats.absent,   "rose"],
          ["Late",     stats.late,     "amber"],
          ["Half Day", stats.halfDay,  "blue"],
        ] as [string, number, string][]).map(([label, count, color]) => (
          <Card key={label} className="p-4">
            <p className={cn("text-2xl font-bold", `text-${color}-600`)}>{count}</p>
            <p className="text-[12px] font-medium text-foreground mt-0.5">{label} Today</p>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[14px] font-semibold text-foreground">Teacher Attendance · July 2026</h2>
          <span className="ml-auto text-[11px] text-muted-foreground">{WORKING_DAYS_SO_FAR} working days recorded</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="min-w-full text-[12px]">
            <thead className="bg-muted/40 border-b border-border/60">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Emp ID</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Subject</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Today</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Present</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Absent</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Late</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">H/D</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {TEACHERS_REF.map((t, idx) => (
                <TeacherRow key={t.id} idx={idx} teacher={t} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Daily breakdown */}
      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">Daily Records · July 2026</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/40">
                <th className="pb-2 text-left text-[11px] font-semibold text-muted-foreground uppercase">Teacher</th>
                {[1, 2, 3, 6].map((d) => (
                  <th key={d} className="pb-2 px-2 text-center text-[11px] font-semibold text-muted-foreground uppercase">Jul {d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {TEACHERS_REF.map((t) => {
                const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
                return (
                  <tr key={t.id} className="hover:bg-muted/10">
                    <td className="py-2 font-medium text-foreground">{t.name}</td>
                    {[1, 2, 3, 6].map((d) => {
                      const status = att?.records[d] ?? "present";
                      return (
                        <td key={d} className="py-2 px-2 text-center">
                          <AttendanceStatusBadge status={status} compact />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
