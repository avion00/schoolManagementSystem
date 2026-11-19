import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PaymentsSummaryCards } from "@/components/billing/PaymentsSummaryCards";
import { PaymentsTable, type PaymentAction } from "@/components/billing/PaymentsTable";
import { PaymentsToolbar, type PaymentsFilters } from "@/components/billing/PaymentsToolbar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { usePayments, useReversePayment } from "@/api/billing";
import { errorMessage } from "@/api/http";
import type { Payment } from "@/api/types/billing";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 10;
type SortField = "paymentId" | "studentName" | "amount" | "paymentDate" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: PaymentsFilters = { search: "", method: "all", status: "all" };

export function BillingPaymentsPage() {
  const navigate = useNavigate();
  const query = usePayments();
  const payments = useMemo(() => query.data ?? [], [query.data]);
  const reverse = useReversePayment();
  const { hasPermission } = useAuth();
  const [filters, setFilters] = useState<PaymentsFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("paymentDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  function updateFilters(next: Partial<PaymentsFilters>) {
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

  const hasActiveFilter = !!filters.search || filters.method !== "all" || filters.status !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return payments.filter((p) => {
      if (filters.method !== "all" && p.method !== filters.method) return false;
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (q && !`${p.paymentId} ${p.invoiceNo} ${p.studentName} ${p.transactionId}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [payments, filters]);

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
  const paginated: Payment[] = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleAction(p: Payment, action: PaymentAction) {
    switch (action) {
      case "view-receipt": navigate(`/billing/receipts/${p.id}`); break;
      case "view-invoice": navigate(`/billing/invoices/${p.invoiceId}`); break;
      case "reverse": {
        const reason = window.prompt(`Reverse ${p.paymentId}? The invoice balance goes back up. Give a reason.`);
        if (!reason?.trim()) return;
        reverse.mutate({ id: p.id, reason: reason.trim() }, {
          onSuccess: () => toast.success(`${p.paymentId} reversed.`),
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
            {sorted.length} payment{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {payments.length} total)</span>
            )}
          </>
        }
        description="Track received payments, receipts, and reversals."
      />

      {query.isError && (
        <PremiumEmptyState title="Couldn't load payments" description={errorMessage(query.error)}
          action={<Button size="sm" variant="outline" onClick={() => query.refetch()}>Try again</Button>} />
      )}
      {query.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {query.isSuccess && (<>

      <PaymentsSummaryCards payments={payments} />

      <PaymentsToolbar filters={filters} onFiltersChange={updateFilters} hasActiveFilter={hasActiveFilter} onReset={resetFilters} />

      <PaymentsTable
        payments={paginated}
        onAction={handleAction}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "payments" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
        canReverse={hasPermission("fee.refund")}
      />
      </>)}
    </div>
  );
}
