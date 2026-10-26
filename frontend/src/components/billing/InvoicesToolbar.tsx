import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { INVOICE_STATUS_OPTIONS } from "@/api/types/billing";

export interface InvoicesFilters {
  search: string;
  status: string;
  className: string;
}

export function InvoicesToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
  classes,
}: {
  filters: InvoicesFilters;
  onFiltersChange: (next: Partial<InvoicesFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
  classes: string[];
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search by invoice no, student, or parent…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.status}
            onChange={(v) => onFiltersChange({ status: v })}
            className="w-40"
            options={[{ value: "all", label: "All statuses" }, ...INVOICE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
          />
          <PremiumSelect
            value={filters.className}
            onChange={(v) => onFiltersChange({ className: v })}
            className="w-40"
            options={[{ value: "all", label: "All classes" }, ...classes.map((c) => ({ value: c, label: c }))]}
          />
        </>
      }
    />
  );
}
