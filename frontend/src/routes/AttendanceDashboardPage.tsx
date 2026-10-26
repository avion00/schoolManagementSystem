import { useNavigate } from "react-router-dom";
import { CalendarCheck, CalendarDays, GraduationCap, Layers, Users, BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { AttendanceSummaryCards } from "@/components/attendance/AttendanceSummaryCards";
import {
  isWorkingDay, todayIso, useAttendanceStats, useClassComparison, useHolidays, useStaffMonthly, useWeekendDays,
} from "@/api/attendance";
import { errorMessage } from "@/api/http";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { cn } from "@/lib/utils";

function QuickAction({ label, icon: Icon, color, onClick }: {
  label: string; icon: React.FC<{ className?: string }>; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="t-lift flex flex-col items-center gap-2 rounded-2xl border border-neutral-200/80 bg-white p-4 text-center shadow-elevated transition-shadow hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-medium text-foreground leading-tight">{label}</span>
    </button>
  );
}

const STATUS_DOT: Record<string, string> = {
  present: "bg-emerald-500", absent: "bg-rose-500", late: "bg-amber-500", "half-day": "bg-blue-500",
  leave: "bg-violet-500", excused: "bg-slate-400", holiday: "bg-slate-300", unmarked: "bg-muted-foreground/30",
};
const STATUS_TEXT: Record<string, string> = {
  present: "text-emerald-600", absent: "text-rose-600", late: "text-amber-600", "half-day": "text-blue-600",
  leave: "text-violet-600", excused: "text-slate-600", holiday: "text-slate-500", unmarked: "text-muted-foreground",
};

function rateCls(rate: number, kind: "text" | "bg") {
  if (kind === "text") return rate >= 90 ? "text-emerald-600" : rate >= 80 ? "text-amber-600" : "text-rose-600";
  return rate >= 90 ? "bg-emerald-500" : rate >= 80 ? "bg-amber-500" : "bg-rose-500";
}

export function AttendanceDashboardPage() {
  const navigate = useNavigate();
  const today = todayIso();
  const [y, m, d] = today.split("-").map(Number);
  const monthStart = today.slice(0, 8) + "01";
  const monthEnd = `${today.slice(0, 8)}${new Date(y, m, 0).getDate()}`;

  const statsQuery = useAttendanceStats();
  const todayClasses = useClassComparison(today, today);
  const staff = useStaffMonthly(y, m);
  const holidays = useHolidays(monthStart, monthEnd).data ?? [];
  const weekendDays = useWeekendDays().data ?? [];
  const MONTHLY_TREND = statsQuery.data?.trend ?? [];
  const markedToday = (todayClasses.data ?? []).filter((c): c is typeof c & { rate: number } => c.rate !== null);
  const workingDaysSoFar = Array.from({ length: d }, (_, i) => i + 1)
    .filter((day) => isWorkingDay(y, m, day, holidays, weekendDays)).length;
  const holidayNames = [...new Map(holidays.map((h) => [h.name, h])).values()];
  const teachersToday = (staff.data?.teachers ?? []).map((t) => ({
    ...t, status: staff.data?.attendance.find((a) => a.teacherId === t.id)?.records[d] ?? "unmarked",
  }));
  const stats = statsQuery.data?.stats;
  const monthClasses = (useClassComparison().data ?? []).filter((c): c is typeof c & { rate: number } => c.rate !== null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Reveal className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Today · {new Date(`${today}T00:00`).toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </Reveal>

      {/* KPI summary */}
      {statsQuery.isError && (
        <PremiumEmptyState title="Couldn't load attendance stats" description={errorMessage(statsQuery.error)} />
      )}
      {statsQuery.isLoading && <PremiumSkeleton className="h-28 w-full rounded-2xl" />}
      {stats && <AttendanceSummaryCards stats={stats} />}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's student attendance snapshot */}
          <Reveal delay={40}>
          <PremiumCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[14px] font-semibold text-foreground">Today · Sections Marked</h2>
              </div>
              <button onClick={() => navigate("/attendance/daily")}
                className="text-[11px] text-primary hover:underline font-medium">Mark attendance →</button>
            </div>
            {todayClasses.isLoading && <PremiumSkeleton className="h-24 w-full rounded-xl" />}
            {todayClasses.isSuccess && markedToday.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">No registers have been taken today yet.</p>
            )}
            <div className="space-y-1.5">
              {markedToday.map((c) => (
                <div key={`${c.className}${c.section}`} className="flex items-center gap-2 text-[12px]">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", rateCls(c.rate, "bg"))} />
                  <span className="flex-1 text-foreground">{c.className} {c.section}</span>
                  <span className="text-muted-foreground text-[10px]">{c.students} students</span>
                  <span className={cn("text-[11px] font-semibold", rateCls(c.rate, "text"))}>{c.rate}%</span>
                </div>
              ))}
            </div>
            {(todayClasses.data?.length ?? 0) > markedToday.length && markedToday.length > 0 && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                {(todayClasses.data?.length ?? 0) - markedToday.length} section(s) not marked yet.
              </p>
            )}
          </PremiumCard>
          </Reveal>

          {/* Monthly trend */}
          <Reveal delay={80}>
          <PremiumCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">Monthly Attendance Trend</h2>
            </div>
            <div className="flex items-end gap-3 h-32">
              {MONTHLY_TREND.map((pt, i) => {
                const height = `${pt.presentRate ?? 0}%`;
                const isCurrent = i === MONTHLY_TREND.length - 1;
                return (
                  <div key={pt.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-foreground font-semibold">{pt.presentRate === null ? "—" : `${pt.presentRate}%`}</span>
                    <div className="w-full flex items-end" style={{ height: "80px" }}>
                      <div
                        className={cn("w-full rounded-t-md transition-all", isCurrent ? "bg-indigo-500" : "bg-indigo-200 dark:bg-indigo-800")}
                        style={{ height }}
                        title={`${pt.month}: ${pt.presentRate ?? "no data"}${pt.presentRate === null ? "" : "%"}`}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground text-center leading-tight">{pt.month}</span>
                  </div>
                );
              })}
            </div>
          </PremiumCard>
          </Reveal>

          {/* Class comparison */}
          <Reveal delay={120}>
          <PremiumCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">Class Attendance Comparison</h2>
            </div>
            <div className="space-y-3">
              {markedToday.length === 0 && monthClasses.length === 0 && (
                <p className="py-4 text-center text-[12px] text-muted-foreground">No attendance recorded this month.</p>
              )}
              {monthClasses.map((c) => (
                <div key={`${c.className}${c.section}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-foreground">{c.className} {c.section}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-muted-foreground">{c.students} students</span>
                      <span className={cn("font-semibold",
                        c.rate >= 90 ? "text-emerald-600" :
                        c.rate >= 80 ? "text-amber-600" : "text-rose-600"
                      )}>{c.rate}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full",
                        c.rate >= 90 ? "bg-emerald-500" : c.rate >= 80 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ width: `${c.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </PremiumCard>
          </Reveal>
        </div>

        {/* Right: 1/3 */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Reveal delay={40}>
          <PremiumCard className="p-5">
            <h2 className="text-[14px] font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction label="Daily Attendance" icon={CalendarCheck} color="bg-emerald-500" onClick={() => navigate("/attendance/daily")} />
              <QuickAction label="Monthly Sheet"    icon={CalendarDays}  color="bg-indigo-500"  onClick={() => navigate("/attendance/monthly")} />
              <QuickAction label="Student Report"   icon={GraduationCap} color="bg-teal-500"    onClick={() => navigate("/attendance/student")} />
              <QuickAction label="Teacher Report"   icon={Users}         color="bg-violet-500"  onClick={() => navigate("/attendance/teacher")} />
              <QuickAction label="Class Report"     icon={Layers}        color="bg-amber-500"   onClick={() => navigate("/attendance/class")} />
              <QuickAction label="Analytics"        icon={BarChart2}     color="bg-rose-500"    onClick={() => navigate("/attendance/reports")} />
            </div>
          </PremiumCard>
          </Reveal>

          {/* Today's teachers */}
          <Reveal delay={80}>
          <PremiumCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">Teacher Attendance Today</h2>
            </div>
            <div className="space-y-1.5">
              {staff.isLoading && <PremiumSkeleton className="h-24 w-full rounded-xl" />}
              {staff.isSuccess && teachersToday.length === 0 && (
                <p className="py-4 text-center text-[12px] text-muted-foreground">No teachers on record.</p>
              )}
              {teachersToday.map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-[12px]">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[t.status])} />
                  <span className="flex-1 text-foreground truncate">{t.name}</span>
                  <span className={cn("text-[10px] font-semibold capitalize", STATUS_TEXT[t.status])}>
                    {t.status === "half-day" ? "H/D" : t.status === "unmarked" ? "Not marked" : t.status}
                  </span>
                </div>
              ))}
            </div>
          </PremiumCard>
          </Reveal>

          {/* Stats chips */}
          <Reveal delay={120}>
          <PremiumCard className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">{new Date(y, m - 1, 1).toLocaleDateString("en", { month: "long" })} Progress</h2>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Working days so far</span>
                <span className="font-semibold text-foreground">{workingDaysSoFar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly rate</span>
                <span className="font-semibold text-emerald-600">{stats?.monthlyRate == null ? "—" : `${stats.monthlyRate}%`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Week trend</span>
                {stats?.weeklyTrend == null ? <span className="font-semibold text-muted-foreground">—</span> : (
                <span className={cn("font-semibold flex items-center gap-0.5",
                  stats.weeklyTrend >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {stats.weeklyTrend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stats.weeklyTrend >= 0 ? "+" : ""}{stats.weeklyTrend} pts
                </span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holidays this month</span>
                <span className="font-semibold text-violet-600 text-right">
                  {holidayNames.length === 0 ? "None" : holidayNames.map((h) => `${h.name} (${h.date.slice(5)})`).join(", ")}
                </span>
              </div>
            </div>
          </PremiumCard>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
