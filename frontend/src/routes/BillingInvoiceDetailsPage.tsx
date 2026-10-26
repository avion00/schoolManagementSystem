import { useState } from "react";
import { BadgePercent, ChevronLeft, Clock, Receipt, Undo2, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { InvoicePreview } from "@/components/billing/InvoicePreview";
import { BillingActivityTimeline } from "@/components/billing/BillingActivityTimeline";
import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { PaymentForm } from "@/components/billing/forms/PaymentForm";
import { Button } from "@/components/ui/button";
import { DetailCard } from "@/components/ui/DetailCard";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import {
  useCancelInvoice, useDecideDiscount, useInvoice, useMoney, useRequestDiscount, useReversePayment,
} from "@/api/billing";
import { errorMessage } from "@/api/http";
import type { BillingActivity } from "@/api/types/billing";
import { useAuth } from "@/lib/auth";

export function BillingInvoiceDetailsPage() {
  const money = useMoney();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const query = useInvoice(id);
  const cancel = useCancelInvoice();
  const reverse = useReversePayment();
  const requestDiscount = useRequestDiscount();
  const decide = useDecideDiscount();
  const [payOpen, setPayOpen] = useState(false);

  if (query.isLoading) return <PremiumSkeleton className="mx-auto h-96 max-w-3xl rounded-2xl" />;
  if (!query.data) {
    return (
      <PremiumCard className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-[13px] font-medium text-foreground">{query.isError ? errorMessage(query.error) : "Invoice not found"}</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/billing/invoices")}>Back to Invoices</Button>
      </PremiumCard>
    );
  }

  const { invoice, payments: paymentHistory, discounts } = query.data;
  const open = invoice.status !== "Cancelled" && invoice.status !== "Refunded";
  const fail = (e: unknown) => toast.error(errorMessage(e));

  const activities: BillingActivity[] = [
    { id: "issued", action: `Invoice ${invoice.invoiceNo} issued${invoice.billingPeriod ? ` for ${invoice.billingPeriod}` : ""}`, by: "", at: `${invoice.issueDate}T09:00:00`, amount: invoice.amount },
    ...paymentHistory.map((p) => ({
      id: `p-${p.id}`, action: p.status === "Reversed"
        ? `Payment ${p.paymentId} reversed${p.reversedReason ? `: ${p.reversedReason}` : ""}`
        : `Payment received (${p.method})`,
      by: p.receivedBy, at: `${p.paymentDate}T12:00:00`, amount: p.amount,
    })),
    ...discounts.map((d) => ({
      id: `d-${d.id}`, action: `Discount ${d.status.toLowerCase()}: ${d.reason}`, by: d.decidedBy || d.requestedBy,
      at: `${d.createdAt}T10:00:00`, amount: d.amount,
    })),
    ...(invoice.status === "Cancelled" ? [{ id: "cancelled", action: `Invoice cancelled${invoice.cancelledReason ? `: ${invoice.cancelledReason}` : ""}`, by: "", at: "9999" }] : []),
  ].sort((a, b) => a.at.localeCompare(b.at));

  function doCancel() {
    const reason = window.prompt(`Cancel ${invoice.invoiceNo}? Give a reason.`);
    if (!reason?.trim()) return;
    cancel.mutate({ id: invoice.id, reason: reason.trim() }, { onSuccess: () => toast.success("Invoice cancelled."), onError: fail });
  }
  function doDiscount() {
    const amount = window.prompt(`Discount amount (balance ${money(invoice.balance)}):`);
    if (!amount || !(Number(amount) > 0)) return;
    const reason = window.prompt("Reason for the discount:");
    if (!reason?.trim()) return;
    requestDiscount.mutate({ invoice: invoice.id, amount, reason: reason.trim() }, {
      onSuccess: () => toast.success("Discount requested. Someone with approval rights must approve it."), onError: fail,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[12.5px]" onClick={() => navigate("/billing/invoices")}>
          <ChevronLeft className="h-3.5 w-3.5" /> Back to Invoices
        </Button>
        {open && (
          <div className="flex flex-wrap gap-2">
            {hasPermission("fee.collect") && invoice.balance > 0 && (
              <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setPayOpen(true)}>
                <Receipt className="h-3.5 w-3.5" /> Record Payment
              </Button>
            )}
            {hasPermission("fee.create") && invoice.balance > 0 && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={doDiscount}>
                <BadgePercent className="h-3.5 w-3.5" /> Request Discount
              </Button>
            )}
            {hasPermission("fee.create") && invoice.paid === 0 && (
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px] text-rose-600" onClick={doCancel}>
                <XCircle className="h-3.5 w-3.5" /> Cancel Invoice
              </Button>
            )}
          </div>
        )}
      </div>

      <InvoicePreview invoice={invoice} />

      {discounts.length > 0 && (
        <div className="print:hidden">
          <DetailCard icon={BadgePercent} title="Discounts">
            <div className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
              {discounts.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium text-foreground">{d.reason}</p>
                    <p className="text-[11px] text-muted-foreground">Requested by {d.requestedBy || "—"} on {d.createdAt}{d.decidedBy ? ` · decided by ${d.decidedBy}` : ""}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-[12.5px] font-semibold tabular-nums">{money(d.amount)}</span>
                    <BillingStatusBadge status={d.status} />
                    {d.status === "Pending" && hasPermission("fee.discount.approve") && (<>
                      <Button size="sm" variant="outline" className="h-7 text-[11.5px]"
                        onClick={() => decide.mutate({ id: d.id, approve: true }, { onSuccess: () => toast.success("Discount approved."), onError: fail })}>Approve</Button>
                      <Button size="sm" variant="outline" className="h-7 text-[11.5px] text-rose-600"
                        onClick={() => decide.mutate({ id: d.id, approve: false, note: window.prompt("Reason for rejecting (optional)") ?? "" }, { onSuccess: () => toast.success("Discount rejected."), onError: fail })}>Reject</Button>
                    </>)}
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        </div>
      )}

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
                    <p className="text-[11px] text-muted-foreground">{p.paymentDate}{p.receivedBy ? ` · Received by ${p.receivedBy}` : ""}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PaymentMethodBadge method={p.method} />
                    <span className={`text-[12.5px] font-semibold tabular-nums ${p.status === "Reversed" ? "text-muted-foreground line-through" : "text-emerald-600 dark:text-emerald-400"}`}>{money(p.amount)}</span>
                    {p.status === "Reversed" && <BillingStatusBadge status="Reversed" />}
                    <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={() => navigate(`/billing/receipts/${p.id}`)}>
                      <Receipt className="h-3.5 w-3.5" /> Receipt
                    </Button>
                    {p.status === "Completed" && hasPermission("fee.refund") && (
                      <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11.5px] text-rose-600" onClick={() => {
                        const reason = window.prompt(`Reverse payment ${p.paymentId} (${money(p.amount)})? Give a reason.`);
                        if (!reason?.trim()) return;
                        reverse.mutate({ id: p.id, reason: reason.trim() }, { onSuccess: () => toast.success("Payment reversed."), onError: fail });
                      }}>
                        <Undo2 className="h-3.5 w-3.5" /> Reverse
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailCard>
      </div>

      <div className="print:hidden">
        <DetailCard icon={Clock} title="Activity Timeline">
          <BillingActivityTimeline activities={activities.map((a) => (a.at === "9999" ? { ...a, at: new Date().toISOString() } : a))} />
        </DetailCard>
      </div>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>{invoice.invoiceNo} — balance {money(invoice.balance)}</DialogDescription>
          </DialogHeader>
          <PaymentForm defaultInvoiceId={invoice.id} onCancel={() => setPayOpen(false)}
            onSaved={(pid) => { setPayOpen(false); navigate(`/billing/receipts/${pid}`); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
