import { useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { ReportCardPreview } from "@/components/exams/ReportCardPreview";
import { EXAM_RESULTS, EXAM_TERM_OPTIONS, CLASS_OPTIONS, SECTION_OPTIONS } from "@/data/examsData";

function Sel({ label, value, options, onChange, disabled, className }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean; className?: string;
}) {
  return (
    <PremiumSelect
      value={value}
      onChange={onChange}
      placeholder={label}
      disabled={disabled}
      className={className}
      options={options.map((o) => ({ value: o, label: o }))}
    />
  );
}

export function ReportCardsPage() {
  const [term,    setTerm]    = useState<string>("First Term");
  const [cls,     setCls]     = useState<string>("Grade 6");
  const [section, setSection] = useState<string>("A");
  const [studentId, setStudentId] = useState<string>("");

  const availableStudents = useMemo(() =>
    EXAM_RESULTS.filter((r) => {
      if (term    && r.examTerm  !== term)    return false;
      if (cls     && r.className !== cls)     return false;
      if (section && r.section   !== section) return false;
      return true;
    }).sort((a, b) => a.rank - b.rank),
  [term, cls, section]);

  const selected = availableStudents.find((r) => String(r.studentId) === studentId) ?? (availableStudents[0] ?? null);

  function onTermChange(v: string)  { setTerm(v);    setStudentId(""); }
  function onClsChange(v: string)   { setCls(v);     setStudentId(""); }
  function onSectionChange(v: string){ setSection(v); setStudentId(""); }

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
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Exam Term</label>
            <Sel label="Select term" value={term} options={EXAM_TERM_OPTIONS as unknown as string[]} onChange={onTermChange} className="w-44" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Class</label>
            <Sel label="Select class" value={cls} options={CLASS_OPTIONS} onChange={onClsChange} className="w-40" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Section</label>
            <Sel label="Select section" value={section} options={SECTION_OPTIONS} onChange={onSectionChange} className="w-32" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Student</label>
            <PremiumSelect
              value={studentId}
              onChange={setStudentId}
              disabled={availableStudents.length === 0}
              placeholder="All / First student"
              className="w-56"
              options={availableStudents.map((r) => ({ value: String(r.studentId), label: `${r.roll}. ${r.studentName}` }))}
            />
          </div>
        </div>

        {availableStudents.length === 0 && (
          <p className="mt-3 text-[12px] text-muted-foreground">
            No published results found for the selected class/term.
          </p>
        )}
      </PremiumCard>

      {/* Student list (mini, for quick switch) */}
      {availableStudents.length > 1 && (
        <PremiumCard className="p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {availableStudents.length} students · click to switch
          </p>
          <div className="flex flex-wrap gap-2">
            {availableStudents.map((r) => (
              <button
                key={r.studentId}
                onClick={() => setStudentId(String(r.studentId))}
                className={`rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${
                  selected?.studentId === r.studentId
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-neutral-200/80 hover:bg-muted/30 text-foreground dark:border-neutral-800"
                }`}
              >
                #{r.rank} {r.studentName}
              </button>
            ))}
          </div>
        </PremiumCard>
      )}

      {/* Report card */}
      {selected ? (
        <ReportCardPreview result={selected} />
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-[14px] font-medium text-foreground">No report card</p>
          <p className="text-[12px] text-muted-foreground mt-1">Select a term, class, and section with published results.</p>
        </div>
      )}
    </div>
  );
}
