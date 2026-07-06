import { Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FeeStatus, Payment } from "@/data/studentDetailsData";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: FeeStatus["status"] | Payment["status"] }) {
  const cls =
    status === "Paid"    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" :
    status === "Pending" ? "bg-amber-500/10 text-amber-700 dark:text-amber-400" :
    "bg-rose-500/10 text-rose-700 dark:text-rose-400";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset", cls,
      status === "Paid"    ? "ring-emerald-500/20" :
      status === "Pending" ? "ring-amber-500/20" : "ring-rose-500/20",
    )}>
      {status}
    </span>
  );
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props { fees: FeeStatus; payments: Payment[]; }

export function StudentFeesCard({ fees, payments }: Props) {
  const paidPct = Math.round((fees.paid / fees.totalFee) * 100);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-semibold">
          <span className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            Fee Status
          </span>
          <StatusBadge status={fees.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Fee overview */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total Fee",  value: `$${fees.totalFee.toLocaleString()}`,   color: "bg-muted/60"                                           },
            { label: "Paid",       value: `$${fees.paid.toLocaleString()}`,        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
            { label: "Due",        value: `$${fees.due.toLocaleString()}`,         color: "bg-rose-500/10 text-rose-700 dark:text-rose-300"          },
            { label: "Discount",   value: `$${fees.discount.toLocaleString()}`,    color: "bg-sky-500/10 text-sky-700 dark:text-sky-300"             },
          ].map(({ label, value, color }) => (
            <div key={label} className={cn("rounded-xl p-3 text-center", color)}>
              <p className="text-base font-bold">{value}</p>
              <p className="mt-0.5 text-[11px] font-medium opacity-75">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div>
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Payment progress</span>
            <span className="font-semibold text-foreground">{paidPct}% paid</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${paidPct}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Next due: <span className="font-semibold text-foreground">{fmt(fees.nextDueDate)}</span>
          </p>
        </div>

        {/* Payment history */}
        <div>
          <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground">
            Payment History
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {["Receipt No", "Date", "Description", "Amount", "Method", "Status"].map((h) => (
                    <TableHead key={h} className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.receiptNo}>
                    <TableCell className="font-mono text-xs">{p.receiptNo}</TableCell>
                    <TableCell className="text-sm">{fmt(p.date)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.description}</TableCell>
                    <TableCell className="font-semibold">${p.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.method}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
