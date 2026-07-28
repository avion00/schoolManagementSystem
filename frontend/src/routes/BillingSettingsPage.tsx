import { useState } from "react";
import {
  Bell, Calendar, CreditCard, DollarSign, FileText, Hash, Percent,
  Receipt, ScrollText, Settings2, Tags,
} from "lucide-react";
import { toast } from "sonner";

import { FormSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { Switch } from "@/components/ui/switch";
import { FEE_CATEGORY_OPTIONS, PAYMENT_METHOD_OPTIONS } from "@/data/billingData";
import { cn } from "@/lib/utils";

const inputClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <Switch checked={value} onCheckedChange={onChange} aria-label={label} />
      <span className="text-[12.5px] text-foreground">{label}</span>
    </div>
  );
}

function SaveButton({ section }: { section: string }) {
  return (
    <Button size="sm" className="h-8 text-[12px]" onClick={() => { console.log(`Saved ${section} settings`); toast.success(`${section} settings saved.`); }}>
      Save Changes
    </Button>
  );
}

export function BillingSettingsPage() {
  const [methods, setMethods] = useState<Record<string, boolean>>(
    Object.fromEntries(PAYMENT_METHOD_OPTIONS.map((m) => [m, true])),
  );
  const [notify, setNotify] = useState({ invoiceIssued: true, paymentReceived: true, overdueReminder: true, payrollProcessed: false });
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [lateFeeType, setLateFeeType] = useState("flat");
  const [currency, setCurrency] = useState("USD");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <FormSection icon={Calendar} title="Academic Year Billing Setup" subtitle="Configure the billing cycle for the current academic year" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="text-[12px] font-medium text-foreground">Academic Year</label>
            <PremiumSelect
              className="mt-1.5"
              value={academicYear}
              onChange={setAcademicYear}
              options={[{ value: "2025-2026", label: "2025–2026" }]}
            /></div>
          <div><label className="text-[12px] font-medium text-foreground">Billing Cycle</label>
            <PremiumSelect
              className="mt-1.5"
              value={billingCycle}
              onChange={setBillingCycle}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "term", label: "Per Term" },
                { value: "annual", label: "Annual" },
              ]}
            /></div>
        </div>
        <div className="mt-4"><SaveButton section="Academic year billing" /></div>
      </FormSection>

      <FormSection icon={Tags} title="Fee Categories" subtitle="Fee types available when creating invoices and fee structures">
        <div className="flex flex-wrap gap-2">
          {FEE_CATEGORY_OPTIONS.map((c) => (
            <span key={c} className="rounded-full bg-muted px-3 py-1 text-[12px] text-foreground">{c}</span>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input placeholder="Add a new fee category…" className={inputClass} />
          <Button variant="outline" size="sm" className="h-9 shrink-0 text-[12px]" onClick={() => toast.success("Fee category added.")}>Add</Button>
        </div>
      </FormSection>

      <FormSection icon={CreditCard} title="Payment Methods" subtitle="Enable or disable accepted payment methods">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PAYMENT_METHOD_OPTIONS.map((m) => (
            <Toggle key={m} label={m} value={methods[m]} onChange={(v) => setMethods((prev) => ({ ...prev, [m]: v }))} />
          ))}
        </div>
        <div className="mt-4"><SaveButton section="Payment methods" /></div>
      </FormSection>

      <FormSection icon={Hash} title="Invoice Numbering Format" subtitle="Pattern used to generate new invoice numbers">
        <input defaultValue="INV-{YYYY}-{0000}" className={inputClass} />
        <p className="mt-1.5 text-[11px] text-muted-foreground">Example: INV-2026-0001</p>
        <div className="mt-4"><SaveButton section="Invoice numbering" /></div>
      </FormSection>

      <FormSection icon={Receipt} title="Receipt Numbering Format" subtitle="Pattern used to generate new receipt numbers">
        <input defaultValue="RCPT-{YYYY}-{0000}" className={inputClass} />
        <p className="mt-1.5 text-[11px] text-muted-foreground">Example: RCPT-2026-0001</p>
        <div className="mt-4"><SaveButton section="Receipt numbering" /></div>
      </FormSection>

      <FormSection icon={ScrollText} title="Late Fee Rules" subtitle="Automatic penalty applied to overdue invoices">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div><label className="text-[12px] font-medium text-foreground">Grace Period (days)</label><input type="number" defaultValue={7} className={cn(inputClass, "mt-1.5")} /></div>
          <div><label className="text-[12px] font-medium text-foreground">Late Fee Type</label>
            <PremiumSelect
              className="mt-1.5"
              value={lateFeeType}
              onChange={setLateFeeType}
              options={[
                { value: "flat", label: "Flat Amount" },
                { value: "percent", label: "Percentage" },
              ]}
            /></div>
          <div><label className="text-[12px] font-medium text-foreground">Late Fee Value</label><input type="number" defaultValue={200} className={cn(inputClass, "mt-1.5")} /></div>
        </div>
        <div className="mt-4"><SaveButton section="Late fee rules" /></div>
      </FormSection>

      <FormSection icon={Percent} title="Discount / Scholarship Rules" subtitle="Rules governing fee discounts and scholarships">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="text-[12px] font-medium text-foreground">Max Discount (%)</label><input type="number" defaultValue={100} className={cn(inputClass, "mt-1.5")} /></div>
          <div><label className="text-[12px] font-medium text-foreground">Approval Required Above</label><input type="number" defaultValue={25} className={cn(inputClass, "mt-1.5")} /></div>
        </div>
        <div className="mt-4"><SaveButton section="Discount / scholarship rules" /></div>
      </FormSection>

      <FormSection icon={DollarSign} title="Tax / VAT" subtitle="Placeholder — enable once tax registration is finalized">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Toggle label="Enable VAT on invoices" value={false} onChange={() => toast.info("Tax settings are a placeholder for now.")} />
          <div><label className="text-[12px] font-medium text-foreground">VAT Rate (%)</label><input type="number" defaultValue={0} disabled className={cn(inputClass, "mt-1.5 opacity-60")} /></div>
        </div>
      </FormSection>

      <FormSection icon={Settings2} title="Currency Settings" subtitle="Default currency used across billing and reports">
        <PremiumSelect
          value={currency}
          onChange={setCurrency}
          options={[
            { value: "USD", label: "USD — US Dollar" },
            { value: "NPR", label: "NPR — Nepalese Rupee" },
            { value: "INR", label: "INR — Indian Rupee" },
          ]}
        />
        <div className="mt-4"><SaveButton section="Currency" /></div>
      </FormSection>

      <FormSection icon={FileText} title="Payment Gateway" subtitle="Placeholder — connect an online payment gateway later">
        <div className="rounded-lg border border-dashed border-input p-4 text-center text-[12px] text-muted-foreground">
          No payment gateway connected. Online payments will route through a gateway once integrated.
        </div>
      </FormSection>

      <FormSection icon={Bell} title="Notification Settings" subtitle="Automated finance notifications">
        <div className="space-y-3">
          <Toggle label="Notify on invoice issued" value={notify.invoiceIssued} onChange={(v) => setNotify((n) => ({ ...n, invoiceIssued: v }))} />
          <Toggle label="Notify on payment received" value={notify.paymentReceived} onChange={(v) => setNotify((n) => ({ ...n, paymentReceived: v }))} />
          <Toggle label="Send overdue payment reminders" value={notify.overdueReminder} onChange={(v) => setNotify((n) => ({ ...n, overdueReminder: v }))} />
          <Toggle label="Notify when payroll is processed" value={notify.payrollProcessed} onChange={(v) => setNotify((n) => ({ ...n, payrollProcessed: v }))} />
        </div>
        <div className="mt-4"><SaveButton section="Notification" /></div>
      </FormSection>
    </div>
  );
}
