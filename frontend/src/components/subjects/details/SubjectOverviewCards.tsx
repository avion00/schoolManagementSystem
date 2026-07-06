import { BookOpen, GraduationCap, Users, Clock, BarChart2, CheckCircle2, AlertTriangle, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SubjectData }  from "@/data/subjectsData";
import type { SubjectDetailMock } from "@/data/subjectDetailData";

interface Props { sub: SubjectData; mock: SubjectDetailMock }

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string | number;
  sub?: string; color: string;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">{label}</p>
            <p className="text-[15px] font-bold text-foreground leading-tight">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressCard({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-muted-foreground">{label}</p>
          <p className="text-[13px] font-bold text-foreground">{pct}%</p>
        </div>
        <div className="h-1.5 rounded-full bg-muted">
          <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">{value} / {max}</p>
      </CardContent>
    </Card>
  );
}

export function SubjectOverviewCards({ sub, mock }: Props) {
  const totalStudents = mock.classMappings.reduce((a, m) => a + m.students, 0);
  const activeMappings = mock.classMappings.filter((m) => m.status === "active").length;
  const completed = mock.syllabusUnits.filter((u) => u.status === "Completed").length;
  const totalPeriods = mock.syllabusUnits.reduce((a, u) => a + u.estimatedPeriods, 0);
  const donePeriods  = mock.syllabusUnits.filter((u) => u.status === "Completed").reduce((a, u) => a + u.estimatedPeriods, 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon={Layers}       label="Assigned Classes" value={activeMappings}      sub={`${sub.assignedClasses.length} grade groups`} color="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400" />
      <StatCard icon={Users}        label="Teachers Assigned" value={mock.teachers.length} sub="primary + assistants"                        color="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" />
      <StatCard icon={GraduationCap}label="Total Students"   value={totalStudents}       sub="across all sections"                          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" />
      <StatCard icon={Clock}        label="Weekly Periods"   value={sub.weeklyPeriods}   sub={`${sub.examDuration} exam`}                   color="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400" />
      <StatCard icon={BookOpen}     label="Syllabus Units"   value={`${completed} / ${mock.syllabusUnits.length}`} sub="units completed"  color="bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400" />
      <StatCard icon={BarChart2}    label="Class Average"    value={`${mock.performance.averageScore}%`} sub="last examination"           color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400" />
      <StatCard icon={CheckCircle2} label="Pass Rate"        value={`${mock.performance.passRate}%`}     sub="passing students"           color="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400" />
      <StatCard icon={AlertTriangle}label="Needs Improvement" value={mock.performance.needsImprovement} sub="students flagged"            color="bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400" />
      <ProgressCard label="Syllabus Progress" value={donePeriods} max={totalPeriods}           color="bg-violet-500" />
      <ProgressCard label="Pass Rate"         value={mock.performance.passRate} max={100}      color="bg-emerald-500" />
    </div>
  );
}
