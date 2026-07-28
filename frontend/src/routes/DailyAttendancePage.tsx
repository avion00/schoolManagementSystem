import { useState, useMemo } from "react";
import { GraduationCap, Users } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
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
    <PremiumSelect
      value={value}
      onChange={onChange}
      placeholder={label}
      className="w-[150px]"
      options={options.map((o) => ({ value: o, label: o }))}
    />
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
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Daily Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {new Date(TODAY).toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </Reveal>

      {/* Mode toggle + filters */}
      <Reveal delay={40}>
      <PremiumCard className="p-4">
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
      </PremiumCard>
      </Reveal>

      {/* Table */}
      <Reveal delay={80}>
      <PremiumCard className="p-5">
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
          <PremiumDataTable
            columns={[
              { key: "employeeId", header: "Emp ID", render: (t) => <span className="font-mono text-[11px] text-muted-foreground">{t.employeeId}</span> },
              { key: "name", header: "Name", render: (t) => <span className="font-medium text-foreground">{t.name}</span> },
              { key: "subject", header: "Subject", render: (t) => <span className="text-muted-foreground">{t.subject}</span> },
              { key: "status", header: "Status", render: (t) => <AttendanceStatusBadge status={initialTeacherData[t.id] ?? "present"} /> },
            ] satisfies PremiumDataTableColumn<(typeof TEACHERS_REF)[number]>[]}
            rows={TEACHERS_REF}
            rowKey={(t) => t.id}
            stickyHeader={false}
          />
        )}
      </PremiumCard>
      </Reveal>
    </div>
  );
}
