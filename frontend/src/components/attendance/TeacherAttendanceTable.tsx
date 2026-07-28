import { Users } from "lucide-react";

import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import { PremiumDataTable, type PremiumDataTableColumn } from "@/components/ui/PremiumDataTable";
import { TEACHER_JULY_ATT, calcRate, countStatuses, type TeacherRef } from "@/data/attendanceData";

export function TeacherAttendanceTable({
  rows,
  workingDaysSoFar,
}: {
  rows: TeacherRef[];
  workingDaysSoFar: number;
}) {
  const columns: PremiumDataTableColumn<TeacherRef>[] = [
    { key: "employeeId", header: "Emp. ID", width: "w-[100px]", render: (t) => <span className="font-mono text-xs text-muted-foreground">{t.employeeId}</span> },
    {
      key: "name", header: "Teacher", width: "w-[220px]", render: (t) => (
        <div>
          <p className="text-sm font-medium text-foreground">{t.name}</p>
          <p className="text-[11px] text-muted-foreground">{t.designation}</p>
        </div>
      ),
    },
    { key: "subject", header: "Subject", width: "w-[140px]", render: (t) => <span className="text-sm text-muted-foreground">{t.subject}</span> },
    {
      key: "today", header: "Today", width: "w-[110px]", align: "center", render: (t) => {
        const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
        const status = att?.records[6] ?? "present";
        return <AttendanceStatusBadge status={status} />;
      },
    },
    {
      key: "present", header: "Present", width: "w-[90px]", align: "center", render: (t) => {
        const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
        const counts = countStatuses(att?.records ?? {});
        return <span className="text-sm font-semibold text-emerald-600">{counts.present}</span>;
      },
    },
    {
      key: "absent", header: "Absent", width: "w-[90px]", align: "center", render: (t) => {
        const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
        const counts = countStatuses(att?.records ?? {});
        return <span className="text-sm font-semibold text-rose-600">{counts.absent}</span>;
      },
    },
    {
      key: "late", header: "Late", width: "w-[80px]", align: "center", render: (t) => {
        const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
        const counts = countStatuses(att?.records ?? {});
        return <span className="text-sm font-semibold text-amber-600">{counts.late}</span>;
      },
    },
    {
      key: "halfDay", header: "H/D", width: "w-[80px]", align: "center", render: (t) => {
        const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
        const counts = countStatuses(att?.records ?? {});
        return <span className="text-sm font-semibold text-blue-600">{counts["half-day"]}</span>;
      },
    },
    {
      key: "rate", header: "Rate", width: "w-[90px]", align: "center", render: (t) => {
        const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
        const rate = calcRate(att?.records ?? {}, workingDaysSoFar);
        return (
          <span className={
            rate >= 90 ? "text-sm font-bold text-emerald-600" : rate >= 75 ? "text-sm font-bold text-amber-600" : "text-sm font-bold text-rose-600"
          }>
            {rate}%
          </span>
        );
      },
    },
  ];

  return (
    <PremiumDataTable
      columns={columns}
      rows={rows}
      rowKey={(t) => t.id}
      emptyIcon={Users}
      emptyTitle="No teachers found"
      emptyDescription="No teaching staff attendance records are available."
    />
  );
}
