import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  icon:      LucideIcon;
  title:     string;
  subtitle?: string;
  action?:   ReactNode;
  children:  ReactNode;
  noPad?:    boolean;
}

export function SettingsSection({ icon: Icon, title, subtitle, action, children, noPad }: Props) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{title}</p>
            {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={noPad ? "" : "p-5"}>{children}</div>
    </Card>
  );
}

/* Reusable form field row */
export function SettingsField({
  label, hint, required, error, children,
}: { label: string; hint?: string; required?: boolean; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-foreground">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
      {hint  && !error && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-[11px] text-rose-500">{error}</p>}
    </div>
  );
}

/* Reusable toggle row */
export function ToggleRow({
  label, sublabel, checked, onChange, disabled,
}: { label:string; sublabel?:string; checked:boolean; onChange:(v:boolean)=>void; disabled?:boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors
          ${checked ? "bg-primary" : "bg-muted"} ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow ring-0 transition-transform
          ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

/* Save bar shown at bottom of each settings panel */
export function SaveBar({
  onSave, onReset, saving, saved,
}: { onSave: () => void; onReset: () => void; saving: boolean; saved: boolean }) {
  return (
    <div className="mt-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex h-9 items-center gap-2 rounded-xl bg-primary px-5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-5 text-[13px] font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        Reset
      </button>
      {saved && (
        <span className="text-[12px] font-medium text-emerald-600">✓ Changes saved</span>
      )}
    </div>
  );
}
