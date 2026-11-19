import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

import { CATEGORICAL_COLORS } from "@/components/charts/palette";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RELATION_OPTIONS, type Parent } from "@/api/types/parents";

export function ParentsOverviewDonut({ parents }: { parents: Parent[] }) {
  const total = parents.length;
  const byRelation = RELATION_OPTIONS
    .map((r, i) => ({
      label: r,
      value: parents.filter((p) => p.relation === r).length,
      color: CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length],
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <Reveal className="h-full">
      <Card className="h-full rounded-2xl border-border/60 shadow-elevated">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-display text-[15px] font-semibold">Parents Overview</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative h-[168px] w-[168px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byRelation}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="66%"
                  outerRadius="100%"
                  paddingAngle={3}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                  isAnimationActive
                >
                  {byRelation.map((d) => (
                    <Cell key={d.label} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip content={<ChartTooltip valueFormatter={(v) => `${v} parents`} />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground">{total}</p>
              <p className="text-[10.5px] text-muted-foreground">Total Parents</p>
            </div>
          </div>

          <div className="w-full flex-1 space-y-3">
            {byRelation.map((d) => (
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
