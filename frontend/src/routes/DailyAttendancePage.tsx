import { useCallback, useState } from "react";
import { GraduationCap, Users } from "lucide-react";

import { todayIso, useRegister, useSaveRegister, useSaveStaffRegister, useStaffMonthly } from "@/api/attendance";
import { errorMessage } from "@/api/http";
import { Reveal } from "@/components/motion";
import { DailyAttendanceTable } from "@/components/attendance/DailyAttendanceTable";
import { SectionPicker } from "@/components/attendance/SectionPicker";
import { Input } from "@/components/ui/input";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Mode = "student" | "teacher";

export function DailyAttendancePage() {
  const { hasPermission } = useAuth();
  const canStaff = hasPermission("staff_attendance.manage");
  const [mode, setMode] = useState<Mode>("student");
  const [date, setDate] = useState(todayIso());
  const [pick, setPick] = useState({ classId: "", sectionId: "", label: "" });
  const onPick = useCallback((v: typeof pick) => setPick(v), []);

  const register = useRegister(pick.sectionId || undefined, date);
  const saveStudents = useSaveRegister();
  const [y, m, d] = date.split("-").map(Number);
  const staff = useStaffMonthly(y, m);
  const saveStaff = useSaveStaffRegister();

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Daily Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {new Date(date).toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </Reveal>

      <Reveal delay={40}>
      <PremiumCard className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["student", "teacher"] as Mode[]).filter((x) => x === "student" || canStaff).map((x) => (
              <button key={x} onClick={() => setMode(x)}
                className={cn("flex items-center gap-1.5 px-4 py-2 text-[12px] font-medium transition-colors",
                  mode === x ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted")}>
                {x === "student" ? <GraduationCap className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                {x === "student" ? "Students" : "Teachers"}
              </button>
            ))}
          </div>
          {mode === "student" && <SectionPicker classId={pick.classId} sectionId={pick.sectionId} onChange={onPick} />}
          <Input type="date" value={date} max={todayIso()} onChange={(e) => setDate(e.target.value)} className="h-9 w-[160px]" />
        </div>
      </PremiumCard>
      </Reveal>

      <Reveal delay={80}>
      <PremiumCard className="p-5">
        {mode === "student" ? (
          register.isLoading || !pick.sectionId ? <PremiumSkeleton className="h-64 w-full" /> :
          register.isError ? <PremiumEmptyState title="Couldn't load the register" description={errorMessage(register.error)} /> :
          register.data!.holiday ? <PremiumEmptyState title={`Holiday: ${register.data!.holiday}`} description="Attendance isn't taken on holidays." /> :
          register.data!.rows.length === 0 ? <PremiumEmptyState title="No active students in this section" /> : (
            <>
              <h2 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                {pick.label} · {register.data!.rows.length} students · {register.data!.marked} marked
              </h2>
              <DailyAttendanceTable
                key={`${pick.sectionId}-${date}`}
                students={register.data!.rows.map((r) => r.student)}
                initialData={Object.fromEntries(register.data!.rows.map((r) => [r.student.id, r.status]))}
                date={date}
                hint="Guardians of students marked absent are notified automatically."
                onSave={(rows) => saveStudents.mutateAsync({
                  date, records: rows.map((r) => ({ student: r.id, status: r.status, remark: r.note })),
                })}
              />
            </>
          )
        ) : (
          staff.isLoading ? <PremiumSkeleton className="h-64 w-full" /> :
          staff.isError ? <PremiumEmptyState title="Couldn't load staff" description={errorMessage(staff.error)} /> : (
            <>
              <h2 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <Users className="h-4 w-4 text-muted-foreground" /> All staff · {staff.data!.teachers.length}
              </h2>
              <DailyAttendanceTable
                key={`staff-${date}`}
                students={staff.data!.teachers.map((t) => ({ id: t.id, name: t.name, rollNo: t.employeeId, className: "", section: "" }))}
                initialData={Object.fromEntries(staff.data!.attendance.map((a) => [a.teacherId, a.records[d]]))}
                date={date}
                onSave={(rows) => saveStaff.mutateAsync({ date, records: rows.map((r) => ({ teacher: r.id, status: r.status })) })}
              />
            </>
          )
        )}
      </PremiumCard>
      </Reveal>
    </div>
  );
}
