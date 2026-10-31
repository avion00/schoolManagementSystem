import { useState } from "react";
import { PenLine } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { MarksEntryTable } from "@/components/exams/MarksEntryTable";
import { EMPTY_SELECTION, ExamPicker, useSelection, type ExamSelection } from "@/components/exams/ExamPicker";
import { useGradeScales, useMarksSheet } from "@/api/exams";
import { errorMessage } from "@/api/http";

export function MarksEntryPage() {
  const [sel, setSel] = useState<ExamSelection>(EMPTY_SELECTION);
  const { exam, paper } = useSelection(sel);
  const sheet = useMarksSheet(sel.subject || undefined);
  const scale = useGradeScales().data?.find((s) => s.id === exam?.gradeScaleId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Marks Entry</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Select an exam, class, and subject to enter student marks
        </p>
      </Reveal>

      {/* Selector panel */}
      <PremiumCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <PenLine className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">Select Paper</h2>
        </div>
        <ExamPicker value={sel} onChange={setSel} mode="subject" />

        {paper && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-4 py-3 text-[12px]">
            {paper.examId && <span><span className="text-muted-foreground">Exam ID:</span> <strong>{paper.examId}</strong></span>}
            <span><span className="text-muted-foreground">Date:</span> <strong>{paper.date || "Not set"}</strong></span>
            {paper.startTime && <span><span className="text-muted-foreground">Time:</span> <strong>{paper.startTime} – {paper.endTime}</strong></span>}
            {paper.room && <span><span className="text-muted-foreground">Room:</span> <strong>{paper.room}</strong></span>}
            <span><span className="text-muted-foreground">Full Marks:</span> <strong>{paper.fullMarks}</strong></span>
            <span><span className="text-muted-foreground">Pass Marks:</span> <strong>{paper.passMarks}</strong></span>
          </div>
        )}
      </PremiumCard>

      {/* Marks table */}
      {sheet.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {sheet.isError && <PremiumEmptyState title="Couldn't load the marks sheet" description={errorMessage(sheet.error)} />}
      {sheet.data && paper && (
        sheet.data.rows.length === 0 ? (
          <PremiumEmptyState title="No students to grade"
            description="There are no active students in this class that you can enter marks for." />
        ) : (
          <PremiumCard className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <PenLine className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-semibold text-foreground">
                {paper.subject} · {paper.className} · {exam?.name}
              </h2>
            </div>
            <MarksEntryTable sheet={sheet.data} scale={scale} />
          </PremiumCard>
        )
      )}

      {/* Empty state */}
      {!sel.subject && (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <PenLine className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-[14px] font-medium text-foreground">No paper selected</p>
          <p className="text-[12px] text-muted-foreground mt-1">Pick an exam, class, and subject. Papers are created on the Exam Schedule page.</p>
        </div>
      )}
    </div>
  );
}
