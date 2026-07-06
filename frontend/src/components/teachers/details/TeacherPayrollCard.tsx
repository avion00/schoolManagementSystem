import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { PayrollInfo, MonthlyPay } from "@/data/teacherDetailsData";

function fmt(n: number) {
  return `NPR ${n.toLocaleString("en-IN")}`;
}

function PayStatusBadge({ status }: { status: "Paid" | "Pending" | "Overdue" }) {
  const cfg = {
    Paid:    "bg-emerald-50 text-emerald-700 ring-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400",
    Pending: "bg-amber-50 text-amber-700 ring-amber-500/30 dark:bg-amber-950/40 dark:text-amber-400",
    Overdue: "bg-rose-50 text-rose-700 ring-rose-500/30 dark:bg-rose-950/40 dark:text-rose-400",
  }[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${cfg}`}>
      {status}
    </span>
  );
}

export function TeacherPayrollCard({
  payroll,
  history,
}: {
  payroll: PayrollInfo;
  history: MonthlyPay[];
}) {
  const gross = payroll.basicSalary + payroll.houseAllowance + payroll.transportAllowance + payroll.otherAllowance;
  const deductions = payroll.providentFundDeduction + payroll.taxDeduction + payroll.otherDeduction;

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Payroll</CardTitle>
          <PayStatusBadge status={payroll.paymentStatus} />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Net Salary hero */}
        <div className="rounded-xl bg-primary/5 p-4 text-center">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Net Salary</p>
          <p className="mt-1 text-3xl font-bold text-primary">{fmt(payroll.netSalary)}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Last paid: {new Date(payroll.lastPaidDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        </div>

        {/* Earnings */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Earnings</p>
          {[
            ["Basic Salary",          payroll.basicSalary],
            ["House Allowance",       payroll.houseAllowance],
            ["Transport Allowance",   payroll.transportAllowance],
            ["Other Allowance",       payroll.otherAllowance],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{fmt(val as number)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-[13px] font-semibold">
            <span>Gross Total</span>
            <span className="text-emerald-600 dark:text-emerald-400">{fmt(gross)}</span>
          </div>
        </div>

        {/* Deductions */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Deductions</p>
          {[
            ["Provident Fund",  payroll.providentFundDeduction],
            ["Income Tax",      payroll.taxDeduction],
            ["Other",           payroll.otherDeduction],
          ].map(([label, val]) => (
            <div key={label as string} className="flex justify-between text-[13px]">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium text-rose-600 dark:text-rose-400">−{fmt(val as number)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-[13px] font-semibold">
            <span>Total Deductions</span>
            <span className="text-rose-600 dark:text-rose-400">−{fmt(deductions)}</span>
          </div>
        </div>

        {/* Bank */}
        <div className="rounded-xl border border-border/60 p-3 text-[12.5px]">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Bank Details</p>
          <div className="space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="font-medium">{payroll.bankName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="font-mono font-medium">{payroll.accountNo}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium">{payroll.paymentMethod}</span></div>
          </div>
        </div>

        {/* History */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Payment History</p>
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.month} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <span className="text-[12.5px] text-muted-foreground">{h.month}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold">{fmt(h.amount)}</span>
                  <Badge variant={h.status === "Paid" ? "secondary" : "outline"} className="text-[10px]">
                    {h.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
