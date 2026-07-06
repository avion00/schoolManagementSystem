import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GradeBadge } from "@/components/exams/GradeBadge";
import type { ExamResult } from "@/data/examsData";
import { cn } from "@/lib/utils";

interface Props { result: ExamResult; }

export function ReportCardPreview({ result }: Props) {
  return (
    <div className="space-y-3">
      {/* Print button */}
      <div className="flex justify-end print:hidden">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print Report Card
        </Button>
      </div>

      {/* A4 card */}
      <div
        id="report-card-print"
        className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-white dark:bg-background shadow-lg overflow-hidden text-[12px]"
        style={{ fontFamily: "serif" }}
      >
        {/* Header */}
        <div className="bg-indigo-700 text-white px-8 py-6 text-center">
          <p className="text-[11px] tracking-widest uppercase opacity-80">Excellence in Education</p>
          <h1 className="text-xl font-bold mt-1">SchoolOS Academy</h1>
          <p className="text-[11px] opacity-80 mt-0.5">Kathmandu, Nepal · Tel: 01-441-xxxx</p>
          <div className="mt-4 inline-block rounded-full border-2 border-white/60 px-6 py-1 text-sm font-bold tracking-wide uppercase">
            Progress Report Card
          </div>
        </div>

        {/* Student info */}
        <div className="px-8 py-5 border-b border-border/40 bg-muted/20">
          <div className="grid grid-cols-2 gap-x-8 gap-y-1.5">
            <InfoRow label="Student Name"  value={result.studentName}    />
            <InfoRow label="Academic Year" value={result.academicYear}   />
            <InfoRow label="Reg. No."      value={result.registrationNo} />
            <InfoRow label="Exam Term"     value={result.examTerm}       />
            <InfoRow label="Class"         value={`${result.className} – ${result.section}`} />
            <InfoRow label="Roll No."      value={String(result.roll)}   />
            <InfoRow label="Adm. No."      value={result.admissionNo}    />
            <InfoRow label="Issue Date"    value={result.publishedDate}  />
          </div>
        </div>

        {/* Marks table */}
        <div className="px-8 py-5">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b-2 border-foreground/20">
                <th className="pb-2 text-left font-semibold text-foreground">Subject</th>
                <th className="pb-2 text-center font-semibold text-foreground">Full Marks</th>
                <th className="pb-2 text-center font-semibold text-foreground">Obtained</th>
                <th className="pb-2 text-center font-semibold text-foreground">%</th>
                <th className="pb-2 text-center font-semibold text-foreground">Grade</th>
                <th className="pb-2 text-center font-semibold text-foreground">Points</th>
              </tr>
            </thead>
            <tbody>
              {result.subjectResults.map((s) => {
                const pct = Math.round((s.obtainedMarks / s.fullMarks) * 1000) / 10;
                return (
                  <tr key={s.subject} className="border-b border-border/20">
                    <td className="py-1.5 text-foreground">{s.subject}</td>
                    <td className="py-1.5 text-center text-muted-foreground">{s.fullMarks}</td>
                    <td className="py-1.5 text-center font-semibold text-foreground">{s.obtainedMarks}</td>
                    <td className="py-1.5 text-center text-muted-foreground">{pct}%</td>
                    <td className="py-1.5 text-center"><GradeBadge grade={s.grade} /></td>
                    <td className="py-1.5 text-center font-semibold text-indigo-600">{s.gradePoint.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-foreground/30 bg-muted/20">
                <td className="py-2 font-bold text-foreground">TOTAL</td>
                <td className="py-2 text-center font-bold">{result.totalFullMarks}</td>
                <td className="py-2 text-center font-bold text-foreground">{result.totalMarks}</td>
                <td className="py-2 text-center font-bold">{result.percentage}%</td>
                <td className="py-2 text-center"><GradeBadge grade={result.grade} /></td>
                <td className="py-2 text-center font-bold text-indigo-600">{result.gpa.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Summary */}
        <div className="px-8 pb-5">
          <div className="grid grid-cols-4 gap-3 mb-4">
            <SumCard label="Percentage" value={`${result.percentage}%`} />
            <SumCard label="GPA"        value={result.gpa.toFixed(2)}   />
            <SumCard label="Class Rank" value={`#${result.rank}`}       />
            <SumCard label="Result"     value={result.result} color={result.result === "Pass" ? "emerald" : "rose"} />
          </div>

          {/* Teacher remarks */}
          <div className="rounded-lg border border-border/40 bg-muted/20 p-3 mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Teacher's Remarks</p>
            <p className="text-foreground italic">"{result.teacherRemarks}"</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 mt-6">
            {["Class Teacher", "Principal", "Parent/Guardian"].map((title) => (
              <div key={title} className="text-center">
                <div className="h-10 border-b border-foreground/30" />
                <p className="text-[10px] mt-1 text-muted-foreground">{title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 px-8 py-3 border-t border-border/40 text-center">
          <p className="text-[10px] text-muted-foreground">
            This is a computer-generated report card. Published on {result.publishedDate}. Contact the school for any discrepancies.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground w-28 shrink-0">{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}

function SumCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className={cn(
      "rounded-lg border p-3 text-center",
      color === "emerald" ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20" :
      color === "rose"    ? "border-rose-200 bg-rose-50 dark:bg-rose-950/20" :
      "border-border/40 bg-muted/20",
    )}>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-bold mt-0.5",
        color === "emerald" ? "text-emerald-700" :
        color === "rose"    ? "text-rose-700"    : "text-foreground",
      )}>{value}</p>
    </div>
  );
}
