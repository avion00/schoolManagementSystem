import { useState } from "react";
import { CreditCard } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { AdmitCardPreview } from "@/components/exams/AdmitCardPreview";
import { EMPTY_SELECTION, ExamPicker, useSelection, type ExamSelection } from "@/components/exams/ExamPicker";
import { useAdmitCards } from "@/api/exams";
import { errorMessage } from "@/api/http";

export function AdmitCardsPage() {
  const [sel, setSel] = useState<ExamSelection>(EMPTY_SELECTION);
  const [studentId, setStudentId] = useState<string>("");
  const { exam } = useSelection(sel);
  const query = useAdmitCards(sel.exam || undefined, sel.classLevel || undefined, sel.section || undefined);

  const availableStudents = query.data?.cards ?? [];
  const examSchedules = query.data?.schedule ?? [];
  const selected = availableStudents.find((r) => r.studentId === studentId) ?? (availableStudents[0] ?? null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admit Cards</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Generate and print student admit cards for examinations</p>
      </div>

      {/* Selector panel */}
      <PremiumCard className="p-5 print:hidden">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">Select Parameters</h2>
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
              options={availableStudents.map((r) => ({ value: r.studentId, label: `${r.roll ? `${r.roll}. ` : ""}${r.name}` }))}
            />
          </div>
        </div>

        {/* Info chips */}
        {query.data && (
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-muted px-3 py-1">{examSchedules.length} subjects scheduled</span>
            <span className="rounded-full bg-muted px-3 py-1">{availableStudents.length} students</span>
            {examSchedules.some((s) => !s.date) && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Some papers have no date yet</span>
            )}
          </div>
        )}
      </PremiumCard>

      {query.isLoading && <PremiumSkeleton className="h-96 w-full rounded-2xl" />}
      {query.isError && <PremiumEmptyState title="Couldn't load admit cards" description={errorMessage(query.error)} />}

      {/* Student quick-switch */}
      {availableStudents.length > 1 && (
        <PremiumCard className="p-4 print:hidden">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Click to switch student
          </p>
          <div className="flex flex-wrap gap-2">
            {availableStudents.map((r) => (
              <button key={r.studentId}
                onClick={() => setStudentId(r.studentId)}
                className={`rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${
                  selected?.studentId === r.studentId
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-neutral-200/80 hover:bg-muted/30 text-foreground dark:border-neutral-800"
                }`}>
                {r.roll ? `${r.roll}. ` : ""}{r.name}
              </button>
            ))}
          </div>
        </PremiumCard>
      )}

      {/* Admit card */}
      {selected && exam ? (
        <AdmitCardPreview
          student={selected}
          schedules={examSchedules}
          term={[exam.name, exam.term].filter(Boolean).join(" · ")}
          year={exam.academicYear}
          instructions={exam.instructions || undefined}
        />
      ) : query.isSuccess || !sel.classLevel ? (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-[14px] font-medium text-foreground">No admit card</p>
          <p className="text-[12px] text-muted-foreground mt-1">Select an exam and a class with active students.</p>
        </div>
      ) : null}
    </div>
  );
}
