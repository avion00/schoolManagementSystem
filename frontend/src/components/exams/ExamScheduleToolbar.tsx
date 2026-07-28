import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import {
  EXAM_TERM_OPTIONS, EXAM_TYPE_OPTIONS, EXAM_STATUS_OPTIONS,
  CLASS_OPTIONS, SECTION_OPTIONS, ACADEMIC_YEAR_OPTIONS,
} from "@/data/examsData";

export interface ScheduleFilters {
  search:    string;
  term:      string;
  className: string;
  section:   string;
  type:      string;
  status:    string;
  year:      string;
}

interface Props {
  filters:      ScheduleFilters;
  onChange:     (key: keyof ScheduleFilters, value: string) => void;
  onClear:      () => void;
  hasActiveFilter: boolean;
}

export function ExamScheduleToolbar({ filters, onChange, onClear, hasActiveFilter }: Props) {
  return (
    <PremiumTableToolbar
      search={filters.search}
      onSearchChange={(v) => onChange("search", v)}
      searchPlaceholder="Search exam, subject, room…"
      hasActiveFilter={hasActiveFilter}
      onReset={onClear}
      filters={
        <>
          <PremiumSelect
            value={filters.term}
            onChange={(v) => onChange("term", v)}
            className="w-36"
            options={[{ value: "", label: "All terms" }, ...EXAM_TERM_OPTIONS.map((t) => ({ value: t, label: t }))]}
          />
          <PremiumSelect
            value={filters.type}
            onChange={(v) => onChange("type", v)}
            className="w-40"
            options={[{ value: "", label: "All types" }, ...EXAM_TYPE_OPTIONS.map((t) => ({ value: t, label: t }))]}
          />
          <PremiumSelect
            value={filters.className}
            onChange={(v) => onChange("className", v)}
            className="w-36"
            options={[{ value: "", label: "All classes" }, ...CLASS_OPTIONS.map((c) => ({ value: c, label: c }))]}
          />
          <PremiumSelect
            value={filters.section}
            onChange={(v) => onChange("section", v)}
            className="w-36"
            options={[{ value: "", label: "All sections" }, ...SECTION_OPTIONS.map((s) => ({ value: s, label: `Section ${s}` }))]}
          />
          <PremiumSelect
            value={filters.status}
            onChange={(v) => onChange("status", v)}
            className="w-36"
            options={[{ value: "", label: "All status" }, ...EXAM_STATUS_OPTIONS.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))]}
          />
          <PremiumSelect
            value={filters.year}
            onChange={(v) => onChange("year", v)}
            className="w-32"
            options={[{ value: "", label: "All years" }, ...ACADEMIC_YEAR_OPTIONS.map((y) => ({ value: y, label: y }))]}
          />
        </>
      }
    />
  );
}
