import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, Award, BarChart2, CalendarDays,
  CreditCard, FileText, PenLine, Plus, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card }   from "@/components/ui/card";
import { ExamSummaryCards } from "@/components/exams/ExamSummaryCards";
import { ExamStatusBadge }  from "@/components/exams/ExamStatusBadge";
import { GradeBadge }       from "@/components/exams/GradeBadge";
import {
  EXAM_SCHEDULES, EXAM_RESULTS, GRADE_SCALE, EXAM_STATS,
} from "@/data/examsData";
import { cn } from "@/lib/utils";

// ── Derived datasets ──────────────────────────────────────────────────────────
const upcomingExams = EXAM_SCHEDULES
  .filter((e) => ["scheduled", "published"].includes(e.status))
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(0, 6);

const pendingMarks = EXAM_SCHEDULES
  .filter((e) => e.status === "completed" && !e.marksEntered)
  .slice(0, 5);

const recentResults = EXAM_RESULTS.slice(0, 5);

const classPerf = [
  { className: "Grade 6 A", passRate: 90, avgGpa: 3.12, students: 35 },
  { className: "Grade 7 A", passRate: 82, avgGpa: 2.95, students: 33 },
  { className: "Grade 8 A", passRate: 88, avgGpa: 3.05, students: 31 },
  { className: "Grade 9 A", passRate: 76, avgGpa: 2.78, students: 30 },
];

// ─── Sub-components ──────────────────────────────────────────────────────────
function SectionHeader({ title, viewPath, icon: Icon }: { title: string; viewPath?: string; icon: React.FC<{className?: string}> }) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[14px] font-semibold text-foreground">{title}</h2>
      </div>
      {viewPath && (
        <button onClick={() => navigate(viewPath)}
          className="text-[11px] text-primary hover:underline font-medium">View all →</button>
      )}
    </div>
  );
}

function QuickAction({ label, icon: Icon, color, onClick }: {
  label: string; icon: React.FC<{className?: string}>; color: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-4 text-center hover:bg-muted/40 transition-colors">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl text-white", color)}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-[11px] font-medium text-foreground leading-tight">{label}</span>
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function ExamsDashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exam Management</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Academic Year 2026/27 · Manage schedules, marks, results, and reports</p>
        </div>
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={() => navigate("/exams/schedule/new")}>
          <Plus className="h-3.5 w-3.5" />Add Exam
        </Button>
      </div>

      {/* KPI summary cards */}
      <ExamSummaryCards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Exams */}
          <Card className="p-5">
            <SectionHeader title="Upcoming Exams" viewPath="/exams/schedule" icon={CalendarDays} />
            {upcomingExams.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-6">No upcoming exams scheduled.</p>
            ) : (
              <div className="space-y-2">
                {upcomingExams.map((ex) => (
                  <div key={ex.id}
                    onClick={() => navigate(`/exams/schedule/${ex.id}`)}
                    className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-muted/30 cursor-pointer transition-colors group">
                    {/* Date badge */}
                    <div className="shrink-0 w-12 text-center rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800 py-1">
                      <p className="text-[10px] text-indigo-500 font-medium">{ex.date.split("-")[1]}/{ex.date.split("-")[0]}</p>
                      <p className="text-[16px] font-bold text-indigo-700 dark:text-indigo-300 leading-none">{ex.date.split("-")[2]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-foreground truncate">{ex.subject}</p>
                      <p className="text-[11px] text-muted-foreground">{ex.className} {ex.section} · {ex.startTime} – {ex.endTime} · {ex.room}</p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <ExamStatusBadge status={ex.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Marks Entry */}
          {pendingMarks.length > 0 && (
            <Card className="p-5">
              <SectionHeader title="Pending Marks Entry" viewPath="/exams/marks-entry" icon={PenLine} />
              <div className="space-y-2">
                {pendingMarks.map((ex) => (
                  <div key={ex.id}
                    className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/20 p-3">
                    <div>
                      <p className="text-[12px] font-medium text-foreground">{ex.subject}</p>
                      <p className="text-[11px] text-muted-foreground">{ex.className} {ex.section} · {ex.examId} · {ex.date}</p>
                    </div>
                    <Button size="sm" variant="outline"
                      className="h-7 text-[11px] border-amber-300 text-amber-700 hover:bg-amber-100"
                      onClick={() => navigate("/exams/marks-entry")}>
                      Enter Marks
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Class Performance */}
          <Card className="p-5">
            <SectionHeader title="Class Performance" icon={BarChart2} />
            <div className="space-y-3">
              {classPerf.map((cp) => (
                <div key={cp.className}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-foreground">{cp.className}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-muted-foreground">GPA <strong className="text-foreground">{cp.avgGpa}</strong></span>
                      <span className={cn("font-semibold", cp.passRate >= 85 ? "text-emerald-600" : "text-amber-600")}>{cp.passRate}% pass</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", cp.passRate >= 85 ? "bg-emerald-500" : "bg-amber-500")}
                      style={{ width: `${cp.passRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column: 1/3 */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-5">
            <h2 className="text-[14px] font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction label="Add Exam"      icon={Plus}        color="bg-indigo-500" onClick={() => navigate("/exams/schedule/new")} />
              <QuickAction label="Marks Entry"   icon={PenLine}     color="bg-amber-500"  onClick={() => navigate("/exams/marks-entry")} />
              <QuickAction label="View Results"  icon={BarChart2}   color="bg-emerald-500" onClick={() => navigate("/exams/results")} />
              <QuickAction label="Report Cards"  icon={FileText}    color="bg-violet-500" onClick={() => navigate("/exams/report-cards")} />
              <QuickAction label="Admit Cards"   icon={CreditCard}  color="bg-teal-500"   onClick={() => navigate("/exams/admit-cards")} />
              <QuickAction label="Grade Scales"  icon={Award}       color="bg-rose-500"   onClick={() => navigate("/exams/grades")} />
            </div>
          </Card>

          {/* Recent Results */}
          <Card className="p-5">
            <SectionHeader title="Recent Results" viewPath="/exams/results" icon={TrendingUp} />
            <div className="space-y-2">
              {recentResults.map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                  {/* Rank medal */}
                  <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                    r.rank === 1 ? "bg-amber-400 text-white" :
                    r.rank === 2 ? "bg-slate-400 text-white" :
                    r.rank === 3 ? "bg-orange-400 text-white" : "bg-muted text-muted-foreground")}>
                    {r.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-foreground truncate">{r.studentName}</p>
                    <p className="text-[10px] text-muted-foreground">{r.percentage}% · GPA {r.gpa.toFixed(2)}</p>
                  </div>
                  <GradeBadge grade={r.grade} />
                </div>
              ))}
            </div>
          </Card>

          {/* Grade Scale summary */}
          <Card className="p-5">
            <SectionHeader title="Grade Scale" viewPath="/exams/grades" icon={Award} />
            <div className="space-y-1.5">
              {GRADE_SCALE.map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <GradeBadge grade={g.gradeName} />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full"
                      style={{ width: `${((g.percentUpto - g.percentFrom) / 100) * 100}%`, marginLeft: `${g.percentFrom}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground w-16 text-right">{g.percentFrom}–{g.percentUpto}%</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Conflict warning */}
          {EXAM_STATS.conflicts > 0 && (
            <Card className="p-5 border-rose-200 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-rose-700 dark:text-rose-300">
                    {EXAM_STATS.conflicts} Schedule Conflict{EXAM_STATS.conflicts > 1 ? "s" : ""}
                  </p>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
                    Invigilator assigned to multiple exams at the same time.
                  </p>
                  <Button size="sm" variant="outline"
                    className="mt-2 h-7 text-[11px] border-rose-300 text-rose-700 hover:bg-rose-100"
                    onClick={() => navigate("/exams/schedule")}>
                    Review Conflicts
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
