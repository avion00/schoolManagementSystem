import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { STATUS_OPTIONS } from "@/api/types/parents";

export interface ParentsFilters {
  search: string;
  filterOcc: string;
  filterGender: string;
  filterStatus: string;
  filterClass: string;
  filterSection: string;
}

export function ParentsToolbar({
  occupationOptions,
  classOptions,
  sectionOptions,
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
}: {
  occupationOptions: string[];
  classOptions: string[];
  sectionOptions: string[];
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
            options={[{ value: "all", label: "All occupations" }, ...occupationOptions.map((o) => ({ value: o, label: o }))]}
          />
          <PremiumSelect
            value={filters.filterClass}
            onChange={(v) => onFiltersChange({ filterClass: v, filterSection: "all" })}
            className="w-40"
            options={[{ value: "all", label: "Child: All classes" }, ...classOptions.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={filters.filterSection}
            onChange={(v) => onFiltersChange({ filterSection: v })}
            className="w-36"
            options={[{ value: "all", label: "All sections" }, ...sectionOptions.map((s) => ({ value: s, label: `Section ${s}` }))]}
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
