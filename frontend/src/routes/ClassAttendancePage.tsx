import { Card } from "@/components/ui/card";
import { Layers, TrendingUp, TrendingDown } from "lucide-react";
import { CLASS_COMPARISON, MONTHLY_TREND } from "@/data/attendanceData";
import { cn } from "@/lib/utils";

export function ClassAttendancePage() {
  const best  = [...CLASS_COMPARISON].sort((a, b) => b.rate - a.rate)[0];
  const worst = [...CLASS_COMPARISON].sort((a, b) => a.rate - b.rate)[0];
  const avg   = Math.round(CLASS_COMPARISON.reduce((s, c) => s + c.rate, 0) / CLASS_COMPARISON.length);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Class-wise Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Compare attendance rates across all classes</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">School Average</p>
          <p className={cn("text-3xl font-bold", avg >= 90 ? "text-emerald-600" : avg >= 80 ? "text-amber-600" : "text-rose-600")}>{avg}%</p>
          <p className="text-[11px] text-muted-foreground mt-1">Across {CLASS_COMPARISON.length} classes · July 2026</p>
        </Card>
        <Card className="p-4 border-emerald-200 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/10">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">Best Class</p>
          </div>
          <p className="text-3xl font-bold text-emerald-700">{best?.rate}%</p>
          <p className="text-[11px] text-emerald-600 mt-1">{best?.className} {best?.section} · {best?.students} students</p>
        </Card>
        <Card className="p-4 border-rose-200 bg-rose-50/40 dark:border-rose-800 dark:bg-rose-950/10">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
            <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide">Needs Attention</p>
          </div>
          <p className="text-3xl font-bold text-rose-700">{worst?.rate}%</p>
          <p className="text-[11px] text-rose-600 mt-1">{worst?.className} {worst?.section} · {worst?.students} students</p>
        </Card>
      </div>

      {/* Horizontal bar chart */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[14px] font-semibold text-foreground">Attendance Rate by Class · July 2026</h2>
        </div>
        <div className="space-y-4">
          {[...CLASS_COMPARISON].sort((a, b) => b.rate - a.rate).map((c) => (
            <div key={`${c.className}${c.section}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-foreground">{c.className} {c.section}</span>
                  <span className="text-[11px] text-muted-foreground">({c.students} students)</span>
                </div>
                <span className={cn("text-[13px] font-bold",
                  c.rate >= 90 ? "text-emerald-600" : c.rate >= 80 ? "text-amber-600" : "text-rose-600"
                )}>{c.rate}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all",
                    c.rate >= 90 ? "bg-emerald-500" : c.rate >= 80 ? "bg-amber-500" : "bg-rose-500"
                  )}
                  style={{ width: `${c.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detail table */}
      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">Class Detail</h2>
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="min-w-full text-[12px]">
            <thead className="bg-muted/40 border-b border-border/60">
              <tr>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase">Class</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase">Section</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase">Students</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase">Rate</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-semibold text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-semibold text-muted-foreground uppercase">vs Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {CLASS_COMPARISON.map((c) => {
                const diff = c.rate - avg;
                return (
                  <tr key={`${c.className}${c.section}`} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium text-foreground">{c.className}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.section}</td>
                    <td className="px-4 py-3 text-center">{c.students}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("font-bold", c.rate >= 90 ? "text-emerald-600" : c.rate >= 80 ? "text-amber-600" : "text-rose-600")}>
                        {c.rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                        c.rate >= 90 ? "bg-emerald-50 text-emerald-700 ring-emerald-500/30" :
                        c.rate >= 80 ? "bg-amber-50 text-amber-700 ring-amber-500/30" :
                        "bg-rose-50 text-rose-700 ring-rose-500/30"
                      )}>
                        {c.rate >= 90 ? "Excellent" : c.rate >= 80 ? "Good" : "Low"}
                      </span>
                    </td>
                    <td className={cn("px-4 py-3 text-right font-semibold",
                      diff >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {diff >= 0 ? "+" : ""}{diff}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Monthly trend mini */}
      <Card className="p-5">
        <h2 className="text-[14px] font-semibold text-foreground mb-4">School-wide Monthly Trend</h2>
        <div className="flex items-end gap-4 h-28">
          {MONTHLY_TREND.map((pt) => {
            const height = `${pt.presentRate}%`;
            const isCurrent = pt.month.startsWith("Jul");
            return (
              <div key={pt.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-foreground">{pt.presentRate}%</span>
                <div className="w-full flex items-end" style={{ height: "72px" }}>
                  <div
                    className={cn("w-full rounded-t-md", isCurrent ? "bg-indigo-500" : "bg-indigo-200 dark:bg-indigo-800")}
                    style={{ height }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground text-center">{pt.month}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
