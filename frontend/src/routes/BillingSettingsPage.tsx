import { useEffect, useState } from "react";
import { CreditCard, Hash, Percent, Settings2, Tags, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormSection } from "@/components/ui/form-section";
import { Button } from "@/components/ui/button";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { Switch } from "@/components/ui/switch";
import {
  METHOD_LABEL, useDeleteFeeCategory, useFeeCategories, useFeeSettings, useSaveFeeCategory, useSaveFeeSettings,
  type FeeSettings,
} from "@/api/billing";
import { errorMessage } from "@/api/http";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const inputClass = "h-9 w-full rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

const CURRENCIES: { code: string; symbol: string; label: string }[] = [
  { code: "NPR", symbol: "Rs.", label: "NPR — Nepalese Rupee" },
  { code: "INR", symbol: "₹", label: "INR — Indian Rupee" },
  { code: "USD", symbol: "$", label: "USD — US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR — Euro" },
  { code: "GBP", symbol: "£", label: "GBP — British Pound" },
  { code: "BDT", symbol: "৳", label: "BDT — Bangladeshi Taka" },
  { code: "PKR", symbol: "Rs", label: "PKR — Pakistani Rupee" },
  { code: "AED", symbol: "AED", label: "AED — UAE Dirham" },
];

function Toggle({ label, value, onChange, disabled }: { label: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <Switch checked={value} onCheckedChange={onChange} aria-label={label} disabled={disabled} />
      <span className="text-[12.5px] text-foreground">{label}</span>
    </div>
  );
}

export function BillingSettingsPage() {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission("settings.manage");
  const canCategories = hasPermission("fee.create");
  const settings = useFeeSettings();
  const save = useSaveFeeSettings();
  const categories = useFeeCategories();
  const saveCategory = useSaveFeeCategory();
  const deleteCategory = useDeleteFeeCategory();
  const [draft, setDraft] = useState<FeeSettings | null>(null);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => { if (settings.data && !draft) setDraft(settings.data); }, [settings.data, draft]);

  if (settings.isLoading || !draft) return <PremiumSkeleton className="mx-auto h-96 max-w-3xl rounded-2xl" />;

  function saveSection(label: string, body: Partial<FeeSettings>) {
    save.mutate(body, {
      onSuccess: (s) => { setDraft(s); toast.success(`${label} saved.`); },
      onError: (e) => toast.error(errorMessage(e)),
    });
  }
  function addCategory() {
    const name = newCategory.trim();
    if (!name) return;
    const code = name.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 32) || "FEE";
    saveCategory.mutate({ name, code }, {
      onSuccess: () => { setNewCategory(""); toast.success("Fee category added."); },
      onError: (e) => toast.error(errorMessage(e)),
    });
  }

  const set = <K extends keyof FeeSettings>(key: K, value: FeeSettings[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d));
  const SaveButton = ({ label, body }: { label: string; body: Partial<FeeSettings> }) => canEdit ? (
    <Button size="sm" className="h-8 text-[12px]" disabled={save.isPending} onClick={() => saveSection(label, body)}>Save Changes</Button>
  ) : <p className="text-[11px] text-muted-foreground">Only users who can manage settings can change this.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <FormSection icon={Settings2} title="Currency" subtitle="Used on every amount, invoice, receipt and report" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="text-[12px] font-medium text-foreground">Currency</label>
            <PremiumSelect className="mt-1.5" value={draft.currency} disabled={!canEdit}
              onChange={(code) => { const c = CURRENCIES.find((x) => x.code === code); set("currency", code); if (c) set("currency_symbol", c.symbol); }}
              options={[...CURRENCIES.map((c) => ({ value: c.code, label: c.label })),
                ...(CURRENCIES.some((c) => c.code === draft.currency) ? [] : [{ value: draft.currency, label: draft.currency }])]} />
          </div>
          <div><label className="text-[12px] font-medium text-foreground">Symbol</label>
            <input value={draft.currency_symbol} disabled={!canEdit} maxLength={6} onChange={(e) => set("currency_symbol", e.target.value)} className={cn(inputClass, "mt-1.5")} />
          </div>
        </div>
        <div className="mt-4"><SaveButton label="Currency" body={{ currency: draft.currency, currency_symbol: draft.currency_symbol }} /></div>
      </FormSection>

      <FormSection icon={Tags} title="Fee Categories" subtitle="Used on invoice lines and fee structures" defaultOpen>
        {categories.isLoading && <PremiumSkeleton className="h-10 w-full rounded-lg" />}
        <div className="flex flex-wrap gap-2">
          {categories.data?.length === 0 && <p className="text-[12px] text-muted-foreground">No fee categories yet.</p>}
          {(categories.data ?? []).map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[12px] text-foreground">
              {c.name}
              {canCategories && (
                <button type="button" title="Delete" className="text-muted-foreground hover:text-rose-600" onClick={() => {
                  if (!window.confirm(`Delete the "${c.name}" category? Existing invoice lines keep their text.`)) return;
                  deleteCategory.mutate(c.id, { onSuccess: () => toast.success("Category deleted."), onError: (e) => toast.error(errorMessage(e)) });
                }}><Trash2 className="h-3 w-3" /></button>
              )}
            </span>
          ))}
        </div>
        {canCategories && (
          <div className="mt-4 flex items-center gap-2">
            <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="Add a new fee category…" className={inputClass} />
            <Button variant="outline" size="sm" className="h-9 shrink-0 text-[12px]" disabled={saveCategory.isPending} onClick={addCategory}>Add</Button>
          </div>
        )}
      </FormSection>

      <FormSection icon={CreditCard} title="Payment Methods" subtitle="Methods staff can record payments with; turned-off methods are refused">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Object.entries(METHOD_LABEL).map(([value, label]) => (
            <Toggle key={value} label={label} disabled={!canEdit} value={draft.payment_methods?.[value] ?? true}
              onChange={(v) => set("payment_methods", { ...draft.payment_methods, [value]: v })} />
          ))}
        </div>
        <div className="mt-4"><SaveButton label="Payment methods" body={{ payment_methods: draft.payment_methods }} /></div>
      </FormSection>

      <FormSection icon={Percent} title="Late Fee Rules" subtitle="Charged once per invoice by the daily overdue job">
        <Toggle label="Charge a late fee on overdue invoices" disabled={!canEdit} value={draft.late_fee_enabled} onChange={(v) => set("late_fee_enabled", v)} />
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div><label className="text-[12px] font-medium text-foreground">Grace Period (days)</label>
            <input type="number" min={0} disabled={!canEdit} value={draft.grace_period_days}
              onChange={(e) => set("grace_period_days", Math.max(0, Number(e.target.value) || 0))} className={cn(inputClass, "mt-1.5")} /></div>
          <div><label className="text-[12px] font-medium text-foreground">Late Fee Type</label>
            <PremiumSelect className="mt-1.5" value={draft.late_fee_type} disabled={!canEdit}
              onChange={(v) => set("late_fee_type", v as FeeSettings["late_fee_type"])}
              options={[{ value: "fixed", label: "Fixed amount" }, { value: "percentage", label: "Percent of balance" }]} /></div>
          <div><label className="text-[12px] font-medium text-foreground">{draft.late_fee_type === "fixed" ? `Amount (${draft.currency_symbol})` : "Percent"}</label>
            <input type="number" min={0} disabled={!canEdit} value={draft.late_fee_amount}
              onChange={(e) => set("late_fee_amount", Math.max(0, Number(e.target.value) || 0))} className={cn(inputClass, "mt-1.5")} /></div>
        </div>
        <div className="mt-4"><SaveButton label="Late fee rules" body={{
          late_fee_enabled: draft.late_fee_enabled, late_fee_type: draft.late_fee_type,
          late_fee_amount: draft.late_fee_amount, grace_period_days: draft.grace_period_days,
        }} /></div>
      </FormSection>

      <FormSection icon={Hash} title="Numbering & Approvals" subtitle="How the system numbers documents and controls money">
        <ul className="list-disc space-y-1 pl-5 text-[12px] text-muted-foreground">
          <li>Invoice, receipt, expense and vendor numbers are assigned by the server in sequence each year (e.g. INV-2026-00001, RCPT-2026-00001) and can't be edited.</li>
          <li>Every fee discount needs approval from someone with discount-approval rights.</li>
          <li>Expenses and payroll must be approved by someone other than the person who recorded them.</li>
          <li>Payment and due-date reminders are configured in Settings → Notifications.</li>
        </ul>
      </FormSection>
    </div>
  );
}
