import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChildAcademic } from "@/data/parentDetailsData";

function pctColor(p: number) {
  if (p >= 85) return "text-emerald-600 dark:text-emerald-400";
  if (p >= 65) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function Bar({ value, color = "bg-primary" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
    </div>
  );
}

const HOMEWORK_CFG = {
  "Up to date":  { label: "Up to date",  cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" },
  "1 pending":   { label: "1 pending",   cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" },
  "2 pending":   { label: "2 pending",   cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400" },
  "3+ pending":  { label: "3+ pending",  cls: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" },
};

export function ParentChildrenAcademicCard({ academicData }: { academicData: ChildAcademic[] }) {
  if (academicData.length === 0) {
    return (
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-[14px] font-semibold">Academic Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">No academic data available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Children Academic Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {academicData.map((child) => {
          const hw = HOMEWORK_CFG[child.homeworkStatus];
          return (
            <div key={child.studentId} className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{child.name}</p>
                  <p className="text-[11px] text-muted-foreground">{child.className} · Section {child.section}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${hw.cls}`}>{hw.label}</span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {/* Attendance */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className={`font-semibold ${pctColor(child.attendancePct)}`}>{child.attendancePct}%</span>
                  </div>
                  <Bar value={child.attendancePct} color="bg-blue-500" />
                </div>
                {/* Latest Exam */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-muted-foreground">Last Exam</span>
                    <span className={`font-semibold ${pctColor(child.latestExamPct)}`}>{child.latestExamPct}%</span>
                  </div>
                  <Bar value={child.latestExamPct} color="bg-violet-500" />
                </div>
              </div>

              {/* Summary row */}
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-muted/40 p-3 text-center text-[12px]">
                <div>
                  <p className="font-bold text-foreground">#{child.classRank}</p>
                  <p className="text-muted-foreground">Class Rank</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{child.upcomingExams}</p>
                  <p className="text-muted-foreground">Upcoming Exams</p>
                </div>
                <div>
                  <p className="font-bold text-foreground">{child.resultPublished}</p>
                  <p className="text-muted-foreground">Results Out</p>
                </div>
              </div>

              {/* Behavior note */}
              <p className="text-[12px] italic text-muted-foreground">"{child.behaviorNote}"</p>

              {/* Divider */}
              {academicData.indexOf(child) < academicData.length - 1 && (
                <div className="border-t border-border/40" />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
