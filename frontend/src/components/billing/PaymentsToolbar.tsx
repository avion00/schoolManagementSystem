import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS_OPTIONS } from "@/data/billingData";

export interface PaymentsFilters {
  search: string;
  method: string;
  status: string;
}

export function PaymentsToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
}: {
  filters: PaymentsFilters;
  onFiltersChange: (next: Partial<PaymentsFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search by payment ID, invoice, student…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.method}
            onChange={(v) => onFiltersChange({ method: v })}
            className="w-44"
            options={[{ value: "all", label: "All methods" }, ...PAYMENT_METHOD_OPTIONS.map((m) => ({ value: m, label: m }))]}
          />
          <PremiumSelect
            value={filters.status}
            onChange={(v) => onFiltersChange({ status: v })}
            className="w-40"
            options={[{ value: "all", label: "All statuses" }, ...PAYMENT_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
          />
        </>
      }
    />
  );
}
