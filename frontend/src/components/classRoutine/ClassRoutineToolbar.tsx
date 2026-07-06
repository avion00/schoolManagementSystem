import { Download, Plus, Printer, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input }  from "@/components/ui/input";
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
    <select value={value} onChange={(e) => onChange(k, e.target.value)}
      className="h-8 rounded-md border border-input bg-background px-2 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
      <option value="">{placeholder}</option>
      {opts.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function ClassRoutineToolbar({ filters, onChange, onClear, onAdd, onPrint, resultCount }: Props) {
  const hasFilter = Object.values(filters).some(Boolean);

  return (
    <div className="rounded-xl border border-border/60 bg-card shadow-sm p-3 space-y-2">
      {/* top row: search + add + print */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
            placeholder="Search class, subject, teacher, room…"
            className="h-8 pl-8 text-[12px]" />
        </div>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px]" onClick={onPrint}>
          <Printer className="h-3.5 w-3.5" />Print
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-[11px]">
          <Download className="h-3.5 w-3.5" />Export
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-[11px]" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />Add Routine
        </Button>
      </div>

      {/* filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <Sel k="year"      value={filters.year}      opts={ACADEMIC_YEAR_OPTIONS} placeholder="All Years"     onChange={onChange} />
        <Sel k="className" value={filters.className}  opts={CLASS_OPTIONS}         placeholder="All Classes"   onChange={onChange} />
        <Sel k="section"   value={filters.section}    opts={SECTION_OPTIONS}       placeholder="All Sections"  onChange={onChange} />
        <Sel k="day"       value={filters.day}        opts={SCHOOL_DAYS}           placeholder="All Days"      onChange={onChange} />
        <Sel k="shift"     value={filters.shift}      opts={SHIFT_OPTIONS}         placeholder="All Shifts"    onChange={onChange} />
        <Sel k="teacher"   value={filters.teacher}    opts={TEACHER_OPTIONS}       placeholder="All Teachers"  onChange={onChange} />
        <Sel k="subject"   value={filters.subject}    opts={SUBJECT_OPTIONS}       placeholder="All Subjects"  onChange={onChange} />
        <Sel k="status"    value={filters.status}     opts={STATUS_OPTIONS}        placeholder="All Statuses"  onChange={onChange} />
        {hasFilter && (
          <Button size="sm" variant="ghost" className="h-8 gap-1 text-[11px] text-muted-foreground" onClick={onClear}>
            <X className="h-3 w-3" />Clear
          </Button>
        )}
        <span className="ml-auto text-[11px] text-muted-foreground shrink-0">{resultCount} entries</span>
      </div>
    </div>
  );
}
