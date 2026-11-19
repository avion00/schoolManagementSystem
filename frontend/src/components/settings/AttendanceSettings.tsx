import { CalendarCheck, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField } from "./SettingsSection";
import { SectionForm } from "./SectionForm";
import { cn } from "@/lib/utils";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Weekly days off and how long past attendance stays editable. */
export function AttendanceSettings() {
  return (
    <SectionForm section="attendance">
      {(draft, set, canEdit) => (<>
        <SettingsSection icon={CalendarCheck} title="Weekly Days Off" subtitle="Registers aren't expected on these days; monthly sheets grey them out">
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => {
              const on = draft.weekend_days.includes(d);
              return (
                <button key={d} type="button" disabled={!canEdit}
                  onClick={() => set({ weekend_days: on ? draft.weekend_days.filter((x) => x !== d) : [...draft.weekend_days, d] })}
                  className={cn("rounded-full border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors",
                    on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted")}>
                  {d}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[11.5px] text-muted-foreground">Holidays are managed on the attendance calendar.</p>
        </SettingsSection>
        <SettingsSection icon={Lock} title="Editing Window">
          <SettingsField label="Days past attendance stays editable" hint="Teachers can't change older registers; staff with full attendance rights still can. 0 = today only.">
            <Input type="number" min={0} max={365} disabled={!canEdit} value={draft.lock_after_days}
              onChange={(e) => set({ lock_after_days: Math.max(0, Math.min(365, Number(e.target.value) || 0)) })} className="h-9 w-32 text-[13px]" />
          </SettingsField>
        </SettingsSection>
      </>)}
    </SectionForm>
  );
}
