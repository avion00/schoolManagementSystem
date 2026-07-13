import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Reveal, SuccessCheck } from "@/components/motion";
import { MarksEntryTable, type MarksEntryValue } from "@/components/teacher/MarksEntryTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  assignedClasses,
  assignedStudents,
  marksPending,
  type MarksStatus,
} from "@/data/teacherDashboardData";

const STATUS_TONE: Record<MarksStatus, PremiumBadgeTone> = {
  Draft: "neutral",
  Submitted: "info",
  Approved: "success",
  Returned: "danger",
};

const EMPTY_VALUE: MarksEntryValue = { theory: "" as unknown as number, practical: "" as unknown as number, internal: "" as unknown as number, remarks: "" };

/** "Marks & Gradebook" entry workflow — teacher enters marks, saves a draft, or submits to admin/principal (who publish final results). */
export function TeacherMarks() {
  const [searchParams] = useSearchParams();
  const [classId, setClassId] = useState(searchParams.get("class") ?? assignedClasses[0].id);
  const availableExams = useMemo(() => marksPending.filter((m) => m.classId === classId), [classId]);
  const [examId, setExamId] = useState(availableExams[0]?.id ?? "");
  const [values, setValues] = useState<Record<number, MarksEntryValue>>({});
  const [bulkPractical, setBulkPractical] = useState("");
  const [bulkInternal, setBulkInternal] = useState("");
  const [saved, setSaved] = useState<"draft" | "submitted" | null>(null);

  const exam = marksPending.find((m) => m.id === examId) ?? availableExams[0];
  const students = useMemo(() => assignedStudents.filter((s) => s.classId === classId), [classId]);
  const missingCount = students.filter((s) => !values[s.id] || values[s.id].theory === ("" as unknown as number)).length;

  function handleClassChange(next: string) {
    setClassId(next);
    const exams = marksPending.filter((m) => m.classId === next);
    setExamId(exams[0]?.id ?? "");
    setValues({});
  }

  function handleFieldChange(studentId: number, field: keyof MarksEntryValue, value: string) {
    setValues((prev) => {
      const current = prev[studentId] ?? EMPTY_VALUE;
      if (field === "remarks") return { ...prev, [studentId]: { ...current, remarks: value } };
      const num = Math.max(0, Number(value) || 0);
      return { ...prev, [studentId]: { ...current, [field]: num } };
    });
  }

  function bulkFill(field: "practical" | "internal", raw: string) {
    const num = Math.max(0, Number(raw) || 0);
    setValues((prev) => {
      const next = { ...prev };
      for (const s of students) next[s.id] = { ...(next[s.id] ?? EMPTY_VALUE), [field]: num };
      return next;
    });
  }

  function handleSave(kind: "draft" | "submitted") {
    if (kind === "submitted" && missingCount > 0) {
      toast.error(`${missingCount} students still have no theory marks entered`);
      return;
    }
    setSaved(kind);
    toast.success(kind === "draft" ? "Marks saved as draft" : "Marks submitted to admin for approval");
    window.setTimeout(() => setSaved(null), 1800);
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Marks &amp; Gradebook</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Enter marks for your assigned classes — final publishing is done by admin/principal.</p>
        </div>
      </Reveal>

      <Reveal delay={60} className="flex flex-wrap items-center gap-3">
        <PremiumSelect value={classId} onChange={handleClassChange} className="w-56" options={assignedClasses.map((c) => ({ value: c.id, label: `${c.className} · ${c.section} — ${c.subject}` }))} />
        <PremiumSelect
          value={examId}
          onChange={setExamId}
          className="w-48"
          placeholder="Select exam"
          options={availableExams.map((e) => ({ value: e.id, label: e.exam }))}
        />
        {exam && <PremiumBadge label={exam.status} tone={STATUS_TONE[exam.status]} />}
        {missingCount > 0 && (
          <span className="flex items-center gap-1 text-[12px] text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-3.5 w-3.5" /> {missingCount} missing theory marks
          </span>
        )}
      </Reveal>

      {!exam ? (
        <PremiumCard className="p-8 text-center text-sm text-muted-foreground">
          No exam scheduled yet for this class. Check Exams.
        </PremiumCard>
      ) : (
        <Reveal delay={100}>
          <PremiumCard className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-2.5">
              <span className="text-[11.5px] font-medium text-muted-foreground">Bulk fill:</span>
              <Input value={bulkPractical} onChange={(e) => setBulkPractical(e.target.value)} placeholder="Practical" className="h-8 w-24 text-[12px]" />
              <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => bulkFill("practical", bulkPractical)}>Apply to all</Button>
              <Input value={bulkInternal} onChange={(e) => setBulkInternal(e.target.value)} placeholder="Internal" className="h-8 w-24 text-[12px]" />
              <Button size="sm" variant="outline" className="h-8 text-[11.5px]" onClick={() => bulkFill("internal", bulkInternal)}>Apply to all</Button>
            </div>

            <MarksEntryTable students={students} values={values} onFieldChange={handleFieldChange} />

            <div className="mt-4 flex items-center justify-end gap-3 border-t border-border/60 pt-4">
              {saved ? (
                <SuccessCheck size={40} label={saved === "draft" ? "Saved as draft" : "Submitted to admin"} />
              ) : (
                <>
                  <Button variant="outline" onClick={() => handleSave("draft")}>Save as draft</Button>
                  <Button onClick={() => handleSave("submitted")}>Submit to admin</Button>
                </>
              )}
            </div>
          </PremiumCard>
        </Reveal>
      )}
    </div>
  );
}
