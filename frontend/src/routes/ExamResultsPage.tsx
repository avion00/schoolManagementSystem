import { useState, useMemo } from "react";
import { BarChart2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ExamResultsTable } from "@/components/exams/ExamResultsTable";
import { GradeBadge }       from "@/components/exams/GradeBadge";
import { EXAM_RESULTS, EXAM_TERM_OPTIONS, CLASS_OPTIONS, SECTION_OPTIONS } from "@/data/examsData";
import { cn } from "@/lib/utils";

function Sel({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-2.5 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

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

  const filtered = useMemo(() =>
    EXAM_RESULTS.filter((r) => {
      if (term    && r.examTerm   !== term)    return false;
      if (cls     && r.className  !== cls)     return false;
      if (section && r.section    !== section) return false;
      return true;
    }),
  [term, cls, section]);

  const passCount   = filtered.filter((r) => r.result === "Pass").length;
  const failCount   = filtered.filter((r) => r.result === "Fail").length;
  const avgPct      = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.percentage, 0) / filtered.length) : 0;
  const avgGpa      = filtered.length ? (filtered.reduce((s, r) => s + r.gpa, 0) / filtered.length).toFixed(2) : "—";
  const dist        = gradeDistribution(filtered);
  const gradeOrder  = ["A+","A","B+","B","C+","C","F"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Exam Results</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Published results for {filtered.length} students
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Sel label="All Terms"    value={term}    options={EXAM_TERM_OPTIONS as unknown as string[]} onChange={setTerm}    />
          <Sel label="All Classes"  value={cls}     options={CLASS_OPTIONS}                             onChange={setCls}     />
          <Sel label="All Sections" value={section} options={SECTION_OPTIONS}                           onChange={setSection} />
          <span className="ml-auto text-[11px] text-muted-foreground">{filtered.length} results</span>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total Students</p>
          <p className="text-2xl font-bold text-foreground mt-1">{filtered.length}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Pass / Fail</p>
          <p className="text-2xl font-bold mt-1">
            <span className="text-emerald-600">{passCount}</span>
            <span className="text-muted-foreground text-[14px] mx-1">/</span>
            <span className="text-rose-600">{failCount}</span>
          </p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Average %</p>
          <p className="text-2xl font-bold text-foreground mt-1">{avgPct}%</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Avg GPA</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{avgGpa}</p>
        </Card>
      </div>

      {/* Grade distribution */}
      {filtered.length > 0 && (
        <Card className="p-5">
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
        </Card>
      )}

      {/* Results table */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">Student Results</h2>
        </div>
        <ExamResultsTable results={filtered} />
      </Card>
    </div>
  );
}
