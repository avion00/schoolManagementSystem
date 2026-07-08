import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MONTHLY_FINANCE_TREND } from "@/data/billingData";

const COLORS = { revenue: "#1baf7a", expenses: "#e34948" };

interface TipItem { dataKey: string; value: number; fill: string; }
function ChartTip({ active, label, payload }: { active?: boolean; label?: string; payload?: TipItem[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1.5 font-semibold">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-1.5 py-0.5">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: p.fill }} />
          <span className="capitalize text-muted-foreground">{p.dataKey}:</span>
          <span className="font-semibold">${p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

export function RevenueExpenseChart() {
  return (
    <Card className="h-full rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold">Revenue vs. Expenses</CardTitle>
        <CardDescription className="text-[11.5px]">Last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONTHLY_FINANCE_TREND} barCategoryGap="28%" barGap={2} margin={{ left: -12, right: 4, top: 4 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={42}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <RTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTip />} />
              <Bar dataKey="revenue" fill={COLORS.revenue} radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="expenses" fill={COLORS.expenses} radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS.revenue }} /> <span className="text-muted-foreground">Revenue</span></span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS.expenses }} /> <span className="text-muted-foreground">Expenses</span></span>
        </div>
      </CardContent>
    </Card>
  );
}
