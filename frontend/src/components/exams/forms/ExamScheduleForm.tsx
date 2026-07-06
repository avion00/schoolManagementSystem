import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, BookOpen, CalendarDays, Clock, FileText, RefreshCw, Save, Users, X } from "lucide-react";
import { toast }   from "sonner";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { FormSection } from "@/components/students/forms/FormSection";
import {
  EXAM_SCHEDULES, EXAM_TERM_OPTIONS, EXAM_TYPE_OPTIONS, EXAM_STATUS_OPTIONS,
  CLASS_OPTIONS, SECTION_OPTIONS, SUBJECT_OPTIONS, INVIGILATOR_OPTIONS, ROOM_OPTIONS,
  ACADEMIC_YEAR_OPTIONS, EXAM_ROOMS,
  type ExamTerm, type ExamType, type ExamStatus, type ExamSchedule,
} from "@/data/examsData";

// ─── form state ───────────────────────────────────────────────────────────────
interface FormData {
  examId:               string;
  examName:             string;
  term:                 ExamTerm | "";
  academicYear:         string;
  examType:             ExamType | "";
  status:               ExamStatus | "";
  className:            string;
  section:              string;
  subject:              string;
  subjectTeacher:       string;
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
  seatCapacity:         string;
  invigilator:          string;
  assistantInvigilator: string;
  instructions:         string;
  notes:                string;
}

type Errors = Partial<Record<keyof FormData, string>>;

function defaultForm(): FormData {
  return {
    examId: "", examName: "", term: "", academicYear: "2026/27", examType: "",
    status: "draft", className: "", section: "", subject: "", subjectTeacher: "",
    fullMarks: "100", passMarks: "40", theoryMarks: "80", practicalMarks: "0", internalMarks: "20",
    date: "", startTime: "10:00", endTime: "12:00", reportingTime: "09:45",
    room: "", seatCapacity: "35", invigilator: "", assistantInvigilator: "",
    instructions: "", notes: "",
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

function Sel({ id, value, options, onChange, placeholder, disabled }: {
  id: string; value: string; options: readonly string[]; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean;
}) {
  return (
    <select id={id} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function calcDuration(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

function genExamId(form: FormData): string {
  if (!form.date || !form.term) return "";
  const year = form.date.split("-")[0];
  const count = EXAM_SCHEDULES.length + 1;
  return `EXM-${year}-${String(count).padStart(3, "0")}`;
}

function checkConflict(form: FormData, excludeId: number): ExamSchedule | undefined {
  if (!form.date || !form.startTime || !form.invigilator) return undefined;
  return EXAM_SCHEDULES.find(
    (s) => s.id !== excludeId && s.date === form.date && s.startTime === form.startTime && s.invigilator === form.invigilator,
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function ExamScheduleForm({ mode }: { mode: "create" | "edit" }) {
  const navigate    = useNavigate();
  const { id }      = useParams<{ id: string }>();
  const numId       = Number(id ?? 0);
  const existing    = mode === "edit" ? EXAM_SCHEDULES.find((e) => e.id === numId) : undefined;

  const [form, setForm] = useState<FormData>(() => {
    if (existing) {
      return {
        examId: existing.examId, examName: existing.examName, term: existing.term,
        academicYear: existing.academicYear, examType: existing.examType, status: existing.status,
        className: existing.className, section: existing.section, subject: existing.subject,
        subjectTeacher: existing.subjectTeacher, fullMarks: String(existing.fullMarks),
        passMarks: String(existing.passMarks), theoryMarks: String(existing.theoryMarks),
        practicalMarks: String(existing.practicalMarks), internalMarks: String(existing.internalMarks),
        date: existing.date, startTime: existing.startTime, endTime: existing.endTime,
        reportingTime: existing.reportingTime, room: existing.room, seatCapacity: String(existing.seatCapacity),
        invigilator: existing.invigilator, assistantInvigilator: existing.assistantInvigilator,
        instructions: existing.instructions, notes: existing.notes,
      };
    }
    return defaultForm();
  });
  const [errors,  setErrors]  = useState<Errors>({});
  const [saving,  setSaving]  = useState(false);

  const set = useCallback((key: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  const conflict = checkConflict(form, numId);
  const duration = calcDuration(form.startTime, form.endTime);

  function validate(): boolean {
    const e: Errors = {};
    if (!form.examName.trim()) e.examName = "Exam name is required.";
    if (!form.term)            e.term     = "Term is required.";
    if (!form.examType)        e.examType = "Exam type is required.";
    if (!form.className)       e.className = "Class is required.";
    if (!form.section)         e.section  = "Section is required.";
    if (!form.subject)         e.subject  = "Subject is required.";
    if (!form.date)            e.date     = "Date is required.";
    if (!form.startTime)       e.startTime = "Start time is required.";
    if (!form.endTime)         e.endTime  = "End time is required.";
    if (!form.room)            e.room     = "Room is required.";
    if (!form.invigilator)     e.invigilator = "Invigilator is required.";
    const th = Number(form.theoryMarks), pr = Number(form.practicalMarks), inn = Number(form.internalMarks);
    if (th + pr + inn !== Number(form.fullMarks)) {
      e.theoryMarks = `Theory + Practical + Internal must equal ${form.fullMarks}.`;
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
    await new Promise((res) => setTimeout(res, 600));
    setSaving(false);
    toast.success(mode === "create" ? "Exam schedule created!" : "Exam schedule updated!");
    navigate("/exams/schedule");
  }

  const roomCap = EXAM_ROOMS.find((r) => r.roomName === form.room)?.capacity;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {mode === "create" ? "Add New Exam Schedule" : "Edit Exam Schedule"}
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {mode === "create" ? "Schedule a new examination" : `Editing ${existing?.examId ?? "exam"}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
            onClick={() => navigate("/exams/schedule")}>
            <X className="h-3.5 w-3.5" />Cancel
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={saving} onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save Schedule"}
          </Button>
        </div>
      </div>

      {/* Conflict banner */}
      {conflict && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
          <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-[12px]">
            <p className="font-semibold text-rose-700 dark:text-rose-300">Invigilator Schedule Conflict</p>
            <p className="text-rose-600 dark:text-rose-400 mt-0.5">
              <strong>{form.invigilator}</strong> is already assigned to {conflict.examId} ({conflict.subject}, {conflict.className} {conflict.section}) on {conflict.date} at {conflict.startTime}.
              Please choose a different invigilator or time.
            </p>
          </div>
        </div>
      )}

      {/* ── Section A: Basic Exam Info ──────────────────────────────────────── */}
      <FormSection icon={FileText} title="Basic Exam Information" subtitle="Name, term, type, and status" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="examName" label="Exam Name" required error={errors.examName}>
            <Input id="examName" value={form.examName} onChange={(e) => set("examName", e.target.value)}
              placeholder="e.g. First Term Examination 2026" className="h-9 text-[12px]" />
          </Field>
          <Field id="term" label="Exam Term" required error={errors.term}>
            <Sel id="term" value={form.term} options={EXAM_TERM_OPTIONS} onChange={(v) => set("term", v as ExamTerm)} placeholder="Select term" />
          </Field>
          <Field id="examType" label="Exam Type" required error={errors.examType}>
            <Sel id="examType" value={form.examType} options={EXAM_TYPE_OPTIONS} onChange={(v) => set("examType", v as ExamType)} placeholder="Select type" />
          </Field>
          <Field id="academicYear" label="Academic Year">
            <Sel id="academicYear" value={form.academicYear} options={ACADEMIC_YEAR_OPTIONS} onChange={(v) => set("academicYear", v)} />
          </Field>
          <Field id="status" label="Status">
            <Sel id="status" value={form.status} options={EXAM_STATUS_OPTIONS} onChange={(v) => set("status", v as ExamStatus)} placeholder="Select status" />
          </Field>
          <Field id="examId" label="Exam ID">
            <div className="flex gap-2">
              <Input id="examId" value={form.examId} onChange={(e) => set("examId", e.target.value)}
                placeholder="Auto-generated" className="h-9 text-[12px] flex-1 font-mono" />
              <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" title="Generate ID"
                onClick={() => set("examId", genExamId(form))}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Field>
        </div>
      </FormSection>

      {/* ── Section B: Class & Subject ─────────────────────────────────────── */}
      <FormSection icon={BookOpen} title="Class & Subject" subtitle="Class, section, subject, teacher, and marks structure">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field id="className" label="Class" required error={errors.className}>
            <Sel id="className" value={form.className} options={CLASS_OPTIONS} onChange={(v) => set("className", v)} placeholder="Select class" />
          </Field>
          <Field id="section" label="Section" required error={errors.section}>
            <Sel id="section" value={form.section} options={SECTION_OPTIONS} onChange={(v) => set("section", v)} placeholder="Select section" />
          </Field>
          <Field id="subject" label="Subject" required error={errors.subject}>
            <Sel id="subject" value={form.subject} options={SUBJECT_OPTIONS} onChange={(v) => set("subject", v)} placeholder="Select subject" />
          </Field>
          <Field id="subjectTeacher" label="Subject Teacher">
            <Sel id="subjectTeacher" value={form.subjectTeacher} options={INVIGILATOR_OPTIONS} onChange={(v) => set("subjectTeacher", v)} placeholder="Select teacher" />
          </Field>
          <Field id="fullMarks" label="Full Marks">
            <Input id="fullMarks" type="number" value={form.fullMarks} onChange={(e) => set("fullMarks", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="passMarks" label="Pass Marks">
            <Input id="passMarks" type="number" value={form.passMarks} onChange={(e) => set("passMarks", e.target.value)} className="h-9 text-[12px]" />
          </Field>
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
          Theory + Practical + Internal must equal Full Marks ({form.fullMarks}).
          {" "}Current sum: {Number(form.theoryMarks) + Number(form.practicalMarks) + Number(form.internalMarks)}.
        </p>
      </FormSection>

      {/* ── Section C: Date & Time ─────────────────────────────────────────── */}
      <FormSection icon={CalendarDays} title="Date & Time" subtitle="Exam date, start/end times, and reporting time">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="date" label="Exam Date" required error={errors.date}>
            <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="startTime" label="Start Time" required error={errors.startTime}>
            <Input id="startTime" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="endTime" label="End Time" required error={errors.endTime}>
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
      <FormSection icon={Users} title="Room & Invigilation" subtitle="Exam room and assigned invigilators">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field id="room" label="Exam Room" required error={errors.room}>
            <Sel id="room" value={form.room} options={ROOM_OPTIONS} onChange={(v) => set("room", v)} placeholder="Select room" />
          </Field>
          <Field id="seatCapacity" label="Seat Capacity">
            <Input id="seatCapacity" type="number" value={form.seatCapacity}
              onChange={(e) => set("seatCapacity", e.target.value)} className="h-9 text-[12px]" />
          </Field>
          <Field id="invigilator" label="Invigilator" required error={errors.invigilator}>
            <Sel id="invigilator" value={form.invigilator} options={INVIGILATOR_OPTIONS}
              onChange={(v) => set("invigilator", v)} placeholder="Select invigilator" />
          </Field>
          <Field id="assistantInvigilator" label="Assistant Invigilator">
            <Sel id="assistantInvigilator" value={form.assistantInvigilator} options={INVIGILATOR_OPTIONS}
              onChange={(v) => set("assistantInvigilator", v)} placeholder="Select assistant" />
          </Field>
        </div>
        {roomCap && Number(form.seatCapacity) > roomCap && (
          <p className="text-[11px] text-amber-600 mt-2">
            ⚠ Seat capacity ({form.seatCapacity}) exceeds room capacity ({roomCap}).
          </p>
        )}
      </FormSection>

      {/* ── Section E: Instructions ────────────────────────────────────────── */}
      <FormSection icon={FileText} title="Instructions & Notes" subtitle="Student instructions, teacher notes, and remarks">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Field id="instructions" label="Student Instructions">
            <textarea id="instructions" value={form.instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("instructions", e.target.value)}
              placeholder="Instructions visible on admit card…"
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
          {saving ? "Saving…" : "Save Schedule"}
        </Button>
      </div>
    </div>
  );
}
