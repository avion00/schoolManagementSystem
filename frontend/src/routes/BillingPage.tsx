import { useState } from "react";
import {
  AlertTriangle, Banknote, CreditCard, FilePlus2, Landmark, Printer,
  Receipt, ScrollText, Send, Smartphone, UserPlus, Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { BillingActivityTimeline } from "@/components/billing/BillingActivityTimeline";
import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { BillingSummaryCards } from "@/components/billing/BillingSummaryCards";
import { ExpenseForm, type ExpenseFormData } from "@/components/billing/forms/ExpenseForm";
import { InvoiceForm, type InvoiceFormData } from "@/components/billing/forms/InvoiceForm";
import { PaymentForm, type PaymentFormData } from "@/components/billing/forms/PaymentForm";
import { PayrollForm, type PayrollFormData } from "@/components/billing/forms/PayrollForm";
import { FeeCollectionChart } from "@/components/billing/FeeCollectionChart";
import { PendingDuesTable } from "@/components/billing/PendingDuesTable";
import { RecentPaymentsTable } from "@/components/billing/RecentPaymentsTable";
import { RevenueExpenseChart } from "@/components/billing/RevenueExpenseChart";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  BILLING_ACTIVITIES, EXPENSES, PAYMENTS, PAYROLL, type PaymentMethod,
} from "@/data/billingData";

type QuickAction = "invoice" | "payment" | "expense" | "payroll" | null;

const METHOD_ICON: Record<PaymentMethod, typeof Banknote> = {
  Cash: Banknote, "Bank Transfer": Landmark, Card: CreditCard,
  "Online Wallet": Wallet, "Mobile Banking": Smartphone, Cheque: ScrollText,
};

export function BillingPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState<QuickAction>(null);

  const upcomingPayroll = PAYROLL.filter((p) => p.status === "Pending").slice(0, 5);
  const recentExpenses = [...EXPENSES].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5);

  const methodTotals = PAYMENTS.filter((p) => p.status === "Completed").reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + p.amount;
    return acc;
  }, {});
  const maxMethod = Math.max(1, ...Object.values(methodTotals));

  const overdueCount = EXPENSES.filter((e) => e.status === "Pending").length;
  const pendingPayrollCount = PAYROLL.filter((p) => p.status === "Pending").length;
  const alerts = [
    { text: `${pendingPayrollCount} staff payroll ${pendingPayrollCount === 1 ? "entry is" : "entries are"} pending this month.`, tone: "amber" },
    { text: `${overdueCount} expense${overdueCount === 1 ? "" : "s"} awaiting approval.`, tone: "amber" },
    { text: "5 invoices are overdue by more than a week.", tone: "red" },
  ] as const;

  function handleQuickSubmit(kind: Exclude<QuickAction, null>, data: unknown) {
    console.log(`Quick action — ${kind}:`, data);
    toast.success(
      kind === "invoice" ? "Invoice created." :
      kind === "payment" ? "Payment recorded." :
      kind === "expense" ? "Expense added." : "Payroll generated.",
    );
    setModal(null);
  }

  return (
    <div className="space-y-4">
      <BillingSummaryCards />

      {/* A + B: charts */}
      <Reveal delay={60} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RevenueExpenseChart />
        <FeeCollectionChart />
      </Reveal>

      {/* C + D: recent payments / pending dues */}
      <Reveal delay={100} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentPaymentsTable />
        <PendingDuesTable />
      </Reveal>

      {/* E + F: upcoming payroll / recent expenses */}
      <Reveal delay={140} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold">Upcoming Payroll</CardTitle></CardHeader>
          <CardContent className="space-y-1 pt-0">
            {upcomingPayroll.map((p) => (
              <button key={p.id} type="button" onClick={() => navigate("/billing/payroll")}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-foreground">{p.staffName}</p>
                  <p className="text-[11px] text-muted-foreground">{p.role} · {p.month}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12.5px] font-semibold tabular-nums text-purple-600 dark:text-purple-400">${p.netSalary.toLocaleString()}</span>
                  <BillingStatusBadge status={p.status} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold">Recent Expenses</CardTitle></CardHeader>
          <CardContent className="space-y-1 pt-0">
            {recentExpenses.map((e) => (
              <button key={e.id} type="button" onClick={() => navigate("/billing/expenses")}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-foreground">{e.vendor}</p>
                  <p className="text-[11px] text-muted-foreground">{e.category} · {e.date}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12.5px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">${e.amount.toLocaleString()}</span>
                  <BillingStatusBadge status={e.status} />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </Reveal>

      {/* G + H: payment method breakdown / alerts */}
      <Reveal delay={180} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold">Payment Method Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-3 pt-0">
            {Object.entries(methodTotals).map(([method, total]) => {
              const Icon = METHOD_ICON[method as PaymentMethod];
              return (
                <div key={method}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 text-foreground"><Icon className="h-3.5 w-3.5 text-muted-foreground" /> {method}</span>
                    <span className="font-medium text-foreground">${total.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(total / maxMethod) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold">Finance Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0">
            {alerts.map((a) => (
              <div key={a.text} className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-[12px] ${
                a.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
              }`}>
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {a.text}
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>

      {/* I: quick actions */}
      <Reveal delay={220}>
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold">Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2.5 pt-0 sm:grid-cols-3 lg:grid-cols-6">
            <QuickActionButton icon={FilePlus2} label="Create Invoice" onClick={() => setModal("invoice")} />
            <QuickActionButton icon={Receipt} label="Record Payment" onClick={() => setModal("payment")} />
            <QuickActionButton icon={Wallet} label="Add Expense" onClick={() => setModal("expense")} />
            <QuickActionButton icon={UserPlus} label="Generate Payroll" onClick={() => setModal("payroll")} />
            <QuickActionButton icon={Printer} label="Print Receipt" onClick={() => navigate("/billing/payments")} />
            <QuickActionButton icon={Send} label="Export Report" onClick={() => navigate("/billing/reports")} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={260}>
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold">Recent Billing Activity</CardTitle></CardHeader>
          <CardContent className="pt-0"><BillingActivityTimeline activities={BILLING_ACTIVITIES} /></CardContent>
        </Card>
      </Reveal>

      {/* Quick action modals */}
      <Dialog open={modal === "invoice"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <InvoiceForm onCancel={() => setModal(null)} onSubmit={(d: InvoiceFormData) => handleQuickSubmit("invoice", d)} />
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "payment"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <PaymentForm onCancel={() => setModal(null)} onSubmit={(d: PaymentFormData) => handleQuickSubmit("payment", d)} />
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "expense"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <ExpenseForm onCancel={() => setModal(null)} onSubmit={(d: ExpenseFormData) => handleQuickSubmit("expense", d)} />
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "payroll"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Generate Payroll</DialogTitle></DialogHeader>
          <PayrollForm onCancel={() => setModal(null)} onSubmit={(d: PayrollFormData) => handleQuickSubmit("payroll", d)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, onClick }: { icon: typeof FilePlus2; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-border/60 p-3.5 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </span>
      <span className="text-[11.5px] font-medium text-foreground">{label}</span>
    </button>
  );
}
