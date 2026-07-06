import { Users, UserCheck, UserX, Clock, CalendarOff, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ATTENDANCE_STATS } from "@/data/attendanceData";
import { cn } from "@/lib/utils";

interface StatCard {
  label:  string;
  value:  string | number;
  sub?:   string;
  icon:   React.FC<{ className?: string }>;
  color:  string;
  bgCls:  string;
}

const CARDS: StatCard[] = [
  {
    label: "Present Today",
    value: ATTENDANCE_STATS.todayPresent,
    sub:   "out of 26 students",
    icon:  UserCheck,
    color: "text-emerald-600",
    bgCls: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    label: "Absent Today",
    value: ATTENDANCE_STATS.todayAbsent,
    sub:   "students absent",
    icon:  UserX,
    color: "text-rose-600",
    bgCls: "bg-rose-50 dark:bg-rose-950/30",
  },
  {
    label: "Late Arrivals",
    value: ATTENDANCE_STATS.todayLate,
    sub:   "arrived late today",
    icon:  Clock,
    color: "text-amber-600",
    bgCls: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    label: "On Leave",
    value: ATTENDANCE_STATS.todayLeave,
    sub:   `half-day: ${ATTENDANCE_STATS.todayHalfDay}`,
    icon:  CalendarOff,
    color: "text-violet-600",
    bgCls: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    label: "Monthly Rate",
    value: `${ATTENDANCE_STATS.monthlyRate}%`,
    sub:   "July 2026",
    icon:  TrendingUp,
    color: "text-teal-600",
    bgCls: "bg-teal-50 dark:bg-teal-950/30",
  },
  {
    label: "Total Students",
    value: 26,
    sub:   "2 classes tracked",
    icon:  Users,
    color: "text-indigo-600",
    bgCls: "bg-indigo-50 dark:bg-indigo-950/30",
  },
];

export function AttendanceSummaryCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map((c) => (
        <Card key={c.label} className="p-4 flex flex-col gap-2">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", c.bgCls)}>
            <c.icon className={cn("h-4 w-4", c.color)} />
          </div>
          <p className={cn("text-2xl font-bold", c.color)}>{c.value}</p>
          <div>
            <p className="text-[12px] font-medium text-foreground leading-tight">{c.label}</p>
            {c.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}
