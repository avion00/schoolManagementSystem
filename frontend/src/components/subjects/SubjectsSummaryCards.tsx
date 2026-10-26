import { BookOpen, CheckSquare, ListChecks, FlaskConical, Users, Layers } from "lucide-react";

import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import type { SubjectData } from "@/api/types/subjects";


export function SubjectsSummaryCards({ subjects }: { subjects: SubjectData[] }) {
  const SUBJECT_STATS = {
    total: subjects.length,
    compulsory: subjects.filter((x) => x.category === "Compulsory").length,
    optional: subjects.filter((x) => x.category === "Optional").length,
    practical: subjects.filter((x) => x.type !== "Theory").length,
    teachers: new Set(subjects.map((x) => x.primaryTeacher?.id).filter(Boolean)).size,
    classes: new Set(subjects.flatMap((x) => x.assignedClasses)).size,
  };
  const stats = [
    {
      label: "Total Subjects", value: SUBJECT_STATS.total, icon: BookOpen, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
    {
      label: "Compulsory", value: SUBJECT_STATS.compulsory, icon: CheckSquare, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Optional", value: SUBJECT_STATS.optional, icon: ListChecks, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Practical", value: SUBJECT_STATS.practical, icon: FlaskConical, tone: METRIC_TONES.purple,
      sparkColor: CATEGORICAL_COLORS[4],
    },
    {
      label: "Teachers", value: SUBJECT_STATS.teachers, icon: Users, tone: METRIC_TONES.cyan,
      sparkColor: CATEGORICAL_COLORS[5],
    },
    {
      label: "Classes Covered", value: SUBJECT_STATS.classes, icon: Layers, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
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
