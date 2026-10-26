import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import { todayIso, useStudentRecords, useStudentReport } from "@/api/attendance";
import { errorMessage } from "@/api/http";
import { useStudents } from "@/api/students";
import type { Student } from "@/api/types/students";
import { cn } from "@/lib/utils";

interface MonthlyBreakdownRow {
  monthName: string;
  present: number;
  absent: number;
  workingDays: number;
  rate: number | null;
}

function rateClass(rate: number) {
  return rate >= 90 ? "text-emerald-600" : rate >= 75 ? "text-amber-600" : "text-rose-600";
}

const monthlyBreakdownColumns: PremiumDataTableColumn<MonthlyBreakdownRow>[] = [
  { key: "monthName", header: "Month", render: (m) => <span className="font-medium text-foreground">{m.monthName}</span> },
  { key: "workingDays", header: "Recorded", align: "center", render: (m) => <span className="text-muted-foreground">{m.workingDays}</span> },
  { key: "present", header: "Present", align: "center", render: (m) => <span className="font-semibold text-emerald-600">{m.present}</span> },
  { key: "absent", header: "Absent", align: "center", render: (m) => <span className="font-semibold text-rose-600">{m.absent}</span> },
  {
    key: "rate", header: "Rate", align: "center", render: (m) => m.rate === null ? <span className="text-muted-foreground">—</span> : (
      <span className={cn("font-bold", rateClass(m.rate))}>{m.rate}%</span>
    ),
  },
];

const inputCls = "h-9 rounded-lg border border-input bg-background px-2.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring";

export function StudentAttendancePage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [from, setFrom] = useState(() => `${new Date().getFullYear()}-01-01`);
  const [to, setTo] = useState(todayIso);

  const studentsQuery = useStudents();
  const report = useStudentReport(selected?.id, from, to);
  const records = useStudentRecords(selected?.id, from, to);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (studentsQuery.data ?? []).filter((s) =>
      !q || s.name.toLowerCase().includes(q) || String(s.roll ?? "").includes(q) || s.admissionNo.toLowerCase().includes(q));
  }, [search, studentsQuery.data]);

  const summary = useMemo(() => {
    const b = report.data?.by_status ?? {};
    return {
      present: b.present ?? 0, absent: b.absent ?? 0, late: b.late ?? 0,
      halfDay: b.half_day ?? 0, leave: (b.leave ?? 0) + (b.excused ?? 0),
      rate: report.data?.rate ?? null,
    };
  }, [report.data]);

  const monthlyBreakdown = useMemo<MonthlyBreakdownRow[]>(() =>
    (report.data?.months ?? []).map((m) => {
      const [y, mo] = m.month.split("-").map(Number);
      return {
        monthName: new Date(y, mo - 1, 1).toLocaleString("en", { month: "long", year: "numeric" }),
        present: m.present, absent: m.absent, workingDays: m.total,
        rate: m.total ? Math.round((m.present / m.total) * 1000) / 10 : null,
      };
    }), [report.data]);

  const detailedRecords = useMemo(
    () => [...(records.data ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [records.data]);

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Student Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">View detailed attendance history for individual students</p>
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Student list */}
        <Reveal delay={40} className="lg:col-span-1">
        <PremiumCard className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID or roll no…"
              className={cn(inputCls, "w-full pl-8 pr-3")}
            />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {studentsQuery.isLoading && <PremiumSkeleton className="h-40 w-full rounded-xl" />}
            {studentsQuery.isError && <p className="text-[12px] text-rose-600">{errorMessage(studentsQuery.error)}</p>}
            {studentsQuery.isSuccess && filtered.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">No students found.</p>
            )}
            {filtered.map((s) => (
              <button key={s.id} onClick={() => setSelected(s)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-lg p-2.5 text-left transition-colors hover:bg-muted/40",
                  selected?.id === s.id && "bg-primary/10 border border-primary/20",
                )}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  {s.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {s.admissionNo}{s.roll !== null ? ` · Roll ${s.roll}` : ""} · {s.className} {s.section ?? ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </PremiumCard>
        </Reveal>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              {/* Student header */}
              <Reveal delay={80}>
              <PremiumCard className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-white text-xl font-bold">
                    {selected.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                    <p className="text-[12px] text-muted-foreground">
                      {selected.admissionNo} · {selected.className} {selected.section ?? ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
                      <span>to</span>
                      <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className={cn("text-3xl font-bold", summary.rate === null ? "text-muted-foreground" : rateClass(summary.rate))}>
                    {summary.rate === null ? "—" : `${summary.rate}%`}
                  </div>
                </div>

                {/* Summary chips */}
                <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                  {([
                    ["present", summary.present, "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"],
                    ["absent",  summary.absent,  "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"],
                    ["late",    summary.late,    "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"],
                    ["h/d",     summary.halfDay, "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"],
                    ["leave",   summary.leave,   "bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"],
                  ] as [string, number, string][]).map(([label, count, color]) => (
                    <div key={label} className={cn("rounded-xl p-3", color)}>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-[10px] font-medium capitalize">{label}</p>
                    </div>
                  ))}
                </div>
              </PremiumCard>
              </Reveal>

              {report.isError && (
                <PremiumEmptyState title="Couldn't load attendance" description={errorMessage(report.error)} />
              )}
              {report.isLoading && <PremiumSkeleton className="h-40 w-full rounded-2xl" />}
              {report.isSuccess && report.data.total === 0 && (
                <PremiumEmptyState title="No attendance recorded" description="Nothing has been marked for this student in the selected range." />
              )}
              {report.isSuccess && report.data.total > 0 && (<>
              {/* Monthly breakdown */}
              <Reveal delay={120}>
              <PremiumCard className="overflow-hidden">
                <h3 className="px-5 pt-5 text-[13px] font-semibold text-foreground mb-1">Monthly Breakdown</h3>
                <PremiumDataTable
                  columns={monthlyBreakdownColumns}
                  rows={monthlyBreakdown}
                  rowKey={(m) => m.monthName}
                  stickyHeader={false}
                />
              </PremiumCard>
              </Reveal>

              {/* Daily records */}
              <Reveal delay={160}>
              <PremiumCard className="p-5">
                <h3 className="text-[13px] font-semibold text-foreground mb-3">Daily Records</h3>
                <div className="flex flex-wrap gap-1.5">
                  {detailedRecords.map((r) => (
                    <div key={r.date} title={r.remark || undefined} className="flex flex-col items-center gap-0.5">
                      <AttendanceStatusBadge status={r.status} compact />
                      <span className="text-[9px] text-muted-foreground">{r.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </PremiumCard>
              </Reveal>
              </>)}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-neutral-200/80 h-64 flex items-center justify-center dark:border-neutral-800">
              <div className="text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-[14px] font-medium text-foreground">Select a student</p>
                <p className="text-[12px] text-muted-foreground mt-1">Click a name from the list to view their attendance.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
