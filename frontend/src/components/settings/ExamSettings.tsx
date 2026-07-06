import { useState } from "react";
import { ClipboardList, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SettingsSection, SettingsField, ToggleRow, SaveBar } from "./SettingsSection";
import { EXAM_SETTINGS } from "@/data/settingsData";
import type { ExamSettings as ES } from "@/data/settingsData";
import { cn } from "@/lib/utils";

const GRADE_COLOR: Record<string, string> = {
  "A+": "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300",
  "A":  "text-blue-700   bg-blue-50   dark:bg-blue-950/40   dark:text-blue-300",
  "B+": "text-violet-700 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300",
  "B":  "text-indigo-700 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-300",
  "C+": "text-amber-700  bg-amber-50  dark:bg-amber-950/40  dark:text-amber-300",
  "C":  "text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300",
  "D":  "text-slate-600  bg-slate-100 dark:bg-slate-800     dark:text-slate-400",
  "F":  "text-rose-700   bg-rose-50   dark:bg-rose-950/40   dark:text-rose-300",
};

export function ExamSettings() {
  const [s, setS] = useState<ES>({ ...EXAM_SETTINGS, gradeScale: EXAM_SETTINGS.gradeScale.map((g) => ({ ...g })) });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  function set<K extends keyof ES>(k: K, v: ES[K]) {
    setS((p) => ({ ...p, [k]: v }));
  }

  async function handleSave() {
    const pct = s.defaultPassPercentage;
    if (pct < 0 || pct > 100) { alert("Pass percentage must be 0–100"); return; }
    setSaving(true); setSaved(false);
    await new Promise((r) => setTimeout(r, 600));
    console.log("Exam settings saved:", s);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-5">
      <SettingsSection icon={ClipboardList} title="Exam Configuration"
        subtitle="Pass marks, GPA, and assessment preferences">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <SettingsField label="Default Pass %" hint="Minimum % to pass">
              <Input type="number" min={0} max={100} value={s.defaultPassPercentage}
                onChange={(e) => set("defaultPassPercentage", Number(e.target.value))}
                className="h-9 text-[13px]" />
            </SettingsField>
            <SettingsField label="Absent Mark" hint="Marks given for absent paper">
              <Input type="number" value={s.absentMark}
                onChange={(e) => set("absentMark", Number(e.target.value))}
                className="h-9 text-[13px]" />
            </SettingsField>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            <ToggleRow label="GPA System Enabled" sublabel="Use Grade Point Average calculation" checked={s.gpaEnabled} onChange={(v) => set("gpaEnabled", v)} />
            <ToggleRow label="Result Approval Required" sublabel="Principal must approve before publishing results" checked={s.resultApprovalRequired} onChange={(v) => set("resultApprovalRequired", v)} />
            <ToggleRow label="Admit Card Required" sublabel="Students need admit card to sit exams" checked={s.admitCardRequired} onChange={(v) => set("admitCardRequired", v)} />
            <ToggleRow label="Practical Marks Enabled" sublabel="Include practical/lab component in exams" checked={s.practicalMarksEnabled} onChange={(v) => set("practicalMarksEnabled", v)} />
            <ToggleRow label="Internal Assessment Enabled" sublabel="Include internal assessment / continuous evaluation" checked={s.internalAssessmentEnabled} onChange={(v) => set("internalAssessmentEnabled", v)} />
          </div>
        </div>
      </SettingsSection>

      {/* Grade scale table */}
      <SettingsSection icon={ClipboardList} title="Grade Scale" subtitle="Grade letter, GPA point, and percentage ranges" noPad>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {["Grade","GPA Point","From %","To %","Comment","Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {s.gradeScale.map((row) => (
                <tr key={row.grade} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold", GRADE_COLOR[row.grade] ?? "bg-muted text-muted-foreground")}>
                      {row.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-foreground tabular-nums">{row.point.toFixed(1)}</td>
                  <td className="px-4 py-3 text-[13px] text-foreground tabular-nums">{row.from}%</td>
                  <td className="px-4 py-3 text-[13px] text-foreground tabular-nums">{row.to}%</td>
                  <td className="px-4 py-3 text-[12px] text-muted-foreground">{row.comment}</td>
                  <td className="px-4 py-3">
                    <button title="Edit" className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      <SaveBar onSave={handleSave} onReset={() => setS({ ...EXAM_SETTINGS, gradeScale: EXAM_SETTINGS.gradeScale.map((g) => ({ ...g })) })} saving={saving} saved={saved} />
    </div>
  );
}
