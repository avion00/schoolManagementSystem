import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { METHOD_LABEL, useFeeSettings, useInvoices, useMoney, useRecordPayment } from "@/api/billing";
import { errorMessage } from "@/api/http";
import { todayIso } from "@/api/attendance";

export interface PaymentFormData {
  invoiceId: string;
  amount: string;
  method: string;       // API value
  transactionId: string;
  paymentDate: string;
  remarks: string;
}

type Errors = Partial<Record<keyof PaymentFormData, string>>;

export function PaymentForm({
  onSaved,
  onCancel,
  submitLabel = "Record Payment",
  defaultInvoiceId,
  studentId,
}: {
  onSaved: (paymentId: string) => void;
  onCancel?: () => void;
  submitLabel?: string;
  defaultInvoiceId?: string;
  /** Only offer this student's invoices. */
  studentId?: string;
}) {
  const [form, setForm] = useState<PaymentFormData>(() => ({
    invoiceId: defaultInvoiceId ?? "", amount: "", method: "cash", transactionId: "", paymentDate: todayIso(), remarks: "",
  }));
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const invoices = useInvoices();
  const settings = useFeeSettings();
  const record = useRecordPayment();
  const money = useMoney();

  const payableInvoices = useMemo(
    () => (invoices.data ?? []).filter((i) => i.balance > 0 && i.status !== "Cancelled" && (!studentId || i.studentId === studentId)),
    [invoices.data, studentId]);
  const selectedInvoice = payableInvoices.find((i) => i.id === form.invoiceId);
  // Methods enabled in Settings → Fees (all when settings are unavailable).
  const methods = Object.keys(METHOD_LABEL).filter((m) => settings.data?.payment_methods?.[m] ?? true);

  function set<K extends keyof PaymentFormData>(key: K, value: PaymentFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: Errors = {};
    if (!form.invoiceId) e.invoiceId = "Invoice is required.";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount is required.";
    else if (selectedInvoice && Number(form.amount) > selectedInvoice.balance) {
      e.amount = `Amount exceeds the balance of ${money(selectedInvoice.balance)}.`;
    }
    if (!form.method) e.method = "Payment method is required.";
    if (!form.paymentDate) e.paymentDate = "Payment date is required.";
    else if (form.paymentDate > todayIso()) e.paymentDate = "Payment date can't be in the future.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    record.mutate({
      invoice: form.invoiceId, amount: form.amount, method: form.method, paidAt: form.paymentDate,
      transactionId: form.transactionId.trim(), remarks: form.remarks.trim(),
    }, {
      onSuccess: (p) => { toast.success(`Payment recorded. Receipt ${p.receipt_number}.`); onSaved(p.id); },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="invoiceId" label="Invoice" required error={errors.invoiceId} attempt={attempt}>
            <select id="invoiceId" value={form.invoiceId} onChange={(e) => set("invoiceId", e.target.value)} className={fieldInputClass(!!errors.invoiceId)}>
              <option value="">{invoices.isLoading ? "Loading invoices…" : payableInvoices.length ? "Select invoice" : "No invoices with a balance"}</option>
              {payableInvoices.map((i) => (
                <option key={i.id} value={i.id}>{i.invoiceNo} — {i.studentName} (balance {money(i.balance)})</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField id="amount" label="Amount" required error={errors.amount} attempt={attempt}>
          <div className="flex gap-2">
            <input id="amount" type="number" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={fieldInputClass(!!errors.amount)} />
            {selectedInvoice && (
              <Button type="button" variant="outline" size="sm" className="h-9 shrink-0 text-[11px]"
                onClick={() => set("amount", String(selectedInvoice.balance))}>Full</Button>
            )}
          </div>
        </FormField>
        <FormField id="method" label="Payment Method" required error={errors.method} attempt={attempt}>
          <select id="method" value={form.method} onChange={(e) => set("method", e.target.value)} className={fieldInputClass(!!errors.method)}>
            {methods.map((m) => <option key={m} value={m}>{METHOD_LABEL[m]}</option>)}
          </select>
        </FormField>

        <FormField id="paymentDate" label="Payment Date" required error={errors.paymentDate} attempt={attempt}>
          <input id="paymentDate" type="date" max={todayIso()} value={form.paymentDate} onChange={(e) => set("paymentDate", e.target.value)} className={fieldInputClass(!!errors.paymentDate)} />
        </FormField>
        <FormField id="transactionId" label="Transaction ID (optional)" attempt={attempt}>
          <input id="transactionId" value={form.transactionId} onChange={(e) => set("transactionId", e.target.value)} placeholder="e.g. TXN100234" className={fieldInputClass()} />
        </FormField>
        <div className="sm:col-span-2">
          <FormField id="remarks" label="Remarks (optional)" attempt={attempt}>
            <input id="remarks" value={form.remarks} onChange={(e) => set("remarks", e.target.value)} className={fieldInputClass()} />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={record.isPending} onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {record.isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
