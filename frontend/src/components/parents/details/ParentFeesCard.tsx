import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FeeRecord } from "@/data/parentDetailsData";

const STATUS_CFG = {
  Paid:    "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
  Due:     "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
  Overdue: "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
};

function fmt(n: number) {
  return `NPR ${n.toLocaleString("en-IN")}`;
}

export function ParentFeesCard({
  records,
  summary,
}: {
  records: FeeRecord[];
  summary: { totalPaid: number; totalDue: number; nextDueDate: string };
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Fees & Expenses</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-4 text-center">
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{fmt(summary.totalPaid)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Total Paid</p>
          </div>
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 p-4 text-center">
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{fmt(summary.totalDue)}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Total Due</p>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-4 text-center">
            <p className="text-[14px] font-bold text-amber-600 dark:text-amber-400">
              {new Date(summary.nextDueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Next Due Date</p>
          </div>
        </div>

        <Separator />

        {/* Fee records table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border/60">
                {["ID", "Child", "Fee Type", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="pb-2 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 font-mono text-muted-foreground">{r.id.toUpperCase()}</td>
                  <td className="py-2.5 font-medium text-foreground">{r.child}</td>
                  <td className="py-2.5 text-muted-foreground">{r.feeType}</td>
                  <td className="py-2.5 font-semibold">{fmt(r.amount)}</td>
                  <td className="py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${STATUS_CFG[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">
                    {new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
