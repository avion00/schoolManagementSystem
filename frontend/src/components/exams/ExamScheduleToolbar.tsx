import { Download, Plus, Printer, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input  } from "@/components/ui/input";
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
  onAdd:        () => void;
  onPrint:      () => void;
  resultCount:  number;
}

function Sel({ label, value, options, onChg }: {
  label: string; value: string; options: readonly string[]; onChg: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChg(e.target.value)}
      className="h-9 rounded-md border border-input bg-background px-2.5 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring min-w-[130px]"
      aria-label={label}
    >
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const hasFilter = (f: ScheduleFilters) =>
  !!(f.search || f.term || f.className || f.section || f.type || f.status || f.year);

export function ExamScheduleToolbar({ filters, onChange, onClear, onAdd, onPrint, resultCount }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-[12px]"
            placeholder="Search exam, subject, room…"
            value={filters.search}
            onChange={(e) => onChange("search", e.target.value)}
          />
        </div>
        <Sel label="All Terms"    value={filters.term}      options={EXAM_TERM_OPTIONS}   onChg={(v) => onChange("term", v)}      />
        <Sel label="All Types"    value={filters.type}      options={EXAM_TYPE_OPTIONS}   onChg={(v) => onChange("type", v)}      />
        <Sel label="All Classes"  value={filters.className} options={CLASS_OPTIONS}        onChg={(v) => onChange("className", v)} />
        <Sel label="All Sections" value={filters.section}   options={SECTION_OPTIONS}      onChg={(v) => onChange("section", v)}   />
        <Sel label="All Status"   value={filters.status}    options={EXAM_STATUS_OPTIONS}  onChg={(v) => onChange("status", v)}    />
        <Sel label="All Years"    value={filters.year}      options={ACADEMIC_YEAR_OPTIONS} onChg={(v) => onChange("year", v)}    />
        {hasFilter(filters) && (
          <Button variant="ghost" size="sm" className="h-9 gap-1 text-[12px]" onClick={onClear}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
        <span className="text-[11px] text-muted-foreground ml-auto">{resultCount} result{resultCount !== 1 ? "s" : ""}</span>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]" onClick={onPrint}>
          <Printer className="h-3.5 w-3.5" />Print
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[12px]">
          <Download className="h-3.5 w-3.5" />Export
        </Button>
        <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />Add Exam
        </Button>
      </div>
    </div>
  );
}
