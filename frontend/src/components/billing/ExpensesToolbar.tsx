import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { EXPENSE_CATEGORY_OPTIONS, EXPENSE_STATUS_OPTIONS, PAYMENT_METHOD_OPTIONS } from "@/api/types/billing";

export interface ExpensesFilters {
  search: string;
  category: string;
  method: string;
  status: string;
}

export function ExpensesToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
}: {
  filters: ExpensesFilters;
  onFiltersChange: (next: Partial<ExpensesFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search by expense ID, vendor, category…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.category}
            onChange={(v) => onFiltersChange({ category: v })}
            className="w-48"
            options={[{ value: "all", label: "All categories" }, ...EXPENSE_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={filters.method}
            onChange={(v) => onFiltersChange({ method: v })}
            className="w-44"
            options={[{ value: "all", label: "All payment methods" }, ...PAYMENT_METHOD_OPTIONS.map((m) => ({ value: m, label: m }))]}
          />
          <PremiumSelect
            value={filters.status}
            onChange={(v) => onFiltersChange({ status: v })}
            className="w-36"
            options={[{ value: "all", label: "All statuses" }, ...EXPENSE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
          />
        </>
      }
    />
  );
}
