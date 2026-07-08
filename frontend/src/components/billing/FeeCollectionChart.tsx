import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CLASS_OPTIONS, STUDENT_FEES } from "@/data/billingData";

const COLOR = "#2a78d6";

function ChartTip({ active, label, payload }: { active?: boolean; label?: string; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground">Collected: <span className="font-semibold text-foreground">${payload[0].value.toLocaleString()}</span></p>
    </div>
  );
}

export function FeeCollectionChart() {
  const data = useMemo(() => CLASS_OPTIONS.map((cls) => ({
    className: cls.replace("Grade ", "G"),
    collected: STUDENT_FEES.filter((f) => f.className === cls).reduce((s, f) => s + f.paid, 0),
  })), []);

  return (
    <Card className="h-full rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold">Fee Collection by Class</CardTitle>
        <CardDescription className="text-[11.5px]">Amount collected so far, per class</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%" margin={{ left: -12, right: 4, top: 4 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="className" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={42}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
              <RTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTip />} />
              <Bar dataKey="collected" fill={COLOR} radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
