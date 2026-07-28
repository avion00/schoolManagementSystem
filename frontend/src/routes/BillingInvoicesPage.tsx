import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { InvoiceForm, type InvoiceFormData } from "@/components/billing/forms/InvoiceForm";
import { PaymentForm, type PaymentFormData } from "@/components/billing/forms/PaymentForm";
import { InvoicesSummaryCards } from "@/components/billing/InvoicesSummaryCards";
import { InvoicesTable, type InvoiceAction } from "@/components/billing/InvoicesTable";
import { InvoicesToolbar, type InvoicesFilters } from "@/components/billing/InvoicesToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { INVOICES, type Invoice } from "@/data/billingData";

const PAGE_SIZE = 10;
type SortField = "invoiceNo" | "studentName" | "issueDate" | "dueDate" | "amount" | "balance" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: InvoicesFilters = { search: "", status: "all", className: "all" };

export function BillingInvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES);
  const [filters, setFilters] = useState<InvoicesFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  function updateFilters(next: Partial<InvoicesFilters>) {
    setFilters((f) => ({ ...f, ...next }));
    setPage(1);
  }
  function resetFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }
  function handleSort(field: string) {
    const f = field as SortField;
    if (sortField === f) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(f); setSortDir("asc"); }
    setPage(1);
  }

  const hasActiveFilter = !!filters.search || filters.status !== "all" || filters.className !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (filters.status !== "all" && inv.status !== filters.status) return false;
      if (filters.className !== "all" && inv.className !== filters.className) return false;
      if (q && !`${inv.invoiceNo} ${inv.studentName} ${inv.parentName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [invoices, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av: string | number = a[sortField] ?? "";
      const bv: string | number = b[sortField] ?? "";
      if (typeof av === "number" && typeof bv === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated: Invoice[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
      <PageHeader
        title={
          <>
            {sorted.length} invoice{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {invoices.length} total)</span>
            )}
          </>
        }
        description="Manage fee invoices, payments, and balances."
        actions={
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" /> Create Invoice
          </Button>
        }
      />

      <InvoicesSummaryCards invoices={invoices} />

      <InvoicesToolbar filters={filters} onFiltersChange={updateFilters} hasActiveFilter={hasActiveFilter} onReset={resetFilters} />

      <InvoicesTable
        invoices={paginated}
        onAction={handleAction}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "invoices" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
      />

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
