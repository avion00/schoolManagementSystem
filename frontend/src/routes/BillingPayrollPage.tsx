import { useMemo, useState } from "react";
import { Printer, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { PayrollForm, type PayrollFormData } from "@/components/billing/forms/PayrollForm";
import { PayrollTable, type PayrollAction } from "@/components/billing/PayrollTable";
import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PAYROLL, type Payroll } from "@/data/billingData";

export function BillingPayrollPage() {
  const [payroll, setPayroll] = useState<Payroll[]>(PAYROLL);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [payslip, setPayslip] = useState<Payroll | null>(null);

  const summary = useMemo(() => {
    const paid = payroll.filter((p) => p.status === "Paid");
    const pending = payroll.filter((p) => p.status === "Pending");
    return {
      totalStaff: payroll.length,
      payrollThisMonth: payroll.reduce((s, p) => s + p.netSalary, 0),
      paidSalary: paid.reduce((s, p) => s + p.netSalary, 0),
      pendingSalary: pending.reduce((s, p) => s + p.netSalary, 0),
      deductions: payroll.reduce((s, p) => s + p.deduction, 0),
      bonuses: payroll.reduce((s, p) => s + (p.bonus ?? 0), 0),
    };
  }, [payroll]);

  const cards = [
    { label: "Total Staff",        value: String(summary.totalStaff) },
    { label: "Payroll This Month", value: `$${summary.payrollThisMonth.toLocaleString()}` },
    { label: "Paid Salary",        value: `$${summary.paidSalary.toLocaleString()}` },
    { label: "Pending Salary",     value: `$${summary.pendingSalary.toLocaleString()}` },
    { label: "Deductions",         value: `$${summary.deductions.toLocaleString()}` },
    { label: "Bonuses",            value: `$${summary.bonuses.toLocaleString()}` },
  ];

  function handleAction(row: Payroll, action: PayrollAction) {
    if (action === "view" || action === "payslip" || action === "print-payslip") { setPayslip(row); return; }
    if (action === "mark-paid") {
      setPayroll((prev) => prev.map((p) => (p.id === row.id ? { ...p, status: "Paid", paymentDate: new Date().toISOString().slice(0, 10) } : p)));
      console.log("Marked paid:", row.employeeId);
      toast.success(`${row.staffName}'s salary marked as paid.`);
    }
  }

  function handleGenerate(data: PayrollFormData) {
    console.log("Generated payroll:", data);
    toast.success("Payroll generated successfully.");
    setGenerateOpen(false);
  }

  return (
    <div className="space-y-4">
      <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">{c.label}</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums text-purple-600 dark:text-purple-400">{c.value}</p>
            </CardContent>
          </Card>
        ))}
      </Reveal>

      <div className="flex justify-end">
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setGenerateOpen(true)}>
          <UserPlus className="h-3.5 w-3.5" /> Generate Payroll
        </Button>
      </div>

      <PayrollTable payroll={payroll} onAction={handleAction} />

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Generate Payroll</DialogTitle>
            <DialogDescription>Create a new salary entry for a staff member.</DialogDescription>
          </DialogHeader>
          <PayrollForm onCancel={() => setGenerateOpen(false)} onSubmit={handleGenerate} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!payslip} onOpenChange={(o) => !o && setPayslip(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          {payslip && (
            <div className="space-y-3">
              <div className="flex justify-end print:hidden">
                <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
                  <Printer className="h-3.5 w-3.5" /> Print Payslip
                </Button>
              </div>
              <div id="payslip-print" className="rounded-2xl border border-border/60 bg-white p-6 text-[12px] dark:bg-background">
                <div className="border-b border-border/40 pb-4 text-center">
                  <h1 className="text-base font-bold text-foreground">SchoolOS Academy</h1>
                  <p className="text-[11px] text-muted-foreground">Salary Payslip — {payslip.month}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 py-4">
                  <Row label="Employee ID" value={payslip.employeeId} />
                  <Row label="Staff Name" value={payslip.staffName} />
                  <Row label="Role" value={payslip.role} />
                  <Row label="Department" value={payslip.department} />
                  <Row label="Payment Method" value={payslip.paymentMethod ?? "—"} />
                  <Row label="Payment Date" value={payslip.paymentDate ?? "Not yet paid"} />
                </div>
                <div className="space-y-1.5 border-t border-border/40 py-4">
                  <SumRow label="Basic Salary" value={payslip.basicSalary} />
                  <SumRow label="Allowance" value={payslip.allowance} tone="green" />
                  <SumRow label="Bonus" value={payslip.bonus ?? 0} tone="green" />
                  <SumRow label="Attendance Deduction" value={-(payslip.attendanceDeduction ?? 0)} tone="red" />
                  <SumRow label="Tax / Other Deduction" value={-(payslip.taxDeduction ?? 0)} tone="red" />
                  <div className="my-1 border-t border-border/40" />
                  <SumRow label="Net Salary" value={payslip.netSalary} bold />
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="text-[11px] text-muted-foreground">Status</span>
                  <BillingStatusBadge status={payslip.status} />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function SumRow({ label, value, bold, tone }: { label: string; value: number; bold?: boolean; tone?: "green" | "red" }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-bold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className={tone === "green" ? "text-emerald-600" : tone === "red" ? "text-rose-600" : "text-foreground"}>
        {value < 0 ? "-" : ""}${Math.abs(value).toLocaleString()}
      </span>
    </div>
  );
}
