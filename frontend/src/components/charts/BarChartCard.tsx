import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";

import { ChartCard } from "@/components/charts/ChartCard";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { CATEGORICAL_COLORS } from "@/components/charts/palette";

export interface BarSeries {
  key: string;
  label: string;
  color?: string;
}

/**
 * Generic single- or multi-series bar chart in a ChartCard. The named charts
 * (RevenueExpenseChart, FeeCollectionChart, PerformanceChart) are thin
 * presets built on this — use it directly for anything else.
 */
export function BarChartCard<T extends object>({
  title,
  subtitle,
  data,
  xKey,
  series,
  height = 224,
  valueFormatter,
  action,
}: {
  title: string;
  subtitle?: string;
  data: T[];
  xKey: string;
  series: BarSeries[];
  height?: number;
  valueFormatter?: (v: number) => string;
  action?: React.ReactNode;
}) {
  return (
    <ChartCard title={title} subtitle={subtitle} action={action}>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="28%" barGap={2} margin={{ left: -12, right: 4, top: 4 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis dataKey={xKey} tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={42} tickFormatter={valueFormatter} />
            <RTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip valueFormatter={valueFormatter} />} />
            {series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span className="text-muted-foreground">{v}</span>} />}
            {series.map((s, i) => (
              <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color ?? CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={22} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
