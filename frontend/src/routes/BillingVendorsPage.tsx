import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { VendorsSummaryCards } from "@/components/billing/VendorsSummaryCards";
import { VendorsTable } from "@/components/billing/VendorsTable";
import { VendorsToolbar, type VendorsFilters } from "@/components/billing/VendorsToolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { PremiumSkeleton } from "@/components/ui/PremiumSkeleton";
import { VendorForm } from "@/components/billing/forms/VendorForm";
import { useDeleteVendor, useVendors } from "@/api/billing";
import { errorMessage } from "@/api/http";
import type { Vendor } from "@/api/types/billing";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 10;
type SortField = "vendorId" | "vendorName" | "category" | "totalPurchases" | "outstandingBalance" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: VendorsFilters = { search: "", category: "all" };

export function BillingVendorsPage() {
  const query = useVendors();
  const VENDORS = useMemo(() => query.data ?? [], [query.data]);
  const remove = useDeleteVendor();
  const { hasPermission } = useAuth();
  const canManage = hasPermission("finance.expense.manage");
  const [form, setForm] = useState<{ open: boolean; vendor?: Vendor }>({ open: false });
  const [filters, setFilters] = useState<VendorsFilters>(EMPTY_FILTERS);
  const [sortField, setSortField] = useState<SortField>("vendorName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  function updateFilters(next: Partial<VendorsFilters>) {
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

  const hasActiveFilter = !!filters.search || filters.category !== "all";

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return VENDORS.filter((v) => {
      if (filters.category !== "all" && v.category !== filters.category) return false;
      if (q && !`${v.vendorId} ${v.vendorName} ${v.contactPerson} ${v.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filters, VENDORS]);

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
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <>
            {sorted.length} vendor{sorted.length !== 1 ? "s" : ""}{" "}
            {hasActiveFilter && (
              <span className="text-base font-normal text-muted-foreground">(filtered from {VENDORS.length} total)</span>
            )}
          </>
        }
        description="Manage suppliers and vendor accounts."
        actions={canManage ? (
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => setForm({ open: true })}>
            <Plus className="h-4 w-4" /> Add Vendor
          </Button>
        ) : undefined}
      />

      {query.isError && (
        <PremiumEmptyState title="Couldn't load vendors" description={errorMessage(query.error)}
          action={<Button size="sm" variant="outline" onClick={() => query.refetch()}>Try again</Button>} />
      )}
      {query.isLoading && <PremiumSkeleton className="h-72 w-full rounded-2xl" />}
      {query.isSuccess && (<>
      <VendorsSummaryCards vendors={VENDORS} />

      <VendorsToolbar filters={filters} onFiltersChange={updateFilters} hasActiveFilter={hasActiveFilter} onReset={resetFilters} />

      <VendorsTable
        vendors={paginated}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        selected={selected}
        onSelectionChange={setSelected}
        pagination={{ page: safePage, pageSize: PAGE_SIZE, total: sorted.length, onPage: (p) => { setPage(p); setSelected(new Set()); }, itemLabel: "vendors" }}
        hasActiveFilter={hasActiveFilter}
        onResetFilters={resetFilters}
        onEdit={canManage ? (v) => setForm({ open: true, vendor: v }) : undefined}
        onDelete={canManage ? (v) => {
          if (!window.confirm(`Delete vendor ${v.vendorName}?`)) return;
          remove.mutate(v.id, { onSuccess: () => toast.success("Vendor deleted."), onError: (e) => toast.error(errorMessage(e)) });
        } : undefined}
      />
      </>)}

      <Dialog open={form.open} onOpenChange={(o) => !o && setForm({ open: false })}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.vendor ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
            <DialogDescription>{form.vendor?.vendorId ?? "A supplier the school buys from."}</DialogDescription>
          </DialogHeader>
          <VendorForm key={form.vendor?.id ?? "new"} vendor={form.vendor} onCancel={() => setForm({ open: false })} onSaved={() => setForm({ open: false })} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
