import { useState } from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { useCreateInvoice, useFeeCategories, useMoney } from "@/api/billing";
import { errorMessage } from "@/api/http";
import { useStudents } from "@/api/students";
import { todayIso } from "@/api/attendance";

interface ItemRow { category: string; description: string; quantity: string; unitPrice: string }

export interface InvoiceFormData {
  studentId: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  items: ItemRow[];
}

function emptyForm(studentId = ""): InvoiceFormData {
  return {
    studentId, billingPeriod: new Date().toLocaleDateString("en", { month: "long", year: "numeric" }),
    issueDate: todayIso(), dueDate: "", items: [{ category: "", description: "", quantity: "1", unitPrice: "" }],
  };
}

type Errors = Partial<Record<keyof InvoiceFormData | "lines", string>>;

/** Creates a single invoice with line items. Bulk billing from fee structures lives on the Invoices page. */
export function InvoiceForm({
  onSaved,
  onCancel,
  defaultStudentId,
  submitLabel = "Create Invoice",
}: {
  onSaved: (invoiceId: string) => void;
  onCancel?: () => void;
  defaultStudentId?: string;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<InvoiceFormData>(() => emptyForm(defaultStudentId));
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const students = useStudents();
  const categories = useFeeCategories();
  const create = useCreateInvoice();
  const money = useMoney();

  function set<K extends keyof InvoiceFormData>(key: K, value: InvoiceFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }
  function setItem(i: number, patch: Partial<ItemRow>) {
    setForm((f) => ({ ...f, items: f.items.map((it, j) => (j === i ? { ...it, ...patch } : it)) }));
    setErrors((e) => ({ ...e, lines: undefined }));
  }

  const total = form.items.reduce((s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0), 0);

  function handleSubmit() {
    const e: Errors = {};
    if (!form.studentId) e.studentId = "Student is required.";
    if (!form.issueDate) e.issueDate = "Issue date is required.";
    if (form.dueDate && form.issueDate && form.dueDate < form.issueDate) e.dueDate = "Due date cannot be before the issue date.";
    if (form.items.some((it) => !it.description.trim() || !(Number(it.unitPrice) > 0) || !(Number(it.quantity) >= 1))) {
      e.lines = "Each line needs a description, a quantity of at least 1 and a price above zero.";
    }
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    create.mutate({
      student: form.studentId, issueDate: form.issueDate, dueDate: form.dueDate, billingPeriod: form.billingPeriod.trim(),
      items: form.items.map((it) => ({
        category: it.category || null, description: it.description.trim(), quantity: Number(it.quantity), unitPrice: it.unitPrice,
      })),
    }, {
      onSuccess: (inv) => { toast.success(`Invoice ${inv.number} created.`); onSaved(inv.id); },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="studentId" label="Student" required error={errors.studentId} attempt={attempt}>
            <select id="studentId" value={form.studentId} onChange={(e) => set("studentId", e.target.value)} className={fieldInputClass(!!errors.studentId)}>
              <option value="">{students.isLoading ? "Loading students…" : "Select student"}</option>
              {(students.data ?? []).filter((s) => s.status === "active").map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.admissionNo} ({s.className}{s.section ? `-${s.section}` : ""})</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField id="billingPeriod" label="Billing Period" attempt={attempt}>
          <input id="billingPeriod" value={form.billingPeriod} onChange={(e) => set("billingPeriod", e.target.value)}
            placeholder="e.g. October 2026" className={fieldInputClass()} />
        </FormField>
        <div />
        <FormField id="issueDate" label="Issue Date" required error={errors.issueDate} attempt={attempt}>
          <input id="issueDate" type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} className={fieldInputClass(!!errors.issueDate)} />
        </FormField>
        <FormField id="dueDate" label="Due Date" error={errors.dueDate} attempt={attempt}>
          <input id="dueDate" type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} className={fieldInputClass(!!errors.dueDate)} />
        </FormField>
      </div>

      <div className="space-y-2" data-field="lines">
        <p className="text-[12px] font-medium text-foreground">Line items <span className="text-rose-500">*</span></p>
        {form.items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <select value={it.category} onChange={(e) => {
              const cat = categories.data?.find((c) => c.id === e.target.value);
              setItem(i, { category: e.target.value, description: it.description || cat?.name || "" });
            }} className={`${fieldInputClass()} col-span-12 sm:col-span-3`}>
              <option value="">No category</option>
              {(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} placeholder="Description"
              className={`${fieldInputClass()} col-span-12 sm:col-span-4`} />
            <input type="number" min="1" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value })} placeholder="Qty"
              className={`${fieldInputClass()} col-span-3 sm:col-span-1`} />
            <input type="number" min="0" value={it.unitPrice} onChange={(e) => setItem(i, { unitPrice: e.target.value })} placeholder="Unit price"
              className={`${fieldInputClass()} col-span-6 sm:col-span-3`} />
            <Button type="button" variant="ghost" size="icon" className="col-span-3 sm:col-span-1 h-9 w-9" disabled={form.items.length === 1}
              onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <div className="flex items-center justify-between">
          <Button type="button" variant="outline" size="sm" className="h-8 gap-1 text-[12px]"
            onClick={() => setForm((f) => ({ ...f, items: [...f.items, { category: "", description: "", quantity: "1", unitPrice: "" }] }))}>
            <Plus className="h-3.5 w-3.5" /> Add line
          </Button>
          <span className="text-[12px] text-muted-foreground">Total <strong className="text-foreground">{money(total)}</strong></span>
        </div>
        {errors.lines && <p className="text-[11px] text-rose-500">{errors.lines}</p>}
        <p className="text-[11px] text-muted-foreground">Discounts are requested from the invoice page and need approval.</p>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={create.isPending} onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {create.isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
