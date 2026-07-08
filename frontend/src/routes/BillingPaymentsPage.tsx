import { useMemo, useState } from "react";
import { Banknote, Landmark, ShieldAlert, ShieldX, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PaymentsTable, type PaymentAction } from "@/components/billing/PaymentsTable";
import { Reveal } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import { PAYMENTS, type Payment } from "@/data/billingData";
import { cn } from "@/lib/utils";

export function BillingPaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>(PAYMENTS);

  const summary = useMemo(() => {
    const cash = payments.filter((p) => p.method === "Cash").reduce((s, p) => s + p.amount, 0);
    const bank = payments.filter((p) => p.method === "Bank Transfer").reduce((s, p) => s + p.amount, 0);
    const online = payments.filter((p) => ["Card", "Online Wallet", "Mobile Banking"].includes(p.method)).reduce((s, p) => s + p.amount, 0);
    const pending = payments.filter((p) => p.status === "Pending").length;
    const failed = payments.filter((p) => p.status === "Failed").length;
    return { total: payments.length, cash, bank, online, pending, failed };
  }, [payments]);

  const cards = [
    { label: "Total Payments",         value: String(summary.total),           icon: Banknote,   tone: "blue" },
    { label: "Cash",                   value: `$${summary.cash.toLocaleString()}`, icon: Banknote, tone: "green" },
    { label: "Bank Transfer",          value: `$${summary.bank.toLocaleString()}`, icon: Landmark, tone: "green" },
    { label: "Online",                 value: `$${summary.online.toLocaleString()}`, icon: Smartphone, tone: "green" },
    { label: "Pending Verification",   value: String(summary.pending),          icon: ShieldAlert, tone: "amber" },
    { label: "Failed Payments",        value: String(summary.failed),           icon: ShieldX,     tone: "red" },
  ] as const;

  function handleAction(p: Payment, action: PaymentAction) {
    switch (action) {
      case "view-receipt": navigate(`/billing/receipts/${p.id}`); break;
      case "print-receipt": navigate(`/billing/receipts/${p.id}`); break;
      case "verify":
        setPayments((prev) => prev.map((row) => (row.id === p.id ? { ...row, status: "Completed" } : row)));
        console.log("Verified payment:", p.paymentId);
        toast.success(`${p.paymentId} verified.`);
        break;
      case "refund":
        setPayments((prev) => prev.map((row) => (row.id === p.id ? { ...row, status: "Refunded" } : row)));
        console.log("Refunded payment:", p.paymentId);
        toast.success(`${p.paymentId} refunded.`);
        break;
    }
  }

  return (
    <div className="space-y-4">
      <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="rounded-2xl border-border/60 shadow-sm">
              <CardContent className="p-4">
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg",
                  c.tone === "green" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" :
                  c.tone === "amber" ? "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" :
                  c.tone === "red"   ? "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" :
                                       "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
                )}>
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-2 text-[11px] text-muted-foreground">{c.label}</p>
                <p className="text-[15px] font-semibold tabular-nums text-foreground">{c.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </Reveal>

      <PaymentsTable payments={payments} onAction={handleAction} />
    </div>
  );
}
