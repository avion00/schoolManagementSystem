import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeacherPerformance } from "@/data/teacherDetailsData";

function MetricBar({
  label,
  value,
  max = 100,
  color = "bg-primary",
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {max === 5 ? `${value}/5` : `${value}%`}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function TeacherPerformanceCard({ perf }: { perf: TeacherPerformance }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <MetricBar label="Teaching Rating"      value={perf.teachingRating}        max={5}   color="bg-violet-500" />
          <MetricBar label="Student Feedback"     value={perf.studentFeedbackScore}  max={100} color="bg-blue-500"   />
          <MetricBar label="Lesson Completion"    value={perf.lessonCompletionPct}   max={100} color="bg-emerald-500" />
          <MetricBar label="Exam Pass Rate"       value={perf.examPassRatePct}       max={100} color="bg-amber-500"  />
          <MetricBar label="Punctuality"          value={perf.punctualityScore}      max={100} color="bg-primary"    />
        </div>

        {/* Strengths */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Strengths
          </p>
          <div className="flex flex-wrap gap-1.5">
            {perf.strengths.map((s) => (
              <span
                key={s}
                className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Improvement areas */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Areas for Improvement
          </p>
          <div className="flex flex-wrap gap-1.5">
            {perf.improvements.map((s) => (
              <span
                key={s}
                className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
