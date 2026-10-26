import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, BookOpen, CalendarDays, Clock, FileText, Save, Users, X } from "lucide-react";
import { toast }   from "sonner";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { FormSection } from "@/components/ui/form-section";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import {
  TYPE_VALUE, clashMessages, useExams, useGradeScales, usePaperRecord, useSaveExam, useSavePaper,
} from "@/api/exams";
import { errorMessage } from "@/api/http";
import { useRooms, useTeacherOptions } from "@/api/routine";
import { useAcademicOptions } from "@/api/students";
import { useSubjectList } from "@/api/subjects";
import { EXAM_TYPE_OPTIONS } from "@/api/types/exams";

// ─── form state ──────────────────────────────────────────────────────────────
const NEW_EXAM = "__new__";
const EXAM_STATUSES = [
  { value: "draft", label: "Draft" }, { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" },
];

interface FormData {
  exam:                 string;   // exam id, or NEW_EXAM
  examName:             string;
  term:                 string;
  examType:             string;   // label
  academicYear:         string;   // id
  status:               string;
  gradeScale:           string;
  examStart:            string;
  examEnd:              string;
  classLevel:           string;
  subject:              string;
  fullMarks:            string;
  passMarks:            string;
  theoryMarks:          string;
  practicalMarks:       string;
  internalMarks:        string;
  date:                 string;
  startTime:            string;
  endTime:              string;
  reportingTime:        string;
  room:                 string;
  invigilator:          string;
  assistantInvigilator: string;
  instructions:         string;
  notes:                string;
}

type Errors = Partial<Record<keyof FormData, string>>;

function defaultForm(): FormData {
  return {
    exam: "", examName: "", term: "", examType: "Final Term", academicYear: "", status: "draft", gradeScale: "",
    examStart: "", examEnd: "", classLevel: "", subject: "",
    fullMarks: "100", passMarks: "40", theoryMarks: "", practicalMarks: "", internalMarks: "",
    date: "", startTime: "10:00", endTime: "13:00", reportingTime: "09:45",
    room: "", invigilator: "", assistantInvigilator: "", instructions: "", notes: "",
  };
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function Field({ id, label, required, error, children }: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5" data-field={id}>
      <label htmlFor={id} className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

type Opt = { value: string; label: string };

function Sel({ id, value, options, onChange, placeholder, disabled }: {
  id: string; value: string; options: Opt[]; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean;
}) {
  return (
    <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function calcDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

const blankToNull = (v: string) => (v === "" ? null : v);

// ─── Component ───────────────────────────────────────────────────────────────
export function ExamScheduleForm({ mode }: { mode: "create" | "edit" }) {
  const navigate    = useNavigate();
  const { id }      = useParams<{ id: string }>();
  const record      = usePaperRecord(mode === "edit" ? id : undefined);
  const examsQuery  = useExams();
  const academics   = useAcademicOptions();
  const subjects    = useSubjectList();
  const rooms       = useRooms();
  const teachers    = useTeacherOptions();
  const scales      = useGradeScales();
  const saveExam    = useSaveExam();
  const savePaper   = useSavePaper();

  const [form, setForm] = useState<FormData>(defaultForm);
  const [loaded, setLoaded] = useState(mode === "create");
  const [errors,  setErrors]  = useState<Errors>({});
  const [clashes, setClashes] = useState<string[]>([]);
  const [saving,  setSaving]  = useState(false);

  const exams = useMemo(() => examsQuery.data ?? [], [examsQuery.data]);
  const openExams = exams.filter((e) => !e.isLocked || e.id === form.exam);

  // Fill the form once the paper (edit) or the defaults (create) are known.
  useEffect(() => {
    if (mode === "edit" && record.data && !loaded && examsQuery.data) {
      const p = record.data;
      const t = (v: string | null | undefined) => (v ? v.slice(0, 5) : "");
      const n = (v: string | null | undefined) => (v === null || v === undefined ? "" : String(Number(v)));
      setForm((f) => ({
        ...f, exam: p.exam, classLevel: p.class_level, subject: p.subject,
        fullMarks: n(p.full_marks), passMarks: n(p.pass_marks), theoryMarks: n(p.theory_marks),
        practicalMarks: n(p.practical_marks), internalMarks: n(p.internal_marks),
        date: p.exam_date ?? "", startTime: t(p.start_time), endTime: t(p.end_time), reportingTime: t(p.reporting_time),
        room: p.room ?? "", invigilator: p.invigilator ?? "", assistantInvigilator: p.assistant_invigilator ?? "",
        instructions: p.instructions ?? "", notes: p.notes ?? "",
      }));
      setLoaded(true);
    }
  }, [mode, record.data, loaded, examsQuery.data]);

  useEffect(() => {
    if (mode === "create" && !form.exam && examsQuery.isSuccess) {
      const first = exams.find((e) => !e.isLocked && (e.status === "draft" || e.status === "scheduled"));
      setForm((f) => ({ ...f, exam: first?.id ?? NEW_EXAM }));
    }
  }, [mode, form.exam, examsQuery.isSuccess, exams]);

  useEffect(() => {
    if (!form.academicYear && academics.data) {
      const year = academics.data.years.find((y) => y.isCurrent) ?? academics.data.years[0];
      if (year) setForm((f) => ({ ...f, academicYear: year.id }));
    }
    if (!form.gradeScale && scales.data?.length) setForm((f) => ({ ...f, gradeScale: scales.data![0].id }));
  }, [academics.data, scales.data, form.academicYear, form.gradeScale]);

  const set = useCallback((key: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setClashes([]);
  }, []);

  const selectedExam = exams.find((e) => e.id === form.exam);
  const creatingExam = form.exam === NEW_EXAM;
  const duration = calcDuration(form.startTime, form.endTime);
  const roomCap = rooms.data?.find((r) => r.id === form.room)?.capacity;
  const partsSum = Number(form.theoryMarks || 0) + Number(form.practicalMarks || 0) + Number(form.internalMarks || 0);
  const hasParts = [form.theoryMarks, form.practicalMarks, form.internalMarks].some((v) => v !== "" && Number(v) > 0);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.exam) e.exam = "Choose an exam.";
    if (creatingExam) {
      if (!form.examName.trim()) e.examName = "Exam name is required.";
      if (!form.academicYear)    e.academicYear = "Academic year is required.";
      if (form.examStart && form.examEnd && form.examEnd < form.examStart) e.examEnd = "End date is before the start date.";
    }
    if (!form.classLevel)      e.classLevel = "Class is required.";
    if (!form.subject)         e.subject  = "Subject is required.";
    if (!form.fullMarks || Number(form.fullMarks) <= 0) e.fullMarks = "Full marks must be greater than zero.";
    if (Number(form.passMarks) > Number(form.fullMarks)) e.passMarks = "Pass marks can't exceed full marks.";
    if (hasParts && partsSum !== Number(form.fullMarks)) {
      e.theoryMarks = `Theory + Practical + Internal must equal ${form.fullMarks} (now ${partsSum}).`;
    }
    if (form.startTime && form.endTime && duration <= 0) e.endTime = "End time must be after the start time.";
    if (form.invigilator && form.invigilator === form.assistantInvigilator) {
      e.assistantInvigilator = "Choose a different assistant.";
    }
    setErrors(e);
    if (Object.keys(e).length > 0) {
      const firstKey = Object.keys(e)[0];
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    setClashes([]);
    try {
      let examId = form.exam;
      if (creatingExam) {
        const created = await saveExam.mutateAsync({ body: {
          name: form.examName.trim(), term: form.term.trim(), exam_type: TYPE_VALUE[form.examType] ?? "final_term",
          status: form.status, academic_year: form.academicYear, grade_scale: form.gradeScale || null,
          start_date: blankToNull(form.examStart), end_date: blankToNull(form.examEnd),
        } });
        examId = created.id;
        setForm((f) => ({ ...f, exam: created.id }));
      }
      const parts = hasParts
        ? { theory_marks: form.theoryMarks || "0", practical_marks: form.practicalMarks || "0", internal_marks: form.internalMarks || "0" }
        : { theory_marks: null, practical_marks: null, internal_marks: null };
      await savePaper.mutateAsync({
        id: mode === "edit" ? id : undefined,
        body: {
          ...(mode === "create" ? { exam: examId } : {}),
          class_level: form.classLevel, subject: form.subject,
          full_marks: form.fullMarks, pass_marks: form.passMarks || "0", ...parts,
          exam_date: blankToNull(form.date), start_time: blankToNull(form.startTime),
          end_time: blankToNull(form.endTime), reporting_time: blankToNull(form.reportingTime),
          room: blankToNull(form.room), invigilator: blankToNull(form.invigilator),
          assistant_invigilator: blankToNull(form.assistantInvigilator),
          instructions: form.instructions, notes: form.notes,
        },
      });
      toast.success(mode === "create" ? "Paper scheduled." : "Paper updated.");
      navigate("/exams/schedule");
    } catch (err) {
      const found = clashMessages(err);
      if (found) {
        setClashes(found);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(errorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  }

  if (mode === "edit" && record.isError) {
    return <PremiumEmptyState title="Couldn't load this paper" description={errorMessage(record.error)} />;
  }
  if (!loaded || examsQuery.isLoading) return <PremiumSkeleton className="mx-auto h-96 max-w-4xl rounded-2xl" />;

  const classOpts = (academics.data?.classes ?? []).map((c) => ({ value: c.id, label: c.name }));
  const subjectOpts = (subjects.data ?? []).map((s) => ({ value: String(s.id), label: `${s.subjectName} (${s.subjectCode})` }));
  const teacherOpts = (teachers.data ?? []).map((t) => ({ value: t.id, label: t.name }));
  const roomOpts = (rooms.data ?? []).map((r) => ({ value: r.id, label: `${r.name}${r.capacity ? ` · ${r.capacity} seats` : ""}` }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {mode === "create" ? "Schedule Exam Paper" : "Edit Exam Paper"}
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            A paper is one subject of an exam for one class (all its sections).
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
            onClick={() => navigate("/exams/schedule")}>
            <X className="h-3.5 w-3.5" />Cancel
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={saving} onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save Paper"}
          </Button>
        </div>
      </div>

      {/* Server-reported clashes */}
      {clashes.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-[12px]">
            <p className="font-semibold text-rose-700 dark:text-rose-300">Schedule conflict</p>
            {clashes.map((c) => <p key={c} className="text-rose-600 dark:text-rose-400 mt-0.5">{c}</p>)}
            <p className="text-rose-600 dark:text-rose-400 mt-1">Choose a different time, room or invigilator.</p>
          </div>
        </div>
      )}

      {/* ── Section A: Exam ─────────────────────────────────────────────────── */}
      <FormSection icon={FileText} title="Exam" subtitle="The exam this paper belongs to" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="exam" label="Exam" required error={errors.exam}>
            <Sel id="exam" value={form.exam} disabled={mode === "edit"} onChange={(v) => set("exam", v)} placeholder="Select exam"
              options={[
                ...openExams.map((e) => ({ value: e.id, label: `${e.name}${e.code ? ` · ${e.code}` : ""}` })),
                { value: NEW_EXAM, label: "+ Create a new exam" },
              ]} />
          </Field>
          {selectedExam && !creatingExam && (
            <div className="sm:col-span-2 flex flex-wrap items-center gap-x-5 gap-y-1 self-end pb-2 text-[12px] text-muted-foreground">
              <span>{selectedExam.examType}</span>
              {selectedExam.term && <span>{selectedExam.term}</span>}
              <span>{selectedExam.academicYear}</span>
              {selectedExam.startDate && <span>{selectedExam.startDate} → {selectedExam.endDate}</span>}
              <span className="capitalize">{selectedExam.status}</span>
            </div>
          )}
          {creatingExam && (<>
            <Field id="examName" label="Exam Name" required error={errors.examName}>
              <Input id="examName" value={form.examName} onChange={(e) => set("examName", e.target.value)}
                placeholder="e.g. First Term Examination 2026" className="h-9 text-[12px]" />
            </Field>
            <Field id="term" label="Term">
              <Input id="term" value={form.term} onChange={(e) => set("term", e.target.value)}
                placeholder="e.g. First Term" className="h-9 text-[12px]" />
            </Field>
            <Field id="examType" label="Exam Type" required>
              <Sel id="examType" value={form.examType} onChange={(v) => set("examType", v)}
                options={EXAM_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))} />
            </Field>
            <Field id="academicYear" label="Academic Year" required error={errors.academicYear}>
              <Sel id="academicYear" value={form.academicYear} onChange={(v) => set("academicYear", v)}
                options={(academics.data?.years ?? []).map((y) => ({ value: y.id, label: y.name }))} />
            </Field>
            <Field id="status" label="Status">
              <Sel id="status" value={form.status} onChange={(v) => set("status", v)} options={EXAM_STATUSES} />
            </Field>
            <Field id="gradeScale" label="Grade Scale">
              <Sel id="gradeScale" value={form.gradeScale} onChange={(v) => set("gradeScale", v)} placeholder="No grading"
                options={(scales.data ?? []).map((s) => ({ value: s.id, label: s.name }))} />
            </Field>
            <Field id="examStart" label="Exam Starts">
              <Input id="examStart" type="date" value={form.examStart} onChange={(e) => set("examStart", e.target.value)} className="h-9 text-[12px]" />
            </Field>
            <Field id="examEnd" label="Exam Ends" error={errors.examEnd}>
              <Input id="examEnd" type="date" value={form.examEnd} onChange={(e) => set("examEnd", e.target.value)} className="h-9 text-[12px]" />
            </Field>
          </>)}
        </div>
      </FormSection>

      {/* ── Section B: Class & Subject ─────────────────────────────────────── */}
      <FormSection icon={BookOpen} title="Class & Subject" subtitle="Class, subject, and marks structure" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="classLevel" label="Class" required error={errors.classLevel}>
            <Sel id="classLevel" value={form.classLevel} options={classOpts} onChange={(v) => set("classLevel", v)} placeholder="Select class" />
          </Field>
          <Field id="subject" label="Subject" required error={errors.subject}>
            <Sel id="subject" value={form.subject} options={subjectOpts} onChange={(v) => set("subject", v)} placeholder="Select subject" />
          </Field>
          <div />
          <Field id="fullMarks" label="Full Marks" required error={errors.fullMarks}>
            <Input id="fullMarks" type="number" value={form.fullMarks} onChange={(e) => set("fullMarks", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="passMarks" label="Pass Marks" error={errors.passMarks}>
            <Input id="passMarks" type="number" value={form.passMarks} onChange={(e) => set("passMarks", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <div />
          <Field id="theoryMarks" label="Theory Marks" error={errors.theoryMarks}>
            <Input id="theoryMarks" type="number" value={form.theoryMarks} onChange={(e) => set("theoryMarks", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="practicalMarks" label="Practical Marks">
            <Input id="practicalMarks" type="number" value={form.practicalMarks} onChange={(e) => set("practicalMarks", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="internalMarks" label="Internal Marks">
            <Input id="internalMarks" type="number" value={form.internalMarks} onChange={(e) => set("internalMarks", e.target.value)} className="h-9 text-[12px]" />
          </Field>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Leave the components empty to mark the paper as a single total. If you split it, Theory + Practical + Internal
          must equal Full Marks ({form.fullMarks || 0}); current sum: {partsSum}.
        </p>
      </FormSection>

      {/* ── Section C: Date & Time ─────────────────────────────────────────── */}
      <FormSection icon={CalendarDays} title="Date & Time" subtitle="Exam date, start/end times, and reporting time" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="date" label="Exam Date" error={errors.date}>
            <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
              min={selectedExam?.startDate ?? (form.examStart || undefined)} max={selectedExam?.endDate ?? (form.examEnd || undefined)}
              className="h-9 text-[12px]" />
          </Field>
          <Field id="startTime" label="Start Time" error={errors.startTime}>
            <Input id="startTime" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="endTime" label="End Time" error={errors.endTime}>
            <Input id="endTime" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="reportingTime" label="Reporting Time">
            <Input id="reportingTime" type="time" value={form.reportingTime} onChange={(e) => set("reportingTime", e.target.value)} className="h-9 text-[12px]" />
          </Field>
        </div>
        {duration > 0 && (
          <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Duration: <strong className="text-foreground">{duration} minutes</strong> ({Math.floor(duration / 60)}h {duration % 60}m)</span>
          </div>
        )}
      </FormSection>

      {/* ── Section D: Room & Invigilation ────────────────────────────────── */}
      <FormSection icon={Users} title="Room & Invigilation" subtitle="Exam room and assigned invigilators" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field id="room" label="Exam Room">
            <Sel id="room" value={form.room} options={roomOpts} onChange={(v) => set("room", v)}
              placeholder={roomOpts.length ? "Select room" : "No exam rooms set up"} />
          </Field>
          <Field id="invigilator" label="Invigilator">
            <Sel id="invigilator" value={form.invigilator} options={teacherOpts}
              onChange={(v) => set("invigilator", v)} placeholder="Select invigilator" />
          </Field>
          <Field id="assistantInvigilator" label="Assistant Invigilator" error={errors.assistantInvigilator}>
            <Sel id="assistantInvigilator" value={form.assistantInvigilator} options={teacherOpts}
              onChange={(v) => set("assistantInvigilator", v)} placeholder="Select assistant" />
          </Field>
        </div>
        {roomCap !== undefined && (
          <p className="text-[11px] text-muted-foreground mt-2">Room capacity: {roomCap} seats.</p>
        )}
      </FormSection>

      {/* ── Section E: Instructions ────────────────────────────────────────── */}
      <FormSection icon={FileText} title="Instructions & Notes" subtitle="Student instructions and staff notes">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field id="instructions" label="Student Instructions">
            <textarea id="instructions" value={form.instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("instructions", e.target.value)}
              placeholder="Instructions for this paper…"
              rows={4}
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
          <Field id="notes" label="Internal Notes">
            <textarea id="notes" value={form.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("notes", e.target.value)}
              placeholder="Internal notes for staff only…"
              rows={4}
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </Field>
        </div>
      </FormSection>

      {/* Footer actions */}
      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]"
          onClick={() => navigate("/exams/schedule")}>
          <X className="h-3.5 w-3.5" />Cancel
        </Button>
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={saving} onClick={handleSave}>
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save Paper"}
        </Button>
      </div>
    </div>
  );
}
