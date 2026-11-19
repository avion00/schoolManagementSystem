import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, CalendarDays, Printer, Save, X } from "lucide-react";
import { toast } from "sonner";

import { errorMessage } from "@/api/http";
import { useRoomsAndOptions } from "./useRoutineFormOptions";
import { useRoutineData, useSaveEntry } from "@/api/routine";
import { SCHOOL_DAYS, SHIFT_OPTIONS, STATUS_OPTIONS, type Shift } from "@/api/types/routine";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/ui/form-section";

interface FormData {
  section: string;
  day: string;
  shift: Shift;
  period: string;
  subject: string;
  teacher: string;
  room: string;
  status: string;
  notes: string;
}

const EMPTY: FormData = {
  section: "", day: "", shift: "Day", period: "", subject: "", teacher: "", room: "", status: "active", notes: "",
};

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-foreground">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function Sel({ value, onChange, options, placeholder, error }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string; error?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`flex h-9 w-full rounded-md border bg-background px-3 text-[13px] shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${error ? "border-destructive" : "border-input"}`}>
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/** Conflicts come back from the server as {conflicts: [{reason, ...}]}. */
function conflictText(err: unknown): string | null {
  const data = (err as { response?: { data?: { conflicts?: { reason: string; section: string }[] } } })?.response?.data;
  return data?.conflicts?.map((c) => c.reason).join("; ") ?? null;
}

export function ClassRoutineForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { routine } = useRoutineData();
  const opts = useRoomsAndOptions();
  const save = useSaveEntry();
  const existing = mode === "edit" ? routine.entries.find((r) => r.id === id) : undefined;

  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverConflict, setServerConflict] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        section: existing.sectionId, day: existing.day.toLowerCase(), shift: existing.shift, period: existing.periodId,
        subject: existing.subjectId, teacher: existing.teacherId ?? "", room: existing.roomId ?? "",
        status: existing.status, notes: existing.notes,
      });
    }
  }, [existing]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
    setServerConflict(null);
  };

  const periods = routine.periodsFor(form.shift).filter((p) => !p.isBreak);
  // Local early warning; the server is authoritative (it checks overlapping times across shifts).
  const localClash = useMemo(() => {
    if (!form.teacher || !form.day || !form.period) return null;
    return routine.entries.find((r) => r.teacherId === form.teacher && r.day.toLowerCase() === form.day
      && r.periodId === form.period && r.status === "active" && r.id !== existing?.id) ?? null;
  }, [form, routine.entries, existing]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.section) errs.section = "Choose a class section.";
    if (!form.day) errs.day = "Choose a day.";
    if (!form.period) errs.period = "Choose a period.";
    if (!form.subject) errs.subject = "Choose a subject.";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      await save.mutateAsync({
        id: existing?.id,
        body: {
          academic_year: opts.yearId, section: form.section, day: form.day, period: form.period,
          subject: form.subject, teacher: form.teacher || null, room: form.room || null,
          status: form.status, notes: form.notes,
        },
      });
      toast.success(mode === "create" ? "Routine entry added." : "Routine entry updated.");
      navigate("/class-routine");
    } catch (err) {
      const clash = conflictText(err);
      if (clash) setServerConflict(clash);
      toast.error(clash ? "This slot clashes with another class." : errorMessage(err, "Couldn't save."));
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-bold text-foreground">{mode === "create" ? "Add Routine Entry" : "Edit Routine Entry"}</h1>
          <p className="text-[12px] text-muted-foreground">Schedule a class period in the weekly timetable.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px]" onClick={() => navigate("/class-routine/print")}>
            <Printer className="h-3.5 w-3.5" />Print
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-[11px]" onClick={() => navigate("/class-routine")}>
            <X className="h-3.5 w-3.5" />Cancel
          </Button>
        </div>
      </div>

      {(serverConflict || localClash) && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[12.5px] text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{serverConflict ?? `This teacher already teaches ${localClash!.className}-${localClash!.section} in that period.`}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormSection icon={CalendarDays} title="When & where" subtitle="Class section, day and period" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Class / Section" required error={errors.section}>
              <Sel value={form.section} onChange={(v) => set("section", v)} options={opts.sections}
                placeholder="Select section" error={errors.section} />
            </Field>
            <Field label="Day" required error={errors.day}>
              <Sel value={form.day} onChange={(v) => set("day", v)}
                options={SCHOOL_DAYS.map((d) => ({ value: d.toLowerCase(), label: d }))} placeholder="Select day" error={errors.day} />
            </Field>
            <Field label="Shift">
              <Sel value={form.shift} onChange={(v) => { set("shift", v as Shift); set("period", ""); }}
                options={SHIFT_OPTIONS.map((s) => ({ value: s, label: s }))} placeholder="Select shift" />
            </Field>
            <Field label="Period" required error={errors.period}>
              <Sel value={form.period} onChange={(v) => set("period", v)}
                options={periods.map((p) => ({ value: p.id, label: `P${p.period} · ${p.start} – ${p.end}` }))}
                placeholder={periods.length ? "Select period" : "No periods in this shift — add them in Bell Schedule"}
                error={errors.period} />
            </Field>
            <Field label="Room">
              <Sel value={form.room} onChange={(v) => set("room", v)} options={opts.rooms} placeholder="No room" />
            </Field>
            <Field label="Status">
              <Sel value={form.status} onChange={(v) => set("status", v)}
                options={STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))} placeholder="Status" />
            </Field>
          </div>
        </FormSection>

        <FormSection icon={CalendarDays} title="What & who" subtitle="Subject and teacher" defaultOpen>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Subject" required error={errors.subject}>
              <Sel value={form.subject} onChange={(v) => set("subject", v)} options={opts.subjects}
                placeholder="Select subject" error={errors.subject} />
            </Field>
            <Field label="Teacher">
              <Sel value={form.teacher} onChange={(v) => set("teacher", v)} options={opts.teachers} placeholder="Not assigned" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-[13px] shadow-sm" />
              </Field>
            </div>
          </div>
        </FormSection>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate("/class-routine")}>Cancel</Button>
          <Button type="submit" size="sm" disabled={save.isPending} className="gap-1.5">
            <Save className="h-3.5 w-3.5" />{save.isPending ? "Saving…" : mode === "create" ? "Add Entry" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
