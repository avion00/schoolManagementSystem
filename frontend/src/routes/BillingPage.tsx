import { useState } from "react";
import {
  AlertTriangle, Banknote, CreditCard, FilePlus2, Landmark, Printer,
  Receipt, ScrollText, Send, Smartphone, UserPlus, Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { BillingActivityTimeline } from "@/components/billing/BillingActivityTimeline";
import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { BillingSummaryCards } from "@/components/billing/BillingSummaryCards";
import { ExpenseForm } from "@/components/billing/forms/ExpenseForm";
import { InvoiceForm } from "@/components/billing/forms/InvoiceForm";
import { PaymentForm } from "@/components/billing/forms/PaymentForm";
import { PayrollForm } from "@/components/billing/forms/PayrollForm";
import { FeeCollectionChart } from "@/components/billing/FeeCollectionChart";
import { PendingDuesTable } from "@/components/billing/PendingDuesTable";
import { RecentPaymentsTable } from "@/components/billing/RecentPaymentsTable";
import { RevenueExpenseChart } from "@/components/billing/RevenueExpenseChart";
import { Reveal } from "@/components/motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  monthLabel, useExpenses, useFeeSummary, useFinanceSummary, useMoney, usePayments, usePayrollRuns, usePayslips, useStudentFees,
} from "@/api/billing";
import type { BillingActivity, PaymentMethod } from "@/api/types/billing";
import { useAuth } from "@/lib/auth";

type QuickAction = "invoice" | "payment" | "expense" | "payroll" | null;

const METHOD_ICON: Record<PaymentMethod, typeof Banknote> = {
  Cash: Banknote, "Bank Transfer": Landmark, Card: CreditCard,
  "Online Payment": Smartphone, "Online Wallet": Wallet, "Mobile Banking": Smartphone, Cheque: ScrollText,
};

export function BillingPage() {
  const money = useMoney();
  const navigate = useNavigate();
  const [modal, setModal] = useState<QuickAction>(null);

  const { hasPermission } = useAuth();
  const canFinance = hasPermission("finance.view");
  const canPayroll = hasPermission("payroll.manage");
  const feeSummary = useFeeSummary();
  const finance = useFinanceSummary(6, canFinance);
  const fees = useStudentFees();
  const payments = usePayments();
  const expensesQuery = useExpenses(canFinance);
  const runs = usePayrollRuns(canPayroll);
  const EXPENSES = canFinance ? expensesQuery.data ?? [] : [];
  const PAYMENTS = payments.data ?? [];
  const openRun = canPayroll ? (runs.data ?? []).find((r) => r.status !== "Paid") : undefined;
  const slips = usePayslips(openRun?.id);

  const upcomingPayroll = (slips.data?.payslips ?? []).slice(0, 5);
  const recentExpenses = EXPENSES.slice(0, 5);

  // This month's collections by method, from the server summary.
  const methodTotals = feeSummary.data?.collectedByMethod ?? {};
  const maxMethod = Math.max(1, ...Object.values(methodTotals));

  const pendingExpenses = EXPENSES.filter((e) => e.status === "Pending").length;
  const alerts: { text: string; tone: "amber" | "red" }[] = [];
  if (openRun) alerts.push({ text: `Payroll for ${monthLabel(openRun.month)} is ${openRun.status.toLowerCase()} and not yet paid.`, tone: "amber" });
  if (pendingExpenses) alerts.push({ text: `${pendingExpenses} expense${pendingExpenses === 1 ? "" : "s"} awaiting approval.`, tone: "amber" });
  if (feeSummary.data?.overdueInvoices) alerts.push({ text: `${feeSummary.data.overdueInvoices} invoice${feeSummary.data.overdueInvoices === 1 ? " is" : "s are"} overdue.`, tone: "red" });
  if (feeSummary.data?.pendingDiscounts) alerts.push({ text: `${feeSummary.data.pendingDiscounts} discount request${feeSummary.data.pendingDiscounts === 1 ? "" : "s"} awaiting a decision.`, tone: "amber" });

  // Recent activity: latest payments and expenses, newest first.
  const activities: BillingActivity[] = [
    ...PAYMENTS.slice(0, 6).map((p) => ({
      id: `p-${p.id}`, action: `${p.status === "Reversed" ? "Reversed payment" : "Payment received"} for ${p.invoiceNo} (${p.studentName})`,
      by: p.receivedBy, at: `${p.paymentDate}T12:00:00`, amount: p.amount,
    })),
    ...EXPENSES.slice(0, 6).map((e) => ({
      id: `e-${e.id}`, action: `Expense ${e.expenseId} ${e.status.toLowerCase()}: ${e.description}`,
      by: e.approvedBy || e.recordedBy, at: `${e.date}T12:00:00`, amount: e.amount,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 8);

  return (
    <div className="space-y-4">
      <BillingSummaryCards fees={feeSummary.data} finance={finance.data} />

      {/* A + B: charts */}
      <Reveal delay={60} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {canFinance && finance.data ? <RevenueExpenseChart trend={finance.data.trend} /> : null}
        <FeeCollectionChart fees={fees.data ?? []} />
      </Reveal>

      {/* C + D: recent payments / pending dues */}
      <Reveal delay={100} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentPaymentsTable payments={PAYMENTS} />
        <PendingDuesTable fees={fees.data ?? []} />
      </Reveal>

      {/* E + F: upcoming payroll / recent expenses */}
      <Reveal delay={140} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PremiumCard className="p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-foreground">
            {openRun ? `Payroll · ${monthLabel(openRun.month)} (${openRun.status})` : "Upcoming Payroll"}
          </h3>
          <div className="space-y-1">
            {upcomingPayroll.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">
                {canPayroll ? "No unpaid payroll run." : "Payroll is visible to payroll managers."}
              </p>
            )}
            {upcomingPayroll.map((p) => (
              <button key={p.id} type="button" onClick={() => navigate("/billing/payroll")}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-foreground">{p.staffName}</p>
                  <p className="text-[11px] text-muted-foreground">{p.department || p.employeeId}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12.5px] font-semibold tabular-nums text-purple-600 dark:text-purple-400">{money(p.netSalary)}</span>
                  <BillingStatusBadge status={p.status} />
                </div>
              </button>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-foreground">Recent Expenses</h3>
          <div className="space-y-1">
            {recentExpenses.length === 0 && (
              <p className="py-6 text-center text-[12px] text-muted-foreground">{canFinance ? "No expenses recorded yet." : "Expenses are visible to finance staff."}</p>
            )}
            {recentExpenses.map((e) => (
              <button key={e.id} type="button" onClick={() => navigate("/billing/expenses")}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50">
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-foreground">{e.vendor || e.description}</p>
                  <p className="text-[11px] text-muted-foreground">{e.category} · {e.date}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[12.5px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">{money(e.amount)}</span>
                  <BillingStatusBadge status={e.status} />
                </div>
              </button>
            ))}
          </div>
        </PremiumCard>
      </Reveal>

      {/* G + H: payment method breakdown / alerts */}
      <Reveal delay={180} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PremiumCard className="p-4">
          <h3 className="mb-3 text-[13px] font-semibold text-foreground">Collections This Month by Method</h3>
          <div className="space-y-3">
            {Object.keys(methodTotals).length === 0 && <p className="py-6 text-center text-[12px] text-muted-foreground">No collections this month yet.</p>}
            {Object.entries(methodTotals).map(([method, total]) => {
              const Icon = METHOD_ICON[method as PaymentMethod] ?? Banknote;
              return (
                <div key={method}>
                  <div className="mb-1 flex items-center justify-between text-[12px]">
                    <span className="flex items-center gap-1.5 text-foreground"><Icon className="h-3.5 w-3.5 text-muted-foreground" /> {method}</span>
                    <span className="font-medium text-foreground">{money(total)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${(total / maxMethod) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </PremiumCard>

        <PremiumCard className="p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-foreground">Finance Alerts</h3>
          <div className="space-y-2">
            {alerts.length === 0 && <p className="py-6 text-center text-[12px] text-muted-foreground">Nothing needs attention.</p>}
            {alerts.map((a) => (
              <div key={a.text} className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-[12px] ${
                a.tone === "red" ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300"
                                  : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300"
              }`}>
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {a.text}
              </div>
            ))}
          </div>
        </PremiumCard>
      </Reveal>

      {/* I: quick actions */}
      <Reveal delay={220}>
        <PremiumCard className="p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-foreground">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {hasPermission("fee.create") && <QuickActionButton icon={FilePlus2} label="Create Invoice" onClick={() => setModal("invoice")} />}
            {hasPermission("fee.collect") && <QuickActionButton icon={Receipt} label="Record Payment" onClick={() => setModal("payment")} />}
            {hasPermission("finance.expense.manage") && <QuickActionButton icon={Wallet} label="Add Expense" onClick={() => setModal("expense")} />}
            {canPayroll && <QuickActionButton icon={UserPlus} label="Generate Payroll" onClick={() => setModal("payroll")} />}
            <QuickActionButton icon={Printer} label="Print Receipt" onClick={() => navigate("/billing/payments")} />
            <QuickActionButton icon={Send} label="Export Report" onClick={() => navigate("/billing/reports")} />
          </div>
        </PremiumCard>
      </Reveal>

      <Reveal delay={260}>
        <PremiumCard className="p-4">
          <h3 className="mb-2 text-[13px] font-semibold text-foreground">Recent Billing Activity</h3>
          {activities.length ? <BillingActivityTimeline activities={activities} /> : <p className="py-4 text-center text-[12px] text-muted-foreground">No billing activity yet.</p>}
        </PremiumCard>
      </Reveal>

      {/* Quick action modals */}
      <Dialog open={modal === "invoice"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>
          <InvoiceForm onCancel={() => setModal(null)} onSaved={(id) => { setModal(null); navigate(`/billing/invoices/${id}`); }} />
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "payment"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <PaymentForm onCancel={() => setModal(null)} onSaved={(id) => { setModal(null); navigate(`/billing/receipts/${id}`); }} />
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "expense"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
          <ExpenseForm onCancel={() => setModal(null)} onSaved={() => setModal(null)} />
        </DialogContent>
      </Dialog>
      <Dialog open={modal === "payroll"} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Generate Payroll</DialogTitle></DialogHeader>
          <PayrollForm onCancel={() => setModal(null)} onSaved={() => { setModal(null); navigate("/billing/payroll"); }} />
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
