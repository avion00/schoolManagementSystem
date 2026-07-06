import { useState, useMemo } from "react";
import { GraduationCap, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DailyAttendanceTable } from "@/components/attendance/DailyAttendanceTable";
import {
  STUDENTS_G6A, STUDENTS_G7A, TEACHERS_REF,
  G6A_JULY_ATT, G7A_JULY_ATT, TEACHER_JULY_ATT,
  CLASS_OPTIONS, SECTION_OPTIONS,
  TODAY, TODAY_DAY,
} from "@/data/attendanceData";
import type { AttendanceStatus } from "@/data/attendanceData";
import { cn } from "@/lib/utils";

type Mode = "student" | "teacher";

function Sel({ label, value, options, onChange }: {
  label: string; value: string; options: readonly string[]; onChange: (v: string) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-9 min-w-[140px] rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function DailyAttendancePage() {
  const [mode,    setMode]    = useState<Mode>("student");
  const [cls,     setCls]     = useState("Grade 6");
  const [section, setSection] = useState("A");

  // Derive students based on class+section selection
  const students = useMemo(() => {
    if (cls === "Grade 6" && section === "A") return STUDENTS_G6A;
    if (cls === "Grade 7" && section === "A") return STUDENTS_G7A;
    return STUDENTS_G6A; // fallback
  }, [cls, section]);

  // Derive today's initial data from pre-generated attendance
  const initialStudentData = useMemo((): Record<number, AttendanceStatus> => {
    const attList = cls === "Grade 6" ? G6A_JULY_ATT : G7A_JULY_ATT;
    const out: Record<number, AttendanceStatus> = {};
    for (const att of attList) {
      out[att.studentId] = att.records[TODAY_DAY] ?? "present";
    }
    return out;
  }, [cls]);

  const initialTeacherData = useMemo((): Record<number, AttendanceStatus> => {
    const out: Record<number, AttendanceStatus> = {};
    for (const att of TEACHER_JULY_ATT) {
      out[att.teacherId] = att.records[TODAY_DAY] ?? "present";
    }
    return out;
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Daily Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {new Date(TODAY).toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Mode toggle + filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["student", "teacher"] as Mode[]).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium transition-colors",
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-muted",
                )}>
                {m === "student" ? <GraduationCap className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                {m === "student" ? "Students" : "Teachers"}
              </button>
            ))}
          </div>

          {mode === "student" && (
            <>
              <Sel label="Class"   value={cls}     options={CLASS_OPTIONS}   onChange={setCls} />
              <Sel label="Section" value={section} options={SECTION_OPTIONS} onChange={setSection} />
            </>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          {mode === "student"
            ? <GraduationCap className="h-4 w-4 text-muted-foreground" />
            : <Users className="h-4 w-4 text-muted-foreground" />}
          <h2 className="text-[13px] font-semibold text-foreground">
            {mode === "student"
              ? `${cls} ${section} · ${students.length} students`
              : `All Teachers · ${TEACHERS_REF.length} staff`}
          </h2>
        </div>

        {mode === "student" ? (
          <DailyAttendanceTable
            key={`${cls}-${section}`}
            students={students}
            initialData={initialStudentData}
            date={TODAY}
          />
        ) : (
          /* Teacher attendance table */
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border/60 shadow-sm">
              <table className="min-w-full text-[12px]">
                <thead className="bg-muted/40 border-b border-border/60">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">#</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Emp ID</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Subject</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {TEACHERS_REF.map((t, idx) => {
                    const status = initialTeacherData[t.id] ?? "present";
                    const badge: Record<string, string> = {
                      present:"bg-emerald-50 text-emerald-700 ring-emerald-500/30",
                      absent: "bg-rose-50 text-rose-700 ring-rose-500/30",
                      late:   "bg-amber-50 text-amber-700 ring-amber-500/30",
                      "half-day":"bg-blue-50 text-blue-700 ring-blue-500/30",
                      leave:  "bg-violet-50 text-violet-700 ring-violet-500/30",
                    };
                    return (
                      <tr key={t.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2.5 text-muted-foreground">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{t.employeeId}</td>
                        <td className="px-3 py-2.5 font-medium text-foreground">{t.name}</td>
                        <td className="px-3 py-2.5 text-muted-foreground">{t.subject}</td>
                        <td className="px-3 py-2.5">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset capitalize", badge[status])}>
                            {status === "half-day" ? "Half Day" : status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
