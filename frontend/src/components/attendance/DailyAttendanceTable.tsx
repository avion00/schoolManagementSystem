import { useState } from "react";
import { Bell, Save } from "lucide-react";
import { toast }   from "sonner";
import { Button }  from "@/components/ui/button";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import type { StudentRef, AttendanceStatus } from "@/data/attendanceData";
import { STATUS_OPTIONS } from "@/data/attendanceData";
import { cn } from "@/lib/utils";

interface RowData {
  student: StudentRef;
  status:  AttendanceStatus;
  note:    string;
}

interface Props {
  students:     StudentRef[];
  initialData:  Record<number, AttendanceStatus>; // studentId → status
  date:         string;
  readOnly?:    boolean;
}

const STATUS_BTN: Record<AttendanceStatus, string> = {
  present:    "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  absent:     "border-rose-300    bg-rose-50    text-rose-700    hover:bg-rose-100",
  late:       "border-amber-300   bg-amber-50   text-amber-700   hover:bg-amber-100",
  "half-day": "border-blue-300    bg-blue-50    text-blue-700    hover:bg-blue-100",
  leave:      "border-violet-300  bg-violet-50  text-violet-700  hover:bg-violet-100",
};

const STATUS_ACTIVE: Record<AttendanceStatus, string> = {
  present:    "border-emerald-500 bg-emerald-500 text-white",
  absent:     "border-rose-500    bg-rose-500    text-white",
  late:       "border-amber-500   bg-amber-500   text-white",
  "half-day": "border-blue-500    bg-blue-500    text-white",
  leave:      "border-violet-500  bg-violet-500  text-white",
};

export function DailyAttendanceTable({ students, initialData, date, readOnly = false }: Props) {
  const [rows, setRows] = useState<RowData[]>(() =>
    students.map((s) => ({
      student: s,
      status:  initialData[s.id] ?? "present",
      note:    "",
    })),
  );
  const [saving, setSaving] = useState(false);

  function setStatus(idx: number, status: AttendanceStatus) {
    if (readOnly) return;
    setRows((r) => r.map((row, i) => i === idx ? { ...row, status } : row));
  }

  function markAll(status: AttendanceStatus) {
    if (readOnly) return;
    setRows((r) => r.map((row) => ({ ...row, status })));
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((res) => setTimeout(res, 600));
    setSaving(false);
    toast.success(`Attendance saved for ${date}`);
  }

  function notifyAbsent() {
    const absentCount = rows.filter((r) => r.status === "absent").length;
    if (absentCount === 0) { toast.info("No absent students to notify."); return; }
    toast.success(`Notified parents of ${absentCount} absent student${absentCount > 1 ? "s" : ""}.`);
  }

  const counts = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="flex flex-wrap gap-3">
        {STATUS_OPTIONS.map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-[12px]">
            <AttendanceStatusBadge status={s} />
            <span className="font-semibold text-foreground">{counts[s] ?? 0}</span>
          </span>
        ))}
      </div>

      {/* Bulk actions */}
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-muted-foreground font-medium">Mark all:</span>
          {STATUS_OPTIONS.map((s) => (
            <button key={s} onClick={() => markAll(s)}
              className={cn("h-7 rounded-full border px-3 text-[11px] font-medium transition-colors", STATUS_BTN[s])}>
              {s === "half-day" ? "Half Day" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
        <table className="min-w-full text-[12px]">
          <thead className="bg-muted/40 border-b border-border/60">
            <tr>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide w-10">#</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Roll No</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Student Name</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
              {!readOnly && <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Note</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row, idx) => (
              <tr key={row.student.id}
                className={cn("transition-colors hover:bg-muted/20",
                  row.status === "absent" && "bg-rose-50/40 dark:bg-rose-950/10",
                )}>
                <td className="px-3 py-2.5 text-muted-foreground">{idx + 1}</td>
                <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{row.student.rollNo}</td>
                <td className="px-3 py-2.5 font-medium text-foreground">{row.student.name}</td>
                <td className="px-3 py-2.5">
                  {readOnly ? (
                    <AttendanceStatusBadge status={row.status} />
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {STATUS_OPTIONS.map((s) => (
                        <button key={s} onClick={() => setStatus(idx, s)}
                          className={cn(
                            "h-6 rounded-full border px-2.5 text-[10px] font-semibold transition-colors",
                            row.status === s ? STATUS_ACTIVE[s] : STATUS_BTN[s],
                          )}>
                          {s === "half-day" ? "H/D" : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
                {!readOnly && (
                  <td className="px-3 py-2.5">
                    <input
                      value={row.note}
                      onChange={(e) => setRows((r) => r.map((x, i) => i === idx ? { ...x, note: e.target.value } : x))}
                      placeholder="Optional note..."
                      className="h-7 w-40 rounded border border-input bg-background px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={notifyAbsent}>
            <Bell className="h-3.5 w-3.5" />Notify Absent Parents
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" disabled={saving} onClick={handleSave}>
            <Save className="h-3.5 w-3.5" />{saving ? "Saving…" : "Save Attendance"}
          </Button>
        </div>
      )}
    </div>
  );
}
