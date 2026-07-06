import { ClipboardList } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExamMeta, ExamScore } from "@/data/studentDetailsData";
import { cn } from "@/lib/utils";

function GradeChip({ grade }: { grade: string }) {
  const color =
    grade === "A+" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
    grade.startsWith("A")  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" :
    grade.startsWith("B")  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" :
    "bg-rose-500/10 text-rose-700 dark:text-rose-400";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", color)}>
      {grade}
    </span>
  );
}

function bar(obtained: number, full: number) {
  const pct = (obtained / full) * 100;
  const col = pct >= 85 ? "bg-emerald-500" : pct >= 70 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", col)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-7 text-right text-[11px] tabular-nums text-muted-foreground">{obtained}</span>
    </div>
  );
}

interface Props {
  scores: ExamScore[];
  meta: ExamMeta;
}

export function StudentScoresCard({ scores, meta }: Props) {
  const resultColor =
    meta.result === "Pass"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
      : "bg-rose-500/10 text-rose-700 dark:text-rose-400";

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            {meta.name}
            <span className="text-xs font-normal text-muted-foreground">({meta.year})</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">GPA:</span>
            <span className="text-sm font-bold text-foreground">{meta.gpa.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">Score:</span>
            <span className="text-sm font-bold text-foreground">{meta.percentage}%</span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", resultColor)}>
              {meta.result}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subject</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Marks</TableHead>
                <TableHead className="min-w-[160px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">Obtained</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Grade</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">GP</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map((s) => (
                <TableRow key={s.subject}>
                  <TableCell className="font-medium">{s.subject}</TableCell>
                  <TableCell className="text-muted-foreground">{s.fullMarks}</TableCell>
                  <TableCell>{bar(s.obtained, s.fullMarks)}</TableCell>
                  <TableCell><GradeChip grade={s.grade} /></TableCell>
                  <TableCell className="tabular-nums text-sm">{s.gradePoint.toFixed(1)}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[11px] font-medium",
                      s.remarks === "Excellent" ? "text-emerald-600 dark:text-emerald-400" :
                      s.remarks === "Good" ? "text-blue-600 dark:text-blue-400" :
                      s.remarks === "Satisfactory" ? "text-amber-600 dark:text-amber-400" :
                      "text-rose-600 dark:text-rose-400",
                    )}>
                      {s.remarks}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals row */}
        <div className="mt-3 flex flex-wrap items-center gap-6 rounded-xl border border-border/60 bg-muted/30 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <Stat label="Marks"      value={`${meta.obtained} / ${meta.totalMarks}`} />
          <Stat label="Percentage" value={`${meta.percentage}%`} />
          <Stat label="GPA"        value={meta.gpa.toFixed(2)} />
          <Stat label="Term"       value={meta.term} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </span>
  );
}
