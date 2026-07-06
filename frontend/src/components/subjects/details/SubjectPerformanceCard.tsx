import { BarChart2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectPerformance } from "@/data/subjectDetailData";

const MEDALS = ["bg-yellow-400 text-yellow-900","bg-slate-300 text-slate-700","bg-amber-600 text-amber-50"];

const CLASS_COLORS = [
  "bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-teal-500",
];

function scoreColor(v: number) {
  if (v >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (v >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function StatChip({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-lg px-3 py-2 ${cls}`}>
      <span className="text-[15px] font-bold leading-tight">{value}</span>
      <span className="text-[10px] font-medium opacity-80">{label}</span>
    </div>
  );
}

export function SubjectPerformanceCard({ perf }: { perf: SubjectPerformance }) {
  const maxAvg = Math.max(...perf.classWise.map((c) => c.average));

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
          Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* stat chips */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatChip label="Class Average"  value={`${perf.averageScore}%`}  cls="bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" />
          <StatChip label="Highest Marks"  value={`${perf.highestMarks}`}   cls="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" />
          <StatChip label="Pass Rate"      value={`${perf.passRate}%`}      cls="bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" />
          <StatChip label="Needs Attention" value={`${perf.needsImprovement}`} cls="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" />
        </div>

        <div className="h-px bg-border/60" />

        {/* class-wise bars */}
        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Average by Class
          </p>
          <div className="space-y-2">
            {perf.classWise.map((c, i) => (
              <div key={c.className} className="space-y-0.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-foreground font-medium">{c.className}</span>
                  <span className={`font-semibold ${scoreColor(c.average)}`}>{c.average}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div
                    className={`h-1.5 rounded-full ${CLASS_COLORS[i % CLASS_COLORS.length]}`}
                    style={{ width: `${(c.average / maxAvg) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border/60" />

        {/* top students */}
        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Top Performers</p>
          <div className="space-y-2">
            {perf.topStudents.map((s, i) => (
              <div key={s.name} className="flex items-center gap-2.5">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${i < 3 ? MEDALS[i] : "bg-muted text-muted-foreground"}`}>
                  {i + 1}
                </div>
                <span className="flex-1 text-[12.5px] font-medium text-foreground">{s.name}</span>
                <span className="text-[11px] text-muted-foreground">{s.className} {s.section}</span>
                <span className={`text-[12px] font-bold ${scoreColor(s.marks)}`}>{s.marks}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
