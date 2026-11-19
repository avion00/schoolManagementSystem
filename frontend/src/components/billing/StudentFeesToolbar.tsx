import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { FEE_STATUS_OPTIONS } from "@/api/types/billing";

export interface StudentFeesFilters {
  search: string;
  className: string;
  section: string;
  status: string;
}

export function StudentFeesToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
  sections,
  classes,
}: {
  filters: StudentFeesFilters;
  onFiltersChange: (next: Partial<StudentFeesFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
  sections: string[];
  classes: string[];
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search by student, admission no, registration no…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.className}
            onChange={(v) => onFiltersChange({ className: v })}
            className="w-40"
            options={[{ value: "all", label: "All classes" }, ...classes.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={filters.section}
            onChange={(v) => onFiltersChange({ section: v })}
            className="w-36"
            options={[{ value: "all", label: "All sections" }, ...sections.map((s) => ({ value: s, label: `Section ${s}` }))]}
          />
          <PremiumSelect
            value={filters.status}
            onChange={(v) => onFiltersChange({ status: v })}
            className="w-36"
            options={[{ value: "all", label: "All statuses" }, ...FEE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
          />
        </>
      }
    />
  );
}
