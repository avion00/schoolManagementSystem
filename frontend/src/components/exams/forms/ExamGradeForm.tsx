import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Award, Save, X } from "lucide-react";
import { toast }   from "sonner";
import { Button }  from "@/components/ui/button";
import { Input }   from "@/components/ui/input";
import { FormSection } from "@/components/students/forms/FormSection";
import { GRADE_SCALE } from "@/data/examsData";
import { cn } from "@/lib/utils";

interface FormData {
  gradeName:    string;
  gradePoint:   string;
  percentFrom:  string;
  percentUpto:  string;
  resultStatus: "Pass" | "Fail";
  comment:      string;
  colorLabel:   string;
  status:       "active" | "inactive";
}
type Errors = Partial<Record<keyof FormData, string>>;

const COLOR_OPTS = ["emerald", "green", "teal", "blue", "cyan", "amber", "orange", "rose"];
const COLOR_SWATCH: Record<string, string> = {
  emerald: "bg-emerald-500", green: "bg-green-500", teal: "bg-teal-500",
  blue: "bg-blue-500",       cyan: "bg-cyan-500",   amber: "bg-amber-500",
  orange: "bg-orange-500",   rose: "bg-rose-500",
};

function defaultForm(): FormData {
  return { gradeName: "", gradePoint: "", percentFrom: "", percentUpto: "", resultStatus: "Pass", comment: "", colorLabel: "blue", status: "active" };
}

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

export function ExamGradeForm({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const numId    = Number(id ?? 0);
  const existing = mode === "edit" ? GRADE_SCALE.find((g) => g.id === numId) : undefined;

  const [form, setForm] = useState<FormData>(() => {
    if (existing) {
      return {
        gradeName:    existing.gradeName,
        gradePoint:   String(existing.gradePoint),
        percentFrom:  String(existing.percentFrom),
        percentUpto:  String(existing.percentUpto),
        resultStatus: existing.resultStatus,
        comment:      existing.comment,
        colorLabel:   existing.colorLabel,
        status:       existing.status,
      };
    }
    return defaultForm();
  });
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function set(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateOverlap(): string | null {
    const from = Number(form.percentFrom);
    const upto = Number(form.percentUpto);
    const overlap = GRADE_SCALE.find((g) => {
      if (g.id === numId) return false;
      return !(upto < g.percentFrom || from > g.percentUpto);
    });
    if (overlap) return `Range ${from}–${upto}% overlaps with grade ${overlap.gradeName} (${overlap.percentFrom}–${overlap.percentUpto}%).`;
    return null;
  }

  function validate(): boolean {
    const e: Errors = {};
    if (!form.gradeName.trim())  e.gradeName   = "Grade name is required.";
    if (form.gradePoint === "") e.gradePoint  = "Grade point is required.";
    if (form.percentFrom === "") e.percentFrom = "From percentage is required.";
    if (form.percentUpto === "") e.percentUpto = "Upto percentage is required.";
    if (!form.comment.trim())   e.comment     = "Comment is required.";
    if (Number(form.percentFrom) > Number(form.percentUpto)) {
      e.percentFrom = "From must be ≤ Upto.";
    }
    const overlapErr = validateOverlap();
    if (overlapErr) e.percentFrom = overlapErr;
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
    toast.success(mode === "create" ? "Grade scale added!" : "Grade scale updated!");
    navigate("/exams/grades");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {mode === "create" ? "Add Grade Scale" : "Edit Grade Scale"}
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {mode === "create" ? "Define a new grade level" : `Editing grade ${existing?.gradeName ?? ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
            onClick={() => navigate("/exams/grades")}>
            <X className="h-3.5 w-3.5" />Cancel
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={saving} onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save Grade"}
          </Button>
        </div>
      </div>

      {/* ── Grade Scale Settings ─────────────────────────────────────────── */}
      <FormSection icon={Award} title="Grade Scale Settings" subtitle="Name, point, percentage range, and appearance" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="gradeName" label="Grade Name" required error={errors.gradeName}>
            <Input id="gradeName" value={form.gradeName} onChange={(e) => set("gradeName", e.target.value)}
              placeholder="e.g. A+, B, C+" className="h-9 text-[12px] font-mono font-bold" />
          </Field>
          <Field id="gradePoint" label="Grade Point (GPA)" required error={errors.gradePoint}>
            <Input id="gradePoint" type="number" step="0.01" min={0} max={4} value={form.gradePoint}
              onChange={(e) => set("gradePoint", e.target.value)} className="h-9 text-[12px]" placeholder="0.00 – 4.00" />
          </Field>
          <Field id="percentFrom" label="Percentage From (%)" required error={errors.percentFrom}>
            <Input id="percentFrom" type="number" min={0} max={100} value={form.percentFrom}
              onChange={(e) => set("percentFrom", e.target.value)} className="h-9 text-[12px]" placeholder="e.g. 80" />
          </Field>
          <Field id="percentUpto" label="Percentage Upto (%)" required error={errors.percentUpto}>
            <Input id="percentUpto" type="number" min={0} max={100} value={form.percentUpto}
              onChange={(e) => set("percentUpto", e.target.value)} className="h-9 text-[12px]" placeholder="e.g. 89" />
          </Field>
          <Field id="comment" label="Comment" required error={errors.comment}>
            <Input id="comment" value={form.comment} onChange={(e) => set("comment", e.target.value)}
              placeholder="e.g. Excellent, Very Good, Pass" className="h-9 text-[12px]" />
          </Field>
          <Field id="resultStatus" label="Result Status">
            <div className="flex gap-3">
              {(["Pass", "Fail"] as const).map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="resultStatus" value={r} checked={form.resultStatus === r}
                    onChange={() => set("resultStatus", r)} className="accent-primary" />
                  <span className={cn("text-[12px] font-medium",
                    r === "Pass" ? "text-emerald-600" : "text-rose-600")}>{r}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>

        {/* Color picker */}
        <div className="mt-4">
          <p className="text-[12px] font-medium text-foreground mb-2">Color Label</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTS.map((c) => (
              <button key={c} type="button"
                onClick={() => set("colorLabel", c)}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                  COLOR_SWATCH[c],
                  form.colorLabel === c ? "ring-2 ring-offset-2 ring-foreground scale-110" : "opacity-70 hover:opacity-100",
                )}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Status toggle */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-[12px] font-medium text-foreground">Status</span>
          <button type="button"
            onClick={() => set("status", form.status === "active" ? "inactive" : "active")}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              form.status === "active" ? "bg-emerald-500" : "bg-muted",
            )}>
            <span className={cn(
              "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform",
              form.status === "active" ? "translate-x-4" : "translate-x-0",
            )} />
          </button>
          <span className="text-[12px] text-muted-foreground capitalize">{form.status}</span>
        </div>

        {/* Live preview */}
        {form.gradeName && (
          <div className="mt-5 rounded-xl border border-border/40 bg-muted/20 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-3">Preview</p>
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full text-white text-lg font-bold",
                COLOR_SWATCH[form.colorLabel] ?? "bg-muted",
              )}>
                {form.gradeName}
              </div>
              <div>
                <p className="font-bold text-foreground">{form.gradeName} · {form.gradePoint || "—"} pts</p>
                <p className="text-[12px] text-muted-foreground">
                  {form.percentFrom || "?"} – {form.percentUpto || "?"}% · {form.comment || "—"} · {form.resultStatus}
                </p>
              </div>
            </div>
          </div>
        )}
      </FormSection>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]" onClick={() => navigate("/exams/grades")}>
          <X className="h-3.5 w-3.5" />Cancel
        </Button>
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={saving} onClick={handleSave}>
          <Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save Grade"}
        </Button>
      </div>
    </div>
  );
}
