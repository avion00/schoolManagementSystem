import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimetableRow } from "@/data/classDetailData";

const DAYS = ["monday","tuesday","wednesday","thursday","friday"] as const;
const DAY_LABELS = { monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu", friday:"Fri" };

export function ClassTimetableCard({ timetable }: { timetable: TimetableRow[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Weekly Timetable</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-[12px]">
            <thead>
              <tr className="border-b border-border/60">
                <th className="pb-2 pr-3 text-left font-medium text-muted-foreground whitespace-nowrap w-32">Time</th>
                {DAYS.map((d) => (
                  <th key={d} className="pb-2 px-1 text-center font-semibold text-foreground">{DAY_LABELS[d]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {timetable.map((row, idx) => {
                if (row.isBreak) {
                  return (
                    <tr key={idx} className="bg-muted/30">
                      <td className="py-2 pr-3 text-[11px] font-medium text-muted-foreground">{row.time}</td>
                      <td colSpan={5} className="py-2 text-center text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">
                        ── Break ──
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2 pr-3 text-[11px] font-medium text-muted-foreground whitespace-nowrap">{row.time}</td>
                    {DAYS.map((d) => {
                      const slot = row[d];
                      if (!slot) return <td key={d} className="py-2 px-1 text-center text-muted-foreground/30">—</td>;
                      return (
                        <td key={d} className="py-1.5 px-1">
                          <div className={`rounded-lg px-2 py-1.5 text-center ${slot.color}`}>
                            <p className="text-[11px] font-semibold leading-tight">{slot.subject}</p>
                            <p className="text-[10px] opacity-70">{slot.teacher}</p>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
