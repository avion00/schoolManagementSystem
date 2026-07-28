import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { PAYROLL_STATUS_OPTIONS } from "@/data/billingData";

export interface PayrollFilters {
  search: string;
  status: string;
}

export function PayrollToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
}: {
  filters: PayrollFilters;
  onFiltersChange: (next: Partial<PayrollFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search by employee ID, name, role…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <PremiumSelect
          value={filters.status}
          onChange={(v) => onFiltersChange({ status: v })}
          className="w-36"
          options={[{ value: "all", label: "All statuses" }, ...PAYROLL_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
        />
      }
    />
  );
}
