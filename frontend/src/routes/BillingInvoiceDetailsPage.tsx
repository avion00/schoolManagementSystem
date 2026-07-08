import { ChevronLeft, Receipt } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { BillingActivityTimeline } from "@/components/billing/BillingActivityTimeline";
import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INVOICES, PAYMENTS, type BillingActivity } from "@/data/billingData";

export function BillingInvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoice = INVOICES.find((i) => String(i.id) === id);

  if (!invoice) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-[13px] font-medium text-foreground">Invoice not found</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/billing/invoices")}>Back to Invoices</Button>
        </CardContent>
      </Card>
    );
  }

  const paymentHistory = PAYMENTS.filter((p) => p.invoiceNo === invoice.invoiceNo);

  const activities: BillingActivity[] = [
    { id: 1, action: `Invoice ${invoice.invoiceNo} issued`, by: "Ramesh Shrestha", at: `${invoice.issueDate}T09:00:00` },
    ...paymentHistory.map((p, i) => ({
      id: 100 + i, action: `Payment of $${p.amount.toLocaleString()} received (${p.method})`, by: p.receivedBy, at: `${p.paymentDate}T12:00:00`, amount: p.amount,
    })),
    ...(invoice.status === "Cancelled" ? [{ id: 999, action: "Invoice cancelled", by: "Super Admin", at: `${invoice.dueDate}T00:00:00` }] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[12.5px] print:hidden" onClick={() => navigate("/billing/invoices")}>
        <ChevronLeft className="h-3.5 w-3.5" /> Back to Invoices
      </Button>

      <InvoicePreview invoice={invoice} />

      <Card className="rounded-2xl border-border/60 shadow-sm print:hidden">
        <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold">Payment History</CardTitle></CardHeader>
        <CardContent className="pt-0">
          {paymentHistory.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No payments recorded yet for this invoice.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {paymentHistory.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-foreground">{p.paymentId}</p>
                    <p className="text-[11px] text-muted-foreground">{p.paymentDate} · Received by {p.receivedBy}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PaymentMethodBadge method={p.method} />
                    <span className="text-[12.5px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">${p.amount.toLocaleString()}</span>
                    <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={() => navigate(`/billing/receipts/${p.id}`)}>
                      <Receipt className="h-3.5 w-3.5" /> Receipt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/60 shadow-sm print:hidden">
        <CardHeader className="pb-2"><CardTitle className="text-[13px] font-semibold">Activity Timeline</CardTitle></CardHeader>
        <CardContent className="pt-0"><BillingActivityTimeline activities={activities} /></CardContent>
      </Card>
    </div>
  );
}
