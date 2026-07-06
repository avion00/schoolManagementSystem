import { Search, X } from "lucide-react";
import { Input }  from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLASS_OPTIONS, SECTION_OPTIONS, MONTH_OPTIONS, YEAR_OPTIONS } from "@/data/attendanceData";

export interface AttendanceFilters {
  search:    string;
  className: string;
  section:   string;
  month:     string;
  year:      string;
  status:    string;
}

interface Props {
  filters:   AttendanceFilters;
  onChange:  (f: AttendanceFilters) => void;
  onClear:   () => void;
  showSearch?:  boolean;
  showStatus?:  boolean;
  showClass?:   boolean;
  showSection?: boolean;
  showMonth?:   boolean;
  showYear?:    boolean;
}

function Sel({ label, value, options, onChange, disabled }: {
  label: string; value: string; options: readonly string[]; onChange: (v: string) => void; disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 min-w-[130px] rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-40"
    >
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function hasFilter(f: AttendanceFilters) {
  return f.search || f.className || f.section || f.month || f.year || f.status;
}

export function AttendanceToolbar({
  filters, onChange, onClear,
  showSearch  = true,
  showStatus  = false,
  showClass   = true,
  showSection = true,
  showMonth   = false,
  showYear    = false,
}: Props) {
  const set = (key: keyof AttendanceFilters, val: string) =>
    onChange({ ...filters, [key]: val });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showSearch && (
        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            placeholder="Search student..."
            className="h-9 pl-8 text-[12px]"
          />
        </div>
      )}
      {showClass && (
        <Sel label="All Classes" value={filters.className} options={CLASS_OPTIONS} onChange={(v) => set("className", v)} />
      )}
      {showSection && (
        <Sel label="All Sections" value={filters.section} options={SECTION_OPTIONS} onChange={(v) => set("section", v)} />
      )}
      {showMonth && (
        <Sel label="All Months" value={filters.month} options={MONTH_OPTIONS} onChange={(v) => set("month", v)} />
      )}
      {showYear && (
        <Sel label="Year" value={filters.year} options={YEAR_OPTIONS} onChange={(v) => set("year", v)} />
      )}
      {showStatus && (
        <Sel label="All Statuses" value={filters.status}
          options={["present", "absent", "late", "half-day", "leave"]}
          onChange={(v) => set("status", v)} />
      )}
      {hasFilter(filters) && (
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-[12px] text-muted-foreground" onClick={onClear}>
          <X className="h-3.5 w-3.5" />Clear
        </Button>
      )}
    </div>
  );
}
