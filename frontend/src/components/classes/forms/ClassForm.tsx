import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen, Building2, Check, ClipboardList, FileText,
  Layers, Plus, StickyNote, Trash2, User, X,
} from "lucide-react";
import { toast } from "sonner";

import { FormSection } from "@/components/students/forms/FormSection";
import { Button }      from "@/components/ui/button";
import { Input }       from "@/components/ui/input";
import { Label }       from "@/components/ui/label";
import {
  CLASSES, ACADEMIC_YEAR_OPTIONS, MEDIUM_OPTIONS, SHIFT_OPTIONS, STATUS_OPTIONS,
  GRADE_OPTIONS, SECTION_OPTIONS, SUBJECT_OPTIONS, TEACHER_OPTIONS,
} from "@/data/classesData";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SectionDraft {
  tempId: string;
  sectionName: string;
  sectionCode: string;
  classTeacher: string;
  room: string;
  capacity: string;
  status: string;
}

interface SubjectDraft {
  tempId: string;
  subjectName: string;
  subjectCode: string;
  teacher: string;
  weeklyPeriods: string;
  fullMarks: string;
  passMarks: string;
  type: string;
}

interface ClassFormData {
  classId: string;
  className: string;
  academicYear: string;
  gradeLevel: string;
  status: string;
  medium: string;
  shift: string;
  description: string;
  sections: SectionDraft[];
  mainClassTeacher: string;
  assistantClassTeacher: string;
  coordinator: string;
  subjects: SubjectDraft[];
  building: string;
  floor: string;
  roomNumber: string;
  roomCapacity: string;
  smartBoard: boolean;
  projector: boolean;
  labRequired: boolean;
  weekDays: string;
  startTime: string;
  endTime: string;
  periodDuration: string;
  breakTime: string;
  monthlyTuitionFee: string;
  admissionFee: string;
  examFee: string;
  libraryFee: string;
  gradingSystem: string;
  passPct: string;
  examTerms: string;
  gpaEnabled: boolean;
  adminNotes: string;
  specialInstructions: string;
}

type Errors = Partial<Record<string, string>>;

// ── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12.5px]">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder?: string; error?: boolean;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-background shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${error ? "border-destructive" : "border-input"}`}>
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TA({ value, onChange, rows = 3, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea value={value}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      rows={rows} placeholder={placeholder}
      className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
  );
}

function sectionErrors(errs: Errors, keys: string[]) {
  return keys.filter((k) => errs[k]).length;
}

function emptySection(): SectionDraft {
  return { tempId: Date.now().toString(), sectionName: "", sectionCode: "", classTeacher: "", room: "", capacity: "", status: "active" };
}

function emptySubject(): SubjectDraft {
  return { tempId: Date.now().toString() + Math.random(), subjectName: "", subjectCode: "", teacher: "", weeklyPeriods: "", fullMarks: "100", passMarks: "40", type: "Compulsory" };
}

const EMPTY: ClassFormData = {
  classId:"", className:"", academicYear:"2026/27", gradeLevel:"", status:"active",
  medium:"English", shift:"Morning", description:"",
  sections: [emptySection()],
  mainClassTeacher:"", assistantClassTeacher:"", coordinator:"",
  subjects: [emptySubject()],
  building:"", floor:"", roomNumber:"", roomCapacity:"",
  smartBoard: false, projector: false, labRequired: false,
  weekDays:"Monday - Friday", startTime:"09:00", endTime:"14:00",
  periodDuration:"45", breakTime:"15",
  monthlyTuitionFee:"", admissionFee:"", examFee:"", libraryFee:"",
  gradingSystem:"Percentage", passPct:"40", examTerms:"3", gpaEnabled: false,
  adminNotes:"", specialInstructions:"",
};

function validate(form: ClassFormData): Errors {
  const e: Errors = {};
  if (!form.classId.trim())     e.classId     = "Class ID is required.";
  if (!form.className.trim())   e.className   = "Class Name is required.";
  if (!form.academicYear)       e.academicYear = "Academic Year is required.";
  if (!form.medium)             e.medium      = "Medium is required.";
  if (!form.shift)              e.shift       = "Shift is required.";
  if (!form.mainClassTeacher)   e.mainClassTeacher = "Main Class Teacher is required.";
  if (form.sections.length === 0) e.sections = "At least one section is required.";
  form.sections.forEach((s, i) => {
    if (!s.sectionName)   e[`sec_name_${i}`]     = "Section name required.";
    if (!s.classTeacher)  e[`sec_teacher_${i}`]  = "Teacher required.";
    if (!s.room)          e[`sec_room_${i}`]      = "Room required.";
    if (!s.capacity)      e[`sec_cap_${i}`]       = "Capacity required.";
  });
  if (form.subjects.length === 0) e.subjects = "At least one subject is required.";
  form.subjects.forEach((s, i) => {
    if (!s.subjectName) e[`sub_name_${i}`]    = "Subject required.";
    if (!s.teacher)     e[`sub_teacher_${i}`] = "Teacher required.";
  });
  return e;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ClassForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const prefill = (): ClassFormData => {
    if (mode === "edit" && id) {
      const c = CLASSES.find((x) => x.id === Number(id));
      if (c) return {
        ...EMPTY,
        classId:    c.classId,
        className:  c.className,
        academicYear: c.academicYear,
        gradeLevel: String(c.gradeLevel),
        status:     c.status,
        medium:     c.medium,
        shift:      c.shift,
        description: c.description,
        mainClassTeacher: c.mainClassTeacher.name,
        building:   c.building,
        roomNumber:  c.mainRoom,
        sections: c.sections.map((s) => ({
          tempId: String(s.id), sectionName: s.sectionName, sectionCode: s.sectionCode,
          classTeacher: s.classTeacher, room: s.room, capacity: String(s.capacity), status: s.status,
        })),
        subjects: c.subjects.map((s) => ({
          tempId: s.subjectCode, subjectName: s.subjectName, subjectCode: s.subjectCode,
          teacher: s.teacher, weeklyPeriods: String(s.weeklyPeriods),
          fullMarks: String(s.fullMarks), passMarks: String(s.passMarks), type: s.type,
        })),
      };
    }
    return { ...EMPTY };
  };

  const [form, setForm] = useState<ClassFormData>(prefill);
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof ClassFormData>(key: K, val: ClassFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  }

  // Section helpers
  const addSection  = () => setForm((f) => ({ ...f, sections: [...f.sections, emptySection()] }));
  const removeSection = (id: string) => setForm((f) => ({ ...f, sections: f.sections.filter((s) => s.tempId !== id) }));
  function updateSection(tempId: string, key: keyof SectionDraft, val: string) {
    setForm((f) => ({ ...f, sections: f.sections.map((s) => s.tempId === tempId ? { ...s, [key]: val } : s) }));
  }

  // Subject helpers
  const addSubject    = () => setForm((f) => ({ ...f, subjects: [...f.subjects, emptySubject()] }));
  const removeSubject = (id: string) => setForm((f) => ({ ...f, subjects: f.subjects.filter((s) => s.tempId !== id) }));
  function updateSubject(tempId: string, key: keyof SubjectDraft, val: string) {
    setForm((f) => ({ ...f, subjects: f.subjects.map((s) => s.tempId === tempId ? { ...s, [key]: val } : s) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector(`[data-field="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast.error("Please fix the errors before saving.");
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success(mode === "create" ? "Class created successfully!" : "Class updated successfully!");
    navigate("/classes");
  }

  const INFO_KEYS = ["classId","className","academicYear","medium","shift"];

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{mode === "create" ? "Add New Class" : "Edit Class"}</h2>
          <p className="text-[13px] text-muted-foreground">
            {mode === "create" ? "Set up a new class with sections, teachers, and subjects." : "Update class information and assignments."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}><X className="mr-1.5 h-4 w-4" />Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving
              ? <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />Saving…</span>
              : <><Check className="mr-1.5 h-4 w-4" />{mode === "create" ? "Create Class" : "Save Changes"}</>}
          </Button>
        </div>
      </div>

      {/* A. Basic Info */}
      <FormSection icon={Layers} title="Basic Class Information" subtitle="Core identifiers and settings"
        errorCount={sectionErrors(errors, INFO_KEYS)}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div data-field="classId">
            <Field label="Class ID" required error={errors.classId}>
              <Input value={form.classId} onChange={(e) => set("classId", e.target.value)}
                placeholder="CLS-2026-001" className={errors.classId ? "border-destructive" : ""} />
            </Field>
          </div>
          <div data-field="className">
            <Field label="Class Name" required error={errors.className}>
              <Input value={form.className} onChange={(e) => set("className", e.target.value)}
                placeholder="Grade 1" className={errors.className ? "border-destructive" : ""} />
            </Field>
          </div>
          <div data-field="academicYear">
            <Field label="Academic Year" required error={errors.academicYear}>
              <Select value={form.academicYear} onChange={(v) => set("academicYear", v)}
                options={ACADEMIC_YEAR_OPTIONS} error={!!errors.academicYear} />
            </Field>
          </div>
          <Field label="Grade Level">
            <Select value={form.gradeLevel} onChange={(v) => set("gradeLevel", v)} options={GRADE_OPTIONS} />
          </Field>
          <div data-field="medium">
            <Field label="Medium" required error={errors.medium}>
              <Select value={form.medium} onChange={(v) => set("medium", v)} options={MEDIUM_OPTIONS} error={!!errors.medium} />
            </Field>
          </div>
          <div data-field="shift">
            <Field label="Shift" required error={errors.shift}>
              <Select value={form.shift} onChange={(v) => set("shift", v)} options={SHIFT_OPTIONS} error={!!errors.shift} />
            </Field>
          </div>
          <Field label="Status">
            <Select value={form.status} onChange={(v) => set("status", v)} options={STATUS_OPTIONS} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description">
              <TA value={form.description} onChange={(v) => set("description", v)} rows={2} placeholder="Brief class description…" />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* B. Sections */}
      <FormSection icon={BookOpen} title="Section Setup" subtitle="Add sections for this class"
        errorCount={errors.sections ? 1 : 0}>
        <div className="space-y-4">
          {errors.sections && <p className="text-[12px] text-destructive">{errors.sections}</p>}
          {form.sections.map((sec, idx) => (
            <div key={sec.tempId} className="relative rounded-xl border border-border/60 bg-muted/30 p-4">
              <button type="button" onClick={() => removeSection(sec.tempId)}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <p className="mb-3 text-[12px] font-semibold text-muted-foreground">Section {idx + 1}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Section Name" required error={errors[`sec_name_${idx}`]}>
                  <Select value={sec.sectionName} onChange={(v) => updateSection(sec.tempId, "sectionName", v)}
                    options={SECTION_OPTIONS} error={!!errors[`sec_name_${idx}`]} />
                </Field>
                <Field label="Section Code">
                  <Input value={sec.sectionCode} onChange={(e) => updateSection(sec.tempId, "sectionCode", e.target.value)}
                    placeholder="SEC-1A" />
                </Field>
                <Field label="Class Teacher" required error={errors[`sec_teacher_${idx}`]}>
                  <Select value={sec.classTeacher} onChange={(v) => updateSection(sec.tempId, "classTeacher", v)}
                    options={TEACHER_OPTIONS} error={!!errors[`sec_teacher_${idx}`]} />
                </Field>
                <Field label="Room No" required error={errors[`sec_room_${idx}`]}>
                  <Input value={sec.room} onChange={(e) => updateSection(sec.tempId, "room", e.target.value)}
                    placeholder="Block A - 101" />
                </Field>
                <Field label="Capacity" required error={errors[`sec_cap_${idx}`]}>
                  <Input type="number" value={sec.capacity}
                    onChange={(e) => updateSection(sec.tempId, "capacity", e.target.value)}
                    placeholder="40" min="1" />
                </Field>
                <Field label="Status">
                  <Select value={sec.status} onChange={(v) => updateSection(sec.tempId, "status", v)}
                    options={["active","inactive"]} />
                </Field>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addSection}>
            <Plus className="h-3.5 w-3.5" />Add Section
          </Button>
        </div>
      </FormSection>

      {/* C. Teacher Assignment */}
      <FormSection icon={User} title="Class Teacher Assignment" subtitle="Assign primary and support teachers" defaultOpen={false}
        errorCount={sectionErrors(errors, ["mainClassTeacher"])}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div data-field="mainClassTeacher">
            <Field label="Main Class Teacher" required error={errors.mainClassTeacher}>
              <Select value={form.mainClassTeacher} onChange={(v) => set("mainClassTeacher", v)}
                options={TEACHER_OPTIONS} error={!!errors.mainClassTeacher} />
            </Field>
          </div>
          <Field label="Assistant Class Teacher">
            <Select value={form.assistantClassTeacher} onChange={(v) => set("assistantClassTeacher", v)}
              options={TEACHER_OPTIONS} />
          </Field>
          <Field label="Coordinator">
            <Select value={form.coordinator} onChange={(v) => set("coordinator", v)}
              options={TEACHER_OPTIONS} />
          </Field>
        </div>
      </FormSection>

      {/* D. Subjects */}
      <FormSection icon={BookOpen} title="Subject Assignment" subtitle="Assign subjects and teachers" defaultOpen={false}
        errorCount={errors.subjects ? 1 : 0}>
        <div className="space-y-4">
          {errors.subjects && <p className="text-[12px] text-destructive">{errors.subjects}</p>}
          {form.subjects.map((sub, idx) => (
            <div key={sub.tempId} className="relative rounded-xl border border-border/60 bg-muted/30 p-4">
              <button type="button" onClick={() => removeSubject(sub.tempId)}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <p className="mb-3 text-[12px] font-semibold text-muted-foreground">Subject {idx + 1}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Subject Name" required error={errors[`sub_name_${idx}`]}>
                  <Select value={sub.subjectName} onChange={(v) => updateSubject(sub.tempId, "subjectName", v)}
                    options={SUBJECT_OPTIONS} error={!!errors[`sub_name_${idx}`]} />
                </Field>
                <Field label="Subject Code">
                  <Input value={sub.subjectCode} onChange={(e) => updateSubject(sub.tempId, "subjectCode", e.target.value)}
                    placeholder="SUB-ENG-01" />
                </Field>
                <Field label="Teacher" required error={errors[`sub_teacher_${idx}`]}>
                  <Select value={sub.teacher} onChange={(v) => updateSubject(sub.tempId, "teacher", v)}
                    options={TEACHER_OPTIONS} error={!!errors[`sub_teacher_${idx}`]} />
                </Field>
                <Field label="Weekly Periods">
                  <Input type="number" value={sub.weeklyPeriods}
                    onChange={(e) => updateSubject(sub.tempId, "weeklyPeriods", e.target.value)} placeholder="6" min="1" />
                </Field>
                <Field label="Full Marks">
                  <Input type="number" value={sub.fullMarks}
                    onChange={(e) => updateSubject(sub.tempId, "fullMarks", e.target.value)} placeholder="100" />
                </Field>
                <Field label="Pass Marks">
                  <Input type="number" value={sub.passMarks}
                    onChange={(e) => updateSubject(sub.tempId, "passMarks", e.target.value)} placeholder="40" />
                </Field>
                <Field label="Type">
                  <Select value={sub.type} onChange={(v) => updateSubject(sub.tempId, "type", v)}
                    options={["Compulsory","Optional"]} />
                </Field>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addSubject}>
            <Plus className="h-3.5 w-3.5" />Add Subject
          </Button>
        </div>
      </FormSection>

      {/* E. Room & Facility */}
      <FormSection icon={Building2} title="Room & Facility Information" subtitle="Physical classroom details" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Building">
            <Input value={form.building} onChange={(e) => set("building", e.target.value)} placeholder="Block A" />
          </Field>
          <Field label="Floor">
            <Input value={form.floor} onChange={(e) => set("floor", e.target.value)} placeholder="Ground Floor" />
          </Field>
          <Field label="Room Number">
            <Input value={form.roomNumber} onChange={(e) => set("roomNumber", e.target.value)} placeholder="Block A - 101" />
          </Field>
          <Field label="Room Capacity">
            <Input type="number" value={form.roomCapacity} onChange={(e) => set("roomCapacity", e.target.value)} placeholder="40" />
          </Field>
          {([
            { key: "smartBoard" as const, label: "Smart Board Available" },
            { key: "projector"  as const, label: "Projector Available"   },
            { key: "labRequired" as const,label: "Lab Required"           },
          ]).map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-[13px]">
              <input type="checkbox" checked={form[key] as boolean}
                onChange={(e) => set(key, e.target.checked as ClassFormData[typeof key])}
                className="h-4 w-4 rounded border-input accent-primary" />
              {label}
            </label>
          ))}
        </div>
      </FormSection>

      {/* F. Timetable Settings */}
      <FormSection icon={ClipboardList} title="Timetable Settings" subtitle="Weekly schedule configuration" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="School Days">
            <Input value={form.weekDays} onChange={(e) => set("weekDays", e.target.value)} placeholder="Monday - Friday" />
          </Field>
          <Field label="Start Time">
            <Input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} />
          </Field>
          <Field label="End Time">
            <Input type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} />
          </Field>
          <Field label="Period Duration (min)">
            <Input type="number" value={form.periodDuration} onChange={(e) => set("periodDuration", e.target.value)} placeholder="45" />
          </Field>
          <Field label="Break Duration (min)">
            <Input type="number" value={form.breakTime} onChange={(e) => set("breakTime", e.target.value)} placeholder="15" />
          </Field>
        </div>
      </FormSection>

      {/* G. Fee Structure */}
      <FormSection icon={FileText} title="Fee Structure" subtitle="Academic year fee amounts" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {([
            { key: "monthlyTuitionFee" as const, label: "Monthly Tuition Fee", placeholder: "8000" },
            { key: "admissionFee"      as const, label: "Admission Fee",        placeholder: "5000" },
            { key: "examFee"           as const, label: "Exam Fee",             placeholder: "500"  },
            { key: "libraryFee"        as const, label: "Library Fee",          placeholder: "300"  },
          ]).map(({ key, label, placeholder }) => (
            <Field key={key} label={label}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-muted-foreground">NPR</span>
                <Input type="number" value={form[key] as string}
                  onChange={(e) => set(key, e.target.value as ClassFormData[typeof key])}
                  placeholder={placeholder} className="pl-12" />
              </div>
            </Field>
          ))}
        </div>
      </FormSection>

      {/* H. Exam & Grading */}
      <FormSection icon={ClipboardList} title="Exam & Grading Setup" subtitle="Assessment configuration" defaultOpen={false}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Grading System">
            <Select value={form.gradingSystem} onChange={(v) => set("gradingSystem", v)}
              options={["Percentage","GPA","Letter Grade","Remarks"]} />
          </Field>
          <Field label="Pass Percentage (%)">
            <Input type="number" value={form.passPct} onChange={(e) => set("passPct", e.target.value)} placeholder="40" />
          </Field>
          <Field label="Exam Terms">
            <Select value={form.examTerms} onChange={(v) => set("examTerms", v)} options={["1","2","3","4"]} />
          </Field>
          <label className="flex items-center gap-2 cursor-pointer text-[13px]">
            <input type="checkbox" checked={form.gpaEnabled}
              onChange={(e) => set("gpaEnabled", e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary" />
            GPA Enabled
          </label>
        </div>
      </FormSection>

      {/* I. Notes */}
      <FormSection icon={StickyNote} title="Administrative Notes" subtitle="Internal notes and instructions" defaultOpen={false}>
        <div className="grid gap-4">
          <Field label="Admin Notes">
            <TA value={form.adminNotes} onChange={(v) => set("adminNotes", v)} rows={3} placeholder="Internal notes…" />
          </Field>
          <Field label="Special Instructions">
            <TA value={form.specialInstructions} onChange={(v) => set("specialInstructions", v)} rows={2} placeholder="Special instructions…" />
          </Field>
        </div>
      </FormSection>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}><X className="mr-1.5 h-4 w-4" />Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving
            ? <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />Saving…</span>
            : <><Check className="mr-1.5 h-4 w-4" />{mode === "create" ? "Create Class" : "Save Changes"}</>}
        </Button>
      </div>
    </form>
  );
}
