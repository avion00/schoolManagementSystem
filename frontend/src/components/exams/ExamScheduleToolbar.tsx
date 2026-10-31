import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import { EXAM_TYPE_OPTIONS, EXAM_STATUS_OPTIONS } from "@/api/types/exams";

export interface ScheduleFilters {
  search:    string;
  term:      string;
  className: string;
  type:      string;
  status:    string;
  year:      string;
}

interface Props {
  filters:      ScheduleFilters;
  onChange:     (key: keyof ScheduleFilters, value: string) => void;
  onClear:      () => void;
  hasActiveFilter: boolean;
  /** Choices present in the data. */
  options: { terms: string[]; classes: string[]; years: string[] };
}

export function ExamScheduleToolbar({ filters, onChange, onClear, hasActiveFilter, options }: Props) {
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
            options={[{ value: "", label: "All terms" }, ...options.terms.map((t) => ({ value: t, label: t }))]}
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
            options={[{ value: "", label: "All classes" }, ...options.classes.map((c) => ({ value: c, label: c }))]}
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
            options={[{ value: "", label: "All years" }, ...options.years.map((y) => ({ value: y, label: y }))]}
          />
        </>
      }
    />
  );
}
