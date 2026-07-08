import { useState } from "react";
import { Send } from "lucide-react";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { FEE_CATEGORY_OPTIONS, type FeeCategory, type FeeStructure } from "@/data/billingData";

export interface FeeStructureFormData {
  category: FeeCategory | "";
  className: string;
  amount: string;
  frequency: FeeStructure["frequency"] | "";
}

function emptyForm(): FeeStructureFormData {
  return { category: "", className: "All Classes", amount: "", frequency: "" };
}

type Errors = Partial<Record<keyof FeeStructureFormData, string>>;

export function FeeStructureForm({
  onSubmit,
  onCancel,
  submitLabel = "Save Fee Structure",
}: {
  onSubmit: (data: FeeStructureFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<FeeStructureFormData>(emptyForm());
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);

  function set<K extends keyof FeeStructureFormData>(key: K, value: FeeStructureFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: Errors = {};
    if (!form.category) e.category = "Fee category is required.";
    if (!form.className.trim()) e.className = "Applicable class is required.";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount is required.";
    if (!form.frequency) e.frequency = "Frequency is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    onSubmit(form);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="category" label="Fee Category" required error={errors.category} attempt={attempt}>
          <select id="category" value={form.category} onChange={(e) => set("category", e.target.value as FeeCategory)} className={fieldInputClass(!!errors.category)}>
            <option value="">Select category</option>
            {FEE_CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField id="className" label="Applicable Class" required error={errors.className} attempt={attempt}>
          <input id="className" value={form.className} onChange={(e) => set("className", e.target.value)} placeholder="e.g. All Classes, Grade 6–10" className={fieldInputClass(!!errors.className)} />
        </FormField>
        <FormField id="amount" label="Amount" required error={errors.amount} attempt={attempt}>
          <input id="amount" type="number" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={fieldInputClass(!!errors.amount)} />
        </FormField>
        <FormField id="frequency" label="Frequency" required error={errors.frequency} attempt={attempt}>
          <select id="frequency" value={form.frequency} onChange={(e) => set("frequency", e.target.value as FeeStructure["frequency"])} className={fieldInputClass(!!errors.frequency)}>
            <option value="">Select frequency</option>
            <option value="One-time">One-time</option>
            <option value="Monthly">Monthly</option>
            <option value="Term">Term</option>
            <option value="Annual">Annual</option>
          </select>
        </FormField>
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
