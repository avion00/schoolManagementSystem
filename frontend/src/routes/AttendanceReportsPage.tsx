import { BarChart2, TrendingUp, Users, GraduationCap, Percent, AlertTriangle } from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { todayIso, useAttendanceStats, useClassComparison, useStudentSummary, type StudentSummaryRow } from "@/api/attendance";
import { errorMessage } from "@/api/http";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { cn } from "@/lib/utils";

type StudentStatRow = StudentSummaryRow;

const lowAttendanceColumns: PremiumDataTableColumn<StudentStatRow>[] = [
  { key: "name", header: "Student", render: (s) => <span className="font-medium text-foreground">{s.name}</span> },
  { key: "class", header: "Class", render: (s) => <span className="text-muted-foreground">{s.className} {s.section}</span> },
  { key: "present", header: "Present", align: "center", render: (s) => <span className="font-semibold text-emerald-600">{s.present}</span> },
  { key: "absent", header: "Absent", align: "center", render: (s) => <span className="font-semibold text-rose-600">{s.absent}</span> },
  { key: "rate", header: "Rate", align: "center", render: (s) => <span className="font-bold text-rose-600">{s.rate}%</span> },
];

const allStudentsColumns: PremiumDataTableColumn<StudentStatRow>[] = [
  { key: "name", header: "Name", render: (s) => <span className="font-medium text-foreground">{s.name}</span> },
  { key: "class", header: "Class", render: (s) => <span className="text-muted-foreground">{s.className} {s.section}</span> },
  { key: "marked", header: "Recorded Days", align: "center", render: (s) => <span>{s.marked}</span> },
  { key: "present", header: "Present", align: "center", render: (s) => <span className="font-semibold text-emerald-600">{s.present}</span> },
  { key: "absent", header: "Absent", align: "center", render: (s) => <span className="font-semibold text-rose-600">{s.absent}</span> },
  { key: "late", header: "Late", align: "center", render: (s) => <span className="font-semibold text-amber-600">{s.late}</span> },
  {
    key: "rate", header: "Rate", align: "center", render: (s) => (
      <span className={cn("font-bold", s.rate >= 90 ? "text-emerald-600" : s.rate >= 75 ? "text-amber-600" : "text-rose-600")}>
        {s.rate}%
      </span>
    ),
  },
];

const DIST_STATUSES = ["present", "absent", "late", "half-day", "leave", "excused"] as const;

const STATUS_COLORS: Record<string, string> = {
  present:    "bg-emerald-500",
  absent:     "bg-rose-500",
  late:       "bg-amber-500",
  "half-day": "bg-blue-500",
  leave:      "bg-violet-500",
  excused:    "bg-slate-400",
};

const STATUS_TEXT: Record<string, string> = {
  present:    "text-emerald-600",
  absent:     "text-rose-600",
  late:       "text-amber-600",
  "half-day": "text-blue-600",
  leave:      "text-violet-600",
  excused:    "text-slate-600",
};

const inputCls = "h-9 rounded-lg border border-input bg-background px-2.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring";

export function AttendanceReportsPage() {
  const [from, setFrom] = useState(() => todayIso().slice(0, 8) + "01");
  const [to, setTo] = useState(todayIso);
  const statsQuery = useAttendanceStats();
  const summaryQuery = useStudentSummary(from, to);
  const classQuery = useClassComparison(from, to);

  const MONTHLY_TREND = statsQuery.data?.trend ?? [];
  const STUDENT_STATS = useMemo(
    () => [...(summaryQuery.data?.rows ?? [])].sort((a, b) => b.rate - a.rate), [summaryQuery.data]);
  const CLASS_COMPARISON = (classQuery.data ?? []).filter((c): c is typeof c & { rate: number } => c.rate !== null);
  const STATUS_DIST = useMemo(() => {
    const by = summaryQuery.data?.byStatus ?? {};
    const total = DIST_STATUSES.reduce((n, st) => n + (by[st] ?? 0), 0);
    return DIST_STATUSES.map((status) => ({
      status, count: by[status] ?? 0, pct: total ? Math.round(((by[status] ?? 0) / total) * 100) : 0,
    }));
  }, [summaryQuery.data]);
  const totalMarked = STUDENT_STATS.reduce((n, s) => n + s.marked, 0);
  const totalPresent = STUDENT_STATS.reduce((n, s) => n + s.present, 0);
  const rangeRate = totalMarked ? Math.round((totalPresent / totalMarked) * 1000) / 10 : null;

  const lowAttStudents = [...STUDENT_STATS.filter((s) => s.rate < 80)].reverse();
  const hasLowAtt = lowAttStudents.length > 0;

  const kpis = [
    { label: "Overall Rate", value: rangeRate === null ? "—" : `${rangeRate}%`, icon: Percent, tone: METRIC_TONES.blue },
    { label: "Students Recorded", value: STUDENT_STATS.length, icon: GraduationCap, tone: METRIC_TONES.green },
    { label: "Sections Recorded", value: CLASS_COMPARISON.length, icon: Users, tone: METRIC_TONES.purple },
    {
      label: "Low Attendance (<80%)", value: lowAttStudents.length, icon: AlertTriangle,
      tone: hasLowAtt ? METRIC_TONES.red : METRIC_TONES.green,
    },
  ];

  if (summaryQuery.isError) {
    return <PremiumEmptyState title="Couldn't load attendance reports" description={errorMessage(summaryQuery.error)}
      action={<Button size="sm" variant="outline" onClick={() => summaryQuery.refetch()}>Try again</Button>} />;
  }

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Attendance Reports & Analytics</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Comprehensive attendance analysis across all classes</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
          <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
          <span>to</span>
          <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </div>
      </Reveal>

      {summaryQuery.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {summaryQuery.isSuccess && STUDENT_STATS.length === 0 && (
        <PremiumEmptyState title="No attendance recorded in this range"
          description="Reports fill in once registers are taken. Try a wider date range." />
      )}
      {summaryQuery.isSuccess && STUDENT_STATS.length > 0 && (<>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 40}>
            <KPITrendCard
              label={k.label}
              value={k.value}
              icon={k.icon}
              iconCls={k.tone}
            />
          </Reveal>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly trend chart */}
        <Reveal delay={40}>
        <PremiumCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[14px] font-semibold text-foreground">Monthly Attendance Trend</h2>
          </div>
          <div className="flex items-end gap-3 h-36">
            {MONTHLY_TREND.map((pt, i) => {
              const isCurrent = i === MONTHLY_TREND.length - 1;
              return (
                <div key={pt.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold text-foreground">{pt.presentRate === null ? "—" : `${pt.presentRate}%`}</span>
                  <div className="w-full flex items-end" style={{ height: "96px" }}>
                    <div
                      className={cn("w-full rounded-t-md", isCurrent ? "bg-indigo-500" : "bg-indigo-200 dark:bg-indigo-800")}
                      style={{ height: `${pt.presentRate ?? 0}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground text-center leading-tight">{pt.month}</span>
                </div>
              );
            })}
          </div>
        </PremiumCard>
        </Reveal>

        {/* Status distribution */}
        <Reveal delay={80}>
        <PremiumCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[14px] font-semibold text-foreground">Status Distribution</h2>
          </div>
          {/* Stacked bar */}
          <div className="h-6 rounded-full overflow-hidden flex mb-4">
            {STATUS_DIST.map((s) => s.pct > 0 && (
              <div key={s.status}
                className={cn("h-full transition-all", STATUS_COLORS[s.status])}
                style={{ width: `${s.pct}%` }}
                title={`${s.status}: ${s.pct}%`}
              />
            ))}
          </div>
          <div className="space-y-2">
            {STATUS_DIST.map((s) => (
              <div key={s.status} className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded-sm shrink-0", STATUS_COLORS[s.status])} />
                <span className="flex-1 text-[12px] text-foreground capitalize">{s.status === "half-day" ? "Half Day" : s.status}</span>
                <span className={cn("text-[12px] font-semibold", STATUS_TEXT[s.status])}>{s.count}</span>
                <span className="text-[11px] text-muted-foreground w-8 text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </PremiumCard>
        </Reveal>

        {/* Class comparison */}
        <Reveal delay={120}>
        <PremiumCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[14px] font-semibold text-foreground">Class Attendance Rate</h2>
          </div>
          <div className="space-y-3">
            {CLASS_COMPARISON.map((c) => (
              <div key={`${c.className}${c.section}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium text-foreground">{c.className} {c.section}</span>
                  <span className={cn("text-[12px] font-bold",
                    c.rate >= 90 ? "text-emerald-600" : c.rate >= 80 ? "text-amber-600" : "text-rose-600"
                  )}>{c.rate}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", c.rate >= 90 ? "bg-emerald-500" : c.rate >= 80 ? "bg-amber-500" : "bg-rose-500")}
                    style={{ width: `${c.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>
        </Reveal>

        {/* Top students */}
        <Reveal delay={160}>
        <PremiumCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[14px] font-semibold text-foreground">Top 5 Students</h2>
          </div>
          <div className="space-y-2">
            {STUDENT_STATS.slice(0, 5).map((s, idx) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
                  idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-slate-400" : idx === 2 ? "bg-orange-400" : "bg-muted"
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.admissionNo} · {s.className} {s.section}</p>
                </div>
                <span className="text-[12px] font-bold text-emerald-600">{s.rate}%</span>
              </div>
            ))}
          </div>
        </PremiumCard>
        </Reveal>
      </div>

      {/* Low attendance alert */}
      {lowAttStudents.length > 0 && (
        <Reveal delay={200}>
        <PremiumCard className="overflow-hidden border-rose-200 bg-rose-50/40 dark:border-rose-800 dark:bg-rose-950/10">
          <h2 className="px-5 pt-5 text-[14px] font-semibold text-rose-700 mb-3">Low Attendance Alert (Below 80%)</h2>
          <PremiumDataTable columns={lowAttendanceColumns} rows={lowAttStudents} rowKey={(s) => s.id} stickyHeader={false} />
        </PremiumCard>
        </Reveal>
      )}

      {/* Full student table */}
      <Reveal delay={240}>
      <PremiumCard className="overflow-hidden">
        <h2 className="px-5 pt-5 text-[14px] font-semibold text-foreground mb-4">All Students Attendance Summary</h2>
        <PremiumDataTable columns={allStudentsColumns} rows={STUDENT_STATS} rowKey={(s) => s.id} stickyHeader={false} />
      </PremiumCard>
      </Reveal>
      </>)}
    </div>
  );
}
