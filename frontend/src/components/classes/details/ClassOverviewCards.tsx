import { BookOpen, CalendarCheck, ClipboardList, GraduationCap, Layers, Wallet } from "lucide-react";
import type { ClassData } from "@/data/classesData";
import type { ClassDetailMock } from "@/data/classDetailData";

function OverviewCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Layers; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className={`flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm ${color}`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-current/10">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="mt-0.5 text-[11px] font-medium opacity-70">{label}</p>
        {sub && <p className="mt-1 text-[10px] opacity-50">{sub}</p>}
      </div>
    </div>
  );
}

function ProgressCard({ label, value, max, color = "bg-primary" }: {
  label: string; value: number; max: number; color?: string;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">{label}</p>
        <p className="text-[13px] font-semibold text-foreground">{pct}%</p>
      </div>
      <p className="mt-1 text-xl font-bold text-foreground">{value}<span className="text-[13px] font-normal text-muted-foreground"> / {max}</span></p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ClassOverviewCards({ cls, mock }: { cls: ClassData; mock: ClassDetailMock }) {
  const { attendance, performance, fees, exams } = mock;
  const upcomingExams = exams.filter((e) => e.status === "Upcoming").length;
  const dueFeesK = Math.round((fees.due + fees.overdue) / 1000);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <OverviewCard icon={GraduationCap} label="Total Students"   value={cls.totalStudents}  color="text-blue-600 dark:text-blue-400" />
      <OverviewCard icon={Layers}        label="Active Sections"  value={cls.sections.length} color="text-violet-600 dark:text-violet-400" />
      <OverviewCard icon={CalendarCheck} label="Attendance Avg"   value={`${attendance.presentPct}%`} sub={`${attendance.totalDays} school days`} color="text-emerald-600 dark:text-emerald-400" />
      <OverviewCard icon={BookOpen}      label="Active Subjects"  value={cls.subjects.filter((s)=>s.status==="active").length} color="text-amber-600 dark:text-amber-400" />
      <ProgressCard label="Capacity Used"    value={cls.totalStudents} max={cls.totalCapacity} color="bg-blue-500" />
      <ProgressCard label="Class Average"    value={performance.classAverage} max={100} color="bg-violet-500" />
      <OverviewCard icon={Wallet}        label="Due Fees"         value={`NPR ${dueFeesK}K`} color="text-rose-600 dark:text-rose-400" />
      <OverviewCard icon={ClipboardList} label="Upcoming Exams"  value={upcomingExams} color="text-orange-600 dark:text-orange-400" />
    </div>
  );
}
