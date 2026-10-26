import { useEffect, useMemo, useState } from "react";
import { Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { GradeBadge } from "@/components/exams/GradeBadge";
import { gradeFor, useSaveMarks } from "@/api/exams";
import { errorMessage } from "@/api/http";
import type { GradeScale, MarksRow, MarksSheet } from "@/api/types/exams";
import { cn } from "@/lib/utils";

interface Props {
  sheet: MarksSheet;
  scale: GradeScale | undefined;
}

type Component = "theory" | "practical" | "internal";
const COMPONENTS: Component[] = ["theory", "practical", "internal"];
const KEY: Record<Component, "theoryMarks" | "practicalMarks" | "internalMarks"> = {
  theory: "theoryMarks", practical: "practicalMarks", internal: "internalMarks",
};

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

/** Total for a row: the sum of its components, or the single mark. Null until complete. */
function totalOf(row: MarksRow, parts: Component[]): number | null {
  if (row.isAbsent) return null;
  if (!parts.length) return row.marksObtained;
  const vals = parts.map((c) => row[KEY[c]]);
  return vals.some((v) => v === null) ? null : vals.reduce<number>((s, v) => s + (v ?? 0), 0);
}

function MarkInput({ value, max, onChange, disabled }: {
  value: number | null; max: number; onChange: (v: number | null) => void; disabled?: boolean;
}) {
  return (
    <input
      type="number"
      min={0} max={max} step="0.5"
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

export function MarksEntryTable({ sheet, scale }: Props) {
  const paper = sheet.paper;
  const parts = COMPONENTS.filter((c) => sheet.components[c] !== undefined);
  const [rows, setRows] = useState<MarksRow[]>(sheet.rows);
  const [dirty, setDirty] = useState(false);
  const save = useSaveMarks();
  useEffect(() => { setRows(sheet.rows); setDirty(false); }, [sheet.rows]);

  function update(studentId: string, patch: Partial<MarksRow>) {
    setRows((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, ...patch } : r)));
    setDirty(true);
  }

  const computed = useMemo(() => rows.map((r) => {
    const total = totalOf(r, parts);
    const pct = total === null ? null : Math.round((total / paper.fullMarks) * 10000) / 100;
    const band = pct === null ? undefined : gradeFor(scale, pct);
    const result = total === null ? null : total >= paper.passMarks ? "Pass" : "Fail";
    return { row: r, total, pct, grade: band?.gradeName ?? null, result };
  }), [rows, parts, paper.fullMarks, paper.passMarks, scale]);

  // Only rows with something entered are sent; blank rows stay "missing".
  const toSave = rows.filter((r) => r.isAbsent || totalOf(r, parts) !== null);
  const entered = computed.filter((c) => c.total !== null).length;
  const absent = rows.filter((r) => r.isAbsent).length;
  const passCount = computed.filter((c) => c.result === "Pass").length;
  const failCount = computed.filter((c) => c.result === "Fail").length;
  const incomplete = rows.filter((r) => !r.isAbsent && parts.length > 0 && parts.some((c) => r[KEY[c]] !== null)
    && totalOf(r, parts) === null).length;

  function handleSave() {
    if (toSave.length === 0) { toast.info("Enter some marks first."); return; }
    save.mutate({ paperId: paper.id, rows: toSave, components: parts }, {
      onSuccess: (r) => { toast.success(`Saved marks for ${r.saved} student${r.saved === 1 ? "" : "s"}.`); setDirty(false); },
      onError: (e) => toast.error(errorMessage(e)),
    });
  }

  const th = "px-3 py-2.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide";

  return (
    <div className="space-y-4">
      {sheet.locked && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-[12px] text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
          <Lock className="h-3.5 w-3.5" /> Marks for this exam are locked. Unlock the exam on the Results page to make changes.
        </div>
      )}

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-[12px]">
        <span><span className="font-semibold">{rows.length}</span> students</span>
        <span className="text-emerald-600"><span className="font-semibold">{passCount}</span> pass</span>
        <span className="text-rose-600"><span className="font-semibold">{failCount}</span> fail</span>
        <span className="text-muted-foreground"><span className="font-semibold">{absent}</span> absent</span>
        <span className="text-muted-foreground"><span className="font-semibold">{entered + absent}</span> of {rows.length} entered</span>
        {!scale && <span className="text-amber-600">This exam has no grade scale, so no grades are shown.</span>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-elevated">
        <table className="min-w-full text-[12px]">
          <thead className="bg-muted/40 border-b border-border/60">
            <tr>
              <th className={cn(th, "text-left")}>Roll</th>
              <th className={cn(th, "text-left")}>Student Name</th>
              <th className={cn(th, "text-left")}>Adm No</th>
              {parts.map((c) => (
                <th key={c} className={cn(th, "text-center capitalize")}>{c}<br /><span className="text-[10px] normal-case font-normal">/{sheet.components[c]}</span></th>
              ))}
              {parts.length === 0 && <th className={cn(th, "text-center")}>Marks<br /><span className="text-[10px] normal-case font-normal">/{paper.fullMarks}</span></th>}
              {parts.length > 0 && <th className={cn(th, "text-center")}>Total<br /><span className="text-[10px] normal-case font-normal">/{paper.fullMarks}</span></th>}
              <th className={cn(th, "text-center")}>%</th>
              <th className={cn(th, "text-center")}>Grade</th>
              <th className={cn(th, "text-center")}>Result</th>
              <th className={cn(th, "text-center")}>Absent</th>
              <th className={cn(th, "text-left")}>Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {computed.map(({ row: r, total, pct, grade, result }) => (
              <tr key={r.studentId} className={cn("hover:bg-muted/20 transition-colors", r.isAbsent && "bg-muted/30 opacity-60")}>
                <td className="px-3 py-2 text-center text-muted-foreground">{r.roll || "—"}</td>
                <td className="px-3 py-2 font-medium text-foreground whitespace-nowrap">
                  {r.studentName}{r.section && <span className="ml-1 text-[10px] text-muted-foreground">({r.section})</span>}
                </td>
                <td className="px-3 py-2 text-muted-foreground font-mono">{r.admissionNo}</td>
                {parts.map((c) => (
                  <td key={c} className="px-3 py-2 text-center">
                    <MarkInput value={r[KEY[c]]} max={sheet.components[c] ?? 0} disabled={r.isAbsent || sheet.locked}
                      onChange={(v) => update(r.studentId, { [KEY[c]]: v })} />
                  </td>
                ))}
                {parts.length === 0 && (
                  <td className="px-3 py-2 text-center">
                    <MarkInput value={r.marksObtained} max={paper.fullMarks} disabled={r.isAbsent || sheet.locked}
                      onChange={(v) => update(r.studentId, { marksObtained: v })} />
                  </td>
                )}
                {parts.length > 0 && (
                  <td className="px-3 py-2 text-center font-bold text-foreground">{total ?? "—"}</td>
                )}
                <td className="px-3 py-2 text-center text-foreground">{pct !== null ? `${pct}%` : "—"}</td>
                <td className="px-3 py-2 text-center"><GradeBadge grade={grade} /></td>
                <td className="px-3 py-2 text-center">
                  {result && <PremiumBadge label={result} tone={result === "Pass" ? "success" : "danger"} />}
                </td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" checked={r.isAbsent} disabled={sheet.locked}
                    onChange={(e) => update(r.studentId, { isAbsent: e.target.checked })}
                    className="h-4 w-4 rounded border-border accent-primary cursor-pointer" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" value={r.remarks} disabled={sheet.locked}
                    onChange={(e) => update(r.studentId, { remarks: e.target.value })}
                    placeholder="Remarks…"
                    className="w-28 rounded border border-input bg-background px-2 py-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!sheet.locked && (
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={save.isPending || !dirty} onClick={handleSave}>
          <Save className="h-3.5 w-3.5" />
          {save.isPending ? "Saving…" : "Save Marks"}
        </Button>
        <span className="text-[11px] text-muted-foreground">
          {dirty ? "Unsaved changes." : "All changes saved."}
          {incomplete > 0 && ` ${incomplete} row(s) have only some components filled and won't be saved until complete.`}
          {" "}Results are locked and published from the Results page.
        </span>
      </div>
      )}
    </div>
  );
}
