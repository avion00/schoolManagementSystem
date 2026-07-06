import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AttendanceSummary } from "@/data/classDetailData";

const DAY_LABELS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function Ring({ pct, color, label }: { pct: number; color: string; label: string }) {
  const r = 22, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="60" height="60" className="-rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" strokeWidth="5" className="stroke-muted" />
        <circle cx="30" cy="30" r={r} fill="none" strokeWidth="5"
          stroke="currentColor" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className={color} />
      </svg>
      <p className="text-[15px] font-bold text-foreground" style={{ marginTop: "-44px" }}>{pct}%</p>
      <p className="mt-7 text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function ClassAttendanceCard({ attendance }: { attendance: AttendanceSummary }) {
  const chartData = attendance.last7Days.map((v, i) => ({ day: DAY_LABELS[i % 7], pct: v }));

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Attendance Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Ring stats */}
        <div className="flex flex-wrap justify-around gap-4">
          <Ring pct={attendance.presentPct}  color="text-emerald-500" label="Present"  />
          <Ring pct={attendance.absentPct}   color="text-rose-500"    label="Absent"   />
          <Ring pct={attendance.latePct}     color="text-amber-500"   label="Late"     />
          <Ring pct={attendance.halfDayPct}  color="text-blue-500"    label="Half Day" />
        </div>

        {/* Info row */}
        <div className="rounded-xl bg-muted/40 px-4 py-3 text-center text-[12px]">
          <span className="text-muted-foreground">Total School Days: </span>
          <span className="font-bold text-foreground">{attendance.totalDays}</span>
        </div>

        {/* Last 7 days chart */}
        <div>
          <p className="mb-2 text-[12px] font-medium text-muted-foreground">Last 7 Days</p>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
              <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`${v}%`, "Attendance"]} />
              <Area type="monotone" dataKey="pct" stroke="#10b981" strokeWidth={2} fill="url(#attGrad)" dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Section-wise */}
        <div>
          <p className="mb-2 text-[12px] font-medium text-muted-foreground">Section-wise Attendance</p>
          <div className="space-y-2">
            {attendance.sectionWise.map(({ section, pct }) => (
              <div key={section} className="flex items-center gap-3 text-[12px]">
                <span className="w-16 text-muted-foreground">Section {section}</span>
                <div className="flex-1 overflow-hidden rounded-full h-1.5 bg-muted">
                  <div className={`h-full rounded-full ${pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <span className={`font-semibold w-10 text-right ${pct >= 90 ? "text-emerald-600 dark:text-emerald-400" : pct >= 75 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400"}`}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
