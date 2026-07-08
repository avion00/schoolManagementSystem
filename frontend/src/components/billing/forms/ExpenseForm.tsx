import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import {
  EXPENSE_CATEGORY_OPTIONS, EXPENSE_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS,
  type ExpenseCategory, type ExpenseStatus, type PaymentMethod,
} from "@/data/billingData";
import { cn } from "@/lib/utils";

export interface ExpenseFormData {
  category: ExpenseCategory | "";
  vendor: string;
  description: string;
  amount: string;
  date: string;
  paymentMethod: PaymentMethod | "";
  status: ExpenseStatus;
  attachmentName?: string;
  remarks: string;
}

function emptyForm(): ExpenseFormData {
  return { category: "", vendor: "", description: "", amount: "", date: "", paymentMethod: "", status: "Pending", attachmentName: undefined, remarks: "" };
}

type Errors = Partial<Record<keyof ExpenseFormData, string>>;

export function ExpenseForm({
  onSubmit,
  onCancel,
  submitLabel = "Add Expense",
}: {
  onSubmit: (data: ExpenseFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<ExpenseFormData>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);

  function set<K extends keyof ExpenseFormData>(key: K, value: ExpenseFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: Errors = {};
    if (!form.category) e.category = "Category is required.";
    if (!form.vendor.trim()) e.vendor = "Vendor / paid to is required.";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount is required.";
    if (!form.date) e.date = "Date is required.";
    if (!form.paymentMethod) e.paymentMethod = "Payment method is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    onSubmit(form);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="category" label="Category" required error={errors.category} attempt={attempt}>
          <select id="category" value={form.category} onChange={(e) => set("category", e.target.value as ExpenseCategory)} className={fieldInputClass(!!errors.category)}>
            <option value="">Select category</option>
            {EXPENSE_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField id="vendor" label="Vendor / Paid To" required error={errors.vendor} attempt={attempt}>
          <input id="vendor" value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="e.g. ABC Stationery Supplier" className={fieldInputClass(!!errors.vendor)} />
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="description" label="Description" attempt={attempt}>
            <textarea id="description" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="What was this expense for?"
              className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
        </div>

        <FormField id="amount" label="Amount" required error={errors.amount} attempt={attempt}>
          <input id="amount" type="number" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={fieldInputClass(!!errors.amount)} />
        </FormField>
        <FormField id="date" label="Date" required error={errors.date} attempt={attempt}>
          <input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className={fieldInputClass(!!errors.date)} />
        </FormField>

        <FormField id="paymentMethod" label="Payment Method" required error={errors.paymentMethod} attempt={attempt}>
          <select id="paymentMethod" value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value as PaymentMethod)} className={fieldInputClass(!!errors.paymentMethod)}>
            <option value="">Select method</option>
            {PAYMENT_METHOD_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </FormField>
        <FormField id="status" label="Approval Status" attempt={attempt}>
          <select id="status" value={form.status} onChange={(e) => set("status", e.target.value as ExpenseStatus)} className={fieldInputClass()}>
            {EXPENSE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="attachment" label="Attachment / Bill (optional)" attempt={attempt}>
            <label htmlFor="attachment" className={cn("flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 text-[12px] text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
              <Paperclip className="h-3.5 w-3.5 shrink-0" /> {form.attachmentName ?? "Choose a file…"}
            </label>
            <input id="attachment" type="file" className="hidden" onChange={(e) => set("attachmentName", e.target.files?.[0]?.name)} />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField id="remarks" label="Remarks (optional)" attempt={attempt}>
            <textarea id="remarks" rows={2} value={form.remarks} onChange={(e) => set("remarks", e.target.value)}
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
