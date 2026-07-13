import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { CLASS_OPTIONS, SECTION_OPTIONS, STATUS_OPTIONS } from "@/data/studentsData";

export interface StudentsFilters {
  search: string;
  filterClass: string;
  filterSection: string;
  filterStatus: string;
  filterGender: string;
}

export function StudentsToolbar({
  filters,
  onFiltersChange,
  hasActiveFilter,
  onReset,
  showColumnsMenu = false,
  hiddenColumns,
  onToggleColumn,
}: {
  filters: StudentsFilters;
  onFiltersChange: (next: Partial<StudentsFilters>) => void;
  hasActiveFilter: boolean;
  onReset: () => void;
  showColumnsMenu?: boolean;
  hiddenColumns?: Set<string>;
  onToggleColumn?: (key: string) => void;
}) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onFiltersChange({ search: v })}
      hasActiveFilter={hasActiveFilter}
      onReset={onReset}
      filters={
        <>
          <PremiumSelect
            value={filters.filterClass}
            onChange={(v) => onFiltersChange({ filterClass: v, filterSection: "all" })}
            className="w-40"
            options={[{ value: "all", label: "All classes" }, ...CLASS_OPTIONS.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={filters.filterSection}
            onChange={(v) => onFiltersChange({ filterSection: v })}
            className="w-40"
            options={[{ value: "all", label: "All sections" }, ...SECTION_OPTIONS.map((s) => ({ value: s, label: `Section ${s}` }))]}
          />
          <PremiumSelect
            value={filters.filterStatus}
            onChange={(v) => onFiltersChange({ filterStatus: v })}
            className="w-40"
            options={[{ value: "all", label: "All statuses" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          />
          <PremiumSelect
            value={filters.filterGender}
            onChange={(v) => onFiltersChange({ filterGender: v })}
            className="w-36"
            options={[{ value: "all", label: "All genders" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
          />
        </>
      }
      trailing={
        showColumnsMenu && hiddenColumns && onToggleColumn ? (
          <PremiumDropdownMenu
            trigger={<Button variant="outline" size="sm" className="h-11 gap-1.5 rounded-xl text-[12.5px]"><Settings2 className="h-3.5 w-3.5" /> Columns</Button>}
            items={[
              { heading: "Toggle columns" },
              { label: hiddenColumns.has("section") ? "Show Section" : "Hide Section", onClick: () => onToggleColumn("section") },
              { label: hiddenColumns.has("guardian") ? "Show Guardian" : "Hide Guardian", onClick: () => onToggleColumn("guardian") },
              { label: hiddenColumns.has("mobile") ? "Show Mobile" : "Hide Mobile", onClick: () => onToggleColumn("mobile") },
            ]}
          />
        ) : undefined
      }
    />
  );
}
