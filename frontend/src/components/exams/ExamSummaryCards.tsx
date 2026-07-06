import { AlertTriangle, BarChart2, BookOpen, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EXAM_STATS, EXAM_RESULTS } from "@/data/examsData";
import { cn } from "@/lib/utils";

const EXAM_RESULTS_COUNT = EXAM_RESULTS.length;

interface StatCardProps {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; color: string; highlight?: boolean;
}
function StatCard({ label, value, sub, icon, color, highlight }: StatCardProps) {
  return (
    <Card className={cn(
      "flex items-center gap-4 p-4 shadow-sm",
      highlight && "ring-2 ring-rose-500/40",
    )}>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white", color)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-xl font-bold text-foreground leading-none mt-0.5">{value}</p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
}

export function ExamSummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      <StatCard label="Total Exams"       value={EXAM_STATS.total}            sub="Academic 2026/27"             icon={<BookOpen className="h-5 w-5" />}      color="bg-indigo-500"  />
      <StatCard label="Upcoming"          value={EXAM_STATS.upcoming}         sub="Scheduled / published"        icon={<Clock className="h-5 w-5" />}         color="bg-blue-500"    />
      <StatCard label="Completed"         value={EXAM_STATS.completed}        sub="All exams done"               icon={<CheckCircle2 className="h-5 w-5" />}  color="bg-emerald-500" />
      <StatCard label="Results Published" value={EXAM_STATS.resultsPublished} sub="Visible to students"          icon={<BarChart2 className="h-5 w-5" />}     color="bg-violet-500"  />
      <StatCard label="Pass Rate"         value={`${EXAM_STATS.passRate}%`}   sub={`${EXAM_RESULTS_COUNT} results`} icon={<TrendingUp className="h-5 w-5" />} color="bg-teal-500"    />
      <StatCard label="Conflicts"         value={EXAM_STATS.conflicts}        sub="Schedule conflicts"           icon={<AlertTriangle className="h-5 w-5" />} color={EXAM_STATS.conflicts > 0 ? "bg-rose-500" : "bg-slate-400"} highlight={EXAM_STATS.conflicts > 0} />
    </div>
  );
}
