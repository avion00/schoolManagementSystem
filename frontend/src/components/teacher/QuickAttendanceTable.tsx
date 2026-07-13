import { useMemo, useState } from "react";

import { StudentAvatar } from "@/components/students/StudentAvatar";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import type { AssignedStudent, AttendanceMark } from "@/data/teacherDashboardData";
import { cn } from "@/lib/utils";

const MARKS: AttendanceMark[] = ["Present", "Absent", "Late", "Half Day", "Leave"];

const MARK_CLS: Record<AttendanceMark, string> = {
  Present: "bg-emerald-500 text-white border-emerald-500",
  Absent: "bg-rose-500 text-white border-rose-500",
  Late: "bg-amber-500 text-white border-amber-500",
  "Half Day": "bg-sky-500 text-white border-sky-500",
  Leave: "bg-violet-500 text-white border-violet-500",
};

/** Fast, one-click attendance grid — designed so a full class can be marked in under a minute. */
export function QuickAttendanceTable({
  students,
  marks,
  onMark,
}: {
  students: AssignedStudent[];
  marks: Record<number, AttendanceMark>;
  onMark: (studentId: number, mark: AttendanceMark) => void;
}) {
  const [search, setSearch] = useState("");
  const [onlyUnmarked, setOnlyUnmarked] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (onlyUnmarked && marks[s.id]) return false;
      return true;
    });
  }, [students, search, onlyUnmarked, marks]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <PremiumSearchInput value={search} onChange={setSearch} placeholder="Search student…" className="max-w-xs" />
        <button
          type="button"
          onClick={() => setOnlyUnmarked((v) => !v)}
          className={cn(
            "rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
            onlyUnmarked ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:bg-muted/60",
          )}
        >
          Only unmarked
        </button>
      </div>

      <div className="space-y-1.5">
        {filtered.map((s, i) => (
          <div key={s.id} className="t-row-in flex flex-wrap items-center gap-3 rounded-xl p-2.5 hover:bg-muted/40" style={{ "--row-index": i } as React.CSSProperties}>
            <StudentAvatar name={s.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{s.name}</p>
              <p className="text-[11px] text-muted-foreground">Roll {s.roll}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MARKS.map((mark) => (
                <button
                  key={mark}
                  type="button"
                  onClick={() => onMark(s.id, mark)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium transition-colors",
                    marks[s.id] === mark ? MARK_CLS[mark] : "border-border/60 text-muted-foreground hover:bg-muted/60",
                  )}
                >
                  {mark}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-6 text-center text-[12.5px] text-muted-foreground">No students match.</p>
        )}
      </div>
    </div>
  );
}
