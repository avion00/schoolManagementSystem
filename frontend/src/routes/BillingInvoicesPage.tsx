import { useMemo, useState } from "react";
import { Plus, RotateCcw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { InvoiceForm, type InvoiceFormData } from "@/components/billing/forms/InvoiceForm";
import { PaymentForm, type PaymentFormData } from "@/components/billing/forms/PaymentForm";
import { InvoicesTable, type InvoiceAction } from "@/components/billing/InvoicesTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CLASS_OPTIONS, INVOICES, INVOICE_STATUS_OPTIONS, type Invoice,
} from "@/data/billingData";

const selectClass = "h-8 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

export function BillingInvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [className, setClassName] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (status !== "all" && inv.status !== status) return false;
      if (className !== "all" && inv.className !== className) return false;
      if (q && !`${inv.invoiceNo} ${inv.studentName} ${inv.parentName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [invoices, search, status, className]);

  function handleAction(inv: Invoice, action: InvoiceAction) {
    switch (action) {
      case "view": navigate(`/billing/invoices/${inv.id}`); break;
      case "edit": toast.info(`Editing ${inv.invoiceNo} — coming soon.`); break;
      case "record-payment": setPaymentInvoice(inv); break;
      case "print": navigate(`/billing/invoices/${inv.id}`); break;
      case "download": toast.success(`Downloaded ${inv.invoiceNo}.`); break;
      case "cancel":
        setInvoices((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: "Cancelled" } : i)));
        console.log("Cancelled invoice:", inv.invoiceNo);
        toast.success(`${inv.invoiceNo} cancelled.`);
        break;
    }
  }

  function handleCreate(data: InvoiceFormData) {
    console.log("Created invoice:", data);
    toast.success("Invoice created successfully.");
    setCreateOpen(false);
  }

  function handleRecordPayment(data: PaymentFormData) {
    console.log("Recorded payment:", data);
    if (paymentInvoice) {
      setInvoices((prev) => prev.map((i) => {
        if (i.id !== paymentInvoice.id) return i;
        const paid = i.paid + Number(data.amount);
        const balance = Math.max(0, i.amount - i.discount - paid);
        return { ...i, paid, balance, status: balance === 0 ? "Paid" : "Partially Paid", paymentMethod: data.method || i.paymentMethod };
      }));
    }
    toast.success("Payment recorded successfully.");
    setPaymentInvoice(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by invoice no, student, or parent..."
              className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => { setSearch(""); setStatus("all"); setClassName("all"); }}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => setCreateOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Create Invoice
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
            <option value="all">All Statuses</option>
            {INVOICE_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={className} onChange={(e) => setClassName(e.target.value)} className={selectClass}>
            <option value="all">All Classes</option>
            {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="ml-auto text-[11.5px] text-muted-foreground">{filtered.length} invoices</span>
        </div>
      </div>

      <InvoicesTable invoices={filtered} onAction={handleAction} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Generate a new fee invoice for a student.</DialogDescription>
          </DialogHeader>
          <InvoiceForm onCancel={() => setCreateOpen(false)} onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentInvoice} onOpenChange={(o) => !o && setPaymentInvoice(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>{paymentInvoice && `${paymentInvoice.invoiceNo} — balance $${paymentInvoice.balance.toLocaleString()}`}</DialogDescription>
          </DialogHeader>
          {paymentInvoice && (
            <PaymentForm defaultInvoiceId={paymentInvoice.id} onCancel={() => setPaymentInvoice(null)} onSubmit={handleRecordPayment} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
