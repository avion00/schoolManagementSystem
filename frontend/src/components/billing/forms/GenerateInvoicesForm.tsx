import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { FormField, fieldInputClass, scrollToFirstError } from "@/components/billing/forms/FormField";
import { Button } from "@/components/ui/button";
import { useFeeStructures, useGenerateInvoices, useMoney } from "@/api/billing";
import { errorMessage } from "@/api/http";
import { useAcademicOptions } from "@/api/students";
import { todayIso } from "@/api/attendance";

/** Bills every active student in a class (or the whole school) from fee structures. */
export function GenerateInvoicesForm({ onSaved, onCancel }: { onSaved: () => void; onCancel?: () => void }) {
  const academics = useAcademicOptions();
  const structures = useFeeStructures();
  const generate = useGenerateInvoices();
  const money = useMoney();
  const [year, setYear] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [period, setPeriod] = useState(new Date().toLocaleDateString("en", { month: "long", year: "numeric" }));
  const [issueDate, setIssueDate] = useState(todayIso());
  const [dueDate, setDueDate] = useState("");
  const [chosen, setChosen] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!year && academics.data) {
      const y = academics.data.years.find((x) => x.isCurrent) ?? academics.data.years[0];
      if (y) setYear(y.id);
    }
  }, [academics.data, year]);

  const applicable = (structures.data ?? []).filter((s) => s.academicYearId === year && (!classLevel || !s.classLevelId || s.classLevelId === classLevel));

  function handleSubmit() {
    const e: Record<string, string | undefined> = {};
    if (!year) e.year = "Academic year is required.";
    if (!period.trim()) e.period = "Billing period is required.";
    if (!issueDate) e.issueDate = "Issue date is required.";
    if (dueDate && dueDate < issueDate) e.dueDate = "Due date cannot be before the issue date.";
    if (applicable.length === 0) e.structures = "There are no fee structures for this year and class.";
    setErrors(e);
    setAttempt((n) => n + 1);
    if (Object.values(e).some(Boolean)) { scrollToFirstError(e); return; }
    generate.mutate({
      academic_year: year, billing_period: period.trim(), issue_date: issueDate, due_date: dueDate || null,
      class_level: classLevel || null, ...(chosen.size ? { fee_structures: [...chosen] } : {}),
    }, {
      onSuccess: (r) => {
        const parts = [`${r.created} invoice${r.created === 1 ? "" : "s"} created (${money(r.total_billed)})`];
        if (r.skipped_already_billed) parts.push(`${r.skipped_already_billed} already billed for this period`);
        if (r.no_applicable_fees) parts.push(`${r.no_applicable_fees} with no applicable fees`);
        toast.success(parts.join(" · "));
        onSaved();
      },
      onError: (err) => toast.error(errorMessage(err)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="year" label="Academic Year" required error={errors.year} attempt={attempt}>
          <select id="year" value={year} onChange={(e) => { setYear(e.target.value); setChosen(new Set()); }} className={fieldInputClass(!!errors.year)}>
            {(academics.data?.years ?? []).map((y) => <option key={y.id} value={y.id}>{y.name}</option>)}
          </select>
        </FormField>
        <FormField id="classLevel" label="Class" attempt={attempt}>
          <select id="classLevel" value={classLevel} onChange={(e) => { setClassLevel(e.target.value); setChosen(new Set()); }} className={fieldInputClass()}>
            <option value="">All classes</option>
            {(academics.data?.classes ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FormField>
        <FormField id="period" label="Billing Period" required error={errors.period} attempt={attempt}>
          <input id="period" value={period} onChange={(e) => setPeriod(e.target.value)} className={fieldInputClass(!!errors.period)} />
        </FormField>
        <div />
        <FormField id="issueDate" label="Issue Date" required error={errors.issueDate} attempt={attempt}>
          <input id="issueDate" type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className={fieldInputClass(!!errors.issueDate)} />
        </FormField>
        <FormField id="dueDate" label="Due Date" error={errors.dueDate} attempt={attempt}>
          <input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={fieldInputClass(!!errors.dueDate)} />
        </FormField>
      </div>

      <div data-field="structures" className="space-y-1.5">
        <p className="text-[12px] font-medium text-foreground">Fees to bill <span className="font-normal text-muted-foreground">(none ticked = all applicable)</span></p>
        {applicable.map((s) => (
          <label key={s.id} className="flex items-center gap-2 text-[12px]">
            <input type="checkbox" checked={chosen.has(s.id)} className="h-3.5 w-3.5"
              onChange={(e) => setChosen((prev) => { const n = new Set(prev); if (e.target.checked) n.add(s.id); else n.delete(s.id); return n; })} />
            {s.name} · {s.className} · {money(s.amount)} / {s.frequency}
          </label>
        ))}
        {errors.structures && <p className="text-[11px] text-rose-500">{errors.structures}</p>}
        <p className="text-[11px] text-muted-foreground">Students already billed for this period are skipped, so it's safe to run again.</p>
      </div>

      <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
        {onCancel && <Button variant="outline" size="sm" className="h-9 text-[12px]" onClick={onCancel}>Cancel</Button>}
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" disabled={generate.isPending} onClick={handleSubmit}>
          <Send className="h-3.5 w-3.5" /> {generate.isPending ? "Generating…" : "Generate Invoices"}
        </Button>
      </div>
    </div>
  );
}
