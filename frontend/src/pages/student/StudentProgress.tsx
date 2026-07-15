import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentProgressCharts } from "@/components/student/StudentProgressCharts";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { homeworkAssignments, progressInsights, subjects, type ProgressInsight } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const INSIGHT_ICON: Record<ProgressInsight["type"], LucideIcon> = {
  positive: CheckCircle2, warning: AlertTriangle, info: Info,
};
const INSIGHT_STYLE: Record<ProgressInsight["type"], string> = {
  positive: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  info: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
};

export function StudentProgress() {
  const done = homeworkAssignments.filter((h) => h.status === "Submitted" || h.status === "Graded").length;
  const homeworkPct = Math.round((done / homeworkAssignments.length) * 100);
  const strongest = [...subjects].sort((a, b) => b.latestMarks - a.latestMarks)[0];
  const weakest = [...subjects].sort((a, b) => a.latestMarks - b.latestMarks)[0];

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">My Progress</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Track your improvement across attendance, marks, and homework.</p>
      </Reveal>

      <Reveal delay={40} className="grid gap-3 sm:grid-cols-3">
        <PremiumCard className="p-4">
          <p className="text-[11.5px] font-medium text-muted-foreground">Homework completion</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{homeworkPct}%</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted/60">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${homeworkPct}%` }} />
          </div>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="text-[11.5px] font-medium text-muted-foreground">Strongest subject</p>
          <p className="mt-1 text-[15px] font-semibold text-foreground">{strongest.name}</p>
          <p className="text-[11.5px] text-muted-foreground">{strongest.latestMarks}/{strongest.latestFullMarks} marks</p>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="text-[11.5px] font-medium text-muted-foreground">Needs attention</p>
          <p className="mt-1 text-[15px] font-semibold text-foreground">{weakest.name}</p>
          <p className="text-[11.5px] text-muted-foreground">{weakest.latestMarks}/{weakest.latestFullMarks} marks</p>
        </PremiumCard>
      </Reveal>

      <Reveal delay={80}>
        <StudentProgressCharts />
      </Reveal>

      <Reveal delay={120}>
        <p className="mb-2 text-[13px] font-semibold text-foreground">Smart insights</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {progressInsights.map((insight) => {
            const Icon = INSIGHT_ICON[insight.type];
            return (
              <PremiumCard key={insight.id} className="flex items-center gap-3 p-3.5">
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", INSIGHT_STYLE[insight.type])}>
                  <Icon className="h-4 w-4" />
                </span>
                <p className="text-[12.5px] text-foreground">{insight.text}</p>
              </PremiumCard>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
