import { Users, UserCheck, UserX, Clock, CalendarOff, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { ATTENDANCE_STATS } from "@/data/attendanceData";

const SPARK = {
  present:  [{ value: 22 }, { value: 23 }, { value: 24 }, { value: 23 }, { value: 25 }, { value: 24 }, { value: 25 }],
  absent:   [{ value: 3 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 1 }, { value: 2 }, { value: 1 }],
  late:     [{ value: 2 }, { value: 3 }, { value: 2 }, { value: 2 }, { value: 3 }, { value: 2 }, { value: 2 }],
  leave:    [{ value: 1 }, { value: 1 }, { value: 2 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
  rate:     [{ value: 84 }, { value: 85 }, { value: 87 }, { value: 86 }, { value: 88 }, { value: 89 }, { value: 90 }],
  students: [{ value: 24 }, { value: 25 }, { value: 25 }, { value: 26 }, { value: 26 }, { value: 26 }, { value: 26 }],
};

const CARDS = [
  {
    label: "Present Today", value: ATTENDANCE_STATS.todayPresent, icon: UserCheck, tone: METRIC_TONES.green,
    sparkColor: STATUS_COLORS.good, sparkData: SPARK.present,
    trend: { value: "+3.2%", up: true, compareLabel: "out of 26 students" },
  },
  {
    label: "Absent Today", value: ATTENDANCE_STATS.todayAbsent, icon: UserX, tone: METRIC_TONES.red,
    sparkColor: STATUS_COLORS.critical, sparkData: SPARK.absent,
    trend: { value: "-1.5%", up: false, compareLabel: "students absent" },
  },
  {
    label: "Late Arrivals", value: ATTENDANCE_STATS.todayLate, icon: Clock, tone: METRIC_TONES.amber,
    sparkColor: STATUS_COLORS.warning, sparkData: SPARK.late,
    trend: { value: "+0.5%", up: true, compareLabel: "arrived late today" },
  },
  {
    label: "On Leave", value: ATTENDANCE_STATS.todayLeave, icon: CalendarOff, tone: METRIC_TONES.purple,
    sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.leave,
    trend: { value: "0.0%", up: true, compareLabel: `half-day: ${ATTENDANCE_STATS.todayHalfDay}` },
  },
  {
    label: "Monthly Rate", value: `${ATTENDANCE_STATS.monthlyRate}%`, icon: TrendingUp, tone: METRIC_TONES.cyan,
    sparkColor: CATEGORICAL_COLORS[5], sparkData: SPARK.rate,
    trend: { value: "+1.4%", up: true, compareLabel: "July 2026" },
  },
  {
    label: "Total Students", value: 26, icon: Users, tone: METRIC_TONES.blue,
    sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.students,
    trend: { value: "0.0%", up: true, compareLabel: "2 classes tracked" },
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
            trend={c.trend}
            sparklineData={c.sparkData}
            sparklineColor={c.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
