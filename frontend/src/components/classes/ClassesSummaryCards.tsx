import { Layers, Rows3, GraduationCap, User, Armchair } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { ClassData } from "@/api/types/classes";


export function ClassesSummaryCards({ classes }: { classes: ClassData[] }) {
  const capacity = classes.reduce((n, c) => n + (c.totalCapacity ?? 0), 0);
  const students = classes.reduce((n, c) => n + c.totalStudents, 0);
  const CLASS_STATS = {
    totalClasses: classes.length,
    totalSections: classes.reduce((n, c) => n + c.sections.length, 0),
    totalStudents: students,
    totalTeachers: classes.reduce((n, c) => n + c.sections.filter((sec) => sec.classTeacher).length, 0),
    availableSeats: capacity ? Math.max(capacity - students, 0) : "—",
  };
  const stats = [
    {
      label: "Total Classes", value: CLASS_STATS.totalClasses, icon: Layers, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Total Sections", value: CLASS_STATS.totalSections, icon: Rows3, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Total Students", value: CLASS_STATS.totalStudents, icon: GraduationCap, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Class Teachers", value: CLASS_STATS.totalTeachers, icon: User, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Available Seats", value: CLASS_STATS.availableSeats, icon: Armchair, tone: METRIC_TONES.cyan,
      sparkColor: CATEGORICAL_COLORS[5],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
