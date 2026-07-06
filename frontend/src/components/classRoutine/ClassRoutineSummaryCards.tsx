import { AlertTriangle, BookOpen, CalendarCheck, Clock, Users2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RoutineStats {
  total: number;
  activeClasses: number;
  teachers: number;
  weeklyPeriods: number;
  freePeriods: number;
  conflicts: number;
}

function StatCard({
  icon: Icon, label, value, sub, color, highlight,
}: {
  icon: React.ElementType; label: string; value: number | string;
  sub?: string; color: string; highlight?: boolean;
}) {
  return (
    <Card className={`border-border/60 shadow-sm transition-all hover:shadow-md ${highlight ? "ring-1 ring-rose-400/40" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground truncate">{label}</p>
            <p className={`text-[22px] font-bold leading-tight ${highlight ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ClassRoutineSummaryCards({ stats }: { stats: RoutineStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard icon={BookOpen}      label="Total Entries"      value={stats.total}         color="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400" sub="all shifts" />
      <StatCard icon={CalendarCheck} label="Active Classes"     value={stats.activeClasses} color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"       sub="class-sections" />
      <StatCard icon={Users2}        label="Teachers Assigned"  value={stats.teachers}      color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" sub="distinct" />
      <StatCard icon={Zap}           label="Weekly Periods"     value={stats.weeklyPeriods} color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"   sub="active only" />
      <StatCard icon={Clock}         label="Free Periods"       value={stats.freePeriods}   color="bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400"       sub="unassigned" />
      <StatCard icon={AlertTriangle} label="Conflicts Detected" value={stats.conflicts}     color={stats.conflicts > 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" : "bg-muted text-muted-foreground"} highlight={stats.conflicts > 0} sub={stats.conflicts > 0 ? "needs review" : "all clear"} />
    </div>
  );
}
