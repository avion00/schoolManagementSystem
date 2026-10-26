import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardCheck, DoorOpen, Users } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { EXAM_CONFLICT_COUNT, type ExamSchedule } from "@/data/examsData";


export function ExamScheduleSummaryCards({ schedules }: { schedules: ExamSchedule[] }) {
  const conflicts = EXAM_CONFLICT_COUNT;
  const stats = [
    {
      label: "Scheduled", value: schedules.filter((e) => e.status === "scheduled").length,
      icon: CalendarClock, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Published", value: schedules.filter((e) => e.status === "published").length,
      icon: CheckCircle2, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Completed", value: schedules.filter((e) => e.status === "completed").length,
      icon: ClipboardCheck, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Exam Rooms", value: new Set(schedules.map((e) => e.room)).size,
      icon: DoorOpen, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Invigilators", value: new Set(schedules.map((e) => e.invigilator)).size,
      icon: Users, tone: METRIC_TONES.cyan,
      sparkColor: CATEGORICAL_COLORS[5],
    },
    {
      label: "Conflicts", value: conflicts,
      icon: AlertTriangle, tone: conflicts > 0 ? METRIC_TONES.red : METRIC_TONES.neutral,
      sparkColor: STATUS_COLORS.critical,
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
            sparklineColor={s.sparkColor}
          />
        </Reveal>
      ))}
    </div>
  );
}
