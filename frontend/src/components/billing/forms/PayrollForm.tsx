import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { monthLabel, useCreatePayrollRun, usePayrollRuns } from "@/api/billing";
import { errorMessage } from "@/api/http";

/**
 * Starts a payroll run for a month. The server creates one payslip per teacher
 * with a salary structure (set on the teacher's profile), deducting unpaid absences.
 */
export function PayrollForm({
  onSaved,
  onCancel,
  submitLabel = "Generate Payroll",
}: {
  onSaved: (runId: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [workingDays, setWorkingDays] = useState("");
  const [errors, setErrors] = useState<{ month?: string; workingDays?: string }>({});
  const [attempt, setAttempt] = useState(0);
  const runs = usePayrollRuns();
  const create = useCreatePayrollRun();
  const existing = runs.data?.find((r) => r.month === month);

  function handleSubmit() {
    const e: typeof errors = {};
    if (!/^\d{4}-\d{2}$/.test(month)) e.month = "Choose a month.";
    else if (existing) e.month = `A ${existing.status.toLowerCase()} run for ${monthLabel(month)} already exists.`;
    if (workingDays && !(Number(workingDays) >= 1 && Number(workingDays) <= 31)) e.workingDays = "Between 1 and 31.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    create.mutate({ month, workingDays: workingDays ? Number(workingDays) : undefined }, {
      onSuccess: (run) => { toast.success(`Payroll for ${monthLabel(run.month)} generated as a draft.`); onSaved(run.id); },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="month" label="Month" required error={errors.month} attempt={attempt}>
          <input id="month" type="month" value={month} onChange={(e) => { setMonth(e.target.value); setErrors({}); }}
            className={fieldInputClass(!!errors.month)} />
        </FormField>
        <FormField id="workingDays" label="Working Days (optional)" error={errors.workingDays} attempt={attempt}>
          <input id="workingDays" type="number" min="1" max="31" value={workingDays} placeholder="Auto from the calendar"
            onChange={(e) => setWorkingDays(e.target.value)} className={fieldInputClass(!!errors.workingDays)} />
        </FormField>
      </div>
      <p className="text-[11px] text-muted-foreground">
        One payslip is created for every teacher with a salary structure. Unpaid absences from staff attendance are
        deducted. You can add bonuses or deductions to each payslip while the run is a draft; someone else then
        approves it before salaries are paid.
      </p>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={create.isPending} onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {create.isPending ? "Generating…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
