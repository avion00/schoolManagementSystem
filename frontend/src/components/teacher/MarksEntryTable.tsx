import { StudentAvatar } from "@/components/students/StudentAvatar";
import type { AssignedStudent } from "@/data/teacherDashboardData";

export interface MarksEntryValue {
  theory: number;
  practical: number;
  internal: number;
  remarks: string;
}

export const MARKS_MAX = { theory: 70, practical: 20, internal: 10 };

export function gradeForTotal(total: number, max = 100): string {
  const pct = (total / max) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
}

function NumberCell({ value, max, onChange }: { value: number | ""; max: number; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      min={0}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`/ ${max}`}
      className="h-9 w-20 rounded-lg border border-neutral-200 bg-white px-2 text-center text-[13px] tabular-nums shadow-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-neutral-800 dark:bg-neutral-950"
    />
  );
}

/** Reusable Theory/Practical/Internal marks-entry grid for a class roster. */
export function MarksEntryTable({
  students,
  values,
  onFieldChange,
}: {
  students: AssignedStudent[];
  values: Record<number, MarksEntryValue>;
  onFieldChange: (studentId: number, field: keyof MarksEntryValue, value: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-border/60 text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 pr-3 font-semibold">Student</th>
            <th className="pb-2 pr-3 font-semibold">Roll</th>
            <th className="pb-2 pr-3 font-semibold">Reg No</th>
            <th className="pb-2 pr-3 font-semibold">Theory</th>
            <th className="pb-2 pr-3 font-semibold">Practical</th>
            <th className="pb-2 pr-3 font-semibold">Internal</th>
            <th className="pb-2 pr-3 font-semibold">Total</th>
            <th className="pb-2 pr-3 font-semibold">Grade</th>
            <th className="pb-2 font-semibold">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => {
            const v = values[s.id] ?? { theory: "" as unknown as number, practical: "" as unknown as number, internal: "" as unknown as number, remarks: "" };
            const total = (Number(v.theory) || 0) + (Number(v.practical) || 0) + (Number(v.internal) || 0);
            const hasAny = v.theory !== ("" as unknown as number) || v.practical !== ("" as unknown as number) || v.internal !== ("" as unknown as number);
            return (
              <tr key={s.id} className="t-row-in border-b border-border/40 last:border-0" style={{ "--row-index": i } as React.CSSProperties}>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2.5">
                    <StudentAvatar name={s.name} />
                    <span className="font-medium text-foreground">{s.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 tabular-nums text-muted-foreground">{s.roll}</td>
                <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{s.registrationNo}</td>
                <td className="py-2.5 pr-3">
                  <NumberCell value={v.theory} max={MARKS_MAX.theory} onChange={(val) => onFieldChange(s.id, "theory", val)} />
                </td>
                <td className="py-2.5 pr-3">
                  <NumberCell value={v.practical} max={MARKS_MAX.practical} onChange={(val) => onFieldChange(s.id, "practical", val)} />
                </td>
                <td className="py-2.5 pr-3">
                  <NumberCell value={v.internal} max={MARKS_MAX.internal} onChange={(val) => onFieldChange(s.id, "internal", val)} />
                </td>
                <td className="py-2.5 pr-3 text-center font-semibold tabular-nums text-foreground">{hasAny ? total : "—"}</td>
                <td className="py-2.5 pr-3 text-center font-semibold text-foreground">{hasAny ? gradeForTotal(total) : "—"}</td>
                <td className="py-2.5">
                  <input
                    value={v.remarks}
                    onChange={(e) => onFieldChange(s.id, "remarks", e.target.value)}
                    placeholder="Optional remark"
                    className="h-9 w-full rounded-lg border border-neutral-200 bg-white px-2.5 text-[12.5px] shadow-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-neutral-800 dark:bg-neutral-950"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
