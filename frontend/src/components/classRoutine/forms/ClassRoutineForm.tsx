import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Clock, FileText, Printer, RefreshCw, Save, X, AlertTriangle } from "lucide-react";
import { toast }   from "sonner";
import { Button }  from "@/components/ui/button";
import { FormSection } from "@/components/students/forms/FormSection";
import {
  ROUTINES, SCHOOL_DAYS, SHIFT_OPTIONS, STATUS_OPTIONS,
  ACADEMIC_YEAR_OPTIONS, CLASS_OPTIONS, SECTION_OPTIONS,
  TEACHER_OPTIONS, SUBJECT_OPTIONS, ROOM_OPTIONS,
  type RoutineStatus, type Shift, type Day,
} from "@/data/classRoutineData";

// ─── form state ──────────────────────────────────────────────────────────────
interface FormData {
  routineId:    string;
  academicYear: string;
  className:    string;
  section:      string;
  day:          Day | "";
  shift:        Shift | "";
  status:       RoutineStatus | "";
  subject:      string;
  teacher:      string;
  room:         string;
  startTime:    string;
  endTime:      string;
  periodNo:     string;
  repeatWeekly: boolean;
  effectiveFrom:string;
  effectiveTo:  string;
  notes:        string;
  specialNotes: string;
}

type Errors = Partial<Record<keyof FormData | string, string>>;

function defaultForm(): FormData {
  return {
    routineId: "", academicYear: "2026/27", className: "", section: "", day: "", shift: "",
    status: "active", subject: "", teacher: "", room: "", startTime: "", endTime: "",
    periodNo: "", repeatWeekly: true, effectiveFrom: "2026-01-05", effectiveTo: "2026-12-20",
    notes: "", specialNotes: "",
  };
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function Field({ id, label, required, error, children }: {
  id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div data-field={id} className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12px] font-medium text-foreground">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{error}</p>}
    </div>
  );
}

function Inp({ id, value, onChange, placeholder, error, type = "text", disabled }: {
  id: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input id={id} type={type} value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`h-9 w-full rounded-md border px-3 text-[13px] bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${error ? "border-rose-400" : "border-input"}`} />
  );
}

function Sel({ id, value, onChange, opts, placeholder, error }: {
  id: string; value: string; onChange: (v: string) => void;
  opts: readonly string[]; placeholder: string; error?: string;
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
      className={`h-9 w-full rounded-md border px-3 text-[13px] bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${error ? "border-rose-400" : "border-input"}`}>
      <option value="">{placeholder}</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// Check if a teacher is already assigned at the same day+period in another class
function checkConflict(
  teacher: string, day: Day | "", startTime: string,
  excludeId?: number,
): RoutineEntry | undefined {
  if (!teacher || !day || !startTime) return undefined;
  return ROUTINES.find(
    (r) => r.teacher === teacher && r.day === day && r.startTime === startTime
      && (excludeId === undefined || r.id !== excludeId)
      && r.status === "active",
  );
}

import type { RoutineEntry } from "@/data/classRoutineData";

// ─── component ───────────────────────────────────────────────────────────────
export function ClassRoutineForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();

  const existing = mode === "edit" ? ROUTINES.find((r) => r.id === Number(id)) : undefined;

  const [form, setForm] = useState<FormData>(() => {
    if (existing) {
      return {
        routineId:    existing.routineId,
        academicYear: existing.academicYear,
        className:    existing.className,
        section:      existing.section,
        day:          existing.day,
        shift:        existing.shift,
        status:       existing.status,
        subject:      existing.subject,
        teacher:      existing.teacher,
        room:         existing.room,
        startTime:    existing.startTime,
        endTime:      existing.endTime,
        periodNo:     String(existing.periodNo),
        repeatWeekly: true,
        effectiveFrom:"2026-01-05",
        effectiveTo:  "2026-12-20",
        notes:        existing.notes,
        specialNotes: "",
      };
    }
    return defaultForm();
  });

  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const conflict = checkConflict(form.teacher, form.day, form.startTime, existing?.id);

  const set = useCallback(<K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrors((prev) => { const n = { ...prev }; delete n[k as string]; return n; });
  }, []);

  function validate(): Errors {
    const e: Errors = {};
    if (!form.className)  e.className  = "Class is required.";
    if (!form.section)    e.section    = "Section is required.";
    if (!form.day)        e.day        = "Day is required.";
    if (!form.subject)    e.subject    = "Subject is required.";
    if (!form.teacher)    e.teacher    = "Teacher is required.";
    if (!form.startTime)  e.startTime  = "Start time is required.";
    if (!form.endTime)    e.endTime    = "End time is required.";
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
                          e.endTime    = "End time must be after start time.";
    if (!form.shift)      e.shift      = "Shift is required.";
    if (!form.status)     e.status     = "Status is required.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.querySelector(`[data-field="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success(mode === "create" ? "Routine entry created successfully." : "Routine entry updated successfully.");
    navigate("/class-routine");
  }

  // auto-generate routineId
  function autoId() {
    if (!form.className || !form.section || !form.day) return;
    const code  = form.className.replace("Grade ", "G") + form.section;
    const dayAb = form.day.slice(0, 3).toUpperCase();
    const p     = form.periodNo ? `P${form.periodNo}` : "P?";
    set("routineId", `RT-${code}-${dayAb}-${p}`);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">
            {mode === "create" ? "Add New Routine Entry" : "Edit Routine Entry"}
          </h1>
          <p className="text-[12px] text-muted-foreground">
            {mode === "create" ? "Schedule a class period in the weekly timetable." : `Editing: ${existing?.routineId ?? ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px]"
            onClick={() => navigate("/class-routine/print")}>
            <Printer className="h-3.5 w-3.5" />Print
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-[11px]"
            onClick={() => navigate("/class-routine")}>
            <X className="h-3.5 w-3.5" />Cancel
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[11px]"
            onClick={handleSubmit} disabled={saving}>
            <Save className="h-3.5 w-3.5" />{saving ? "Saving…" : mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>

      {/* conflict banner */}
      {conflict && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/30">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="text-[12.5px]">
            <p className="font-semibold text-rose-700 dark:text-rose-400">Schedule Conflict Detected</p>
            <p className="text-rose-600 dark:text-rose-500">
              <strong>{conflict.teacher}</strong> is already assigned to <strong>{conflict.className} {conflict.section}</strong> ({conflict.subject}) at <strong>{conflict.startTime}</strong> on <strong>{conflict.day}</strong>.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* 1. Basic Routine Info */}
        <FormSection icon={CalendarDays} title="Basic Routine Info" subtitle="Schedule identity and class placement" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="routineId" label="Routine ID">
              <div className="flex gap-2">
                <Inp id="routineId" value={form.routineId} onChange={(v) => set("routineId", v)}
                  placeholder="e.g. RT-G6A-SUN-P1" />
                <Button type="button" size="sm" variant="outline" className="h-9 shrink-0 text-[11px]" onClick={autoId}>
                  Auto
                </Button>
              </div>
            </Field>
            <Field id="academicYear" label="Academic Year" required error={errors.academicYear}>
              <Sel id="academicYear" value={form.academicYear} onChange={(v) => set("academicYear", v)}
                opts={ACADEMIC_YEAR_OPTIONS} placeholder="Select year" />
            </Field>
            <Field id="className" label="Class" required error={errors.className}>
              <Sel id="className" value={form.className} onChange={(v) => set("className", v)}
                opts={CLASS_OPTIONS} placeholder="Select class" error={errors.className} />
            </Field>
            <Field id="section" label="Section" required error={errors.section}>
              <Sel id="section" value={form.section} onChange={(v) => set("section", v)}
                opts={SECTION_OPTIONS} placeholder="Select section" error={errors.section} />
            </Field>
            <Field id="day" label="Day" required error={errors.day}>
              <Sel id="day" value={form.day} onChange={(v) => set("day", v as Day)}
                opts={SCHOOL_DAYS} placeholder="Select day" error={errors.day} />
            </Field>
            <Field id="shift" label="Shift" required error={errors.shift}>
              <Sel id="shift" value={form.shift} onChange={(v) => set("shift", v as Shift)}
                opts={SHIFT_OPTIONS} placeholder="Select shift" error={errors.shift} />
            </Field>
            <Field id="status" label="Status" required error={errors.status}>
              <Sel id="status" value={form.status} onChange={(v) => set("status", v as RoutineStatus)}
                opts={STATUS_OPTIONS} placeholder="Select status" error={errors.status} />
            </Field>
          </div>
        </FormSection>

        {/* 2. Period Details */}
        <FormSection icon={Clock} title="Period Details" subtitle="Subject, teacher, room, and timing for this period" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="subject" label="Subject" required error={errors.subject}>
              <Sel id="subject" value={form.subject} onChange={(v) => set("subject", v)}
                opts={SUBJECT_OPTIONS} placeholder="Select subject" error={errors.subject} />
            </Field>
            <Field id="teacher" label="Teacher" required error={errors.teacher}>
              <Sel id="teacher" value={form.teacher} onChange={(v) => set("teacher", v)}
                opts={TEACHER_OPTIONS} placeholder="Select teacher" error={errors.teacher} />
            </Field>
            <Field id="room" label="Room">
              <Sel id="room" value={form.room} onChange={(v) => set("room", v)}
                opts={ROOM_OPTIONS} placeholder="Select room / lab" />
            </Field>
            <Field id="periodNo" label="Period Number">
              <Inp id="periodNo" value={form.periodNo} onChange={(v) => set("periodNo", v)}
                placeholder="e.g. 1" type="number" />
            </Field>
            <Field id="startTime" label="Start Time" required error={errors.startTime}>
              <Inp id="startTime" value={form.startTime} onChange={(v) => set("startTime", v)}
                placeholder="e.g. 6:45 AM" error={errors.startTime} />
            </Field>
            <Field id="endTime" label="End Time" required error={errors.endTime}>
              <Inp id="endTime" value={form.endTime} onChange={(v) => set("endTime", v)}
                placeholder="e.g. 7:30 AM" error={errors.endTime} />
            </Field>
          </div>
          {form.startTime && form.endTime && (
            <p className="text-[11px] text-muted-foreground">Duration: 45 min</p>
          )}
        </FormSection>

        {/* 3. Repeat Settings */}
        <FormSection icon={RefreshCw} title="Repeat Settings" subtitle="Set weekly recurrence and validity period">
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.repeatWeekly}
                onChange={(e) => set("repeatWeekly", e.target.checked)}
                className="h-4 w-4 rounded border-border" />
              <span className="text-[12.5px] text-foreground">Repeat every week (standard schedule)</span>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="effectiveFrom" label="Effective From">
                <Inp id="effectiveFrom" value={form.effectiveFrom}
                  onChange={(v) => set("effectiveFrom", v)} type="date"
                  disabled={!form.repeatWeekly} />
              </Field>
              <Field id="effectiveTo" label="Effective To">
                <Inp id="effectiveTo" value={form.effectiveTo}
                  onChange={(v) => set("effectiveTo", v)} type="date"
                  disabled={!form.repeatWeekly} />
              </Field>
            </div>
          </div>
        </FormSection>

        {/* 4. Notes */}
        <FormSection icon={FileText} title="Notes &amp; Instructions" subtitle="Admin notes and special instructions">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-foreground">Admin Notes</label>
              <textarea value={form.notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("notes", e.target.value)}
                rows={3} placeholder="Internal notes for this routine entry…"
                className="w-full rounded-md border border-input px-3 py-2 text-[13px] bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-medium text-foreground">Special Instructions</label>
              <textarea value={form.specialNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => set("specialNotes", e.target.value)}
                rows={3} placeholder="Instructions for students or teachers…"
                className="w-full rounded-md border border-input px-3 py-2 text-[13px] bg-background text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
            </div>
          </div>
        </FormSection>

        {/* submit */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/class-routine")}>Cancel</Button>
          <Button type="submit" size="sm" disabled={saving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />{saving ? "Saving…" : mode === "create" ? "Create Routine" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
