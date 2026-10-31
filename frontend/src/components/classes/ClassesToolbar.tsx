import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
const MEDIUM_OPTIONS = ["English", "Nepali", "Bilingual"];
const SHIFT_OPTIONS = ["Morning", "Day", "Evening"];
const STATUS_OPTIONS = ["active", "inactive", "suspended"];

export interface ClassesFilters {
  search: string;
  filterYear: string;
  filterMedium: string;
  filterShift: string;
  filterStatus: string;
}

export function ClassesToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
  yearOptions,
}: {
  yearOptions: string[];
  filters: ClassesFilters;
  onFiltersChange: (next: Partial<ClassesFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search class, teacher, room, section…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.filterYear}
            onChange={(v) => onFiltersChange({ filterYear: v })}
            className="w-36"
            options={[{ value: "all", label: "Year: All" }, ...yearOptions.map((y) => ({ value: y, label: y }))]}
          />
          <PremiumSelect
            value={filters.filterMedium}
            onChange={(v) => onFiltersChange({ filterMedium: v })}
            className="w-40"
            options={[{ value: "all", label: "Medium: All" }, ...MEDIUM_OPTIONS.map((m) => ({ value: m, label: m }))]}
          />
          <PremiumSelect
            value={filters.filterShift}
            onChange={(v) => onFiltersChange({ filterShift: v })}
            className="w-36"
            options={[{ value: "all", label: "Shift: All" }, ...SHIFT_OPTIONS.map((s) => ({ value: s, label: s }))]}
          />
          <PremiumSelect
            value={filters.filterStatus}
            onChange={(v) => onFiltersChange({ filterStatus: v })}
            className="w-40"
            options={[{ value: "all", label: "Status: All" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          />
        </>
      }
    />
  );
}
