import { BookOpen, CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SyllabusUnit, SyllabusStatus } from "@/data/subjectDetailData";

const STATUS_CFG: Record<SyllabusStatus, { cls: string; icon: typeof CheckCircle2; label: string }> = {
  "Completed":   { cls: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2, label: "Completed"   },
  "In Progress": { cls: "text-amber-600 dark:text-amber-400",     icon: Clock,        label: "In Progress" },
  "Not Started": { cls: "text-muted-foreground",                  icon: Circle,       label: "Not Started" },
};

const STATUS_BAR: Record<SyllabusStatus, string> = {
  "Completed":   "bg-emerald-500",
  "In Progress": "bg-amber-500",
  "Not Started": "bg-muted",
};

export function SubjectSyllabusCard({ syllabusUnits }: { syllabusUnits: SyllabusUnit[] }) {
  const total     = syllabusUnits.reduce((a, u) => a + u.estimatedPeriods, 0);
  const completed = syllabusUnits.filter((u) => u.status === "Completed").reduce((a, u) => a + u.estimatedPeriods, 0);
  const inProg    = syllabusUnits.filter((u) => u.status === "In Progress").reduce((a, u) => a + u.estimatedPeriods, 0);
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Syllabus Progress
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">{syllabusUnits.length} units · {total} periods</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* overall bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Overall Completion</span>
            <span className="font-semibold text-foreground">{pct}% ({completed}/{total} periods)</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />Completed ({completed})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />In Progress ({inProg})</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-muted inline-block border border-border/60" />Not Started ({total - completed - inProg})</span>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* unit list */}
        <div className="space-y-3">
          {syllabusUnits.map((unit) => {
            const cfg = STATUS_CFG[unit.status];
            const Icon = cfg.icon;
            const unitPct = total > 0 ? Math.round((unit.estimatedPeriods / total) * 100) : 0;
            return (
              <div key={unit.id} className="space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.cls}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12.5px] font-medium text-foreground">
                        Unit {unit.unitNo}: {unit.title}
                      </p>
                      <span className={`shrink-0 text-[10px] font-semibold ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {unit.topics.join(" · ")}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 flex-1 rounded-full bg-muted">
                        <div className={`h-1 rounded-full ${STATUS_BAR[unit.status]}`} style={{ width: `${unitPct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{unit.estimatedPeriods} periods</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
