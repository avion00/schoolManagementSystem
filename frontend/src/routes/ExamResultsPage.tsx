import { useState, useMemo } from "react";
import { Award, BarChart2, ListChecks, Percent, TrendingUp, Users } from "lucide-react";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { Reveal } from "@/components/motion";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { ExamResultsTable } from "@/components/exams/ExamResultsTable";
import { GradeBadge }       from "@/components/exams/GradeBadge";
import { EXAM_RESULTS, EXAM_TERM_OPTIONS, CLASS_OPTIONS, SECTION_OPTIONS } from "@/data/examsData";
import { cn } from "@/lib/utils";

type SortField = "rank" | "studentName" | "roll" | "totalMarks" | "percentage" | "gpa";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 15;

const SPARK = {
  up: [{ value: 28 }, { value: 29 }, { value: 30 }, { value: 31 }, { value: 32 }, { value: 33 }, { value: 34 }],
  upSlow: [{ value: 70 }, { value: 71 }, { value: 72 }, { value: 71 }, { value: 73 }, { value: 74 }, { value: 75 }],
  flat: [{ value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }, { value: 3 }],
};

// Grade distribution
function gradeDistribution(results: typeof EXAM_RESULTS) {
  const dist: Record<string, number> = {};
  results.forEach((r) => { dist[r.grade] = (dist[r.grade] ?? 0) + 1; });
  return dist;
}

export function ExamResultsPage() {
  const [term,    setTerm]    = useState<string>("First Term");
  const [cls,     setCls]     = useState<string>("Grade 6");
  const [section, setSection] = useState<string>("A");
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);

  function handleSort(field: string) {
    const f = field as SortField;
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  }

  const filtered = useMemo(() =>
    EXAM_RESULTS.filter((r) => {
      if (term    && r.examTerm   !== term)    return false;
      if (cls     && r.className  !== cls)     return false;
      if (section && r.section    !== section) return false;
      return true;
    }),
  [term, cls, section]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortField], bv = b[sortField];
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const passCount   = filtered.filter((r) => r.result === "Pass").length;
  const failCount   = filtered.filter((r) => r.result === "Fail").length;
  const avgPct      = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.percentage, 0) / filtered.length) : 0;
  const avgGpa      = filtered.length ? (filtered.reduce((s, r) => s + r.gpa, 0) / filtered.length).toFixed(2) : "—";
  const dist        = gradeDistribution(filtered);
  const gradeOrder  = ["A+","A","B+","B","C+","C","F"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Published results for {filtered.length} students
        </p>
      </Reveal>

      {/* Filters */}
      <PremiumCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <PremiumSelect
            value={term}
            onChange={(v) => { setTerm(v); setPage(1); }}
            className="w-40"
            placeholder="All Terms"
            options={EXAM_TERM_OPTIONS.map((t) => ({ value: t, label: t }))}
          />
          <PremiumSelect
            value={cls}
            onChange={(v) => { setCls(v); setPage(1); }}
            className="w-36"
            placeholder="All Classes"
            options={CLASS_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
          <PremiumSelect
            value={section}
            onChange={(v) => { setSection(v); setPage(1); }}
            className="w-36"
            placeholder="All Sections"
            options={SECTION_OPTIONS.map((s) => ({ value: s, label: `Section ${s}` }))}
          />
          <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} results</span>
        </div>
      </PremiumCard>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPITrendCard
          label="Total Students"
          value={filtered.length}
          icon={Users}
          iconCls={METRIC_TONES.blue}
          trend={{ value: "+4.2%", up: true, compareLabel: "vs last term" }}
          sparklineData={SPARK.up}
          sparklineColor={CATEGORICAL_COLORS[0]}
        />
        <KPITrendCard
          label="Pass / Fail"
          value={`${passCount} / ${failCount}`}
          icon={ListChecks}
          iconCls={METRIC_TONES.purple}
          trend={{
            value: passCount >= failCount ? "+3.0%" : "-3.0%",
            up: passCount >= failCount,
            compareLabel: "pass rate vs last term",
          }}
          sparklineData={SPARK.flat}
          sparklineColor={CATEGORICAL_COLORS[4]}
        />
        <KPITrendCard
          label="Average %"
          value={`${avgPct}%`}
          icon={Percent}
          iconCls={METRIC_TONES.amber}
          trend={{ value: "+1.6%", up: true, compareLabel: "vs last term" }}
          sparklineData={SPARK.upSlow}
          sparklineColor={STATUS_COLORS.warning}
        />
        <KPITrendCard
          label="Avg GPA"
          value={avgGpa}
          icon={Award}
          iconCls={METRIC_TONES.cyan}
          trend={{ value: "+0.8%", up: true, compareLabel: "vs last term" }}
          sparklineData={SPARK.upSlow}
          sparklineColor={CATEGORICAL_COLORS[5]}
        />
      </div>

      {/* Grade distribution */}
      {filtered.length > 0 && (
        <PremiumCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[13px] font-semibold text-foreground">Grade Distribution</h2>
          </div>
          <div className="flex items-end gap-3 h-24">
            {gradeOrder.map((g) => {
              const count = dist[g] ?? 0;
              const pct   = filtered.length ? (count / filtered.length) * 100 : 0;
              return (
                <div key={g} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] text-muted-foreground">{count}</span>
                  <div
                    className={cn("w-full rounded-t transition-all",
                      g === "F" ? "bg-rose-400" : g === "A+" ? "bg-emerald-500" : "bg-indigo-400")}
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
        />
      </PremiumCard>
    </div>
  );
}
