import { useState, useMemo } from "react";
import { Award, BarChart2, ListChecks, Lock, LockOpen, Percent, Send, TrendingUp, Undo2, Users } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { ExamResultsTable } from "@/components/exams/ExamResultsTable";
import { GradeBadge }       from "@/components/exams/GradeBadge";
import { EMPTY_SELECTION, ExamPicker, useSelection, type ExamSelection } from "@/components/exams/ExamPicker";
import { missingMarks, useExamResults, useExamTransition, useGradeScales } from "@/api/exams";
import { errorMessage } from "@/api/http";
import type { ExamResult } from "@/api/types/exams";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type SortField = "rank" | "studentName" | "roll" | "totalMarks" | "percentage" | "gpa";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 15;

export function ExamResultsPage() {
  const [sel, setSel] = useState<ExamSelection>(EMPTY_SELECTION);
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const { exam } = useSelection(sel);
  const query = useExamResults(exam, sel.classLevel || undefined, sel.section || undefined);
  const scale = useGradeScales().data?.find((s) => s.id === exam?.gradeScaleId);
  const transition = useExamTransition();
  const { hasPermission } = useAuth();

  function handleSort(field: string) {
    const f = field as SortField;
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  }

  function run(action: "lock" | "unlock" | "publish" | "unpublish", force = false) {
    if (!exam) return;
    transition.mutate({ id: exam.id, action, force }, {
      onSuccess: () => toast.success({
        lock: "Marks locked.", unlock: "Marks unlocked.", publish: "Results published. Students and parents have been notified.",
        unpublish: "Results unpublished.",
      }[action]),
      onError: (e) => {
        const gaps = missingMarks(e);
        if (gaps && action === "publish") {
          const list = gaps.map((g) => `${g.subject} (${g.className}): ${g.missing} missing`).join("\n");
          if (window.confirm(`Some marks are missing:\n\n${list}\n\nPublish anyway?`)) run("publish", true);
          return;
        }
        toast.error(errorMessage(e));
      },
    });
  }

  const filtered = useMemo(() => query.data?.rows ?? [], [query.data]);

  const sorted = useMemo(() => {
    const key = (r: ExamResult): string | number | null => sortField === "studentName" ? r.studentName : r[sortField];
    return [...filtered].sort((a, b) => {
      const av = key(a), bv = key(b);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;   // unranked / missing always last
      if (bv === null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv), undefined, { numeric: true })
        : String(bv).localeCompare(String(av), undefined, { numeric: true });
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const graded      = filtered.filter((r) => r.result === "Pass" || r.result === "Fail");
  const passCount   = filtered.filter((r) => r.result === "Pass").length;
  const failCount   = filtered.filter((r) => r.result === "Fail").length;
  const pcts        = graded.map((r) => r.percentage).filter((v): v is number => v !== null);
  const gpas        = graded.map((r) => r.gpa).filter((v): v is number => v !== null);
  const avgPct      = pcts.length ? `${Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length)}%` : "—";
  const avgGpa      = gpas.length ? (gpas.reduce((s, v) => s + v, 0) / gpas.length).toFixed(2) : "—";
  const gradeOrder  = [...(scale?.bands ?? [])].map((b) => b.gradeName);
  const dist: Record<string, number> = {};
  graded.forEach((r) => { if (r.grade) dist[r.grade] = (dist[r.grade] ?? 0) + 1; });
  const failGrades  = new Set((scale?.bands ?? []).filter((b) => b.resultStatus === "Fail").map((b) => b.gradeName));

  const stateLabel = !exam ? "" : exam.isPublished ? "Published" : exam.isLocked ? "Marks locked" : "Open for marks entry";

  return (
    <div className="space-y-5">
      {/* Header */}
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Ranked results computed from entered marks. Workflow: enter marks → lock → publish.
        </p>
      </Reveal>

      {/* Filters + workflow */}
      <PremiumCard className="p-4 space-y-3">
        <ExamPicker value={sel} onChange={(v) => { setSel(v); setPage(1); }} mode="section" />
        {exam && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              exam.isPublished ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : exam.isLocked ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-muted text-muted-foreground")}>
              {stateLabel}
            </span>
            {exam.publishedAt && <span className="text-[11px] text-muted-foreground">on {exam.publishedAt.slice(0, 10)}</span>}
            <div className="ml-auto flex flex-wrap gap-2">
              {hasPermission("exam.marks.lock") && !exam.isPublished && (
                exam.isLocked ? (
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" disabled={transition.isPending} onClick={() => run("unlock")}>
                    <LockOpen className="h-3.5 w-3.5" />Unlock marks
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" disabled={transition.isPending}
                    onClick={() => window.confirm("Lock marks? Teachers won't be able to change them until unlocked.") && run("lock")}>
                    <Lock className="h-3.5 w-3.5" />Lock marks
                  </Button>
                )
              )}
              {hasPermission("exam.result.publish") && exam.isLocked && (
                exam.isPublished ? (
                  <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" disabled={transition.isPending}
                    onClick={() => window.confirm("Unpublish results? Students and parents will no longer see them.") && run("unpublish")}>
                    <Undo2 className="h-3.5 w-3.5" />Unpublish
                  </Button>
                ) : (
                  <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={transition.isPending}
                    onClick={() => window.confirm("Publish results to students and parents?") && run("publish")}>
                    <Send className="h-3.5 w-3.5" />Publish results
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </PremiumCard>

      {query.isError && <PremiumEmptyState title="Couldn't load results" description={errorMessage(query.error)} />}
      {query.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}

      {query.isSuccess && (<>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPITrendCard label="Students" value={filtered.length} icon={Users} iconCls={METRIC_TONES.blue} />
        <KPITrendCard label="Pass / Fail" value={`${passCount} / ${failCount}`} icon={ListChecks} iconCls={METRIC_TONES.purple} />
        <KPITrendCard label="Average %" value={avgPct} icon={Percent} iconCls={METRIC_TONES.amber} />
        <KPITrendCard label="Avg GPA" value={avgGpa} icon={Award} iconCls={METRIC_TONES.cyan} />
      </div>

      {/* Grade distribution */}
      {graded.length > 0 && gradeOrder.length > 0 && (
        <PremiumCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[13px] font-semibold text-foreground">Grade Distribution</h2>
          </div>
          <div className="flex items-end gap-3 h-24">
            {gradeOrder.map((g, i) => {
              const count = dist[g] ?? 0;
              const pct   = (count / graded.length) * 100;
              return (
                <div key={g} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] text-muted-foreground">{count}</span>
                  <div
                    className={cn("w-full rounded-t transition-all",
                      failGrades.has(g) ? "bg-rose-400" : i === 0 ? "bg-emerald-500" : "bg-indigo-400")}
                    style={{ height: `${Math.max(4, pct)}%` }}
                  />
                  <GradeBadge grade={g} />
                </div>
              );
            })}
          </div>
        </PremiumCard>
      )}

      {/* Results table */}
      <PremiumCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">Student Results</h2>
        </div>
        <ExamResultsTable
          results={paginated}
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
          pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: setPage, itemLabel: "results" }}
          reportLink={(r) => `/exams/report-cards?exam=${sel.exam}&class=${sel.classLevel}&student=${r.studentId}`}
        />
      </PremiumCard>
      </>)}
    </div>
  );
}
