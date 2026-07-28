import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { CLASS_OPTIONS, OCCUPATION_OPTIONS, SECTION_OPTIONS, STATUS_OPTIONS } from "@/data/parentsData";

export interface ParentsFilters {
  search: string;
  filterOcc: string;
  filterGender: string;
  filterStatus: string;
  filterClass: string;
  filterSection: string;
}

export function ParentsToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
}: {
  filters: ParentsFilters;
  onFiltersChange: (next: Partial<ParentsFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search name, parent ID, phone, email, child…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.filterOcc}
            onChange={(v) => onFiltersChange({ filterOcc: v })}
            className="w-40"
            options={[{ value: "all", label: "All occupations" }, ...OCCUPATION_OPTIONS.map((o) => ({ value: o, label: o }))]}
          />
          <PremiumSelect
            value={filters.filterClass}
            onChange={(v) => onFiltersChange({ filterClass: v, filterSection: "all" })}
            className="w-40"
            options={[{ value: "all", label: "Child: All classes" }, ...CLASS_OPTIONS.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={filters.filterSection}
            onChange={(v) => onFiltersChange({ filterSection: v })}
            className="w-36"
            options={[{ value: "all", label: "All sections" }, ...SECTION_OPTIONS.map((s) => ({ value: s, label: `Section ${s}` }))]}
          />
          <PremiumSelect
            value={filters.filterGender}
            onChange={(v) => onFiltersChange({ filterGender: v })}
            className="w-36"
            options={[{ value: "all", label: "All genders" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
          />
          <PremiumSelect
            value={filters.filterStatus}
            onChange={(v) => onFiltersChange({ filterStatus: v })}
            className="w-36"
            options={[{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          />
        </>
      }
    />
  );
}
