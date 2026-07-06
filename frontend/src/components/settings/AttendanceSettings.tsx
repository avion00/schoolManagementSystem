import { useState } from "react";
import { CalendarCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField, ToggleRow, SaveBar } from "./SettingsSection";
import { ATTENDANCE_SETTINGS } from "@/data/settingsData";
import type { AttendanceSettings as AS } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export function AttendanceSettings() {
  const [s, setS] = useState<AS>({ ...ATTENDANCE_SETTINGS, weekendDays: [...ATTENDANCE_SETTINGS.weekendDays] });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  function set<K extends keyof AS>(k: K, v: AS[K]) {
    setS((p) => ({ ...p, [k]: v }));
  }
  function toggleDay(day: string) {
    setS((p) => ({
      ...p,
      weekendDays: p.weekendDays.includes(day)
        ? p.weekendDays.filter((d) => d !== day)
        : [...p.weekendDays, day],
    }));
  }

  async function handleSave() {
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    console.log("Attendance settings saved:", s);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SettingsSection icon={CalendarCheck} title="Attendance Configuration"
        subtitle="How attendance is captured and managed">
        {/* Type selector */}
        <div className="space-y-5">
          <SettingsField label="Attendance Type">
            <div className="flex gap-2">
              {(["Daily","Period-wise"] as const).map((t) => (
                <button key={t} type="button" onClick={() => set("attendanceType", t)}
                  className={cn("flex-1 h-9 rounded-lg border text-[12px] font-medium transition-colors",
                    s.attendanceType === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted")}>
                  {t}
                </button>
              ))}
            </div>
          </SettingsField>

          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsField label="Late Threshold (min)" hint="Minutes after start = 'Late'">
              <Input type="number" value={s.lateThresholdMinutes} onChange={(e) => set("lateThresholdMinutes", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Half Day Threshold (min)" hint="Minutes present = 'Half Day'">
              <Input type="number" value={s.halfDayThreshold} onChange={(e) => set("halfDayThreshold", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Lock After (days)" hint="Lock attendance editing after N days">
              <Input type="number" value={s.lockAfterDays} onChange={(e) => set("lockAfterDays", Number(e.target.value))} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Work Hours Start">
              <Input type="time" value={s.workingHoursStart} onChange={(e) => set("workingHoursStart", e.target.value)} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Work Hours End">
              <Input type="time" value={s.workingHoursEnd} onChange={(e) => set("workingHoursEnd", e.target.value)} className="h-9 text-[13px]" />
            </SettingsField>
          </div>

          {/* Weekend days */}
          <SettingsField label="Weekend Days" hint="Days when school is closed">
            <div className="mt-1.5 flex flex-wrap gap-2">
              {DAYS.map((d) => {
                const selected = s.weekendDays.includes(d);
                return (
                  <button key={d} type="button" onClick={() => toggleDay(d)}
                    className={cn("h-8 rounded-lg border px-3 text-[12px] font-medium transition-colors",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted")}>
                    {d.slice(0,3)}
                  </button>
                );
              })}
            </div>
          </SettingsField>

          {/* Toggles */}
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            <ToggleRow
              label="Allow Late Marking"
              sublabel="Teachers can mark attendance after the set lock period"
              checked={s.allowLateMarking}
              onChange={(v) => set("allowLateMarking", v)}
            />
            <ToggleRow
              label="Auto-Notify Parents on Absence"
              sublabel="Send notification when student is marked absent"
              checked={s.autoNotifyParents}
              onChange={(v) => set("autoNotifyParents", v)}
            />
            <ToggleRow
              label="Count Holidays as Absent"
              sublabel="If student is not excused on a holiday, mark absent"
              checked={s.countHolidaysAbsent}
              onChange={(v) => set("countHolidaysAbsent", v)}
            />
          </div>
        </div>
      </SettingsSection>

      <SaveBar onSave={handleSave} onReset={() => setS({ ...ATTENDANCE_SETTINGS, weekendDays: [...ATTENDANCE_SETTINGS.weekendDays] })} saving={saving} saved={saved} />
    </div>
  );
}
