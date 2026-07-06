import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeacherAttendanceSummary, AttendanceMonth } from "@/data/teacherDetailsData";

function Pill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`flex flex-col items-center rounded-xl px-4 py-3 ${color}`}>
      <span className="text-[22px] font-bold leading-none">{value}</span>
      <span className="mt-1 text-[11px] font-medium opacity-70">{label}</span>
    </div>
  );
}

export function TeacherAttendanceCard({
  summary,
  monthly,
}: {
  summary: TeacherAttendanceSummary;
  monthly: AttendanceMonth[];
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Attendance</CardTitle>
          <span className="text-[13px] font-bold text-primary">{summary.percentage}%</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>{summary.presentDays} days present</span>
            <span>{summary.totalWorkingDays} working days</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${summary.percentage}%` }}
            />
          </div>
        </div>

        {/* Pills */}
        <div className="grid grid-cols-3 gap-2">
          <Pill label="Present" value={summary.presentDays}       color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" />
          <Pill label="Absent"  value={summary.absentDays}        color="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" />
          <Pill label="Leave"   value={summary.leaveDays}         color="bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" />
        </div>

        {/* Chart */}
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tAttGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(v: number) => [v, "Present"]}
              />
              <Area
                type="monotone"
                dataKey="present"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#tAttGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
