import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { StudentAttendanceChart } from "@/components/student/StudentAttendanceChart";
import { Button } from "@/components/ui/button";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  attendanceRecords, attendanceTrend, computeAttendanceSummary, createStudentHelpTicket,
  type AttendanceRecord, type AttendanceStatus,
} from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<AttendanceStatus, PremiumBadgeTone> = {
  present: "success", absent: "danger", late: "warning", leave: "info", holiday: "neutral",
};
const CALENDAR_DOT: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500", absent: "bg-rose-500", late: "bg-amber-500", leave: "bg-blue-500", holiday: "bg-slate-300 dark:bg-slate-600",
};

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function StudentAttendance() {
  const summary = computeAttendanceSummary();
  const months = useMemo(() => Array.from(new Set(attendanceRecords.map((r) => monthLabel(r.date)))), []);
  const [month, setMonth] = useState(months[months.length - 1]);

  const monthRecords = attendanceRecords.filter((r) => monthLabel(r.date) === month);
  const thisMonthPresent = monthRecords.filter((r) => r.status === "present" || r.status === "late").length;
  const thisMonthTotal = monthRecords.filter((r) => r.status !== "holiday").length;
  const thisMonthPct = thisMonthTotal ? Math.round((thisMonthPresent / thisMonthTotal) * 100) : 0;

  // Calendar grid for the selected month
  const first = new Date(monthRecords[0]?.date ?? attendanceRecords[0].date);
  const year = first.getFullYear();
  const monthIdx = first.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const startOffset = new Date(year, monthIdx, 1).getDay();
  const byDate = new Map(monthRecords.map((r) => [r.date, r]));
  const cells: (AttendanceRecord | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, monthIdx, i + 1).toISOString().slice(0, 10);
      return byDate.get(d) ?? null;
    }),
  ];

  const columns: PremiumDataTableColumn<AttendanceRecord>[] = [
    { key: "date", header: "Date", render: (r) => r.date },
    { key: "day", header: "Day", render: (r) => r.day },
    { key: "status", header: "Status", render: (r) => <PremiumBadge label={r.status} tone={STATUS_TONE[r.status]} /> },
    { key: "remark", header: "Remark", render: (r) => <span className="text-muted-foreground">{r.remark ?? "—"}</span> },
  ];

  function requestCorrection() {
    createStudentHelpTicket({ category: "Attendance", title: "Attendance correction request", description: "Please review my attendance record — I believe there's an error.", sentTo: "Class Teacher" });
    toast.success("Correction request sent to your class teacher.");
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">My Attendance</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Overall {summary.presentPct}% present · {summary.totalDays} days recorded</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={requestCorrection}>Request correction</Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => toast.success("Downloading attendance report…")}>
              <Download className="h-3.5 w-3.5" /> Download report
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={40} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Overall", value: `${summary.presentPct}%` },
          { label: "This month", value: `${thisMonthPct}%` },
          { label: "Present days", value: String(summary.presentDays) },
          { label: "Absent days", value: String(summary.absentDays) },
          { label: "Leave days", value: String(summary.leaveDays) },
        ].map((s) => (
          <PremiumCard key={s.label} className="p-3.5">
            <p className="text-lg font-semibold text-foreground">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </PremiumCard>
        ))}
      </Reveal>

      <Reveal delay={80} className="grid gap-4 lg:grid-cols-3">
        <StudentAttendanceChart />
        <div className="lg:col-span-2">
          <LineChartCard title="Attendance trend" subtitle="Present percentage by month" data={attendanceTrend} xKey="month" series={[{ key: "pct", label: "Attendance", color: "#10b981" }]} valueFormatter={(v) => `${v}%`} />
        </div>
      </Reveal>

      <Reveal delay={120}>
        <PremiumCard className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-foreground">Calendar view</p>
            <div className="w-40"><PremiumSelect value={month} onChange={setMonth} options={months.map((m) => ({ value: m, label: m }))} /></div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1 font-medium">{d}</div>)}
            {cells.map((rec, i) => (
              <div key={i} className={cn("flex h-12 flex-col items-center justify-center gap-1 rounded-lg", rec && "border border-border/50")}>
                {rec && (
                  <>
                    <span className="text-[11.5px] text-foreground">{new Date(rec.date).getDate()}</span>
                    <span className={cn("h-1.5 w-1.5 rounded-full", CALENDAR_DOT[rec.status])} />
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
            {(["present", "absent", "late", "leave", "holiday"] as AttendanceStatus[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5"><span className={cn("h-2 w-2 rounded-full", CALENDAR_DOT[s])} /> {s}</span>
            ))}
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={160}>
        <PremiumDataTable columns={columns} rows={attendanceRecords.slice().reverse()} rowKey={(r) => r.id} />
      </Reveal>
    </div>
  );
}
