import { useState } from "react";
import { CalendarDays, Plus, CheckCircle, Archive, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField, ToggleRow, SaveBar } from "./SettingsSection";
import { ACADEMIC_YEARS } from "@/data/settingsData";
import type { AcademicYear, AcademicYearStatus } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const STATUS_CLS: Record<AcademicYearStatus, string> = {
  Active:   "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-400/40 dark:bg-emerald-950/40 dark:text-emerald-300",
  Upcoming: "bg-violet-50  text-violet-700  ring-1 ring-violet-400/40  dark:bg-violet-950/40  dark:text-violet-300",
  Archived: "bg-slate-100  text-slate-500   ring-1 ring-slate-300/50   dark:bg-slate-800      dark:text-slate-400",
};

export function AcademicYearSettings() {
  const active  = ACADEMIC_YEARS.find((y) => y.status === "Active")!;
  const [form, setForm]   = useState<AcademicYear>({ ...active });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  function set<K extends keyof AcademicYear>(k: K, v: AcademicYear[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSave() {
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    console.log("Academic year saved:", form);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      {/* Active year config */}
      <SettingsSection icon={CalendarDays} title="Current Academic Year"
        subtitle="Manage active year settings">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsField label="Academic Year">
              <Input value={form.year} onChange={(e) => set("year", e.target.value)} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Start Date">
              <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="End Date">
              <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Attendance Lock Date" hint="Mark attendance read-only after this date">
              <Input type="date" value={form.attendanceLock} onChange={(e) => set("attendanceLock", e.target.value)} className="h-9 text-[13px]" />
            </SettingsField>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            <ToggleRow
              label="Admissions Open"
              sublabel="Allow new student admissions for this year"
              checked={form.admissionOpen}
              onChange={(v) => set("admissionOpen", v)}
            />
            <ToggleRow
              label="Result Publishing Enabled"
              sublabel="Allow exam results to be published"
              checked={form.resultPublished}
              onChange={(v) => set("resultPublished", v)}
            />
          </div>
        </div>
        <SaveBar onSave={handleSave} onReset={() => setForm({ ...active })} saving={saving} saved={saved} />
      </SettingsSection>

      {/* Years table */}
      <SettingsSection icon={CalendarDays} title="All Academic Years"
        subtitle="History and upcoming sessions"
        action={
          <Button size="sm" className="h-8 gap-1.5 text-[12px]">
            <Plus className="h-3.5 w-3.5" /> Add Year
          </Button>
        }
        noPad>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {["Year","Start Date","End Date","Admissions","Results","Status","Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ACADEMIC_YEARS.map((y) => (
                <tr key={y.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3.5 text-[13px] font-semibold text-foreground">{y.year}</td>
                  <td className="px-4 py-3.5 text-[12px] text-muted-foreground">{y.startDate}</td>
                  <td className="px-4 py-3.5 text-[12px] text-muted-foreground">{y.endDate}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", y.admissionOpen ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
                      {y.admissionOpen ? "Open" : "Closed"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", y.resultPublished ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400")}>
                      {y.resultPublished ? "Published" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", STATUS_CLS[y.status])}>
                      {y.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1">
                      {y.status !== "Active" && (
                        <button title="Activate" className="flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors">
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button title="Edit" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {y.status !== "Archived" && (
                        <button title="Archive" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  );
}
