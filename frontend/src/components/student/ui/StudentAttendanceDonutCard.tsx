import { CalendarCheck } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Reveal } from "@/components/motion";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";

const SLICES = [
  { key: "present", label: "Present", color: "#10b981" },
  { key: "absent", label: "Absent", color: "#f43f5e" },
  { key: "late", label: "Late", color: "#f59e0b" },
  { key: "leave", label: "Leave", color: "#3b82f6" },
] as const;

/** Attendance composition donut — big chart on the left, a beside-chart legend, and an overall-% footer. */
export function StudentAttendanceDonutCard({
  present,
  absent,
  late,
  leave,
  overallPct,
}: {
  present: number;
  absent: number;
  late: number;
  leave: number;
  overallPct: number;
}) {
  const values: Record<string, number> = { present, absent, late, leave };
  const data = SLICES.map((s) => ({ ...s, value: values[s.key] })).filter((d) => d.value > 0);
  const total = present + absent + late + leave;

  return (
    <Reveal className="h-full">
      <div className="h-full rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
        <StudentSectionHeader icon={CalendarCheck} title="Attendance Overview" />
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-44 w-44 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="label" innerRadius="66%" outerRadius="100%" paddingAngle={3} strokeWidth={2} stroke="hsl(var(--card))">
                  {data.map((d) => (
                    <Cell key={d.key} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-bold text-foreground">{total}</p>
              <p className="text-[11px] text-muted-foreground">Total Days</p>
            </div>
          </div>
          <div className="w-full space-y-2.5">
            {data.map((d) => (
              <div key={d.key} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-medium text-foreground">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                  {d.label}
                </span>
                <span className="text-muted-foreground">
                  {d.value} day{d.value === 1 ? "" : "s"}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 border-t border-border/60 pt-3 text-[12px] text-muted-foreground">
          Overall attendance: <span className="font-semibold text-foreground">{overallPct}%</span>
        </p>
      </div>
    </Reveal>
  );
}
