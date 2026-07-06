import { useState } from "react";
import { Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GradeBadge } from "@/components/exams/GradeBadge";
import { getGradeForPercent } from "@/data/examsData";
import type { MarksEntry, ExamSchedule } from "@/data/examsData";
import { cn } from "@/lib/utils";

interface Props {
  entries:  MarksEntry[];
  schedule: ExamSchedule;
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function computeTotals(row: MarksEntry, sched: ExamSchedule): Partial<MarksEntry> {
  if (row.isAbsent) return { totalMarks: null, percentage: null, grade: null, gradePoint: null, result: null };
  const th  = row.theoryMarks    ?? 0;
  const pr  = row.practicalMarks ?? 0;
  const inn = row.internalMarks  ?? 0;
  const total = th + pr + inn;
  const full  = sched.fullMarks;
  const pct   = Math.round((total / full) * 10000) / 100;
  const { grade, gradePoint, result } = getGradeForPercent(pct);
  return { totalMarks: total, percentage: pct, grade, gradePoint, result };
}

function MarkInput({ value, max, onChange, disabled }: {
  value: number | null; max: number; onChange: (v: number | null) => void; disabled?: boolean;
}) {
  return (
    <input
      type="number"
      min={0} max={max}
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") { onChange(null); return; }
        onChange(clamp(Number(raw), 0, max));
      }}
      className="w-16 rounded border border-input bg-background px-2 py-1 text-center text-[12px] focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

export function MarksEntryTable({ entries: initial, schedule }: Props) {
  const [rows, setRows] = useState<MarksEntry[]>(initial.map((r) => ({
    ...r, ...computeTotals(r, schedule),
  })));
  const [saving, setSaving]     = useState(false);
  const [publishing, setPublish] = useState(false);

  function update(id: number, patch: Partial<MarksEntry>) {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const merged = { ...r, ...patch };
      const computed = computeTotals(merged, schedule);
      return { ...merged, ...computed };
    }));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((res) => setTimeout(res, 600));
    setSaving(false);
    toast.success("Marks saved successfully.");
  }
  async function handlePublish() {
    setPublish(true);
    await new Promise((res) => setTimeout(res, 800));
    setPublish(false);
    toast.success("Results published! Students can now view their marks.");
  }

  const entered = rows.filter((r) => !r.isAbsent && r.totalMarks !== null).length;
  const passCount = rows.filter((r) => r.result === "Pass").length;
  const failCount = rows.filter((r) => r.result === "Fail").length;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-[12px]">
        <span><span className="font-semibold">{rows.length}</span> students</span>
        <span className="text-emerald-600"><span className="font-semibold">{passCount}</span> pass</span>
        <span className="text-rose-600"><span className="font-semibold">{failCount}</span> fail</span>
        <span className="text-muted-foreground"><span className="font-semibold">{entered}</span> marks entered</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
        <table className="min-w-full text-[12px]">
          <thead className="bg-muted/40 border-b border-border/60">
            <tr>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Roll</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Student Name</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Adm No</th>
              {schedule.theoryMarks > 0 && <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Theory<br/><span className="text-[10px] normal-case font-normal">/{schedule.theoryMarks}</span></th>}
              {schedule.practicalMarks > 0 && <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Practical<br/><span className="text-[10px] normal-case font-normal">/{schedule.practicalMarks}</span></th>}
              {schedule.internalMarks > 0 && <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Internal<br/><span className="text-[10px] normal-case font-normal">/{schedule.internalMarks}</span></th>}
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Total<br/><span className="text-[10px] normal-case font-normal">/{schedule.fullMarks}</span></th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">%</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Grade</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Result</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Absent</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((r) => (
              <tr key={r.id} className={cn("hover:bg-muted/20 transition-colors", r.isAbsent && "bg-muted/30 opacity-60")}>
                <td className="px-3 py-2 text-center text-muted-foreground">{r.roll}</td>
                <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">{r.studentName}</td>
                <td className="px-3 py-2 text-muted-foreground font-mono">{r.admissionNo}</td>
                {schedule.theoryMarks > 0 && (
                  <td className="px-3 py-2 text-center">
                    <MarkInput value={r.theoryMarks} max={schedule.theoryMarks} disabled={r.isAbsent}
                      onChange={(v) => update(r.id, { theoryMarks: v })} />
                  </td>
                )}
                {schedule.practicalMarks > 0 && (
                  <td className="px-3 py-2 text-center">
                    <MarkInput value={r.practicalMarks} max={schedule.practicalMarks} disabled={r.isAbsent}
                      onChange={(v) => update(r.id, { practicalMarks: v })} />
                  </td>
                )}
                {schedule.internalMarks > 0 && (
                  <td className="px-3 py-2 text-center">
                    <MarkInput value={r.internalMarks} max={schedule.internalMarks} disabled={r.isAbsent}
                      onChange={(v) => update(r.id, { internalMarks: v })} />
                  </td>
                )}
                <td className="px-3 py-2 text-center font-bold text-foreground">
                  {r.isAbsent ? "—" : (r.totalMarks ?? "—")}
                </td>
                <td className="px-3 py-2 text-center text-foreground">
                  {r.isAbsent ? "—" : (r.percentage !== null ? `${r.percentage}%` : "—")}
                </td>
                <td className="px-3 py-2 text-center">
                  <GradeBadge grade={r.isAbsent ? null : r.grade} />
                </td>
                <td className="px-3 py-2 text-center">
                  {!r.isAbsent && r.result && (
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1",
                      r.result === "Pass"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-500/30"
                        : "bg-rose-50 text-rose-700 ring-rose-500/30",
                    )}>
                      {r.result}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" checked={r.isAbsent}
                    onChange={(e) => update(r.id, { isAbsent: e.target.checked })}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" value={r.remarks}
                    onChange={(e) => update(r.id, { remarks: e.target.value })}
                    placeholder="Remarks…"
                    className="w-28 rounded border border-input bg-background px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={saving} onClick={handleSave}>
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving…" : "Save Marks"}
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px] border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          disabled={publishing} onClick={handlePublish}>
          <Send className="h-3.5 w-3.5" />
          {publishing ? "Publishing…" : "Publish Results"}
        </Button>
        <span className="text-[11px] text-muted-foreground">Marks auto-saved every 2 min.</span>
      </div>
    </div>
  );
}
