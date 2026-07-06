import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformanceSummary } from "@/data/classDetailData";

const SUBJECT_COLORS = [
  "bg-blue-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-orange-500",
];

function StatChip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`rounded-xl p-4 text-center ${color}`}>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px] opacity-70">{label}</p>
    </div>
  );
}

export function ClassPerformanceCard({ perf }: { perf: PerformanceSummary }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Academic Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Top stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatChip label="Class Average"    value={`${perf.classAverage}%`} color="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400" />
          <StatChip label="Highest Score"    value={`${perf.highestScore}%`} color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" />
          <StatChip label="Pass Rate"        value={`${perf.passPct}%`}      color="bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400" />
          <StatChip label="Needs Attention"  value={perf.needsImprovement}   color="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400" />
        </div>

        {/* Subject-wise */}
        <div>
          <p className="mb-3 text-[12px] font-medium text-muted-foreground">Subject-wise Average</p>
          <div className="space-y-2.5">
            {perf.subjectWise.map(({ subject, average }, i) => (
              <div key={subject} className="flex items-center gap-3 text-[12px]">
                <span className="w-32 shrink-0 text-muted-foreground truncate">{subject}</span>
                <div className="flex-1 overflow-hidden rounded-full h-2 bg-muted">
                  <div className={`h-full rounded-full ${SUBJECT_COLORS[i % SUBJECT_COLORS.length]}`}
                    style={{ width: `${average}%` }} />
                </div>
                <span className="font-semibold w-10 text-right text-foreground">{average}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 students */}
        <div>
          <p className="mb-3 text-[12px] font-medium text-muted-foreground">Top 5 Students</p>
          <div className="space-y-2">
            {perf.top5Students.map((s, i) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                  i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-muted-foreground"
                }`}>{i + 1}</div>
                <span className="flex-1 text-[12.5px] font-medium text-foreground">{s.name}</span>
                <span className="text-[11px] text-muted-foreground">Sec {s.section}</span>
                <span className="text-[12.5px] font-bold text-foreground">{s.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
