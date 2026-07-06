import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeesSummary } from "@/data/classDetailData";

function fmt(n: number) { return `NPR ${n.toLocaleString("en-IN")}`; }

export function ClassFeesCard({ fees }: { fees: FeesSummary }) {
  const collectedPct = Math.round((fees.collected / fees.totalExpected) * 100);

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Fee Collection Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Top chips */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label:"Total Expected", value: fmt(fees.totalExpected), cls:"bg-muted/60 text-foreground" },
            { label:"Collected",      value: fmt(fees.collected),     cls:"bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" },
            { label:"Due",            value: fmt(fees.due),           cls:"bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400" },
            { label:"Overdue",        value: fmt(fees.overdue),       cls:"bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400" },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`rounded-xl p-4 text-center ${cls}`}>
              <p className="text-[15px] font-bold leading-tight">{value}</p>
              <p className="mt-0.5 text-[11px] opacity-70">{label}</p>
            </div>
          ))}
        </div>

        {/* Collection progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-[12px]">
            <span className="text-muted-foreground">Collection Rate</span>
            <span className="font-semibold text-foreground">{collectedPct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${collectedPct}%` }} />
          </div>
        </div>

        <Separator />

        {/* Section-wise */}
        <div>
          <p className="mb-3 text-[12px] font-medium text-muted-foreground">Section-wise Collection</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-border/60">
                  {["Section","Collected","Due","Collection %"].map((h) => (
                    <th key={h} className="pb-2 pr-4 text-left font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {fees.sectionWise.map(({ section, collected, due }) => {
                  const total = collected + due;
                  const pct = Math.round((collected / total) * 100);
                  return (
                    <tr key={section} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 pr-4 font-medium text-foreground">Section {section}</td>
                      <td className="py-2.5 pr-4 text-emerald-600 dark:text-emerald-400 font-semibold">{fmt(collected)}</td>
                      <td className="py-2.5 pr-4 text-rose-600 dark:text-rose-400 font-semibold">{fmt(due)}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-medium text-foreground">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {fees.scholarship > 0 && (
          <div className="rounded-xl bg-violet-50 dark:bg-violet-950/30 px-4 py-3 text-[12.5px]">
            <span className="text-violet-700 dark:text-violet-400">Scholarship / Discount applied: </span>
            <span className="font-bold text-violet-700 dark:text-violet-400">{fmt(fees.scholarship)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
