import { TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";

import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Reveal } from "@/components/motion";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";

/** Monthly attendance-% trend — smooth area line with a soft gradient fill, 0–100% axis. */
export function StudentAttendanceTrendChart({
  data,
  action,
}: {
  data: { month: string; pct: number }[];
  action?: ReactNode;
}) {
  return (
    <Reveal className="h-full">
      <div className="h-full rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
        <StudentSectionHeader icon={TrendingUp} title="Monthly Attendance Trend" action={action} />
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -18, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="attendance-trend-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                stroke="hsl(var(--muted-foreground))"
                width={38}
                tickFormatter={(v) => `${v}%`}
              />
              <RTooltip cursor={{ stroke: "hsl(var(--border))" }} content={<ChartTooltip valueFormatter={(v) => `${v}%`} />} />
              <Area
                dataKey="pct"
                name="Attendance"
                type="monotone"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#attendance-trend-fill)"
                dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Reveal>
  );
}
