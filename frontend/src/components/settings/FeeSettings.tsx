import { useState } from "react";
import { CreditCard, Tag, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField, ToggleRow, SaveBar } from "./SettingsSection";
import { FEE_SETTINGS } from "@/data/settingsData";
import type { FeeSettings as FS } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { key: "cash",        label: "Cash"                },
  { key: "bankTransfer",label: "Bank Transfer"       },
  { key: "card",        label: "Card (POS)"          },
  { key: "online",      label: "Online Payment",      },
] as const;

export function FeeSettings() {
  const [s, setS] = useState<FS>({ ...FEE_SETTINGS, paymentMethods: { ...FEE_SETTINGS.paymentMethods }, categories: FEE_SETTINGS.categories.map((c) => ({ ...c })) });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  function set<K extends keyof FS>(k: K, v: FS[K]) {
    setS((p) => ({ ...p, [k]: v }));
  }
  function setPayment(k: keyof FS["paymentMethods"], v: boolean) {
    setS((p) => ({ ...p, paymentMethods: { ...p.paymentMethods, [k]: v } }));
  }
  function toggleCat(id: number) {
    setS((p) => ({ ...p, categories: p.categories.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c) }));
  }

  async function handleSave() {
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    console.log("Fee settings saved:", s);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Currency & late fee */}
      <SettingsSection icon={CreditCard} title="Fee Configuration"
        subtitle="Currency, late fee, and billing preferences">
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingsField label="Currency">
            <select value={s.currency} onChange={(e) => set("currency", e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              {["NPR","USD","EUR","GBP","INR"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </SettingsField>
          <SettingsField label="Currency Symbol">
            <Input value={s.currencySymbol} onChange={(e) => set("currencySymbol", e.target.value)} className="h-9 text-[13px]" />
          </SettingsField>
          <SettingsField label="Invoice Prefix" hint='e.g. "INV" → INV-0001'>
            <Input value={s.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} className="h-9 text-[13px]" />
          </SettingsField>
          <SettingsField label="Receipt Prefix" hint='e.g. "RCP" → RCP-0001'>
            <Input value={s.receiptPrefix} onChange={(e) => set("receiptPrefix", e.target.value)} className="h-9 text-[13px]" />
          </SettingsField>
        </div>

        <div className="mt-4 divide-y divide-border rounded-xl border border-border overflow-hidden">
          <ToggleRow
            label="Late Fee Enabled"
            sublabel="Charge a late fee for overdue payments"
            checked={s.lateFeeEnabled}
            onChange={(v) => set("lateFeeEnabled", v)}
          />
        </div>

        {s.lateFeeEnabled && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <SettingsField label="Late Fee Type">
              <div className="flex gap-2">
                {(["Fixed","Percentage"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => set("lateFeeType", t)}
                    className={cn("flex-1 h-9 rounded-lg border text-[12px] font-medium transition-colors",
                      s.lateFeeType === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted")}>
                    {t}
                  </button>
                ))}
              </div>
            </SettingsField>
            <SettingsField label={`Late Fee Amount (${s.lateFeeType === "Percentage" ? "%" : s.currencySymbol})`}>
              <Input type="number" value={s.lateFeeAmount} onChange={(e) => set("lateFeeAmount", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Grace Period (days)" hint="Days before late fee applies">
              <Input type="number" value={s.gracePeriodDays} onChange={(e) => set("gracePeriodDays", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
          </div>
        )}
      </SettingsSection>

      {/* Payment methods */}
      <SettingsSection icon={CreditCard} title="Payment Methods"
        subtitle="Accepted payment options">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PAYMENT_METHODS.map(({ key, label }) => {
            const active = s.paymentMethods[key];
            return (
              <button key={key} onClick={() => setPayment(key, !active)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}>
                <CreditCard className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                <p className="text-[12px] font-medium text-foreground">{label}</p>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Fee categories */}
      <SettingsSection icon={Tag} title="Fee Categories"
        subtitle="Default fee types and amounts"
        noPad>
        <table className="min-w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              {["Fee Category","Amount","Status","Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {s.categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3.5 text-[13px] font-medium text-foreground">{cat.name}</td>
                <td className="px-4 py-3.5 text-[13px] text-foreground">
                  {s.currencySymbol} {cat.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3.5">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    cat.isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1">
                    <button title="Edit" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggleCat(cat.id)}
                      className={cn("h-5 w-9 rounded-full border-2 border-transparent transition-colors", cat.isActive ? "bg-primary" : "bg-muted")}>
                      <span className={cn("block h-4 w-4 rounded-full bg-white shadow transition-transform", cat.isActive ? "translate-x-4" : "translate-x-0")} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SettingsSection>

      <SaveBar onSave={handleSave} onReset={() => setS({ ...FEE_SETTINGS, paymentMethods: { ...FEE_SETTINGS.paymentMethods }, categories: FEE_SETTINGS.categories.map((c) => ({ ...c })) })} saving={saving} saved={saved} />
    </div>
  );
}
