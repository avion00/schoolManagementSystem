import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/api/types/students";

const PALETTE = ["#2a78d6", "#1baf7a", "#8b5cf6", "#f59e0b", "#ef4444", "#0ea5e9", "#ec4899", "#14b8a6"];

export function StudentsOverviewDonut({ students }: { students: Student[] }) {
  const total = students.length;
  const counts = new Map<string, number>();
  for (const s of students) counts.set(s.className, (counts.get(s.className) ?? 0) + 1);
  const byClass = [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));

  return (
    <Reveal className="h-full">
      <Card className="h-full rounded-2xl border-border/60 shadow-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-display text-[15px] font-semibold">Students Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-[168px] w-[168px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byClass}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="66%"
                  outerRadius="100%"
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                  isAnimationActive
                >
                  {byClass.map((d) => (
                    <Cell key={d.label} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip content={<ChartTooltip valueFormatter={(v) => `${v} students`} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">{total}</p>
              <p className="text-[10.5px] text-muted-foreground">Total Students</p>
            </div>
          </div>

          <div className="w-full flex-1 space-y-3">
            {byClass.map((d) => (
              <div key={d.label} className="flex items-center justify-between gap-2 text-[13px]">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                  <span className="truncate font-medium text-foreground">{d.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold tabular-nums text-foreground">{d.value}</span>
                  <span className="w-10 text-right tabular-nums text-muted-foreground">
                    {total ? Math.round((d.value / total) * 100) : 0}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}
