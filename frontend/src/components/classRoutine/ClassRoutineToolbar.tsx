import { Download, Plus, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PremiumSearchInput } from "@/components/ui/PremiumSearchInput";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  ACADEMIC_YEAR_OPTIONS, CLASS_OPTIONS, SCHOOL_DAYS, SECTION_OPTIONS,
  SHIFT_OPTIONS, STATUS_OPTIONS, SUBJECT_OPTIONS, TEACHER_OPTIONS,
} from "@/data/classRoutineData";

export interface RoutineFilters {
  search:    string;
  className: string;
  section:   string;
  day:       string;
  teacher:   string;
  subject:   string;
  shift:     string;
  status:    string;
  year:      string;
}

interface Props {
  filters:    RoutineFilters;
  onChange:   (key: keyof RoutineFilters, value: string) => void;
  onClear:    () => void;
  onAdd:      () => void;
  onPrint:    () => void;
  resultCount: number;
}

function Sel({ k, value, opts, placeholder, onChange }: {
  k: keyof RoutineFilters; value: string; opts: readonly string[];
  placeholder: string; onChange: (k: keyof RoutineFilters, v: string) => void;
}) {
  return (
    <PremiumSelect
      value={value}
      onChange={(v) => onChange(k, v)}
      className="w-36"
      options={[{ value: "", label: placeholder }, ...opts.map((o) => ({ value: o, label: o }))]}
    />
  );
}

export function ClassRoutineToolbar({ filters, onChange, onClear, onAdd, onPrint, resultCount }: Props) {
  const hasFilter = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-2.5">
      {/* top row: search + add + print */}
      <div className="flex flex-wrap items-center gap-2.5">
        <PremiumSearchInput
          value={filters.search}
          onChange={(v) => onChange("search", v)}
          placeholder="Search class, subject, teacher, room…"
          className="min-w-[220px] flex-1 sm:max-w-sm"
        />
        <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-xl" onClick={onPrint}>
          <Printer className="h-3.5 w-3.5" />Print
        </Button>
        <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-xl">
          <Download className="h-3.5 w-3.5" />Export
        </Button>
        <Button size="sm" className="h-9 gap-1.5 rounded-xl" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />Add Routine
        </Button>
      </div>

      {/* filter row */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Sel k="year"      value={filters.year}      opts={ACADEMIC_YEAR_OPTIONS} placeholder="All Years"     onChange={onChange} />
        <Sel k="className" value={filters.className}  opts={CLASS_OPTIONS}         placeholder="All Classes"   onChange={onChange} />
        <Sel k="section"   value={filters.section}    opts={SECTION_OPTIONS}       placeholder="All Sections"  onChange={onChange} />
        <Sel k="day"       value={filters.day}        opts={SCHOOL_DAYS}           placeholder="All Days"      onChange={onChange} />
        <Sel k="shift"     value={filters.shift}      opts={SHIFT_OPTIONS}         placeholder="All Shifts"    onChange={onChange} />
        <Sel k="teacher"   value={filters.teacher}    opts={TEACHER_OPTIONS}       placeholder="All Teachers"  onChange={onChange} />
        <Sel k="subject"   value={filters.subject}    opts={SUBJECT_OPTIONS}       placeholder="All Subjects"  onChange={onChange} />
        <Sel k="status"    value={filters.status}     opts={STATUS_OPTIONS}        placeholder="All Statuses"  onChange={onChange} />
        {hasFilter && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={onClear}>
            Clear
          </Button>
        )}
        <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{resultCount} entries</span>
      </div>
    </div>
  );
}
