import { useState } from "react";
import { Lock, Shield, Clock, AlertTriangle, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField, ToggleRow, SaveBar } from "./SettingsSection";
import { SECURITY_SETTINGS } from "@/data/settingsData";
import type { SecuritySettings as SS } from "@/data/settingsData";
import { cn } from "@/lib/utils";

export function SecuritySettings() {
  const [s, setS] = useState<SS>({ ...SECURITY_SETTINGS, allowedDomains: [...SECURITY_SETTINGS.allowedDomains] });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [newDomain, setNewDomain] = useState("");

  function set<K extends keyof SS>(k: K, v: SS[K]) {
    setS((p) => ({ ...p, [k]: v }));
  }

  function addDomain() {
    const d = newDomain.trim().toLowerCase();
    if (d && !s.allowedDomains.includes(d)) {
      setS((p) => ({ ...p, allowedDomains: [...p.allowedDomains, d] }));
      setNewDomain("");
    }
  }
  function removeDomain(d: string) {
    setS((p) => ({ ...p, allowedDomains: p.allowedDomains.filter((x) => x !== d) }));
  }

  function validate(): boolean {
    if (s.minPasswordLength < 6 || s.minPasswordLength > 32) {
      alert("Password length must be between 6 and 32");
      return false;
    }
    if (s.sessionTimeoutMins < 5) {
      alert("Session timeout must be at least 5 minutes");
      return false;
    }
    return true;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    console.log("Security settings saved:", s);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Password policy */}
      <SettingsSection icon={Lock} title="Password Policy"
        subtitle="Minimum requirements for user passwords">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Minimum Password Length" hint="Between 6 and 32 characters">
              <Input type="number" min={6} max={32} value={s.minPasswordLength}
                onChange={(e) => set("minPasswordLength", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            <ToggleRow label="Require Uppercase Letter" checked={s.requireUppercase} onChange={(v) => set("requireUppercase", v)} />
            <ToggleRow label="Require Number" checked={s.requireNumber} onChange={(v) => set("requireNumber", v)} />
            <ToggleRow label="Require Special Character" checked={s.requireSpecialChar} onChange={(v) => set("requireSpecialChar", v)} />
          </div>

          {/* Strength preview */}
          <div className="rounded-xl bg-muted/30 p-4">
            <p className="mb-2 text-[12px] font-medium text-foreground">Password strength requirements active:</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                Min {s.minPasswordLength} chars
              </span>
              {s.requireUppercase    && <span className="rounded-md bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">Uppercase</span>}
              {s.requireNumber       && <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">Number</span>}
              {s.requireSpecialChar  && <span className="rounded-md bg-violet-50 dark:bg-violet-950/30 px-2.5 py-0.5 text-[11px] font-medium text-violet-700 dark:text-violet-300">Special char</span>}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Session & login */}
      <SettingsSection icon={Clock} title="Session & Login"
        subtitle="Timeouts, lockouts, and login alerts">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsField label="Session Timeout (min)" hint="Idle minutes before auto-logout">
              <Input type="number" value={s.sessionTimeoutMins}
                onChange={(e) => set("sessionTimeoutMins", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Max Login Attempts" hint="Before lockout">
              <Input type="number" value={s.maxLoginAttempts}
                onChange={(e) => set("maxLoginAttempts", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Lockout Duration (min)">
              <Input type="number" value={s.lockoutDurationMins}
                onChange={(e) => set("lockoutDurationMins", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
          </div>
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            <ToggleRow label="Login Alerts" sublabel="Email admin when a new login occurs" checked={s.loginAlertsEnabled} onChange={(v) => set("loginAlertsEnabled", v)} />
            <ToggleRow label="Auto Logout Inactive Users" sublabel="Force logout after session timeout" checked={s.autoLogoutInactive} onChange={(v) => set("autoLogoutInactive", v)} />
          </div>
        </div>
      </SettingsSection>

      {/* 2FA */}
      <SettingsSection icon={Shield} title="Two-Factor Authentication"
        subtitle="Add extra verification layer for admin users">
        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
          <ToggleRow
            label="Enable Two-Factor Authentication"
            sublabel="Requires app-based TOTP (Google Authenticator, Authy)"
            checked={s.twoFactorEnabled}
            onChange={(v) => set("twoFactorEnabled", v)}
          />
        </div>
        {!s.twoFactorEnabled && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-[12px] text-amber-800 dark:text-amber-300">
              2FA is disabled. Enable it for enhanced account security.
            </p>
          </div>
        )}
      </SettingsSection>

      {/* Allowed domains */}
      <SettingsSection icon={Lock} title="Allowed Email Domains"
        subtitle="Only allow registrations from these domains">
        <div className="space-y-3">
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            <ToggleRow label="IP Whitelist Enabled" sublabel="Restrict access to approved IP ranges" checked={s.ipWhitelistEnabled} onChange={(v) => set("ipWhitelistEnabled", v)} />
          </div>

          <div className="flex flex-wrap gap-2">
            {s.allowedDomains.map((d) => (
              <span key={d} className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-[12px] font-medium text-foreground">
                {d}
                <button onClick={() => removeDomain(d)} className="text-muted-foreground hover:text-rose-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDomain()}
              placeholder="e.g. schoolos.np"
              className="h-9 flex-1 text-[13px]"
            />
            <button onClick={addDomain}
              className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-[12px] font-medium text-foreground hover:bg-muted transition-colors")}>
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
        </div>
      </SettingsSection>

      <SaveBar onSave={handleSave} onReset={() => setS({ ...SECURITY_SETTINGS, allowedDomains: [...SECURITY_SETTINGS.allowedDomains] })} saving={saving} saved={saved} />
    </div>
  );
}
