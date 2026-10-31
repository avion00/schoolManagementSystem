import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { FREQUENCY_VALUE, useFeeCategories, useSaveStructure } from "@/api/billing";
import { errorMessage } from "@/api/http";
import { useAcademicOptions } from "@/api/students";
import { FEE_FREQUENCY_OPTIONS, type FeeFrequency, type FeeStructure } from "@/api/types/billing";

export interface FeeStructureFormData {
  name: string;
  category: string;       // category id
  classLevel: string;     // "" = all classes
  academicYear: string;
  amount: string;
  frequency: FeeFrequency | "";
}

type Errors = Partial<Record<keyof FeeStructureFormData, string>>;

export function FeeStructureForm({
  onSaved,
  onCancel,
  structure,
  submitLabel = "Save Fee Structure",
}: {
  onSaved: () => void;
  onCancel?: () => void;
  structure?: FeeStructure;
  submitLabel?: string;
}) {
  const [form, setForm] = useState<FeeStructureFormData>(() => structure ? {
    name: structure.name, category: structure.categoryId, classLevel: structure.classLevelId ?? "",
    academicYear: structure.academicYearId, amount: String(structure.amount), frequency: structure.frequency,
  } : { name: "", category: "", classLevel: "", academicYear: "", amount: "", frequency: "Monthly" });
  const [errors, setErrors] = useState<Errors>({});
  const [attempt, setAttempt] = useState(0);
  const categories = useFeeCategories();
  const academics = useAcademicOptions();
  const save = useSaveStructure();

  useEffect(() => {
    if (!form.academicYear && academics.data) {
      const y = academics.data.years.find((x) => x.isCurrent) ?? academics.data.years[0];
      if (y) setForm((f) => ({ ...f, academicYear: y.id }));
    }
  }, [academics.data, form.academicYear]);

  function set<K extends keyof FeeStructureFormData>(key: K, value: FeeStructureFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleSubmit() {
    const e: Errors = {};
    if (!form.category) e.category = "Fee category is required.";
    if (!form.academicYear) e.academicYear = "Academic year is required.";
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount is required.";
    if (!form.frequency) e.frequency = "Frequency is required.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    const catName = categories.data?.find((c) => c.id === form.category)?.name ?? "";
    save.mutate({
      id: structure?.id,
      body: {
        name: form.name.trim() || catName, category: form.category, class_level: form.classLevel || null,
        academic_year: form.academicYear, amount: form.amount, frequency: FREQUENCY_VALUE[form.frequency as FeeFrequency],
      },
    }, {
      onSuccess: () => { toast.success(structure ? "Fee structure updated." : "Fee structure added."); onSaved(); },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="category" label="Fee Category" required error={errors.category} attempt={attempt}>
          <select id="category" value={form.category} onChange={(e) => set("category", e.target.value)} className={fieldInputClass(!!errors.category)}>
            <option value="">{categories.data?.length === 0 ? "Add categories in Billing Settings" : "Select category"}</option>
            {(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField id="name" label="Name (optional)" attempt={attempt}>
          <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Defaults to the category name" className={fieldInputClass()} />
        </FormField>
        <FormField id="classLevel" label="Applicable Class" attempt={attempt}>
          <select id="classLevel" value={form.classLevel} onChange={(e) => set("classLevel", e.target.value)} className={fieldInputClass()}>
            <option value="">All Classes</option>
            {(academics.data?.classes ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField id="academicYear" label="Academic Year" required error={errors.academicYear} attempt={attempt}>
          <select id="academicYear" value={form.academicYear} onChange={(e) => set("academicYear", e.target.value)} className={fieldInputClass(!!errors.academicYear)}>
            {(academics.data?.years ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </FormField>
        <FormField id="amount" label="Amount" required error={errors.amount} attempt={attempt}>
          <input id="amount" type="number" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} className={fieldInputClass(!!errors.amount)} />
        </FormField>
        <FormField id="frequency" label="Frequency" required error={errors.frequency} attempt={attempt}>
          <select id="frequency" value={form.frequency} onChange={(e) => set("frequency", e.target.value as FeeFrequency)} className={fieldInputClass(!!errors.frequency)}>
            {FEE_FREQUENCY_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </FormField>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={save.isPending} onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {save.isPending ? "Saving…" : submitLabel}
        </Button>
      </div>
    </div>
  );
}
