import { useMemo, useState } from "react";
import { Download, Printer, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { AttendanceTrendChart } from "@/components/teacher/AttendanceTrendChart";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  assignedClasses,
  assignedStudents,
  lowAttendanceStudents,
} from "@/data/teacherDashboardData";

const MONTHS = ["May 2026", "June 2026", "July 2026"];

/** Deterministic per-student monthly tallies derived from their attendance %, not random. */
function monthlyTally(attendancePercentage: number, workingDays: number) {
  const present = Math.round((attendancePercentage / 100) * workingDays);
  const absent = Math.max(0, workingDays - present - 1);
  const late = Math.max(0, workingDays - present - absent);
  return { present, absent, late, workingDays };
}

export function TeacherAttendanceReports() {
  const [classId, setClassId] = useState(assignedClasses[0].id);
  const [month, setMonth] = useState(MONTHS[MONTHS.length - 1]);
  const workingDays = 22;

  const students = useMemo(() => assignedStudents.filter((s) => s.classId === classId), [classId]);
  const cls = assignedClasses.find((c) => c.id === classId);
  const lateProne = assignedStudents.filter((s) => s.attendancePercentage >= 75 && s.attendancePercentage < 90).slice(0, 4);

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Attendance Reports</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Trends and health for your assigned classes only.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Exporting attendance report — coming soon")}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </Reveal>

      <Reveal delay={60} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceTrendChart />
        </div>
        <PremiumCard className="p-5">
          <p className="mb-3 text-[13.5px] font-semibold text-foreground">Class Comparison</p>
          <div className="space-y-2">
            {assignedClasses.map((c) => {
              const trendUp = c.attendanceRate >= 90;
              return (
                <div key={c.id} className="flex items-center justify-between">
                  <span className="text-[12.5px] text-foreground">{c.className}-{c.section}</span>
                  <span className="flex items-center gap-1 text-[12.5px] font-semibold">
                    {c.attendanceRate}%
                    {trendUp ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />}
                  </span>
                </div>
              );
            })}
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={100} className="grid gap-4 lg:grid-cols-2">
        <PremiumCard className="p-5">
          <h2 className="mb-3 text-[13.5px] font-semibold text-foreground">Low Attendance Students</h2>
          <div className="space-y-2">
            {lowAttendanceStudents.map((s) => (
              <div key={s.studentId} className="flex items-center gap-3 rounded-xl border border-border/50 p-2.5">
                <StudentAvatar name={s.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{s.name}</p>
                  <p className="text-[11.5px] text-muted-foreground">{s.className}-{s.section}</p>
                </div>
                <p className="shrink-0 text-[12.5px] font-semibold text-rose-600 dark:text-rose-400">{s.attendancePercentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-5">
          <h2 className="mb-3 text-[13.5px] font-semibold text-foreground">Late Arrival Pattern</h2>
          {lateProne.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No recurring late-arrival pattern detected.</p> : (
            <div className="space-y-2">
              {lateProne.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-2.5">
                  <StudentAvatar name={s.name} />
                  <p className="min-w-0 flex-1 truncate text-[13px] text-foreground">{s.name}</p>
                  <span className="text-[11.5px] text-amber-600 dark:text-amber-400">Frequently late</span>
                </div>
              ))}
            </div>
          )}
        </PremiumCard>
      </Reveal>

      <Reveal delay={140}>
        <PremiumCard className="overflow-x-auto p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
            <p className="text-[13.5px] font-semibold text-foreground">Monthly Sheet — {cls?.className} · {cls?.section}</p>
            <div className="flex gap-2">
              <PremiumSelect value={classId} onChange={setClassId} className="w-48" options={assignedClasses.map((c) => ({ value: c.id, label: `${c.className} · ${c.section}` }))} />
              <PremiumSelect value={month} onChange={setMonth} className="w-36" options={MONTHS.map((m) => ({ value: m, label: m }))} />
            </div>
          </div>
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Student</th>
                <th className="px-4 py-3 font-semibold">Present</th>
                <th className="px-4 py-3 font-semibold">Absent</th>
                <th className="px-4 py-3 font-semibold">Late</th>
                <th className="px-4 py-3 font-semibold">Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const t = monthlyTally(s.attendancePercentage, workingDays);
                return (
                  <tr key={s.id} className="t-row-in border-b border-border/40 last:border-0" style={{ "--row-index": i } as React.CSSProperties}>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar name={s.name} />
                        <span className="font-medium text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 tabular-nums text-emerald-600 dark:text-emerald-400">{t.present}</td>
                    <td className="px-4 py-2.5 tabular-nums text-rose-600 dark:text-rose-400">{t.absent}</td>
                    <td className="px-4 py-2.5 tabular-nums text-amber-600 dark:text-amber-400">{t.late}</td>
                    <td className="px-4 py-2.5 tabular-nums font-medium text-foreground">{s.attendancePercentage.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
