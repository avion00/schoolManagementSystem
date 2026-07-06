import { useState, useMemo } from "react";
import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AdmitCardPreview } from "@/components/exams/AdmitCardPreview";
import {
  EXAM_RESULTS, EXAM_SCHEDULES, EXAM_TERM_OPTIONS, CLASS_OPTIONS, SECTION_OPTIONS,
} from "@/data/examsData";

// Static DOB map for students (indexed by studentId)
const DOB_MAP: Record<number, string> = {
  101: "2014-03-15", 102: "2014-07-22", 103: "2014-11-08", 104: "2015-01-30",
  105: "2014-09-14", 106: "2015-05-20", 107: "2014-12-03", 108: "2015-02-18",
  109: "2014-08-25", 110: "2015-04-10",
};

function Sel({ label, value, options, onChange, disabled }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-2.5 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40">
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function AdmitCardsPage() {
  const [term,    setTerm]    = useState<string>("Mid Term");
  const [cls,     setCls]     = useState<string>("Grade 6");
  const [section, setSection] = useState<string>("A");
  const [studentId, setStudentId] = useState<string>("");

  const availableStudents = useMemo(() =>
    EXAM_RESULTS.filter((r) => r.className === cls && r.section === section).sort((a, b) => a.roll - b.roll),
  [cls, section]);

  const selected = availableStudents.find((r) => String(r.studentId) === studentId) ?? (availableStudents[0] ?? null);

  // Exam schedules for the selected term + class + section
  const examSchedules = useMemo(() =>
    EXAM_SCHEDULES
      .filter((e) => e.term === term && e.className === cls && e.section === section)
      .sort((a, b) => a.date.localeCompare(b.date)),
  [term, cls, section]);

  function onTermChange(v: string)  { setTerm(v); }
  function onClsChange(v: string)   { setCls(v);     setStudentId(""); }
  function onSectionChange(v: string){ setSection(v); setStudentId(""); }

  const studentInfo = selected ? {
    name:           selected.studentName,
    registrationNo: selected.registrationNo,
    admissionNo:    selected.admissionNo,
    className:      selected.className,
    section:        selected.section,
    roll:           selected.roll,
    dob:            DOB_MAP[selected.studentId] ?? "2014-01-01",
  } : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admit Cards</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Generate and print student admit cards for examinations</p>
      </div>

      {/* Selector panel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">Select Parameters</h2>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Exam Term</label>
            <Sel label="Select term" value={term} options={EXAM_TERM_OPTIONS as unknown as string[]} onChange={onTermChange} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Class</label>
            <Sel label="Select class" value={cls} options={CLASS_OPTIONS} onChange={onClsChange} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Section</label>
            <Sel label="Select section" value={section} options={SECTION_OPTIONS} onChange={onSectionChange} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Student</label>
            <select value={studentId} onChange={(e) => setStudentId(e.target.value)}
              disabled={availableStudents.length === 0}
              className="h-9 min-w-[200px] rounded-md border border-input bg-background px-2.5 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40">
              <option value="">All / First student</option>
              {availableStudents.map((r) => (
                <option key={r.studentId} value={String(r.studentId)}>
                  {r.roll}. {r.studentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Info chips */}
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          <span className="rounded-full bg-muted px-3 py-1">{examSchedules.length} subjects scheduled</span>
          <span className="rounded-full bg-muted px-3 py-1">{availableStudents.length} students</span>
        </div>
      </Card>

      {/* Student quick-switch */}
      {availableStudents.length > 1 && (
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Click to switch student
          </p>
          <div className="flex flex-wrap gap-2">
            {availableStudents.map((r) => (
              <button key={r.studentId}
                onClick={() => setStudentId(String(r.studentId))}
                className={`rounded-lg border px-3 py-1.5 text-[12px] transition-colors ${
                  selected?.studentId === r.studentId
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border/60 hover:bg-muted/30 text-foreground"
                }`}>
                {r.roll}. {r.studentName}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Admit card */}
      {studentInfo ? (
        <AdmitCardPreview
          student={studentInfo}
          schedules={examSchedules}
          term={term || "Examination"}
          year="2026/27"
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-[14px] font-medium text-foreground">No admit card</p>
          <p className="text-[12px] text-muted-foreground mt-1">Select term, class, and section to generate admit cards.</p>
        </div>
      )}
    </div>
  );
}
