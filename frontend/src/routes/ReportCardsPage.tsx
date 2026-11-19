import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { ReportCardPreview } from "@/components/exams/ReportCardPreview";
import { EMPTY_SELECTION, ExamPicker, useSelection, type ExamSelection } from "@/components/exams/ExamPicker";
import { useExamResults } from "@/api/exams";
import { errorMessage } from "@/api/http";

export function ReportCardsPage() {
  const [params] = useSearchParams();
  const [sel, setSel] = useState<ExamSelection>({
    ...EMPTY_SELECTION, exam: params.get("exam") ?? "", classLevel: params.get("class") ?? "",
  });
  const [studentId, setStudentId] = useState<string>(params.get("student") ?? "");
  const { exam } = useSelection(sel);
  const results = useExamResults(exam, sel.classLevel || undefined, sel.section || undefined);

  const availableStudents = [...(results.data?.rows ?? [])]
    .sort((a, b) => (a.rank ?? 1e9) - (b.rank ?? 1e9) || a.studentName.localeCompare(b.studentName));
  const selected = availableStudents.find((r) => r.studentId === studentId) ?? (availableStudents[0] ?? null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Report Cards</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Generate and print student progress report cards</p>
      </div>

      {/* Selector panel */}
      <PremiumCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">Select Report</h2>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <ExamPicker value={sel} onChange={(v) => { setSel(v); setStudentId(""); }} mode="section" />
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Student</label>
            <PremiumSelect
              value={selected?.studentId ?? ""}
              onChange={setStudentId}
              disabled={availableStudents.length === 0}
              placeholder="Select student"
              className="w-56"
              options={availableStudents.map((r) => ({ value: r.studentId, label: `${r.roll ? `${r.roll}. ` : ""}${r.studentName}` }))}
            />
          </div>
        </div>
        {exam && !exam.isPublished && (
          <p className="mt-3 text-[12px] text-amber-600">
            Results for this exam aren't published yet. This is a draft report card.
          </p>
        )}
      </PremiumCard>

      {results.isLoading && <PremiumSkeleton className="h-96 w-full rounded-2xl" />}
      {results.isError && <PremiumEmptyState title="Couldn't load results" description={errorMessage(results.error)} />}

      {/* Student list (mini, for quick switch) */}
      {availableStudents.length > 1 && (
        <PremiumCard className="p-4 print:hidden">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {availableStudents.length} students · click to switch
          </p>
          <div className="flex flex-wrap gap-2">
            {availableStudents.map((r) => (
              <button
                key={r.studentId}
                onClick={() => setStudentId(r.studentId)}
                className={`rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${
                  selected?.studentId === r.studentId
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-neutral-200/80 hover:bg-muted/30 text-foreground dark:border-neutral-800"
                }`}
              >
                {r.rank !== null ? `#${r.rank} ` : ""}{r.studentName}
              </button>
            ))}
          </div>
        </PremiumCard>
      )}

      {/* Report card */}
      {selected && exam ? (
        <ReportCardPreview result={selected} examId={exam.id} examName={exam.name} />
      ) : results.isSuccess || !sel.classLevel ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-[14px] font-medium text-foreground">No report card</p>
          <p className="text-[12px] text-muted-foreground mt-1">Select an exam and a class that has students.</p>
        </div>
      ) : null}
    </div>
  );
}
