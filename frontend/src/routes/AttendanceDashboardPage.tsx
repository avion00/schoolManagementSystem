import { useNavigate } from "react-router-dom";
import { CalendarCheck, CalendarDays, GraduationCap, Layers, Users, BarChart2, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AttendanceSummaryCards } from "@/components/attendance/AttendanceSummaryCards";
import {
  ATTENDANCE_STATS, MONTHLY_TREND, CLASS_COMPARISON, TODAY,
  STUDENTS_G6A, G6A_JULY_ATT, TEACHERS_REF, TEACHER_JULY_ATT,
  isWorkingDay,
} from "@/data/attendanceData";
import { cn } from "@/lib/utils";

function QuickAction({ label, icon: Icon, color, onClick }: {
  label: string; icon: React.FC<{ className?: string }>; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-4 text-center hover:bg-muted/40 transition-colors">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-medium text-foreground leading-tight">{label}</span>
    </button>
  );
}

// Working days in July so far (1,2,3,6)
const workingDaysSoFar = [1, 2, 3, 6].filter((d) => isWorkingDay(2026, 7, d)).length;

// Today's G6A attendance (July day 6)
const todayG6A = G6A_JULY_ATT.map((a) => ({
  studentId: a.studentId,
  status:    a.records[6] ?? "present",
}));

// Today's teacher attendance (July day 6)
const todayTeachers = TEACHER_JULY_ATT.map((a) => ({
  teacherId: a.teacherId,
  status:    a.records[6] ?? "present",
}));

export function AttendanceDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Today · {new Date(TODAY).toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* KPI summary */}
      <AttendanceSummaryCards />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's student attendance snapshot */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[14px] font-semibold text-foreground">Today · Grade 6 A</h2>
              </div>
              <button onClick={() => navigate("/attendance/daily")}
                className="text-[11px] text-primary hover:underline font-medium">Mark attendance →</button>
            </div>
            <div className="grid grid-cols-5 gap-2 text-center mb-4">
              {(["present","absent","late","half-day","leave"] as const).map((s) => {
                const count = todayG6A.filter((r) => r.status === s).length;
                const colors: Record<string, string> = {
                  present:"text-emerald-700 bg-emerald-50", absent:"text-rose-700 bg-rose-50",
                  late:"text-amber-700 bg-amber-50", "half-day":"text-blue-700 bg-blue-50",
                  leave:"text-violet-700 bg-violet-50",
                };
                return (
                  <div key={s} className={cn("rounded-xl p-3", colors[s])}>
                    <p className="text-xl font-bold">{count}</p>
                    <p className="text-[10px] font-medium capitalize">{s === "half-day" ? "Half Day" : s}</p>
                  </div>
                );
              })}
            </div>
            <div className="space-y-1.5">
              {STUDENTS_G6A.map((s) => {
                const rec = todayG6A.find((r) => r.studentId === s.id);
                const status = rec?.status ?? "present";
                const dot: Record<string, string> = {
                  present:"bg-emerald-500", absent:"bg-rose-500",
                  late:"bg-amber-500", "half-day":"bg-blue-500", leave:"bg-violet-500",
                };
                return (
                  <div key={s.id} className="flex items-center gap-2 text-[12px]">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", dot[status])} />
                    <span className="flex-1 text-foreground">{s.name}</span>
                    <span className="text-muted-foreground font-mono text-[10px]">{s.rollNo}</span>
                    <span className={cn("text-[10px] font-semibold capitalize",
                      status === "present" ? "text-emerald-600" :
                      status === "absent"  ? "text-rose-600" :
                      status === "late"    ? "text-amber-600" :
                      status === "half-day"? "text-blue-600"  : "text-violet-600"
                    )}>
                      {status === "half-day" ? "H/D" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Monthly trend */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">Monthly Attendance Trend</h2>
            </div>
            <div className="flex items-end gap-3 h-32">
              {MONTHLY_TREND.map((pt) => {
                const height = `${pt.presentRate}%`;
                const isCurrent = pt.month.startsWith("Jul");
                return (
                  <div key={pt.month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-foreground font-semibold">{pt.presentRate}%</span>
                    <div className="w-full flex items-end" style={{ height: "80px" }}>
                      <div
                        className={cn("w-full rounded-t-md transition-all", isCurrent ? "bg-indigo-500" : "bg-indigo-200 dark:bg-indigo-800")}
                        style={{ height }}
                        title={`${pt.month}: ${pt.presentRate}%`}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground text-center leading-tight">{pt.month}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Class comparison */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">Class Attendance Comparison</h2>
            </div>
            <div className="space-y-3">
              {CLASS_COMPARISON.map((c) => (
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
          </Card>
        </div>

        {/* Right: 1/3 */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-5">
            <h2 className="text-[14px] font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction label="Daily Attendance" icon={CalendarCheck} color="bg-emerald-500" onClick={() => navigate("/attendance/daily")} />
              <QuickAction label="Monthly Sheet"    icon={CalendarDays}  color="bg-indigo-500"  onClick={() => navigate("/attendance/monthly")} />
              <QuickAction label="Student Report"   icon={GraduationCap} color="bg-teal-500"    onClick={() => navigate("/attendance/student")} />
              <QuickAction label="Teacher Report"   icon={Users}         color="bg-violet-500"  onClick={() => navigate("/attendance/teacher")} />
              <QuickAction label="Class Report"     icon={Layers}        color="bg-amber-500"   onClick={() => navigate("/attendance/class")} />
              <QuickAction label="Analytics"        icon={BarChart2}     color="bg-rose-500"    onClick={() => navigate("/attendance/reports")} />
            </div>
          </Card>

          {/* Today's teachers */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">Teacher Attendance Today</h2>
            </div>
            <div className="space-y-1.5">
              {TEACHERS_REF.map((t) => {
                const rec = todayTeachers.find((r) => r.teacherId === t.id);
                const status = rec?.status ?? "present";
                const dot: Record<string, string> = {
                  present:"bg-emerald-500", absent:"bg-rose-500",
                  late:"bg-amber-500", "half-day":"bg-blue-500", leave:"bg-violet-500",
                };
                return (
                  <div key={t.id} className="flex items-center gap-2 text-[12px]">
                    <span className={cn("h-2 w-2 rounded-full shrink-0", dot[status])} />
                    <span className="flex-1 text-foreground truncate">{t.name}</span>
                    <span className={cn("text-[10px] font-semibold capitalize",
                      status === "present" ? "text-emerald-600" :
                      status === "absent"  ? "text-rose-600" :
                      status === "late"    ? "text-amber-600" :
                      status === "half-day"? "text-blue-600"  : "text-violet-600"
                    )}>
                      {status === "half-day" ? "H/D" : status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Stats chips */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[14px] font-semibold text-foreground">July Progress</h2>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Working days so far</span>
                <span className="font-semibold text-foreground">{workingDaysSoFar}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly rate</span>
                <span className="font-semibold text-emerald-600">{ATTENDANCE_STATS.monthlyRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Week trend</span>
                <span className={cn("font-semibold flex items-center gap-0.5",
                  ATTENDANCE_STATS.weeklyTrend >= 0 ? "text-emerald-600" : "text-rose-600"
                )}>
                  {ATTENDANCE_STATS.weeklyTrend >= 0
                    ? <TrendingUp className="h-3 w-3" />
                    : <TrendingDown className="h-3 w-3" />}
                  {ATTENDANCE_STATS.weeklyTrend >= 0 ? "+" : ""}{ATTENDANCE_STATS.weeklyTrend}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Holiday this month</span>
                <span className="font-semibold text-violet-600">1 (Jul 17)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
