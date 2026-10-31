import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/api/types/teachers";

const STATUS_OPTIONS = ["active", "on leave", "inactive", "resigned", "terminated"];

export interface TeachersFilters {
  search: string;
  filterDept: string;
  filterSubject: string;
  filterStatus: string;
  filterGender: string;
  filterEmpType: string;
}

export function TeachersToolbar({
  departmentOptions,
  subjectOptions,
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
}: {
  departmentOptions: string[];
  subjectOptions: string[];
  filters: TeachersFilters;
  onFiltersChange: (next: Partial<TeachersFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      searchPlaceholder="Search name, ID, email, subject…"
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.filterDept}
            onChange={(v) => onFiltersChange({ filterDept: v })}
            className="w-40"
            options={[{ value: "all", label: "All departments" }, ...departmentOptions.map((d) => ({ value: d, label: d }))]}
          />
          <PremiumSelect
            value={filters.filterSubject}
            onChange={(v) => onFiltersChange({ filterSubject: v })}
            className="w-40"
            options={[{ value: "all", label: "All subjects" }, ...subjectOptions.map((s) => ({ value: s, label: s }))]}
          />
          <PremiumSelect
            value={filters.filterStatus}
            onChange={(v) => onFiltersChange({ filterStatus: v })}
            className="w-36"
            options={[{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          />
          <PremiumSelect
            value={filters.filterGender}
            onChange={(v) => onFiltersChange({ filterGender: v })}
            className="w-36"
            options={[{ value: "all", label: "All genders" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
          />
          <PremiumSelect
            value={filters.filterEmpType}
            onChange={(v) => onFiltersChange({ filterEmpType: v })}
            className="w-40"
            options={[{ value: "all", label: "All types" }, ...EMPLOYMENT_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))]}
          />
        </>
      }
    />
  );
}
