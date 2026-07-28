import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardCheck, DoorOpen, Users } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { EXAM_CONFLICT_COUNT, type ExamSchedule } from "@/data/examsData";

const SPARK = {
  up: [{ value: 10 }, { value: 11 }, { value: 11 }, { value: 12 }, { value: 13 }, { value: 13 }, { value: 14 }],
  upSlow: [{ value: 6 }, { value: 6 }, { value: 7 }, { value: 7 }, { value: 8 }, { value: 8 }, { value: 9 }],
  upSharp: [{ value: 3 }, { value: 4 }, { value: 5 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 9 }],
  flat: [{ value: 5 }, { value: 6 }, { value: 5 }, { value: 6 }, { value: 6 }, { value: 5 }, { value: 6 }],
  down: [{ value: 6 }, { value: 5 }, { value: 5 }, { value: 4 }, { value: 3 }, { value: 3 }, { value: 2 }],
};

export function ExamScheduleSummaryCards({ schedules }: { schedules: ExamSchedule[] }) {
  const conflicts = EXAM_CONFLICT_COUNT;
  const stats = [
    {
      label: "Scheduled", value: schedules.filter((e) => e.status === "scheduled").length,
      icon: CalendarClock, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.up,
      trend: { value: "+5.0%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Published", value: schedules.filter((e) => e.status === "published").length,
      icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.upSlow,
      trend: { value: "+3.4%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Completed", value: schedules.filter((e) => e.status === "completed").length,
      icon: ClipboardCheck, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4], sparkData: SPARK.upSharp,
      trend: { value: "+8.2%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Exam Rooms", value: new Set(schedules.map((e) => e.room)).size,
      icon: DoorOpen, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.flat,
      trend: { value: "0.0%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Invigilators", value: new Set(schedules.map((e) => e.invigilator)).size,
      icon: Users, tone: METRIC_TONES.cyan,
      sparkColor: CATEGORICAL_COLORS[5], sparkData: SPARK.upSlow,
      trend: { value: "+1.5%", up: true, compareLabel: "vs last term" },
    },
    {
      label: "Conflicts", value: conflicts,
      icon: AlertTriangle, tone: conflicts > 0 ? METRIC_TONES.red : METRIC_TONES.neutral,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.down,
      trend: { value: "-6.0%", up: false, compareLabel: "vs last term" },
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 40}>
          <KPITrendCard
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconCls={s.tone}
            trend={s.trend}
            sparklineData={s.sparkData}
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
