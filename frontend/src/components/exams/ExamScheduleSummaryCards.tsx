import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardCheck, DoorOpen, Users } from "lucide-react";

import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { ExamSchedule } from "@/api/types/exams";


export function ExamScheduleSummaryCards({ schedules, conflicts }: { schedules: ExamSchedule[]; conflicts: number }) {
  const stats = [
    {
      label: "Scheduled", value: schedules.filter((e) => e.status === "scheduled").length,
      icon: CalendarClock, tone: METRIC_TONES.blue,
    },
    {
      label: "Published", value: schedules.filter((e) => e.status === "published").length,
      icon: CheckCircle2, tone: METRIC_TONES.green,
    },
    {
      label: "Completed", value: schedules.filter((e) => e.status === "completed").length,
      icon: ClipboardCheck, tone: METRIC_TONES.purple,
    },
    {
      label: "Exam Rooms", value: new Set(schedules.map((e) => e.room).filter(Boolean)).size,
      icon: DoorOpen, tone: METRIC_TONES.amber,
    },
    {
      label: "Invigilators", value: new Set(schedules.flatMap((e) => [e.invigilator, e.assistantInvigilator]).filter(Boolean)).size,
      icon: Users, tone: METRIC_TONES.cyan,
    },
    {
      label: "Conflicts", value: conflicts,
      icon: AlertTriangle, tone: conflicts > 0 ? METRIC_TONES.red : METRIC_TONES.neutral,
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
          />
        </Reveal>
      ))}
    </div>
  );
}
