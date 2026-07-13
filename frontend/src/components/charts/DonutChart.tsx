import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

import { ChartCard } from "@/components/charts/ChartCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { CATEGORICAL_COLORS } from "@/components/charts/palette";

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

/** Donut chart for a composition breakdown (fee status mix, role distribution…). */
export function DonutChart({
  data,
  title,
  subtitle,
  height = 224,
  valueFormatter = (v) => v.toLocaleString(),
  centerLabel,
}: {
  data: DonutSlice[];
  title: string;
  subtitle?: string;
  height?: number;
  valueFormatter?: (v: number) => string;
  centerLabel?: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ChartCard title={title} subtitle={subtitle}>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius="62%" outerRadius="85%" paddingAngle={2} strokeWidth={2} stroke="hsl(var(--card))">
              {data.map((slice, i) => (
                <Cell key={slice.label} fill={slice.color ?? CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length]} />
              ))}
            </Pie>
            <RTooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12 }}
              formatter={(v) => <span className="text-muted-foreground">{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
            <p className="text-xl font-semibold text-foreground">{valueFormatter(total)}</p>
            <p className="text-[11px] text-muted-foreground">{centerLabel}</p>
          </div>
        )}
      </div>
    </ChartCard>
  );
}
