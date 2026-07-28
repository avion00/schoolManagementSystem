import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { VendorsSummaryCards } from "@/components/billing/VendorsSummaryCards";
import { VendorsTable } from "@/components/billing/VendorsTable";
import { VendorsToolbar, type VendorsFilters } from "@/components/billing/VendorsToolbar";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { VENDORS } from "@/data/billingData";

const PAGE_SIZE = 10;
type SortField = "vendorId" | "vendorName" | "category" | "totalPurchases" | "outstandingBalance" | "status";
type SortDir = "asc" | "desc";

const EMPTY_FILTERS: VendorsFilters = { search: "", category: "all" };

export function BillingVendorsPage() {
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
      if (q && !`${v.vendorId} ${v.vendorName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filters]);

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
        actions={
          <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={() => toast.info("Add vendor form — coming soon.")}>
            <Plus className="h-4 w-4" /> Add Vendor
          </Button>
        }
      />

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
      />
    </div>
  );
}
