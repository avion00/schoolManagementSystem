import { CalendarCheck } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttendanceMonth, AttendanceSummary } from "@/data/studentDetailsData";
import { cn } from "@/lib/utils";

function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className={cn("rounded-xl p-3 text-center", color)}>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-medium opacity-80">{label}</p>
    </div>
  );
}

interface Props {
  summary: AttendanceSummary;
  monthly: AttendanceMonth[];
}

export function StudentAttendanceCard({ summary, monthly }: Props) {
  const pct = summary.presentPercent.toFixed(1);
  const pctNum = summary.presentPercent;
  const barColor = pctNum >= 90 ? "#10b981" : pctNum >= 75 ? "#f59e0b" : "#ef4444";

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Attendance Summary
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-bold",
              pctNum >= 90
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : pctNum >= 75
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400",
            )}
          >
            {pct}% present
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Progress bar */}
        <div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: barColor }}
            />
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-5 gap-2">
          <StatPill label="Total Days"   value={summary.totalDays} color="bg-muted/60" />
          <StatPill label="Present"      value={summary.present}   color="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" />
          <StatPill label="Absent"       value={summary.absent}    color="bg-rose-500/10 text-rose-700 dark:text-rose-300" />
          <StatPill label="Late"         value={summary.late}      color="bg-amber-500/10 text-amber-700 dark:text-amber-300" />
          <StatPill label="Half Day"     value={summary.halfDay}   color="bg-sky-500/10 text-sky-700 dark:text-sky-300" />
        </div>

        {/* Monthly chart */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Monthly Trend
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} fill="url(#attGrad)" name="Present" />
              <Area type="monotone" dataKey="absent"  stroke="#ef4444" strokeWidth={2} fill="none" name="Absent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
