import { Users, UserCheck, UserX, Clock, CalendarOff, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { ATTENDANCE_STATS } from "@/data/attendanceData";


const CARDS = [
  {
    label: "Present Today", value: ATTENDANCE_STATS.todayPresent, icon: UserCheck, tone: METRIC_TONES.green,
    sparkColor: STATUS_COLORS.good,
  },
  {
    label: "Absent Today", value: ATTENDANCE_STATS.todayAbsent, icon: UserX, tone: METRIC_TONES.red,
    sparkColor: STATUS_COLORS.critical,
  },
  {
    label: "Late Arrivals", value: ATTENDANCE_STATS.todayLate, icon: Clock, tone: METRIC_TONES.amber,
    sparkColor: STATUS_COLORS.warning,
  },
  {
    label: "On Leave", value: ATTENDANCE_STATS.todayLeave, icon: CalendarOff, tone: METRIC_TONES.purple,
    sparkColor: CATEGORICAL_COLORS[4],
    trend: { value: "0.0%", up: true, compareLabel: `half-day: ${ATTENDANCE_STATS.todayHalfDay}` },
  },
  {
    label: "Monthly Rate", value: `${ATTENDANCE_STATS.monthlyRate}%`, icon: TrendingUp, tone: METRIC_TONES.cyan,
    sparkColor: CATEGORICAL_COLORS[5],
  },
  {
    label: "Total Students", value: 26, icon: Users, tone: METRIC_TONES.blue,
    sparkColor: CATEGORICAL_COLORS[0],
  },
];

export function AttendanceSummaryCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map((c, i) => (
        <Reveal key={c.label} delay={i * 40}>
          <KPITrendCard
            label={c.label}
            value={c.value}
            icon={c.icon}
            iconCls={c.tone}
            sparklineColor={c.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
