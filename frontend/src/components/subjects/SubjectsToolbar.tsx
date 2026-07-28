import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { ACADEMIC_YEAR_OPTIONS, SUBJECT_CATEGORY_OPTIONS, SUBJECT_STATUS_OPTIONS, SUBJECT_TYPE_OPTIONS } from "@/data/subjectsData";

export interface SubjectsFilters {
  search: string;
  filterType: string;
  filterCategory: string;
  filterStatus: string;
  filterYear: string;
}

export function SubjectsToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
}: {
  filters: SubjectsFilters;
  onFiltersChange: (next: Partial<SubjectsFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search subject name or code…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.filterType}
            onChange={(v) => onFiltersChange({ filterType: v })}
            className="w-40"
            options={[{ value: "", label: "All Types" }, ...SUBJECT_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))]}
          />
          <PremiumSelect
            value={filters.filterCategory}
            onChange={(v) => onFiltersChange({ filterCategory: v })}
            className="w-44"
            options={[{ value: "", label: "All Categories" }, ...SUBJECT_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={filters.filterStatus}
            onChange={(v) => onFiltersChange({ filterStatus: v })}
            className="w-40"
            options={[{ value: "", label: "All Statuses" }, ...SUBJECT_STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          />
          <PremiumSelect
            value={filters.filterYear}
            onChange={(v) => onFiltersChange({ filterYear: v })}
            className="w-36"
            options={[{ value: "", label: "All Years" }, ...ACADEMIC_YEAR_OPTIONS.map((y) => ({ value: y, label: y }))]}
          />
        </>
      }
    />
  );
}
