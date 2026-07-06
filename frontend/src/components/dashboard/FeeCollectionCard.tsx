import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { feeChartData, feeLegend } from "@/data/dashboardData";

const FEE_COLORS = {
  collections: "hsl(var(--primary))",
  fees: "#10b981",
  expenses: "#f59e0b",
} as const;

interface TipPayloadItem {
  dataKey: string;
  value: number;
  fill: string;
}

interface TipProps {
  active?: boolean;
  label?: string;
  payload?: TipPayloadItem[];
}

function ChartTip({ active, label, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 py-0.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: p.fill }}
          />
          <span className="capitalize text-muted-foreground">{p.dataKey}:</span>
          <span className="font-semibold">${p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export function FeeCollectionCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Fee Collection & Expenses</CardTitle>
        <CardDescription>Monthly overview — Jan to Jul 2026.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={feeChartData}
              barCategoryGap="28%"
              barGap={2}
              margin={{ left: -12, right: 4, top: 4 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                width={42}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              />
              <RTooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={<ChartTip />}
              />
              <Bar
                dataKey="collections"
                fill={FEE_COLORS.collections}
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Bar
                dataKey="fees"
                fill={FEE_COLORS.fees}
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Bar
                dataKey="expenses"
                fill={FEE_COLORS.expenses}
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
          {feeLegend.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-muted-foreground">{l.label}</span>
              <span className="font-semibold">{l.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
