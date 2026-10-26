import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen, ClipboardList, Info, Layers, Printer, Save, Users, X, Plus,
} from "lucide-react";
import { toast }    from "sonner";
import { Button }   from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";
import { useClasses, useSchools } from "@/api/classes";
import { errorMessage, type Schemas } from "@/api/http";
import {
  CATEGORY_LABEL, CATEGORY_VALUE, TYPE_LABEL, TYPE_VALUE, useSaveSubject, useSubjectRecord,
} from "@/api/subjects";
import {
  SUBJECT_TYPE_OPTIONS, SUBJECT_CATEGORY_OPTIONS, SUBJECT_STATUS_OPTIONS,
  type SubjectType, type SubjectCategory, type SubjectStatus,
} from "@/api/types/subjects";

// ─── types ───────────────────────────────────────────────────────────────────
interface ClassMappingDraft {
  id?: string;
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
  const num = (x: string) => (x.trim() === "" ? null : Number(x));
  if (!f.subjectCode.trim())  e.subjectCode  = "Subject code is required.";
  if (!f.subjectName.trim())  e.subjectName  = "Subject name is required.";
  if (!f.type)                e.type         = "Subject type is required.";
  if (!f.category)            e.category     = "Category is required.";
  const full = num(f.fullMarks);
  const pass = num(f.passMarks);
  if (full === null || isNaN(full) || full <= 0) e.fullMarks = "Full marks must be a positive number.";
  if (pass === null || isNaN(pass) || pass < 0)  e.passMarks = "Pass marks are required.";
  else if (full !== null && pass > full)         e.passMarks = "Pass marks can't exceed full marks.";
  const parts = [f.theoryMarks, f.practicalMarks, f.internalMarks].map(num);
  if (parts.some((x) => x !== null) && full !== null && parts.reduce<number>((a, b) => a + (b ?? 0), 0) !== full)
    e.theoryMarks = "Theory + practical + internal must add up to full marks.";
  const classes = f.classMappings.map((m) => m.className).filter(Boolean);
  if (new Set(classes).size !== classes.length) e.classMappings = "Each class can be added once.";
  return e;
}

// ─── default form state ───────────────────────────────────────────────────────
function defaultForm(): SubjectFormData {
  return {
    subjectCode: "", subjectName: "", type: "", category: "", status: "active",
    description: "", academicYear: "", department: "",
    primaryTeacher: "", assistantTeacher: "", room: "",
    weeklyPeriods: "", fullMarks: "", passMarks: "",
    theoryMarks: "", practicalMarks: "", internalMarks: "",
    creditHours: "", examDuration: "",
    gpaEnabled: true, practicalRequired: false, projectRequired: false,
    vivaRequired: false, assignmentRequired: false,
    classMappings: [],
    notes: "",
  };
}

function recordToForm(r: { subject: Schemas["Subject"]; mappings: Schemas["ClassSubject"][] }): SubjectFormData {
  const x = r.subject;
  const str = (v: unknown) => (v === null || v === undefined ? "" : String(Number(v)));
  return {
    ...defaultForm(),
    subjectCode: x.code, subjectName: x.name,
    type: TYPE_LABEL[x.type ?? "theory"] ?? "", category: CATEGORY_LABEL[x.category ?? "compulsory"] ?? "",
    status: (x.status ?? "active") as SubjectStatus, description: x.description ?? "",
    department: x.department ?? "", fullMarks: str(x.full_marks), passMarks: str(x.pass_marks),
    theoryMarks: str(x.theory_marks), practicalMarks: str(x.practical_marks), internalMarks: str(x.internal_marks),
    creditHours: str(x.credit_hours), examDuration: str(x.exam_duration_minutes),
    gpaEnabled: !!x.gpa_enabled, practicalRequired: !!x.practical_required, projectRequired: !!x.project_required,
    vivaRequired: !!x.viva_required, assignmentRequired: !!x.assignment_required,
    classMappings: r.mappings.map((m) => ({
      tempId: m.id, id: m.id, className: m.class_level, section: "", teacherName: "", room: "",
      weeklyPeriods: String(m.weekly_periods ?? ""),
    })),
  };
}

// ─── component ────────────────────────────────────────────────────────────────
export function SubjectForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const record = useSubjectRecord(mode === "edit" ? id : undefined);
  const classes = useClasses();
  const school = useSchools();
  const save = useSaveSubject();
  const saving = save.isPending;
  const [form, setForm] = useState<SubjectFormData>(defaultForm);
  const [errors,  setErrors]  = useState<Errors>({});

  useEffect(() => {
    if (record.data) setForm(recordToForm(record.data));
  }, [record.data]);

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
    const num = (x: string) => (x.trim() === "" ? null : x.trim());
    try {
      const saved = await save.mutateAsync({
        id: mode === "edit" ? id : undefined,
        payload: {
          code: form.subjectCode.trim(), name: form.subjectName.trim(),
          type: TYPE_VALUE[form.type] ?? "theory", category: CATEGORY_VALUE[form.category] ?? "compulsory",
          status: form.status || "active", description: form.description, department: form.department,
          full_marks: form.fullMarks, pass_marks: form.passMarks,
          theory_marks: num(form.theoryMarks), practical_marks: num(form.practicalMarks),
          internal_marks: num(form.internalMarks), credit_hours: num(form.creditHours),
          exam_duration_minutes: form.examDuration.trim() ? Number(form.examDuration) : null,
          gpa_enabled: form.gpaEnabled, practical_required: form.practicalRequired,
          project_required: form.projectRequired, viva_required: form.vivaRequired,
          assignment_required: form.assignmentRequired,
          ...(mode === "create" ? { school: school.data?.id } : {}),
        },
        mappings: form.classMappings.map((m) => ({ id: m.id, classLevel: m.className, weeklyPeriods: m.weeklyPeriods })),
      });
      toast.success(mode === "create" ? "Subject created." : "Subject updated.");
      navigate(`/subjects/${saved.id}`);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save the subject."));
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">{mode === "create" ? "Add New Subject" : "Edit Subject"}</h1>
          <p className="text-[12px] text-muted-foreground">
            {mode === "create" ? "Register a new subject in the curriculum." : `Editing: ${form.subjectName}`}
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
            <Field id="department" label="Department">
              <Inp id="department" value={form.department} onChange={(v) => set("department", v)} placeholder="e.g. Science" />
            </Field>
            <Field id="status" label="Status" required error={errors.status}>
              <Sel id="status" value={form.status} onChange={(v) => set("status", v as SubjectStatus)}
                opts={SUBJECT_STATUS_OPTIONS} placeholder="Select status" error={errors.status} />
            </Field>
          </div>
          <Field id="description" label="Description">
            <TA id="description" value={form.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("description", e.target.value)}
              placeholder="Brief description of what this subject covers…" />
          </Field>
        </FormSection>

        {/* 2. Teachers */}
        <FormSection icon={Users} title="Teachers" subtitle="Who teaches this subject" defaultOpen={false}>
          <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> Teachers are linked to subjects through their class assignments (Teachers → Edit).
          </p>
        </FormSection>

        {/* 3. Class Mappings */}
        <FormSection icon={Layers} title="Class Mappings" subtitle="Classes that take this subject in the current academic year">
          <div className="space-y-3">
            {errors.classMappings && <p className="text-[12px] text-destructive">{errors.classMappings}</p>}
            {form.classMappings.length === 0 && <p className="text-[12px] text-muted-foreground">Not mapped to any class yet.</p>}
            {form.classMappings.map((m, i) => (
              <div key={m.tempId} className="rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[12px] font-medium text-foreground">Mapping {i + 1}</p>
                  {(
                    <Button type="button" size="icon" variant="ghost" className="h-6 w-6"
                      onClick={() => setForm((p) => ({ ...p, classMappings: p.classMappings.filter((x) => x.tempId !== m.tempId) }))}>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field id={`cm-class-${m.tempId}`} label="Class">
                    <select id={`cm-class-${m.tempId}`} value={m.className}
                      onChange={(e) => updateMapping(m.tempId, "className", e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm">
                      <option value="">Select class</option>
                      {(classes.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.className}</option>)}
                    </select>
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
        <FormSection icon={ClipboardList} title="Credits &amp; Exam" subtitle="Credit hours and exam length (weekly periods are set per class above)">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="creditHours" label="Credit Hours">
              <Inp id="creditHours" value={form.creditHours} onChange={(v) => set("creditHours", v)}
                placeholder="e.g. 4" type="number" />
            </Field>
            <Field id="examDuration" label="Exam Duration (minutes)">
              <Inp id="examDuration" value={form.examDuration} onChange={(v) => set("examDuration", v)}
                placeholder="e.g. 180" type="number" />
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
            <Field id="theoryMarks" label="Theory Marks" error={errors.theoryMarks}>
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
