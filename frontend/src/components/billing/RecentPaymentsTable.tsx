import { useNavigate } from "react-router-dom";

import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PAYMENTS } from "@/data/billingData";

export function RecentPaymentsTable() {
  const navigate = useNavigate();
  const recent = [...PAYMENTS].sort((a, b) => (a.paymentDate < b.paymentDate ? 1 : -1)).slice(0, 6);

  return (
    <Card className="h-full rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[13px] font-semibold">Recent Payments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {recent.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => navigate("/billing/payments")}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-foreground">{p.studentName}</p>
              <p className="text-[11px] text-muted-foreground">{p.invoiceNo} · {p.paymentDate}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <PaymentMethodBadge method={p.method} className="hidden sm:inline-flex" />
              <span className="text-[12.5px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                ${p.amount.toLocaleString()}
              </span>
              <BillingStatusBadge status={p.status} />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
