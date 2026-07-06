import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen, ClipboardList, FileText, Layers, Printer, Save, Users, X, Plus,
} from "lucide-react";
import { toast }    from "sonner";
import { Button }   from "@/components/ui/button";
import { FormSection } from "@/components/students/forms/FormSection";
import {
  SUBJECTS,
  SUBJECT_TYPE_OPTIONS, SUBJECT_CATEGORY_OPTIONS, SUBJECT_STATUS_OPTIONS,
  ACADEMIC_YEAR_OPTIONS, GRADE_OPTIONS, SECTION_OPTIONS,
  DEPARTMENT_OPTIONS, TEACHER_OPTIONS,
  type SubjectType, type SubjectCategory, type SubjectStatus,
} from "@/data/subjectsData";

// ─── types ───────────────────────────────────────────────────────────────────
interface ClassMappingDraft {
  tempId: string;
  className: string;
  section: string;
  teacherName: string;
  room: string;
  weeklyPeriods: string;
}

interface SubjectFormData {
  subjectCode:        string;
  subjectName:        string;
  type:               SubjectType | "";
  category:           SubjectCategory | "";
  status:             SubjectStatus | "";
  description:        string;
  academicYear:       string;
  department:         string;
  primaryTeacher:     string;
  assistantTeacher:   string;
  room:               string;
  weeklyPeriods:      string;
  fullMarks:          string;
  passMarks:          string;
  theoryMarks:        string;
  practicalMarks:     string;
  internalMarks:      string;
  creditHours:        string;
  examDuration:       string;
  gpaEnabled:         boolean;
  practicalRequired:  boolean;
  projectRequired:    boolean;
  vivaRequired:       boolean;
  assignmentRequired: boolean;
  classMappings:      ClassMappingDraft[];
  notes:              string;
}

type Errors = Partial<Record<keyof SubjectFormData | string, string>>;

// ─── field helpers ────────────────────────────────────────────────────────────
function Field({ id, label, required, error, children }: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div data-field={id} className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

function Inp({ id, value, onChange, placeholder, error, type = "text" }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; type?: string;
}) {
  return (
    <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-9 w-full rounded-md border px-3 text-[13px] bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${error ? "border-rose-400" : "border-input"}`} />
  );
}

function Sel({ id, value, onChange, opts, placeholder, error }: {
  id: string; value: string; onChange: (v: string) => void;
  opts: string[]; placeholder: string; error?: string;
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
      className={`h-9 w-full rounded-md border px-3 text-[13px] bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${error ? "border-rose-400" : "border-input"}`}>
      <option value="">{placeholder}</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TA({ id, value, onChange, placeholder }: {
  id: string; value: string; onChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
}) {
  return (
    <textarea id={id} value={value} onChange={onChange} rows={3} placeholder={placeholder}
      className="w-full rounded-md border border-input px-3 py-2 text-[13px] bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
  );
}

function Check({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-border" />
      <span className="text-[12.5px] text-foreground">{label}</span>
    </label>
  );
}

// ─── empty mapping factory ────────────────────────────────────────────────────
function emptyMapping(): ClassMappingDraft {
  return { tempId: `${Date.now()}-${Math.random()}`, className: "", section: "", teacherName: "", room: "", weeklyPeriods: "" };
}

// ─── validation ───────────────────────────────────────────────────────────────
function validate(f: SubjectFormData): Errors {
  const e: Errors = {};
  if (!f.subjectCode.trim())  e.subjectCode  = "Subject code is required.";
  if (!f.subjectName.trim())  e.subjectName  = "Subject name is required.";
  if (!f.type)                e.type         = "Subject type is required.";
  if (!f.category)            e.category     = "Category is required.";
  if (!f.status)              e.status       = "Status is required.";
  if (!f.academicYear)        e.academicYear = "Academic year is required.";
  if (!f.primaryTeacher)      e.primaryTeacher = "Primary teacher is required.";
  if (!f.department)          e.department   = "Department is required.";
  if (!f.fullMarks || isNaN(Number(f.fullMarks)) || Number(f.fullMarks) <= 0)
                              e.fullMarks    = "Full marks must be a positive number.";
  if (!f.passMarks || isNaN(Number(f.passMarks)) || Number(f.passMarks) <= 0)
                              e.passMarks    = "Pass marks must be a positive number.";
  if (Number(f.passMarks) >= Number(f.fullMarks))
                              e.passMarks    = "Pass marks must be less than full marks.";
  if (!f.weeklyPeriods || isNaN(Number(f.weeklyPeriods)) || Number(f.weeklyPeriods) <= 0)
                              e.weeklyPeriods = "Weekly periods required.";
  return e;
}

// ─── default form state ───────────────────────────────────────────────────────
function defaultForm(): SubjectFormData {
  return {
    subjectCode: "", subjectName: "", type: "", category: "", status: "active",
    description: "", academicYear: "2026/27", department: "",
    primaryTeacher: "", assistantTeacher: "", room: "",
    weeklyPeriods: "", fullMarks: "", passMarks: "",
    theoryMarks: "", practicalMarks: "", internalMarks: "",
    creditHours: "", examDuration: "",
    gpaEnabled: true, practicalRequired: false, projectRequired: false,
    vivaRequired: false, assignmentRequired: false,
    classMappings: [emptyMapping()],
    notes: "",
  };
}

// ─── component ────────────────────────────────────────────────────────────────
export function SubjectForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const existing = mode === "edit" ? SUBJECTS.find((s) => s.id === Number(id)) : undefined;

  const [form, setForm] = useState<SubjectFormData>(() => {
    if (existing) {
      return {
        subjectCode: existing.subjectCode,
        subjectName: existing.subjectName,
        type:        existing.type,
        category:    existing.category,
        status:      existing.status,
        description: existing.description,
        academicYear: existing.academicYear,
        department:  existing.department,
        primaryTeacher: existing.primaryTeacher.name,
        assistantTeacher: existing.assistantTeacher,
        room:         existing.room,
        weeklyPeriods: String(existing.weeklyPeriods),
        fullMarks:    String(existing.fullMarks),
        passMarks:    String(existing.passMarks),
        theoryMarks:  String(existing.theoryMarks),
        practicalMarks: String(existing.practicalMarks),
        internalMarks: String(existing.internalMarks),
        creditHours:  String(existing.creditHours),
        examDuration: existing.examDuration,
        gpaEnabled:   existing.gpaEnabled,
        practicalRequired:  existing.practicalRequired,
        projectRequired:    existing.projectRequired,
        vivaRequired:       existing.vivaRequired,
        assignmentRequired: existing.assignmentRequired,
        classMappings: [emptyMapping()],
        notes: "",
      };
    }
    return defaultForm();
  });

  const [errors,  setErrors]  = useState<Errors>({});
  const [saving,  setSaving]  = useState(false);

  const set = useCallback(<K extends keyof SubjectFormData>(k: K, v: SubjectFormData[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => { const n = { ...prev }; delete n[k as string]; return n; });
  }, []);

  function updateMapping(tempId: string, k: keyof ClassMappingDraft, v: string) {
    setForm((prev) => ({
      ...prev,
      classMappings: prev.classMappings.map((m) => m.tempId === tempId ? { ...m, [k]: v } : m),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success(mode === "create" ? "Subject created successfully." : "Subject updated successfully.");
    navigate("/subjects");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">{mode === "create" ? "Add New Subject" : "Edit Subject"}</h1>
          <p className="text-[12px] text-muted-foreground">
            {mode === "create" ? "Register a new subject in the curriculum." : `Editing: ${existing?.subjectName ?? ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px]"
            onClick={() => navigate("/subjects/subject-form/print")}>
            <Printer className="h-3.5 w-3.5" />Print Form
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-[11px]"
            onClick={() => navigate("/subjects")}>
            <X className="h-3.5 w-3.5" />Cancel
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[11px]" onClick={handleSubmit} disabled={saving}>
            <Save className="h-3.5 w-3.5" />{saving ? "Saving…" : mode === "create" ? "Create Subject" : "Save Changes"}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* 1. Basic Info */}
        <FormSection icon={BookOpen} title="Basic Information" subtitle="Subject identity and curriculum placement" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="subjectCode" label="Subject Code" required error={errors.subjectCode}>
              <Inp id="subjectCode" value={form.subjectCode} onChange={(v) => set("subjectCode", v)}
                placeholder="e.g. SUB-ENG-001" error={errors.subjectCode} />
            </Field>
            <Field id="subjectName" label="Subject Name" required error={errors.subjectName}>
              <Inp id="subjectName" value={form.subjectName} onChange={(v) => set("subjectName", v)}
                placeholder="e.g. English" error={errors.subjectName} />
            </Field>
            <Field id="type" label="Subject Type" required error={errors.type}>
              <Sel id="type" value={form.type} onChange={(v) => set("type", v as SubjectType)}
                opts={SUBJECT_TYPE_OPTIONS} placeholder="Select type" error={errors.type} />
            </Field>
            <Field id="category" label="Category" required error={errors.category}>
              <Sel id="category" value={form.category} onChange={(v) => set("category", v as SubjectCategory)}
                opts={SUBJECT_CATEGORY_OPTIONS} placeholder="Select category" error={errors.category} />
            </Field>
            <Field id="department" label="Department" required error={errors.department}>
              <Sel id="department" value={form.department} onChange={(v) => set("department", v)}
                opts={DEPARTMENT_OPTIONS} placeholder="Select department" error={errors.department} />
            </Field>
            <Field id="status" label="Status" required error={errors.status}>
              <Sel id="status" value={form.status} onChange={(v) => set("status", v as SubjectStatus)}
                opts={SUBJECT_STATUS_OPTIONS} placeholder="Select status" error={errors.status} />
            </Field>
            <Field id="academicYear" label="Academic Year" required error={errors.academicYear}>
              <Sel id="academicYear" value={form.academicYear} onChange={(v) => set("academicYear", v)}
                opts={ACADEMIC_YEAR_OPTIONS} placeholder="Select year" error={errors.academicYear} />
            </Field>
            <Field id="room" label="Default Room / Lab">
              <Inp id="room" value={form.room} onChange={(v) => set("room", v)} placeholder="e.g. Room 201 / Lab A" />
            </Field>
          </div>
          <Field id="description" label="Description">
            <TA id="description" value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("description", e.target.value)}
              placeholder="Brief description of what this subject covers…" />
          </Field>
        </FormSection>

        {/* 2. Teachers */}
        <FormSection icon={Users} title="Teacher Assignment" subtitle="Primary and assistant teachers for this subject" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="primaryTeacher" label="Primary Teacher" required error={errors.primaryTeacher}>
              <Sel id="primaryTeacher" value={form.primaryTeacher} onChange={(v) => set("primaryTeacher", v)}
                opts={TEACHER_OPTIONS} placeholder="Select teacher" error={errors.primaryTeacher} />
            </Field>
            <Field id="assistantTeacher" label="Assistant Teacher">
              <Sel id="assistantTeacher" value={form.assistantTeacher} onChange={(v) => set("assistantTeacher", v)}
                opts={TEACHER_OPTIONS} placeholder="Select teacher (optional)" />
            </Field>
          </div>
        </FormSection>

        {/* 3. Class Mappings */}
        <FormSection icon={Layers} title="Class Mappings" subtitle="Assign this subject to classes and sections">
          <div className="space-y-3">
            {form.classMappings.map((m, i) => (
              <div key={m.tempId} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] font-medium text-foreground">Mapping {i + 1}</p>
                  {form.classMappings.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6"
                      onClick={() => setForm((p) => ({ ...p, classMappings: p.classMappings.filter((x) => x.tempId !== m.tempId) }))}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field id={`cm-class-${m.tempId}`} label="Class">
                    <Sel id={`cm-class-${m.tempId}`} value={m.className} onChange={(v) => updateMapping(m.tempId, "className", v)}
                      opts={GRADE_OPTIONS} placeholder="Select class" />
                  </Field>
                  <Field id={`cm-sec-${m.tempId}`} label="Section">
                    <Sel id={`cm-sec-${m.tempId}`} value={m.section} onChange={(v) => updateMapping(m.tempId, "section", v)}
                      opts={SECTION_OPTIONS} placeholder="Section" />
                  </Field>
                  <Field id={`cm-teacher-${m.tempId}`} label="Class Teacher">
                    <Sel id={`cm-teacher-${m.tempId}`} value={m.teacherName} onChange={(v) => updateMapping(m.tempId, "teacherName", v)}
                      opts={TEACHER_OPTIONS} placeholder="Assign teacher" />
                  </Field>
                  <Field id={`cm-room-${m.tempId}`} label="Room">
                    <Inp id={`cm-room-${m.tempId}`} value={m.room} onChange={(v) => updateMapping(m.tempId, "room", v)} placeholder="e.g. Room 201" />
                  </Field>
                  <Field id={`cm-periods-${m.tempId}`} label="Periods/Week">
                    <Inp id={`cm-periods-${m.tempId}`} value={m.weeklyPeriods} onChange={(v) => updateMapping(m.tempId, "weeklyPeriods", v)}
                      placeholder="e.g. 5" type="number" />
                  </Field>
                </div>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" className="h-8 gap-1.5 text-[11px]"
              onClick={() => setForm((p) => ({ ...p, classMappings: [...p.classMappings, emptyMapping()] }))}>
              <Plus className="h-3.5 w-3.5" />Add Mapping
            </Button>
          </div>
        </FormSection>

        {/* 4. Periods & Schedule */}
        <FormSection icon={ClipboardList} title="Periods &amp; Schedule" subtitle="Weekly teaching load and credit hours">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="weeklyPeriods" label="Weekly Periods" required error={errors.weeklyPeriods}>
              <Inp id="weeklyPeriods" value={form.weeklyPeriods} onChange={(v) => set("weeklyPeriods", v)}
                placeholder="e.g. 6" type="number" error={errors.weeklyPeriods} />
            </Field>
            <Field id="creditHours" label="Credit Hours">
              <Inp id="creditHours" value={form.creditHours} onChange={(v) => set("creditHours", v)}
                placeholder="e.g. 4" type="number" />
            </Field>
            <Field id="examDuration" label="Exam Duration">
              <Inp id="examDuration" value={form.examDuration} onChange={(v) => set("examDuration", v)}
                placeholder="e.g. 3 hours" />
            </Field>
          </div>
        </FormSection>

        {/* 5. Marks Structure */}
        <FormSection icon={ClipboardList} title="Marks Structure" subtitle="Full marks, pass marks, and mark breakdown">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field id="fullMarks" label="Full Marks" required error={errors.fullMarks}>
              <Inp id="fullMarks" value={form.fullMarks} onChange={(v) => set("fullMarks", v)}
                placeholder="e.g. 100" type="number" error={errors.fullMarks} />
            </Field>
            <Field id="passMarks" label="Pass Marks" required error={errors.passMarks}>
              <Inp id="passMarks" value={form.passMarks} onChange={(v) => set("passMarks", v)}
                placeholder="e.g. 40" type="number" error={errors.passMarks} />
            </Field>
            <Field id="theoryMarks" label="Theory Marks">
              <Inp id="theoryMarks" value={form.theoryMarks} onChange={(v) => set("theoryMarks", v)}
                placeholder="e.g. 75" type="number" />
            </Field>
            <Field id="practicalMarks" label="Practical Marks">
              <Inp id="practicalMarks" value={form.practicalMarks} onChange={(v) => set("practicalMarks", v)}
                placeholder="e.g. 25" type="number" />
            </Field>
            <Field id="internalMarks" label="Internal / CW Marks">
              <Inp id="internalMarks" value={form.internalMarks} onChange={(v) => set("internalMarks", v)}
                placeholder="e.g. 20" type="number" />
            </Field>
          </div>
        </FormSection>

        {/* 6. Assessment Settings */}
        <FormSection icon={ClipboardList} title="Assessment Settings" subtitle="Exam requirements and grading configuration">
          <div className="grid gap-3 sm:grid-cols-2">
            <Check id="gpaEnabled"         checked={form.gpaEnabled}         onChange={(v) => set("gpaEnabled", v)}         label="GPA Enabled"          />
            <Check id="practicalRequired"  checked={form.practicalRequired}  onChange={(v) => set("practicalRequired", v)}  label="Practical Exam Required" />
            <Check id="projectRequired"    checked={form.projectRequired}    onChange={(v) => set("projectRequired", v)}    label="Project Required"     />
            <Check id="vivaRequired"       checked={form.vivaRequired}       onChange={(v) => set("vivaRequired", v)}       label="Viva / Oral Required" />
            <Check id="assignmentRequired" checked={form.assignmentRequired} onChange={(v) => set("assignmentRequired", v)} label="Assignment Required"  />
          </div>
        </FormSection>

        {/* 7. Documents */}
        <FormSection icon={FileText} title="Documents Checklist" subtitle="Track required documents for this subject">
          <div className="grid gap-2 sm:grid-cols-2">
            {["Syllabus 2026/27","Lesson Plan","Teacher's Guide","Question Bank","Assignment Sheets","Reference Materials"].map((doc) => (
              <label key={doc} className="flex items-center gap-2 cursor-pointer select-none text-[12.5px] text-muted-foreground">
                <input type="checkbox" className="h-4 w-4 rounded border-border" />
                {doc}
              </label>
            ))}
          </div>
        </FormSection>

        {/* 8. Notes */}
        <FormSection icon={FileText} title="Notes &amp; Remarks" subtitle="Additional instructions or curriculum notes">
          <Field id="notes" label="Notes">
            <TA id="notes" value={form.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("notes", e.target.value)}
              placeholder="Any notes, special instructions, or remarks for this subject…" />
          </Field>
        </FormSection>

        {/* submit row */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/subjects")}>Cancel</Button>
          <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />{saving ? "Saving…" : mode === "create" ? "Create Subject" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
