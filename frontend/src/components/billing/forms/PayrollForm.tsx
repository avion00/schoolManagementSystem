import { useState } from "react";
import { Send } from "lucide-react";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHOD_OPTIONS, PAYROLL, type PaymentMethod } from "@/data/billingData";

export interface PayrollFormData {
  staffId: string;
  month: string;
  basicSalary: string;
  allowance: string;
  deduction: string;
  bonus: string;
  paymentMethod: PaymentMethod | "";
  notes: string;
}

function emptyForm(): PayrollFormData {
  const monthLabel = new Date().toLocaleString(undefined, { month: "long", year: "numeric" });
  return { staffId: "", month: monthLabel, basicSalary: "", allowance: "0", deduction: "0", bonus: "0", paymentMethod: "", notes: "" };
}

type Errors = Partial<Record<keyof PayrollFormData, string>>;

export function PayrollForm({
  onSubmit,
  onCancel,
  submitLabel = "Generate Payroll",
}: {
  onSubmit: (data: PayrollFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<PayrollFormData>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);

  function set<K extends keyof PayrollFormData>(key: K, value: PayrollFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: Errors = {};
    if (!form.staffId) e.staffId = "Staff member is required.";
    if (!form.month.trim()) e.month = "Month is required.";
    if (!form.basicSalary || Number(form.basicSalary) <= 0) e.basicSalary = "Salary amount is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    onSubmit(form);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="staffId" label="Staff Member" required error={errors.staffId} attempt={attempt}>
            <select id="staffId" value={form.staffId} onChange={(e) => set("staffId", e.target.value)} className={fieldInputClass(!!errors.staffId)}>
              <option value="">Select staff member</option>
              {PAYROLL.map((p) => <option key={p.id} value={p.id}>{p.staffName} — {p.role} ({p.department})</option>)}
            </select>
          </FormField>
        </div>

        <FormField id="month" label="Month" required error={errors.month} attempt={attempt}>
          <input id="month" value={form.month} onChange={(e) => set("month", e.target.value)} placeholder="e.g. July 2026" className={fieldInputClass(!!errors.month)} />
        </FormField>
        <FormField id="basicSalary" label="Basic Salary" required error={errors.basicSalary} attempt={attempt}>
          <input id="basicSalary" type="number" min="0" value={form.basicSalary} onChange={(e) => set("basicSalary", e.target.value)} className={fieldInputClass(!!errors.basicSalary)} />
        </FormField>

        <FormField id="allowance" label="Allowance" attempt={attempt}>
          <input id="allowance" type="number" min="0" value={form.allowance} onChange={(e) => set("allowance", e.target.value)} className={fieldInputClass()} />
        </FormField>
        <FormField id="deduction" label="Deduction" attempt={attempt}>
          <input id="deduction" type="number" min="0" value={form.deduction} onChange={(e) => set("deduction", e.target.value)} className={fieldInputClass()} />
        </FormField>
        <FormField id="bonus" label="Bonus" attempt={attempt}>
          <input id="bonus" type="number" min="0" value={form.bonus} onChange={(e) => set("bonus", e.target.value)} className={fieldInputClass()} />
        </FormField>
        <FormField id="paymentMethod" label="Payment Method" attempt={attempt}>
          <select id="paymentMethod" value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value as PaymentMethod)} className={fieldInputClass()}>
            <option value="">Select method</option>
            {PAYMENT_METHOD_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="notes" label="Notes (optional)" attempt={attempt}>
            <textarea id="notes" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {submitLabel}
        </Button>
      </div>
    </div>
  );
}
