import { useState } from "react";
import { Send } from "lucide-react";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { FEE_CATEGORY_OPTIONS, STUDENT_FEES, type FeeCategory } from "@/data/billingData";
import { cn } from "@/lib/utils";

export interface InvoiceFormData {
  studentId: string;
  feeType: FeeCategory | "";
  issueDate: string;
  dueDate: string;
  amount: string;
  discount: string;
  notes: string;
}

function emptyForm(): InvoiceFormData {
  return { studentId: "", feeType: "", issueDate: "", dueDate: "", amount: "", discount: "0", notes: "" };
}

type Errors = Partial<Record<keyof InvoiceFormData, string>>;

export function InvoiceForm({
  onSubmit,
  onCancel,
  submitLabel = "Create Invoice",
}: {
  onSubmit: (data: InvoiceFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<InvoiceFormData>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);

  function set<K extends keyof InvoiceFormData>(key: K, value: InvoiceFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: Errors = {};
    if (!form.studentId) e.studentId = "Student is required.";
    if (!form.feeType) e.feeType = "Fee type is required.";
    if (!form.issueDate) e.issueDate = "Issue date is required.";
    if (!form.dueDate) e.dueDate = "Due date is required.";
    else if (form.issueDate && form.dueDate < form.issueDate) e.dueDate = "Due date cannot be before the issue date.";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    onSubmit(form);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="studentId" label="Student" required error={errors.studentId} attempt={attempt}>
            <select id="studentId" value={form.studentId} onChange={(e) => set("studentId", e.target.value)} className={fieldInputClass(!!errors.studentId)}>
              <option value="">Select student</option>
              {STUDENT_FEES.map((s) => (
                <option key={s.id} value={s.id}>{s.studentName} — {s.admissionNo} ({s.className}-{s.section})</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField id="feeType" label="Fee Type" required error={errors.feeType} attempt={attempt}>
          <select id="feeType" value={form.feeType} onChange={(e) => set("feeType", e.target.value as FeeCategory)} className={fieldInputClass(!!errors.feeType)}>
            <option value="">Select fee type</option>
            {FEE_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField id="amount" label="Amount" required error={errors.amount} attempt={attempt}>
          <input id="amount" type="number" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)}
            placeholder="e.g. 15000" className={fieldInputClass(!!errors.amount)} />
        </FormField>

        <FormField id="issueDate" label="Issue Date" required error={errors.issueDate} attempt={attempt}>
          <input id="issueDate" type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} className={fieldInputClass(!!errors.issueDate)} />
        </FormField>
        <FormField id="dueDate" label="Due Date" required error={errors.dueDate} attempt={attempt}>
          <input id="dueDate" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={fieldInputClass(!!errors.dueDate)} />
        </FormField>

        <FormField id="discount" label="Discount (optional)" attempt={attempt}>
          <input id="discount" type="number" min="0" value={form.discount} onChange={(e) => set("discount", e.target.value)} className={fieldInputClass()} />
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="notes" label="Notes (optional)" attempt={attempt}>
            <textarea id="notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
              placeholder="Any additional notes for this invoice…"
              className={cn("w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring")} />
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
