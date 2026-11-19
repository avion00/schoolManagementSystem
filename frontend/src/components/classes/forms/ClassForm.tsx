import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Check, Info, Layers, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { useClassRecord, useSaveClass, useSchools, type SectionDraft, type SubjectDraft } from "@/api/classes";
import { errorMessage, type Schemas } from "@/api/http";
import { useSubjects } from "@/api/teachers";
import { FormSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Types ─────────────────────────────────────────────────────────────────────
interface SectionRow extends SectionDraft { tempId: string }
interface SubjectRow extends SubjectDraft { tempId: string }

interface ClassFormData {
  code: string;
  name: string;
  gradeLevel: string;
  status: string;
  medium: string;
  shift: string;
  building: string;
  mainRoom: string;
  description: string;
  sections: SectionRow[];
  subjects: SubjectRow[];
}

type Errors = Partial<Record<string, string>>;

const MEDIUM_OPTIONS = ["English", "Nepali", "Bilingual"];
const SHIFT_OPTIONS = ["Morning", "Day", "Evening"];
const STATUS_OPTIONS = ["active", "inactive", "suspended"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Field({ label: text, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12.5px]">
        {text}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Select({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
  placeholder?: string; error?: boolean;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`flex h-9 w-full rounded-md border px-3 py-1 text-sm bg-background shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring ${error ? "border-destructive" : "border-input"}`}>
      <option value="">{placeholder ?? "Select…"}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const opts = (xs: string[]) => xs.map((x) => ({ value: x.toLowerCase(), label: x.charAt(0).toUpperCase() + x.slice(1) }));
const tid = () => `${Date.now()}-${Math.random()}`;
const emptySection = (): SectionRow => ({ tempId: tid(), name: "", code: "", room: "", capacity: "" });
const emptySubject = (): SubjectRow => ({ tempId: tid(), subject: "", weeklyPeriods: "", isOptional: false });

const EMPTY: ClassFormData = {
  code: "", name: "", gradeLevel: "", status: "active", medium: "", shift: "",
  building: "", mainRoom: "", description: "", sections: [emptySection()], subjects: [],
};

function recordToForm(r: { cls: Schemas["ClassLevel"]; sections: Schemas["Section"][]; subjects: Schemas["ClassSubject"][] }): ClassFormData {
  return {
    code: r.cls.code ?? "", name: r.cls.name, gradeLevel: String(r.cls.order ?? ""),
    status: r.cls.status ?? "active", medium: r.cls.medium ?? "", shift: r.cls.shift ?? "",
    building: r.cls.building ?? "", mainRoom: r.cls.main_room ?? "", description: r.cls.description ?? "",
    sections: r.sections.map((s) => ({
      tempId: s.id, id: s.id, name: s.name, code: s.code ?? "", room: s.room ?? "",
      capacity: s.capacity === null || s.capacity === undefined ? "" : String(s.capacity),
    })),
    subjects: r.subjects.map((s) => ({
      tempId: s.id, id: s.id, subject: s.subject, weeklyPeriods: String(s.weekly_periods ?? ""),
      isOptional: !!s.is_optional,
    })),
  };
}

function validate(form: ClassFormData): Errors {
  const e: Errors = {};
  if (!form.name.trim()) e.name = "Class name is required.";
  form.sections.forEach((s, i) => {
    if (!s.name.trim()) e[`sec_name_${i}`] = "Section name required.";
    if (s.capacity && (!/^\d+$/.test(s.capacity) || Number(s.capacity) < 1)) e[`sec_cap_${i}`] = "Use a whole number.";
  });
  const names = form.sections.map((s) => s.name.trim().toLowerCase()).filter(Boolean);
  if (new Set(names).size !== names.length) e.sections = "Section names must be unique.";
  const subs = form.subjects.map((s) => s.subject).filter(Boolean);
  if (new Set(subs).size !== subs.length) e.subjects = "Each subject can be added once.";
  return e;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ClassForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const record = useClassRecord(mode === "edit" ? id : undefined);
  const school = useSchools();
  const subjects = useSubjects();
  const save = useSaveClass();

  const [form, setForm] = useState<ClassFormData>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (record.data) setForm(recordToForm(record.data));
  }, [record.data]);

  function set<K extends keyof ClassFormData>(key: K, val: ClassFormData[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setErrors((e) => { const n = { ...e }; delete n[key as string]; return n; });
  }
  const updateSection = (tempId: string, key: keyof SectionDraft, val: string) =>
    setForm((f) => ({ ...f, sections: f.sections.map((s) => s.tempId === tempId ? { ...s, [key]: val } : s) }));
  const updateSubject = (tempId: string, patch: Partial<SubjectDraft>) =>
    setForm((f) => ({ ...f, subjects: f.subjects.map((s) => s.tempId === tempId ? { ...s, ...patch } : s) }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix the errors before saving.");
      return;
    }
    try {
      const saved = await save.mutateAsync({
        id: mode === "edit" ? id : undefined,
        payload: {
          ...(mode === "create" ? { school: school.data?.id } : {}),
          name: form.name.trim(), code: form.code.trim(), order: Number(form.gradeLevel) || 0,
          status: form.status, medium: form.medium, shift: form.shift, building: form.building,
          main_room: form.mainRoom, description: form.description,
        },
        sections: form.sections,
        subjects: form.subjects,
      });
      toast.success(mode === "create" ? "Class created." : "Class updated.");
      navigate(`/classes/${saved.id}`);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save the class."));
    }
  }

  const subjectOptions = (subjects.data ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }));
  const saving = save.isPending;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">{mode === "create" ? "Add New Class" : "Edit Class"}</h2>
          <p className="text-[13px] text-muted-foreground">
            {mode === "create" ? "Set up a class with its sections and subjects." : "Update class information, sections and subjects."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}><X className="mr-1.5 h-4 w-4" />Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : <><Check className="mr-1.5 h-4 w-4" />{mode === "create" ? "Create Class" : "Save Changes"}</>}
          </Button>
        </div>
      </div>

      {/* A. Basic */}
      <FormSection icon={Layers} title="Basic Class Information" subtitle="Core identifiers and settings"
        errorCount={errors.name ? 1 : 0}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Class Name" required error={errors.name}>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Grade 8"
              className={errors.name ? "border-destructive" : ""} />
          </Field>
          <Field label="Class Code">
            <Input value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="e.g. G8" />
          </Field>
          <Field label="Grade Level">
            <Input type="number" value={form.gradeLevel} onChange={(e) => set("gradeLevel", e.target.value)}
              placeholder="Used for ordering, e.g. 8" min="0" />
          </Field>
          <Field label="Medium">
            <Select value={form.medium} onChange={(v) => set("medium", v)} options={opts(MEDIUM_OPTIONS)} />
          </Field>
          <Field label="Shift">
            <Select value={form.shift} onChange={(v) => set("shift", v)} options={opts(SHIFT_OPTIONS)} />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(v) => set("status", v)} options={opts(STATUS_OPTIONS)} />
          </Field>
          <Field label="Building">
            <Input value={form.building} onChange={(e) => set("building", e.target.value)} placeholder="e.g. Block A" />
          </Field>
          <Field label="Main Room">
            <Input value={form.mainRoom} onChange={(e) => set("mainRoom", e.target.value)} placeholder="e.g. 101" />
          </Field>
          <div className="sm:col-span-2 lg:col-span-3">
            <Field label="Description">
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2}
                placeholder="Brief class description…"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
            </Field>
          </div>
        </div>
      </FormSection>

      {/* B. Sections */}
      <FormSection icon={BookOpen} title="Sections" subtitle="Sections, rooms and capacity (enrolment can't exceed capacity)"
        errorCount={Object.keys(errors).filter((k) => k.startsWith("sec") || k === "sections").length}>
        <div className="space-y-4">
          {errors.sections && <p className="text-[12px] text-destructive">{errors.sections}</p>}
          {form.sections.length === 0 && <p className="text-[12.5px] text-muted-foreground">No sections. Students can still be enrolled in the class.</p>}
          {form.sections.map((sec, idx) => (
            <div key={sec.tempId} className="relative rounded-xl border border-border/60 bg-muted/30 p-4">
              <button type="button" onClick={() => set("sections", form.sections.filter((s) => s.tempId !== sec.tempId))}
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                aria-label="Remove section">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <p className="mb-3 text-[12px] font-semibold text-muted-foreground">Section {idx + 1}</p>
              <div className="grid gap-3 sm:grid-cols-4">
                <Field label="Name" required error={errors[`sec_name_${idx}`]}>
                  <Input value={sec.name} onChange={(e) => updateSection(sec.tempId, "name", e.target.value)} placeholder="A" />
                </Field>
                <Field label="Code">
                  <Input value={sec.code} onChange={(e) => updateSection(sec.tempId, "code", e.target.value)} placeholder="8A" />
                </Field>
                <Field label="Room">
                  <Input value={sec.room} onChange={(e) => updateSection(sec.tempId, "room", e.target.value)} placeholder="101" />
                </Field>
                <Field label="Capacity" error={errors[`sec_cap_${idx}`]}>
                  <Input type="number" min="1" value={sec.capacity}
                    onChange={(e) => updateSection(sec.tempId, "capacity", e.target.value)} placeholder="No limit" />
                </Field>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5"
            onClick={() => set("sections", [...form.sections, emptySection()])}>
            <Plus className="h-3.5 w-3.5" />Add Section
          </Button>
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> Class teachers are set from each teacher's assignments.
          </p>
        </div>
      </FormSection>

      {/* C. Subjects */}
      <FormSection icon={BookOpen} title="Curriculum" subtitle="Subjects this class takes in the current academic year"
        errorCount={errors.subjects ? 1 : 0}>
        <div className="space-y-3">
          {errors.subjects && <p className="text-[12px] text-destructive">{errors.subjects}</p>}
          {form.subjects.length === 0 && <p className="text-[12.5px] text-muted-foreground">No subjects added yet.</p>}
          {form.subjects.map((sub) => (
            <div key={sub.tempId} className="grid items-end gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 sm:grid-cols-[2fr_1fr_auto_auto]">
              <Field label="Subject">
                <Select value={sub.subject} onChange={(v) => updateSubject(sub.tempId, { subject: v })}
                  options={subjectOptions} placeholder={subjects.isLoading ? "Loading…" : "Select subject…"} />
              </Field>
              <Field label="Weekly Periods">
                <Input type="number" min="0" value={sub.weeklyPeriods}
                  onChange={(e) => updateSubject(sub.tempId, { weeklyPeriods: e.target.value })} placeholder="5" />
              </Field>
              <label className="flex h-9 items-center gap-2 text-[12.5px] text-muted-foreground">
                <input type="checkbox" checked={sub.isOptional}
                  onChange={(e) => updateSubject(sub.tempId, { isOptional: e.target.checked })} />
                Optional
              </label>
              <Button type="button" variant="ghost" size="sm" className="text-rose-600"
                onClick={() => set("subjects", form.subjects.filter((s) => s.tempId !== sub.tempId))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5"
            onClick={() => set("subjects", [...form.subjects, emptySubject()])}>
            <Plus className="h-3.5 w-3.5" />Add Subject
          </Button>
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> Marks schemes come from each subject; fees are set under Billing → Fee structures.
          </p>
        </div>
      </FormSection>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => navigate(-1)}><X className="mr-1.5 h-4 w-4" />Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : <><Check className="mr-1.5 h-4 w-4" />{mode === "create" ? "Create Class" : "Save Changes"}</>}
        </Button>
      </div>
    </form>
  );
}

