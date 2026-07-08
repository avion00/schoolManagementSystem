import { Printer } from "lucide-react";

import { PaymentMethodBadge } from "@/components/billing/PaymentMethodBadge";
import { Button } from "@/components/ui/button";
import type { Payment } from "@/data/billingData";

export function ReceiptPreview({ payment, receiptNo }: { payment: Payment; receiptNo: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end print:hidden">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print Receipt
        </Button>
      </div>

      <div id="receipt-print" className="mx-auto max-w-md overflow-hidden rounded-2xl border border-border/60 bg-white text-[12px] shadow-lg dark:bg-background">
        <div className="border-b border-border/40 bg-muted/20 px-7 py-6 text-center">
          <h1 className="text-base font-bold text-foreground">SchoolOS Academy</h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Kathmandu, Nepal · Tel: 01-441-xxxx</p>
          <div className="mt-3 inline-block rounded-full border-2 border-foreground/20 px-5 py-1 text-[12px] font-bold uppercase tracking-wide text-foreground">
            Payment Receipt
          </div>
        </div>

        <div className="space-y-1.5 px-7 py-5">
          <Row label="Receipt No." value={receiptNo} />
          <Row label="Payment ID" value={payment.paymentId} />
          <Row label="Invoice No." value={payment.invoiceNo} />
          <Row label="Student" value={payment.studentName} />
          <Row label="Parent / Guardian" value={payment.parentName} />
          <Row label="Transaction ID" value={payment.transactionId} />
          <Row label="Received By" value={payment.receivedBy} />
          <Row label="Date" value={payment.paymentDate} />
        </div>

        <div className="border-y border-border/40 bg-muted/20 px-7 py-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Amount Paid</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${payment.amount.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Payment Method</span>
            <PaymentMethodBadge method={payment.method} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 px-7 py-6">
          <div className="text-center">
            <div className="h-10 border-b border-foreground/30" />
            <p className="mt-1 text-[10px] text-muted-foreground">Received By</p>
          </div>
          <div className="text-center">
            <div className="h-10 border-b border-foreground/30" />
            <p className="mt-1 text-[10px] text-muted-foreground">School Seal</p>
          </div>
        </div>
        <div className="bg-muted/30 px-7 py-3 text-center text-[10px] text-muted-foreground">
          Computer-generated receipt — no signature required for validity.
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
