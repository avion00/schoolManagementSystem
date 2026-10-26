import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { toast } from "sonner";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { EXPENSE_CATEGORY_VALUE, METHOD_LABEL, useSaveExpense, useVendors } from "@/api/billing";
import { uploadFile } from "@/api/files";
import { errorMessage } from "@/api/http";
import { todayIso } from "@/api/attendance";
import { EXPENSE_CATEGORY_OPTIONS, type Expense, type ExpenseCategory } from "@/api/types/billing";
import { cn } from "@/lib/utils";

export interface ExpenseFormData {
  category: ExpenseCategory | "";
  vendorId: string;
  description: string;
  amount: string;
  date: string;
  paymentMethod: string;   // API value; set when the expense is paid
  file?: File;
  remarks: string;
}

function initialForm(e?: Expense): ExpenseFormData {
  return e ? {
    category: e.category, vendorId: e.vendorId ?? "", description: e.description, amount: String(e.amount),
    date: e.date, paymentMethod: Object.entries(METHOD_LABEL).find(([, v]) => v === e.paymentMethod)?.[0] ?? "",
    remarks: e.remarks ?? "",
  } : { category: "", vendorId: "", description: "", amount: "", date: todayIso(), paymentMethod: "", remarks: "" };
}

type Errors = Partial<Record<keyof ExpenseFormData, string>>;

/** Records an expense (it starts pending; someone else approves it). Edits only while pending. */
export function ExpenseForm({
  onSaved,
  onCancel,
  expense,
  submitLabel,
}: {
  onSaved: () => void;
  onCancel?: () => void;
  expense?: Expense;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<ExpenseFormData>(() => initialForm(expense));
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const [uploading, setUploading] = useState(false);
  const vendors = useVendors();
  const save = useSaveExpense();

  function set<K extends keyof ExpenseFormData>(key: K, value: ExpenseFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit() {
    const e: Errors = {};
    if (!form.category) e.category = "Category is required.";
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount is required.";
    if (!form.date) e.date = "Date is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    try {
      let receipt: string | undefined;
      if (form.file) {
        setUploading(true);
        receipt = (await uploadFile(form.file)).id;
      }
      await save.mutateAsync({
        id: expense?.id,
        body: {
          category: EXPENSE_CATEGORY_VALUE[form.category as ExpenseCategory], vendor: form.vendorId || null,
          description: form.description.trim(), amount: form.amount, expense_date: form.date,
          payment_method: form.paymentMethod, remarks: form.remarks.trim(),
          ...(receipt ? { receipt_id: receipt } : {}),
        },
      });
      toast.success(expense ? "Expense updated." : "Expense recorded. It now needs approval.");
      onSaved();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
    }
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
        <FormField id="vendorId" label="Vendor (optional)" attempt={attempt}>
          <select id="vendorId" value={form.vendorId} onChange={(e) => set("vendorId", e.target.value)} className={fieldInputClass()}>
            <option value="">No vendor</option>
            {(vendors.data ?? []).filter((v) => v.status === "Active" || v.id === form.vendorId).map((v) => (
              <option key={v.id} value={v.id}>{v.vendorName}</option>
            ))}
          </select>
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="description" label="Description" required error={errors.description} attempt={attempt}>
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

        <FormField id="paymentMethod" label="Payment Method (optional)" attempt={attempt}>
          <select id="paymentMethod" value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)} className={fieldInputClass()}>
            <option value="">Decide when paying</option>
            {Object.entries(METHOD_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="attachment" label="Attachment / Bill (optional)" attempt={attempt}>
            <label htmlFor="attachment" className={cn("flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 text-[12px] text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
              <Paperclip className="h-3.5 w-3.5 shrink-0" /> {form.file?.name ?? expense?.attachmentName ?? "Choose a file…"}
            </label>
            <input id="attachment" type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => set("file", e.target.files?.[0])} />
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
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={save.isPending || uploading} onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : save.isPending ? "Saving…" : submitLabel ?? (expense ? "Save Changes" : "Add Expense")}
        </Button>
      </div>
    </div>
  );
}
