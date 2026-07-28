import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import {
  ALL_STUDENTS, G6A_JUNE_ATT, G6A_JULY_ATT, G7A_JULY_ATT,
  countStatuses, calcRate,
} from "@/data/attendanceData";
import type { StudentRef, MonthlyAttendance } from "@/data/attendanceData";
import { cn } from "@/lib/utils";

const ALL_ATT: MonthlyAttendance[] = [...G6A_JUNE_ATT, ...G6A_JULY_ATT, ...G7A_JULY_ATT];

function getStudentSummary(studentId: number) {
  const records = ALL_ATT.filter((a) => a.studentId === studentId);
  let present = 0, absent = 0, late = 0, halfDay = 0, leave = 0, totalWorking = 0;
  for (const r of records) {
    const c = countStatuses(r.records);
    present   += c.present;
    absent    += c.absent;
    late      += c["late"];
    halfDay   += c["half-day"];
    leave     += c["leave"];
    // working days for this month
    const daysInMonth = new Date(r.year, r.month, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      if (r.records[d] !== undefined) totalWorking++;
    }
  }
  const rate = totalWorking > 0
    ? Math.round(((present + late * 0.5 + halfDay * 0.5) / totalWorking) * 100)
    : 0;
  return { present, absent, late, halfDay, leave, totalWorking, rate };
}

interface MonthlyBreakdownRow {
  monthName: string;
  present: number;
  absent: number;
  late: number;
  "half-day": number;
  leave: number;
  workingDays: number;
  rate: number;
}

const monthlyBreakdownColumns: PremiumDataTableColumn<MonthlyBreakdownRow>[] = [
  { key: "monthName", header: "Month", render: (m) => <span className="font-medium text-foreground">{m.monthName}</span> },
  { key: "workingDays", header: "Working", align: "center", render: (m) => <span className="text-muted-foreground">{m.workingDays}</span> },
  { key: "present", header: "Present", align: "center", render: (m) => <span className="font-semibold text-emerald-600">{m.present}</span> },
  { key: "absent", header: "Absent", align: "center", render: (m) => <span className="font-semibold text-rose-600">{m.absent}</span> },
  { key: "late", header: "Late", align: "center", render: (m) => <span className="font-semibold text-amber-600">{m.late}</span> },
  {
    key: "rate", header: "Rate", align: "center", render: (m) => (
      <span className={cn("font-bold", m.rate >= 90 ? "text-emerald-600" : m.rate >= 75 ? "text-amber-600" : "text-rose-600")}>
        {m.rate}%
      </span>
    ),
  },
];

export function StudentAttendancePage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StudentRef | null>(null);

  const filtered = useMemo(
    () => ALL_STUDENTS.filter((s) =>
      !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase())
    ),
    [search],
  );

  const summary = useMemo(() => selected ? getStudentSummary(selected.id) : null, [selected]);

  // Month-by-month data for selected student
  const monthlyBreakdown = useMemo(() => {
    if (!selected) return [];
    return ALL_ATT
      .filter((a) => a.studentId === selected.id)
      .map((a) => {
        const c    = countStatuses(a.records);
        const days = Object.keys(a.records).length;
        const rate = calcRate(a.records, days);
        const monthName = new Date(a.year, a.month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
        return { monthName, ...c, workingDays: days, rate };
      })
      .sort((x, y) => {
        const ax = ALL_ATT.find((a) => a.studentId === selected.id && a.records === (x as unknown as MonthlyAttendance).records);
        const ay = ALL_ATT.find((a) => a.studentId === selected.id && a.records === (y as unknown as MonthlyAttendance).records);
        if (!ax || !ay) return 0;
        return ax.year !== ay.year ? ax.year - ay.year : ax.month - ay.month;
      });
  }, [selected]);

  // Detailed record for selected student (all days)
  const detailedRecords = useMemo(() => {
    if (!selected) return [];
    const out: { date: string; status: string }[] = [];
    for (const a of ALL_ATT.filter((x) => x.studentId === selected.id)) {
      for (const [day, status] of Object.entries(a.records)) {
        const month = String(a.month).padStart(2, "0");
        const d     = String(day).padStart(2, "0");
        out.push({ date: `${a.year}-${month}-${d}`, status });
      }
    }
    return out.sort((a, b) => a.date.localeCompare(b.date));
  }, [selected]);

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
              placeholder="Search by name or roll no…"
              className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-[12px] focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filtered.map((s) => {
              const sum = getStudentSummary(s.id);
              return (
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
                    <p className="text-[10px] text-muted-foreground">{s.rollNo} · {s.className} {s.section}</p>
                  </div>
                  <span className={cn("text-[11px] font-bold",
                    sum.rate >= 90 ? "text-emerald-600" : sum.rate >= 75 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {sum.rate}%
                  </span>
                </button>
              );
            })}
          </div>
        </PremiumCard>
        </Reveal>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-4">
          {selected && summary ? (
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
                    <p className="text-[12px] text-muted-foreground">{selected.rollNo} · {selected.className} {selected.section}</p>
                    {selected.parentPhone && <p className="text-[12px] text-muted-foreground mt-0.5">Parent: {selected.parentPhone}</p>}
                  </div>
                  <div className={cn("text-3xl font-bold",
                    summary.rate >= 90 ? "text-emerald-600" : summary.rate >= 75 ? "text-amber-600" : "text-rose-600"
                  )}>
                    {summary.rate}%
                  </div>
                </div>

                {/* Summary chips */}
                <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                  {([
                    ["present", summary.present, "emerald"],
                    ["absent",  summary.absent,  "rose"],
                    ["late",    summary.late,     "amber"],
                    ["h/d",     summary.halfDay,  "blue"],
                    ["leave",   summary.leave,    "violet"],
                  ] as [string, number, string][]).map(([label, count, color]) => (
                    <div key={label} className={cn("rounded-xl p-3",
                      `bg-${color}-50 text-${color}-700 dark:bg-${color}-950/30 dark:text-${color}-300`
                    )}>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-[10px] font-medium capitalize">{label}</p>
                    </div>
                  ))}
                </div>
              </PremiumCard>
              </Reveal>

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
                    <div key={r.date} className="flex flex-col items-center gap-0.5">
                      <AttendanceStatusBadge status={r.status as import("@/data/attendanceData").AttendanceStatus} compact />
                      <span className="text-[9px] text-muted-foreground">{r.date.slice(5)}</span>
                    </div>
                  ))}
                </div>
              </PremiumCard>
              </Reveal>
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
