import { useMemo, useState } from "react";
import { Send } from "lucide-react";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { INVOICES, PAYMENT_METHOD_OPTIONS, type PaymentMethod } from "@/data/billingData";

export interface PaymentFormData {
  invoiceId: string;
  amount: string;
  method: PaymentMethod | "";
  transactionId: string;
  paymentDate: string;
  allowOverpayment: boolean;
}

function emptyForm(): PaymentFormData {
  return { invoiceId: "", amount: "", method: "", transactionId: "", paymentDate: "", allowOverpayment: false };
}

type Errors = Partial<Record<keyof PaymentFormData, string>>;

export function PaymentForm({
  onSubmit,
  onCancel,
  submitLabel = "Record Payment",
  defaultInvoiceId,
}: {
  onSubmit: (data: PaymentFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
  defaultInvoiceId?: number;
}) {
  const [form, setForm] = useState<PaymentFormData>(() => ({ ...emptyForm(), invoiceId: defaultInvoiceId ? String(defaultInvoiceId) : "" }));
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);

  const payableInvoices = useMemo(() => INVOICES.filter((i) => i.balance > 0), []);
  const selectedInvoice = payableInvoices.find((i) => String(i.id) === form.invoiceId);

  function set<K extends keyof PaymentFormData>(key: K, value: PaymentFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: Errors = {};
    if (!form.invoiceId) e.invoiceId = "Invoice is required.";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount is required.";
    else if (selectedInvoice && !form.allowOverpayment && Number(form.amount) > selectedInvoice.balance) {
      e.amount = `Amount exceeds the balance of $${selectedInvoice.balance.toLocaleString()}. Enable overpayment to proceed.`;
    }
    if (!form.method) e.method = "Payment method is required.";
    if (!form.paymentDate) e.paymentDate = "Payment date is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    onSubmit(form);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="invoiceId" label="Invoice" required error={errors.invoiceId} attempt={attempt}>
            <select id="invoiceId" value={form.invoiceId} onChange={(e) => set("invoiceId", e.target.value)} className={fieldInputClass(!!errors.invoiceId)}>
              <option value="">Select invoice</option>
              {payableInvoices.map((i) => (
                <option key={i.id} value={i.id}>{i.invoiceNo} — {i.studentName} (balance ${i.balance.toLocaleString()})</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField id="amount" label="Amount" required error={errors.amount} attempt={attempt}>
          <input id="amount" type="number" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={fieldInputClass(!!errors.amount)} />
        </FormField>
        <FormField id="method" label="Payment Method" required error={errors.method} attempt={attempt}>
          <select id="method" value={form.method} onChange={(e) => set("method", e.target.value as PaymentMethod)} className={fieldInputClass(!!errors.method)}>
            <option value="">Select method</option>
            {PAYMENT_METHOD_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </FormField>

        <FormField id="paymentDate" label="Payment Date" required error={errors.paymentDate} attempt={attempt}>
          <input id="paymentDate" type="date" value={form.paymentDate} onChange={(e) => set("paymentDate", e.target.value)} className={fieldInputClass(!!errors.paymentDate)} />
        </FormField>
        <FormField id="transactionId" label="Transaction ID (optional)" attempt={attempt}>
          <input id="transactionId" value={form.transactionId} onChange={(e) => set("transactionId", e.target.value)} placeholder="e.g. TXN100234" className={fieldInputClass()} />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <input type="checkbox" checked={form.allowOverpayment} onChange={(e) => set("allowOverpayment", e.target.checked)} className="h-3.5 w-3.5 rounded border-input" />
        Allow overpayment beyond the invoice balance
      </label>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {submitLabel}
        </Button>
      </div>
    </div>
  );
}
