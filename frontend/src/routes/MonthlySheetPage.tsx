import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { MonthlyAttendanceGrid } from "@/components/attendance/MonthlyAttendanceGrid";
import {
  STUDENTS_G6A, STUDENTS_G7A,
  G6A_JUNE_ATT, G6A_JULY_ATT, G7A_JULY_ATT,
  CLASS_OPTIONS, SECTION_OPTIONS, MONTH_OPTIONS, YEAR_OPTIONS,
} from "@/data/attendanceData";
import type { MonthlyAttendance, StudentRef } from "@/data/attendanceData";

function Sel({ label, value, options, onChange }: {
  label: string; value: string; options: readonly string[]; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-foreground">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-[150px] rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// Resolve attendance data based on selections
function resolveAtt(cls: string, section: string, month: string, year: string): {
  students: StudentRef[];
  attendance: MonthlyAttendance[];
  yearNum: number;
  monthNum: number;
} {
  const yearNum  = Number(year) || 2026;
  const monthNum = MONTH_OPTIONS.indexOf(month as typeof MONTH_OPTIONS[number]) + 1 || 7;

  let students: StudentRef[] = STUDENTS_G6A;
  let attendance: MonthlyAttendance[] = [];

  if (cls === "Grade 6" && section === "A") {
    students = STUDENTS_G6A;
    if (yearNum === 2026 && monthNum === 6) attendance = G6A_JUNE_ATT;
    else if (yearNum === 2026 && monthNum === 7) attendance = G6A_JULY_ATT;
  } else if (cls === "Grade 7" && section === "A") {
    students = STUDENTS_G7A;
    if (yearNum === 2026 && monthNum === 7) attendance = G7A_JULY_ATT;
  }

  return { students, attendance, yearNum, monthNum };
}

export function MonthlySheetPage() {
  const [cls,     setCls]     = useState("Grade 6");
  const [section, setSection] = useState("A");
  const [month,   setMonth]   = useState("July");
  const [year,    setYear]    = useState("2026");

  const { students, attendance, yearNum, monthNum } = useMemo(
    () => resolveAtt(cls, section, month, year),
    [cls, section, month, year],
  );

  const ready = cls && section && month && year;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monthly Attendance Sheet</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          View and print the full monthly attendance grid for any class
        </p>
      </div>

      {/* Selector */}
      <Card className="p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <Sel label="Class"   value={cls}     options={CLASS_OPTIONS}   onChange={setCls} />
          <Sel label="Section" value={section} options={SECTION_OPTIONS} onChange={setSection} />
          <Sel label="Month"   value={month}   options={MONTH_OPTIONS}   onChange={setMonth} />
          <Sel label="Year"    value={year}    options={YEAR_OPTIONS}    onChange={setYear} />
        </div>
      </Card>

      {/* Grid */}
      {ready ? (
        <Card className="p-5">
          <MonthlyAttendanceGrid
            students={students}
            attendance={attendance}
            year={yearNum}
            month={monthNum}
            className={cls}
            section={section}
          />
        </Card>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 py-16 text-center">
          <p className="text-[14px] font-medium text-foreground">Select class, section, month and year</p>
          <p className="text-[12px] text-muted-foreground mt-1">The attendance sheet will appear here.</p>
        </div>
      )}
    </div>
  );
}
