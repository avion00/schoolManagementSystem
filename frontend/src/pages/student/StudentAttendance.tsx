import {
  CalendarCheck, CalendarDays, CalendarOff, CircleCheckBig, Clock3, Download, Pencil,
  Sparkles, TrendingUp, XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StudentAttendanceCalendar } from "@/components/student/ui/StudentAttendanceCalendar";
import { StudentAttendanceDonutCard } from "@/components/student/ui/StudentAttendanceDonutCard";
import { StudentAttendanceRowActions } from "@/components/student/ui/StudentAttendanceRowActions";
import { StudentAttendanceTrendChart } from "@/components/student/ui/StudentAttendanceTrendChart";
import { StudentDashboardMetricCard } from "@/components/student/ui/StudentDashboardMetricCard";
import { StudentPageHeader } from "@/components/student/ui/StudentPageHeader";
import { StudentPageShell } from "@/components/student/ui/StudentPageShell";
import { StudentPrimaryButton } from "@/components/student/ui/StudentPrimaryButton";
import { StudentProfileMiniCard } from "@/components/student/ui/StudentProfileMiniCard";
import { StudentProgressCard, StudentRingStat } from "@/components/student/ui/StudentProgressCard";
import { StudentQuickInsightsCard, type StudentQuickInsight } from "@/components/student/ui/StudentQuickInsightsCard";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import { StudentTwoColumnLayout } from "@/components/student/ui/StudentTwoColumnLayout";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  attendanceRecords, attendanceTrend, computeAttendanceSummary, createStudentHelpTicket, studentProfile, studyStreak,
  type AttendanceRecord, type AttendanceStatus,
} from "@/data/studentDashboardData";

const STATUS_TONE: Record<AttendanceStatus, StudentPillTone> = {
  present: "success", absent: "danger", late: "warning", leave: "info", holiday: "neutral",
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Present", absent: "Absent", late: "Late", leave: "Leave", holiday: "Holiday",
};

const TREND_RANGE_OPTIONS = [
  { value: "3", label: "3 Months" },
  { value: "6", label: "6 Months" },
  { value: "12", label: "12 Months" },
];

function monthKey(dateStr: string) {
  return dateStr.slice(0, 7); // "YYYY-MM"
}

export function StudentAttendance() {
  const summary = computeAttendanceSummary();
  const [trendRange, setTrendRange] = useState("6");
  const trendData = useMemo(() => attendanceTrend.slice(-Number(trendRange)), [trendRange]);

  // Real month navigation, bounded to months that actually have records.
  const monthKeys = useMemo(
    () => Array.from(new Set(attendanceRecords.map((r) => monthKey(r.date)))).sort(),
    [],
  );
  const [monthIdx, setMonthIdx] = useState(monthKeys.length - 1);
  const selectedMonthKey = monthKeys[monthIdx];
  const monthRecords = attendanceRecords.filter((r) => monthKey(r.date) === selectedMonthKey);
  const monthLabelStr = new Date(`${selectedMonthKey}-01`).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const thisMonthPresent = monthRecords.filter((r) => r.status === "present" || r.status === "late").length;
  const thisMonthTotal = monthRecords.filter((r) => r.status !== "holiday").length;
  const thisMonthPct = thisMonthTotal ? Math.round((thisMonthPresent / thisMonthTotal) * 100) : 0;

  // Calendar grid for the selected month
  const first = new Date(`${selectedMonthKey}-01`);
  const year = first.getFullYear();
  const monthNum = first.getMonth();
  const daysInMonth = new Date(year, monthNum + 1, 0).getDate();
  const startOffset = new Date(year, monthNum, 1).getDay();
  const byDate = new Map(monthRecords.map((r) => [r.date, r]));
  const cells: (AttendanceRecord | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, monthNum, i + 1).toISOString().slice(0, 10);
      return byDate.get(d) ?? null;
    }),
  ];

  const historyRows = attendanceRecords.filter((r) => r.status !== "holiday").slice().reverse();

  const presentPctOfTotal = summary.totalDays ? Math.round((summary.presentDays / summary.totalDays) * 100) : 0;
  const absentPctOfTotal = summary.totalDays ? Math.round((summary.absentDays / summary.totalDays) * 100) : 0;
  const leavePctOfTotal = summary.totalDays ? Math.round((summary.leaveDays / summary.totalDays) * 100) : 0;

  function requestCorrection(record?: AttendanceRecord) {
    createStudentHelpTicket({
      category: "Attendance",
      title: record ? `Attendance correction — ${record.date}` : "Attendance correction request",
      description: record
        ? `Please review my attendance for ${record.date} (${STATUS_LABEL[record.status]}). I believe this is incorrect.`
        : "Please review my attendance record — I believe there's an error.",
      sentTo: "Class Teacher",
    });
    toast.success("Correction request sent to your class teacher.");
  }

  const insights: StudentQuickInsight[] = [
    {
      id: "streak", icon: Sparkles, iconCls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      title: "Current Streak", description: `${studyStreak.currentStreakDays} days of consistent attendance`,
      badge: `Best: ${studyStreak.bestStreakDays} days`, badgeTone: "success",
    },
    {
      id: "late", icon: Clock3, iconCls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      title: "Late Arrivals", description: `${summary.lateDays} late arrival${summary.lateDays === 1 ? "" : "s"} this month`,
      badge: "Keep improving", badgeTone: "warning",
    },
    {
      id: "review", icon: CalendarDays, iconCls: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      title: "Next Review", description: "Attendance review on Aug 01, 2026",
      badge: "In 3 days", badgeTone: "info",
    },
    {
      id: "tip", icon: TrendingUp, iconCls: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      title: "Tip for You", description: "Great job! Keep up the consistency.",
      badge: "Stay consistent", badgeTone: "purple",
    },
  ];

  const columns: PremiumDataTableColumn<AttendanceRecord>[] = [
    { key: "date", header: "Date", render: (r) => <span className="font-medium text-foreground">{r.date}</span> },
    { key: "status", header: "Status", render: (r) => <StudentStatusPill label={STATUS_LABEL[r.status]} tone={STATUS_TONE[r.status]} /> },
    { key: "remark", header: "Remark", render: (r) => <span className="text-muted-foreground">{r.remark ?? "—"}</span> },
  ];

  return (
    <StudentPageShell>
      <StudentPageHeader
        title="My Attendance"
        description="Track attendance, trends, calendar, and correction requests."
        actions={
          <>
            <StudentSecondaryButton className="w-auto px-4" onClick={() => requestCorrection()}>
              <Pencil className="h-3.5 w-3.5" /> Request correction
            </StudentSecondaryButton>
            <StudentPrimaryButton className="w-auto px-4" onClick={() => toast.success("Downloading attendance report…")}>
              <Download className="h-3.5 w-3.5" /> Download report
            </StudentPrimaryButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StudentDashboardMetricCard
          label="Overall Attendance" value={`${summary.presentPct}%`} supporting={`${summary.presentDays} of ${summary.totalDays} days`}
          icon={CalendarCheck} tone="emerald" trendData={attendanceTrend.map((t) => ({ value: t.pct }))}
        />
        <StudentDashboardMetricCard
          label="This Month" value={`${thisMonthPct}%`} supporting={`${thisMonthPresent} of ${thisMonthTotal} days`}
          icon={CalendarDays} tone="blue" percent={thisMonthPct}
        />
        <StudentDashboardMetricCard
          label="Present Days" value={summary.presentDays} supporting="This month"
          icon={CircleCheckBig} tone="emerald" percent={presentPctOfTotal}
        />
        <StudentDashboardMetricCard
          label="Absent Days" value={summary.absentDays} supporting="This month"
          icon={XCircle} tone="rose" percent={absentPctOfTotal}
        />
        <StudentDashboardMetricCard
          label="Leave Days" value={summary.leaveDays} supporting="This month"
          icon={CalendarOff} tone="amber" percent={leavePctOfTotal}
        />
      </div>

      <StudentTwoColumnLayout
        main={
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <StudentAttendanceDonutCard
                present={summary.presentDays} absent={summary.absentDays} late={summary.lateDays} leave={summary.leaveDays}
                overallPct={summary.presentPct}
              />
              <StudentAttendanceTrendChart
                data={trendData}
                action={<div className="w-32"><PremiumSelect value={trendRange} onChange={setTrendRange} options={TREND_RANGE_OPTIONS} /></div>}
              />
            </div>

            <StudentAttendanceCalendar
              monthLabel={monthLabelStr}
              onPrev={() => setMonthIdx((i) => Math.max(0, i - 1))}
              onNext={() => setMonthIdx((i) => Math.min(monthKeys.length - 1, i + 1))}
              canPrev={monthIdx > 0}
              canNext={monthIdx < monthKeys.length - 1}
              cells={cells}
            />

            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
              <StudentSectionHeader
                icon={CalendarDays}
                title="Attendance History"
                action={<button type="button" onClick={() => toast.info("Showing full attendance history below.")} className="text-[12px] font-medium text-primary hover:underline">View all</button>}
              />
              <PremiumDataTable
                columns={columns}
                rows={historyRows}
                rowKey={(r) => r.id}
                rowActions={(r) => (
                  <StudentAttendanceRowActions
                    onViewDetails={() => toast.info(`${r.date} · ${STATUS_LABEL[r.status]}${r.remark ? ` — ${r.remark}` : ""}`)}
                    onRequestCorrection={() => requestCorrection(r)}
                    onDownloadProof={r.status === "present" || r.status === "late" ? () => toast.success(`Downloading proof for ${r.date}…`) : undefined}
                  />
                )}
              />
            </div>
          </>
        }
        sidebar={
          <>
            <StudentProfileMiniCard
              name={studentProfile.name}
              className={studentProfile.className}
              section={studentProfile.section}
              roll={studentProfile.roll}
              admissionNo={studentProfile.admissionNo}
              status={studentProfile.status}
            />

            <StudentProgressCard
              title="Attendance Summary"
              icon={<CalendarCheck className="h-4 w-4 text-primary" />}
              footer={
                <>
                  <div className="flex items-center gap-4">
                    <StudentRingStat percent={summary.presentPct} label="Overall" strokeCls="stroke-emerald-500" />
                    <div className="flex-1 space-y-1.5 text-[12px]">
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Present</span><span className="font-medium text-foreground">{summary.presentDays} days</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Absent</span><span className="font-medium text-foreground">{summary.absentDays} day</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Late</span><span className="font-medium text-foreground">{summary.lateDays} day</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Leave</span><span className="font-medium text-foreground">{summary.leaveDays} day</span></div>
                    </div>
                  </div>
                  <p className="mt-3 border-t border-border/60 pt-3 text-[11.5px] text-muted-foreground">
                    Total: {summary.totalDays} days · This month
                  </p>
                </>
              }
            />

            <StudentQuickInsightsCard insights={insights} />

            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
              <StudentSectionHeader title="Legend / Status Guide" />
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { code: "P", label: "Present", desc: "Student was present", tone: "success" as const },
                  { code: "A", label: "Absent", desc: "Student was absent", tone: "danger" as const },
                  { code: "L", label: "Late", desc: "Student arrived late", tone: "warning" as const },
                  { code: "L", label: "Leave", desc: "Student on leave", tone: "info" as const },
                ]).map((l) => (
                  <div key={l.label} className="rounded-xl bg-muted/30 p-2.5">
                    <div className="flex items-center gap-1.5">
                      <StudentStatusPill label={l.code} tone={l.tone} className="h-5 w-5 justify-center rounded-full px-0" />
                      <span className="text-[12px] font-semibold text-foreground">{l.label}</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{l.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        }
      />
    </StudentPageShell>
  );
}
