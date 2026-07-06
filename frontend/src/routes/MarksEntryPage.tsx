import { useState, useMemo } from "react";
import { BookOpen, ChevronRight, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card }   from "@/components/ui/card";
import { MarksEntryTable } from "@/components/exams/MarksEntryTable";
import {
  EXAM_SCHEDULES, MARKS_ENTRIES, EXAM_TERM_OPTIONS,
  CLASS_OPTIONS, SECTION_OPTIONS,
} from "@/data/examsData";

function Sel({ label, value, options, onChange, disabled }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-input bg-background px-3 text-[13px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40 min-w-[160px]">
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// Derive subject options from schedules matching term+class+section
function subjectsFor(term: string, cls: string, sec: string): string[] {
  return [...new Set(
    EXAM_SCHEDULES
      .filter((e) => e.term === term && e.className === cls && e.section === sec)
      .map((e) => e.subject)
  )].sort();
}

// Mock extra entries for non-exam-1 selections (same students, blank marks)
function blankEntries() {
  return MARKS_ENTRIES.map((e) => ({
    ...e,
    theoryMarks: null, practicalMarks: null, internalMarks: null,
    totalMarks: null, percentage: null, grade: null, gradePoint: null, result: null,
    remarks: "", isAbsent: false,
  }));
}

export function MarksEntryPage() {
  const [term,    setTerm]    = useState<string>("");
  const [cls,     setCls]     = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [loaded,  setLoaded]  = useState<boolean>(false);

  function onTermChange(v: string)    { setTerm(v);    setCls(""); setSection(""); setSubject(""); setLoaded(false); }
  function onClsChange(v: string)     { setCls(v);     setSection(""); setSubject(""); setLoaded(false); }
  function onSectionChange(v: string) { setSection(v); setSubject(""); setLoaded(false); }
  function onSubjectChange(v: string) { setSubject(v); setLoaded(false); }

  const classOpts   = CLASS_OPTIONS;
  const sectionOpts = SECTION_OPTIONS;
  const subjectOpts = useMemo(() => subjectsFor(term, cls, section), [term, cls, section]);

  // Find matching exam schedule
  const matchedExam = useMemo(() => {
    if (!term || !cls || !section || !subject) return null;
    return EXAM_SCHEDULES.find(
      (e) => e.term === term && e.className === cls && e.section === section && e.subject === subject,
    ) ?? null;
  }, [term, cls, section, subject]);

  // Marks data: real for exam 1, blank for others
  const marksData = useMemo(() => {
    if (!matchedExam) return [];
    if (matchedExam.id === 1) return MARKS_ENTRIES;
    return blankEntries();
  }, [matchedExam]);

  const canLoad = !!matchedExam;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Marks Entry</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Select exam, class, and subject to enter student marks
        </p>
      </div>

      {/* Selector panel */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <PenLine className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[13px] font-semibold text-foreground">Select Exam</h2>
        </div>

        {/* Step breadcrumb */}
        <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground mb-4">
          <span className={term ? "text-foreground font-medium" : ""}>Term</span>
          <ChevronRight className="h-3 w-3" />
          <span className={cls ? "text-foreground font-medium" : ""}>Class</span>
          <ChevronRight className="h-3 w-3" />
          <span className={section ? "text-foreground font-medium" : ""}>Section</span>
          <ChevronRight className="h-3 w-3" />
          <span className={subject ? "text-foreground font-medium" : ""}>Subject</span>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Exam Term</label>
            <Sel label="Select term" value={term} options={EXAM_TERM_OPTIONS as unknown as string[]} onChange={onTermChange} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Class</label>
            <Sel label="Select class" value={cls} options={classOpts} onChange={onClsChange} disabled={!term} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Section</label>
            <Sel label="Select section" value={section} options={sectionOpts} onChange={onSectionChange} disabled={!cls} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-foreground">Subject</label>
            <Sel label="Select subject" value={subject} options={subjectOpts} onChange={onSubjectChange} disabled={!section || subjectOpts.length === 0} />
          </div>
          <Button
            size="sm"
            className="h-10 gap-1.5 text-[12px]"
            disabled={!canLoad}
            onClick={() => canLoad && setLoaded(true)}
          >
            <BookOpen className="h-3.5 w-3.5" />Load Students
          </Button>
        </div>

        {/* Exam info chip */}
        {matchedExam && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border/40 bg-muted/20 px-4 py-3 text-[12px]">
            <span><span className="text-muted-foreground">Exam ID:</span> <strong>{matchedExam.examId}</strong></span>
            <span><span className="text-muted-foreground">Date:</span> <strong>{matchedExam.date}</strong></span>
            <span><span className="text-muted-foreground">Time:</span> <strong>{matchedExam.startTime} – {matchedExam.endTime}</strong></span>
            <span><span className="text-muted-foreground">Room:</span> <strong>{matchedExam.room}</strong></span>
            <span><span className="text-muted-foreground">Full Marks:</span> <strong>{matchedExam.fullMarks}</strong></span>
            <span><span className="text-muted-foreground">Pass Marks:</span> <strong>{matchedExam.passMarks}</strong></span>
          </div>
        )}
      </Card>

      {/* Marks table */}
      {loaded && matchedExam && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <PenLine className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-[13px] font-semibold text-foreground">
              {matchedExam.subject} · {matchedExam.className} {matchedExam.section} · {matchedExam.term}
            </h2>
          </div>
          <MarksEntryTable entries={marksData} schedule={matchedExam} />
        </Card>
      )}

      {/* Empty state */}
      {!loaded && (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <PenLine className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-[14px] font-medium text-foreground">No exam loaded</p>
          <p className="text-[12px] text-muted-foreground mt-1">Select term, class, section, and subject then click "Load Students".</p>
        </div>
      )}
    </div>
  );
}
