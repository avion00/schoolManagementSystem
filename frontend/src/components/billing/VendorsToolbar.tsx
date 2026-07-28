import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { VENDOR_CATEGORY_OPTIONS } from "@/data/billingData";

export interface VendorsFilters {
  search: string;
  category: string;
}

export function VendorsToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
}: {
  filters: VendorsFilters;
  onFiltersChange: (next: Partial<VendorsFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search by vendor ID or name…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <PremiumSelect
          value={filters.category}
          onChange={(v) => onFiltersChange({ category: v })}
          className="w-48"
          options={[{ value: "all", label: "All categories" }, ...VENDOR_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))]}
        />
      }
    />
  );
}
