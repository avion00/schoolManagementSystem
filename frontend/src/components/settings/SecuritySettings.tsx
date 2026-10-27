import { KeyRound, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField } from "./SettingsSection";
import { SectionForm } from "./SectionForm";

function clamp(v: string, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, Number(v) || lo));
}

/** Password rules and sign-in lockout, enforced by the server for every account in the school. */
export function SecuritySettings() {
  return (
    <SectionForm section="security">
      {(draft, set, canEdit) => (<>
        <SettingsSection icon={KeyRound} title="Passwords">
          <SettingsField label="Minimum password length" hint="8–64 characters; applies to new and changed passwords">
            <Input type="number" min={8} max={64} disabled={!canEdit} value={draft.min_password_length}
              onChange={(e) => set({ min_password_length: clamp(e.target.value, 8, 64) })} className="h-9 w-32 text-[13px]" />
          </SettingsField>
        </SettingsSection>
        <SettingsSection icon={ShieldAlert} title="Sign-in Lockout" subtitle="Protects accounts from password guessing">
          <div className="grid gap-4 sm:grid-cols-2">
            <SettingsField label="Failed attempts before lockout" hint="3–20">
              <Input type="number" min={3} max={20} disabled={!canEdit} value={draft.max_login_attempts}
                onChange={(e) => set({ max_login_attempts: clamp(e.target.value, 3, 20) })} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Lockout duration (minutes)" hint="1–1440">
              <Input type="number" min={1} max={1440} disabled={!canEdit} value={draft.lockout_duration_mins}
                onChange={(e) => set({ lockout_duration_mins: clamp(e.target.value, 1, 1440) })} className="h-9 text-[13px]" />
            </SettingsField>
          </div>
        </SettingsSection>
      </>)}
    </SectionForm>
  );
}
