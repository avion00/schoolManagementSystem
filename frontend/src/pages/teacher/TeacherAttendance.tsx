import { useMemo, useState } from "react";
import { Copy, Printer, Send } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import { Reveal, SuccessCheck } from "@/components/motion";
import { QuickAttendanceTable } from "@/components/teacher/QuickAttendanceTable";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { assignedClasses, assignedStudents, type AttendanceMark } from "@/data/teacherDashboardData";

/** Merged "Mark Attendance" workflow — replaces the old separate Daily/Monthly pages;
 *  monthly view now lives inside Attendance Reports where teachers actually look for trends. */
export function TeacherAttendance() {
  const [searchParams] = useSearchParams();
  const [classId, setClassId] = useState(searchParams.get("class") ?? assignedClasses[0].id);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<number, AttendanceMark>>({});
  const [saved, setSaved] = useState(false);

  const students = useMemo(() => assignedStudents.filter((s) => s.classId === classId), [classId]);
  const cls = assignedClasses.find((c) => c.id === classId);

  function setMark(studentId: number, mark: AttendanceMark) {
    setMarks((m) => ({ ...m, [studentId]: mark }));
  }

  function markAllPresent() {
    setMarks(Object.fromEntries(students.map((s) => [s.id, "Present" as AttendanceMark])));
    toast.success("Marked all present — adjust any exceptions below");
  }

  function copyYesterday() {
    setMarks(Object.fromEntries(students.map((s) => [s.id, s.attendancePercentage >= 80 ? "Present" as AttendanceMark : "Absent" as AttendanceMark])));
    toast.info("Copied yesterday's attendance pattern");
  }

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  }

  const absentCount = Object.values(marks).filter((m) => m === "Absent").length;
  const markedCount = students.filter((s) => marks[s.id]).length;

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Mark Attendance</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Mark a full class in under a minute.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print sheet
        </Button>
      </Reveal>

      <Reveal delay={60} className="flex flex-wrap items-center gap-3">
        <PremiumSelect
          value={classId}
          onChange={(v) => { setClassId(v); setMarks({}); }}
          className="w-56"
          options={assignedClasses.map((c) => ({ value: c.id, label: `${c.className} · ${c.section} — ${c.subject}` }))}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 rounded-xl border border-neutral-200 bg-white px-3.5 text-[13px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-neutral-800 dark:bg-neutral-950"
        />
        <Button variant="outline" size="sm" onClick={markAllPresent}>Mark all present</Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={copyYesterday}>
          <Copy className="h-3.5 w-3.5" /> Copy yesterday
        </Button>
        <span className="text-[12.5px] text-muted-foreground">{markedCount} of {students.length} marked</span>
      </Reveal>

      <Reveal delay={100}>
        <PremiumCard className="p-4">
          <QuickAttendanceTable students={students} marks={marks} onMark={setMark} />

          <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-border/60 pt-4">
            {saved ? (
              <SuccessCheck size={40} label="Attendance saved" />
            ) : (
              <>
                {absentCount > 0 && (
                  <Button variant="outline" className="gap-1.5" onClick={() => toast.info(`Absence notification sent to ${absentCount} guardians`)}>
                    <Send className="h-3.5 w-3.5" /> Notify {absentCount} absent guardians
                  </Button>
                )}
                <Button onClick={handleSave} disabled={markedCount === 0}>
                  Save attendance — {cls?.className} {cls?.section}
                </Button>
              </>
            )}
          </div>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
