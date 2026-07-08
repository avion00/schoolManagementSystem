import { Printer } from "lucide-react";

import { BillingStatusBadge } from "@/components/billing/BillingStatusBadge";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/data/billingData";

export function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const subtotal = invoice.items.reduce((s, it) => s + it.amount, 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-end print:hidden">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print Invoice
        </Button>
      </div>

      <div id="invoice-print" className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-border/60 bg-white text-[12px] shadow-lg dark:bg-background">
        {/* Header */}
        <div className="border-b border-border/40 bg-muted/20 px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">SchoolOS Academy</h1>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Kathmandu, Nepal · Tel: 01-441-xxxx</p>
              <p className="text-[11px] text-muted-foreground">accounts@schoolos.academy</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold uppercase tracking-wide text-foreground">Invoice</p>
              <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">{invoice.invoiceNo}</p>
              <div className="mt-1.5"><BillingStatusBadge status={invoice.status} /></div>
            </div>
          </div>
        </div>

        {/* Student / parent info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 border-b border-border/40 px-8 py-5">
          <InfoRow label="Student" value={invoice.studentName} />
          <InfoRow label="Parent / Guardian" value={invoice.parentName} />
          <InfoRow label="Admission No." value={invoice.admissionNo} />
          <InfoRow label="Class" value={`${invoice.className} – ${invoice.section}`} />
          <InfoRow label="Issue Date" value={invoice.issueDate} />
          <InfoRow label="Due Date" value={invoice.dueDate} />
        </div>

        {/* Items */}
        <div className="px-8 py-5">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b-2 border-foreground/20">
                <th className="pb-2 text-left font-semibold text-foreground">Item</th>
                <th className="pb-2 text-center font-semibold text-foreground">Qty</th>
                <th className="pb-2 text-right font-semibold text-foreground">Unit Price</th>
                <th className="pb-2 text-right font-semibold text-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it) => (
                <tr key={it.id} className="border-b border-border/20">
                  <td className="py-1.5 text-foreground">{it.label}</td>
                  <td className="py-1.5 text-center text-muted-foreground">{it.qty}</td>
                  <td className="py-1.5 text-right text-muted-foreground">${it.unitPrice.toLocaleString()}</td>
                  <td className="py-1.5 text-right font-medium text-foreground">${it.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex justify-end">
            <div className="w-56 space-y-1 text-[12px]">
              <SumRow label="Subtotal" value={subtotal} />
              <SumRow label="Discount" value={-invoice.discount} />
              <SumRow label="Tax (VAT)" value={0} />
              <div className="my-1 border-t border-border/40" />
              <SumRow label="Total" value={subtotal - invoice.discount} bold />
              <SumRow label="Paid" value={invoice.paid} tone="green" />
              <SumRow label="Balance Due" value={invoice.balance} tone="red" bold />
            </div>
          </div>
        </div>

        {/* Footer / signature */}
        <div className="grid grid-cols-2 gap-6 border-t border-border/40 px-8 py-6">
          <div className="text-center">
            <div className="h-10 border-b border-foreground/30" />
            <p className="mt-1 text-[10px] text-muted-foreground">Authorized Signature</p>
          </div>
          <div className="text-center">
            <div className="h-10 border-b border-foreground/30" />
            <p className="mt-1 text-[10px] text-muted-foreground">School Seal</p>
          </div>
        </div>
        <div className="bg-muted/30 px-8 py-3 text-center text-[10px] text-muted-foreground">
          This is a computer-generated invoice. Contact the accounts office for any discrepancies.
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-32 shrink-0 text-muted-foreground">{label}:</span>
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
