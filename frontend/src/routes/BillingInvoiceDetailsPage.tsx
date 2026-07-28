import { ChevronLeft, Clock, Receipt } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { BillingActivityTimeline } from "@/components/billing/BillingActivityTimeline";
import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/ui/DetailCard";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { INVOICES, PAYMENTS, type BillingActivity } from "@/data/billingData";

export function BillingInvoiceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const invoice = INVOICES.find((i) => String(i.id) === id);

  if (!invoice) {
    return (
      <PremiumCard className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-[13px] font-medium text-foreground">Invoice not found</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/billing/invoices")}>Back to Invoices</Button>
      </PremiumCard>
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

      <div className="print:hidden">
        <DetailCard icon={Receipt} title="Payment History">
          {paymentHistory.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No payments recorded yet for this invoice.</p>
          ) : (
            <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
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
        </DetailCard>
      </div>

      <div className="print:hidden">
        <DetailCard icon={Clock} title="Activity Timeline">
          <BillingActivityTimeline activities={activities} />
        </DetailCard>
      </div>
    </div>
  );
}
