import { useMemo } from "react";
import { Users, UserCheck, UserX, Clock, Clock3 } from "lucide-react";
import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { KPITrendCard } from "@/components/ui/KPITrendCard";
import { METRIC_TONES } from "@/components/ui/MetricCard";
import { CATEGORICAL_COLORS, STATUS_COLORS } from "@/components/charts/palette";
import { AttendanceStatusBadge } from "@/components/attendance/AttendanceStatusBadge";
import { TeacherAttendanceTable } from "@/components/attendance/TeacherAttendanceTable";
import { TEACHERS_REF, TEACHER_JULY_ATT, isWorkingDay } from "@/data/attendanceData";

// Working days in July 2026 through day 6: 1(W), 2(Th), 3(F), 6(M)
const WORKING_DAYS_SO_FAR = [1, 2, 3, 6].filter((d) => isWorkingDay(2026, 7, d)).length;

const SPARK = {
  present:  [{ value: 6 }, { value: 7 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 7 }, { value: 8 }],
  absent:   [{ value: 2 }, { value: 1 }, { value: 2 }, { value: 1 }, { value: 1 }, { value: 0 }, { value: 1 }],
  late:     [{ value: 1 }, { value: 2 }, { value: 1 }, { value: 1 }, { value: 2 }, { value: 1 }, { value: 1 }],
  halfDay:  [{ value: 1 }, { value: 1 }, { value: 0 }, { value: 1 }, { value: 1 }, { value: 1 }, { value: 1 }],
};

export function TeacherAttendancePage() {
  const stats = useMemo(() => {
    let present = 0, absent = 0, late = 0, halfDay = 0;
    for (const att of TEACHER_JULY_ATT) {
      const s = att.records[6] ?? "present";
      if (s === "present") present++;
      else if (s === "absent") absent++;
      else if (s === "late") late++;
      else if (s === "half-day") halfDay++;
    }
    return { present, absent, late, halfDay };
  }, []);

  const summaryCards = [
    {
      label: "Present Today", value: stats.present, icon: UserCheck, tone: METRIC_TONES.green,
      sparkColor: STATUS_COLORS.good, sparkData: SPARK.present,
      trend: { value: "+4.1%", up: true, compareLabel: "vs yesterday" },
    },
    {
      label: "Absent Today", value: stats.absent, icon: UserX, tone: METRIC_TONES.red,
      sparkColor: STATUS_COLORS.critical, sparkData: SPARK.absent,
      trend: { value: "-2.0%", up: false, compareLabel: "vs yesterday" },
    },
    {
      label: "Late Today", value: stats.late, icon: Clock, tone: METRIC_TONES.amber,
      sparkColor: STATUS_COLORS.warning, sparkData: SPARK.late,
      trend: { value: "+1.0%", up: true, compareLabel: "vs yesterday" },
    },
    {
      label: "Half Day Today", value: stats.halfDay, icon: Clock3, tone: METRIC_TONES.blue,
      sparkColor: CATEGORICAL_COLORS[0], sparkData: SPARK.halfDay,
      trend: { value: "0.0%", up: true, compareLabel: "vs yesterday" },
    },
  ];

  return (
    <div className="space-y-5">
      <Reveal>
        <h1 className="text-2xl font-bold text-foreground">Teacher Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Track attendance for all teaching staff · July 2026</p>
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
              trend={s.trend}
              sparklineData={s.sparkData}
              sparklineColor={s.sparkColor}
            />
          </Reveal>
        ))}
      </div>

      {/* Table */}
      <Reveal delay={80}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[14px] font-semibold text-foreground">Teacher Attendance · July 2026</h2>
          <span className="ml-auto text-[11px] text-muted-foreground">{WORKING_DAYS_SO_FAR} working days recorded</span>
        </div>
        <TeacherAttendanceTable rows={TEACHERS_REF} workingDaysSoFar={WORKING_DAYS_SO_FAR} />
      </Reveal>

      {/* Daily breakdown */}
      <Reveal delay={120}>
      <PremiumCard className="overflow-hidden">
        <h2 className="px-5 pt-5 text-[14px] font-semibold text-foreground mb-4">Daily Records · July 2026</h2>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="min-w-full text-[11px]">
            <thead>
              <tr className="border-b border-neutral-200/80 dark:border-neutral-800">
                <th className="pb-2 text-left text-[11px] font-semibold text-muted-foreground uppercase">Teacher</th>
                {[1, 2, 3, 6].map((d) => (
                  <th key={d} className="pb-2 px-2 text-center text-[11px] font-semibold text-muted-foreground uppercase">Jul {d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
              {TEACHERS_REF.map((t) => {
                const att = TEACHER_JULY_ATT.find((a) => a.teacherId === t.id);
                return (
                  <tr key={t.id} className="transition-colors hover:bg-muted/40">
                    <td className="py-2 font-medium text-foreground">{t.name}</td>
                    {[1, 2, 3, 6].map((d) => {
                      const status = att?.records[d] ?? "present";
                      return (
                        <td key={d} className="py-2 px-2 text-center">
                          <AttendanceStatusBadge status={status} compact />
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
