import { useMemo } from "react";
import { Users, UserCheck, UserX, Clock, Clock3 } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import { TeacherAttendanceTable } from "@/components/attendance/TeacherAttendanceTable";
import { useStaffMonthly } from "@/api/attendance";
import { errorMessage } from "@/api/http";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";



export function TeacherAttendancePage() {
  const now = new Date();
  const today = now.getDate();
  const monthLabel = now.toLocaleDateString("en", { month: "long", year: "numeric" });
  const staff = useStaffMonthly(now.getFullYear(), now.getMonth() + 1);
  const TEACHERS_REF = staff.data?.teachers ?? [];
  const TEACHER_JULY_ATT = useMemo(() => staff.data?.attendance ?? [], [staff.data]);
  // Days this month that have any staff attendance recorded, most recent 7.
  const recordedDays = [...new Set(TEACHER_JULY_ATT.flatMap((a) => Object.keys(a.records).map(Number)))].sort((a, b) => a - b).slice(-7);
  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, halfDay = 0;
    for (const att of TEACHER_JULY_ATT) {
      const s = att.records[today];
      if (s === "present") present++;
      else if (s === "absent") absent++;
      else if (s === "late") late++;
      else if (s === "half-day") halfDay++;
    }
    return { present, absent, late, halfDay };
  }, [TEACHER_JULY_ATT, today]);

  const summaryCards = [
    {
      label: "Present Today", value: stats.present, icon: UserCheck, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good,
    },
    {
      label: "Absent Today", value: stats.absent, icon: UserX, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical,
    },
    {
      label: "Late Today", value: stats.late, icon: Clock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning,
    },
    {
      label: "Half Day Today", value: stats.halfDay, icon: Clock3, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0],
    },
  ];

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Teacher Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Track attendance for all teaching staff · {monthLabel}</p>
      </Reveal>

      {/* Today summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {summaryCards.map((s, i) => (
          <Reveal key={s.label} delay={i * 40}>
            <KPITrendCard
              label={s.label}
              value={s.value}
              icon={s.icon}
              iconCls={s.tone}
              sparklineColor={s.sparkColor}
            />
          </Reveal>
        ))}
      </div>

      {/* Table */}
      <Reveal delay={80}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[14px] font-semibold text-foreground">Teacher Attendance · {monthLabel}</h2>
          <span className="ml-auto text-[11px] text-muted-foreground">{recordedDays.length} days recorded</span>
        </div>
        {staff.isLoading ? <PremiumSkeleton className="h-64 w-full" /> :
         staff.isError ? <PremiumEmptyState title="Couldn't load staff attendance" description={errorMessage(staff.error)} /> :
         <TeacherAttendanceTable rows={TEACHERS_REF} attendance={TEACHER_JULY_ATT} today={today} />}
      </Reveal>

      {/* Daily breakdown */}
      <Reveal delay={120}>
      <PremiumCard className="overflow-hidden">
        <h2 className="px-5 pt-5 text-[14px] font-semibold text-foreground mb-4">Daily Records · {monthLabel}</h2>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th className="pb-2 text-left text-[11px] font-semibold text-muted-foreground uppercase">Teacher</th>
                {recordedDays.map((d) => (
                  <th key={d} className="pb-2 px-2 text-center text-[11px] font-semibold text-muted-foreground uppercase">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
              {TEACHERS_REF.map((t) => {
                const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
                return (
                  <tr key={t.id} className="transition-colors hover:bg-muted/40">
                    <td className="py-2 font-medium text-foreground">{t.name}</td>
                    {recordedDays.map((d) => {
                      const status = att?.records[d];
                      return (
                        <td key={d} className="py-2 px-2 text-center">
                          {status ? <AttendanceStatusBadge status={status} compact /> : <span className="text-muted-foreground">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PremiumCard>
      </Reveal>
    </div>
  );
}
