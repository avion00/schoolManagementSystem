import { useMemo, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { GenerateInvoicesForm } from "@/components/billing/forms/GenerateInvoicesForm";
import { InvoiceForm } from "@/components/billing/forms/InvoiceForm";
import { PaymentForm } from "@/components/billing/forms/PaymentForm";
import { InvoicesSummaryCards } from "@/components/billing/InvoicesSummaryCards";
import { InvoicesTable, type InvoiceAction } from "@/components/billing/InvoicesTable";
import { InvoicesToolbar, type InvoicesFilters } from "@/components/billing/InvoicesToolbar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import type { Invoice } from "@/api/types/billing";
import { useCancelInvoice, useInvoices, useMoney } from "@/api/billing";
import { errorMessage } from "@/api/http";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 10;
type SortField = "invoiceNo" | "studentName" | "issueDate" | "dueDate" | "amount" | "balance" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: InvoicesFilters = { search: "", status: "all", className: "all" };

export function BillingInvoicesPage() {
  const money = useMoney();
  const navigate = useNavigate();
  const query = useInvoices();
  const invoices = useMemo(() => query.data ?? [], [query.data]);
  const cancel = useCancelInvoice();
  const { hasPermission } = useAuth();
  const [generateOpen, setGenerateOpen] = useState(false);
  const classes = useMemo(() => Array.from(new Set(invoices.map((i) => i.className))), [invoices]);
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
      if (q && !`${inv.invoiceNo} ${inv.studentName} ${inv.admissionNo}`.toLowerCase().includes(q)) return false;
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
      case "view": case "print": navigate(`/billing/invoices/${inv.id}`); break;
      case "record-payment": setPaymentInvoice(inv); break;
      case "cancel": {
        const reason = window.prompt(`Cancel ${inv.invoiceNo}? Give a reason (invoices with payments must have them reversed first).`);
        if (!reason?.trim()) return;
        cancel.mutate({ id: inv.id, reason: reason.trim() }, {
          onSuccess: () => toast.success(`${inv.invoiceNo} cancelled.`),
          onError: (e) => toast.error(errorMessage(e)),
        });
        break;
      }
    }
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
          hasPermission("fee.create") ? (<>
            <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-xl" onClick={() => setGenerateOpen(true)}>
              <Layers className="h-4 w-4" /> Bill a Class
            </Button>
            <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Create Invoice
            </Button>
          </>) : undefined
        }
      />

      {query.isError && (
        <PremiumEmptyState title="Couldn't load invoices" description={errorMessage(query.error)}
          action={<Button size="sm" variant="outline" onClick={() => query.refetch()}>Try again</Button>} />
      )}
      {query.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {query.isSuccess && (<>
      <InvoicesSummaryCards invoices={invoices} />

      <InvoicesToolbar filters={filters} onFiltersChange={updateFilters} hasActiveFilter={hasActiveFilter} onReset={resetFilters} classes={classes} />

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
        canCollect={hasPermission("fee.collect")}
        canCancel={hasPermission("fee.create")}
      />
      </>)}

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bill a Class</DialogTitle>
            <DialogDescription>Create invoices for every active student from the fee structures.</DialogDescription>
          </DialogHeader>
          <GenerateInvoicesForm onCancel={() => setGenerateOpen(false)} onSaved={() => setGenerateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>A one-off invoice for a single student.</DialogDescription>
          </DialogHeader>
          <InvoiceForm onCancel={() => setCreateOpen(false)} onSaved={(id) => { setCreateOpen(false); navigate(`/billing/invoices/${id}`); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentInvoice} onOpenChange={(o) => !o && setPaymentInvoice(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>{paymentInvoice && `${paymentInvoice.invoiceNo} — balance ${money(paymentInvoice.balance)}`}</DialogDescription>
          </DialogHeader>
          {paymentInvoice && (
            <PaymentForm defaultInvoiceId={paymentInvoice.id} onCancel={() => setPaymentInvoice(null)}
              onSaved={(id) => { setPaymentInvoice(null); navigate(`/billing/receipts/${id}`); }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
