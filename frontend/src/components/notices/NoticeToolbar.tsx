import { useNavigate }  from "react-router-dom";
import { Search, X, Plus } from "lucide-react";
import { Input }   from "@/components/ui/input";
import { Button }  from "@/components/ui/button";
import {
  NOTICE_CATEGORY_OPTIONS, NOTICE_PRIORITY_OPTIONS,
  NOTICE_STATUS_OPTIONS, NOTICE_AUDIENCE_OPTIONS,
} from "@/data/noticesData";
import type { NoticeCategory, NoticePriority, NoticeStatus, AudienceType } from "@/data/noticesData";

export interface NoticeFilters {
  search:    string;
  category:  string;
  audience:  string;
  priority:  string;
  status:    string;
  dateFrom:  string;
  dateTo:    string;
}

export const EMPTY_FILTERS: NoticeFilters = {
  search: "", category: "", audience: "", priority: "", status: "", dateFrom: "", dateTo: "",
};

interface Props {
  filters:  NoticeFilters;
  onChange: (f: NoticeFilters) => void;
  onClear:  () => void;
  total:    number;
  filtered: number;
}

function Sel<T extends string>({ label, value, options, onChange }: {
  label: string; value: string; options: readonly T[]; onChange: (v: string) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="h-9 min-w-[130px] rounded-lg border border-input bg-background px-3 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function hasFilter(f: NoticeFilters) {
  return f.search || f.category || f.audience || f.priority || f.status || f.dateFrom || f.dateTo;
}

export function NoticeToolbar({ filters, onChange, onClear, total, filtered }: Props) {
  const navigate = useNavigate();
  const set = (k: keyof NoticeFilters, v: string) => onChange({ ...filters, [k]: v });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={filters.search} onChange={(e) => set("search", e.target.value)}
            placeholder="Search notices…" className="h-9 pl-8 text-[12px]" />
        </div>

        <Sel label="Category"  value={filters.category}  options={NOTICE_CATEGORY_OPTIONS as readonly NoticeCategory[]} onChange={(v) => set("category", v)} />
        <Sel label="Audience"  value={filters.audience}  options={NOTICE_AUDIENCE_OPTIONS as readonly AudienceType[]}   onChange={(v) => set("audience", v)} />
        <Sel label="Priority"  value={filters.priority}  options={NOTICE_PRIORITY_OPTIONS as readonly NoticePriority[]} onChange={(v) => set("priority", v)} />
        <Sel label="Status"    value={filters.status}    options={NOTICE_STATUS_OPTIONS   as readonly NoticeStatus[]}   onChange={(v) => set("status",   v)} />

        {/* Date range */}
        <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)}
          title="Published from"
          className="h-9 rounded-lg border border-input bg-background px-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        <span className="text-[11px] text-muted-foreground">to</span>
        <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)}
          title="Published to"
          className="h-9 rounded-lg border border-input bg-background px-2 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />

        {hasFilter(filters) && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-[12px] text-muted-foreground" onClick={onClear}>
            <X className="h-3.5 w-3.5" />Clear
          </Button>
        )}

        <div className="ml-auto">
          <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={() => navigate("/notices/new")}>
            <Plus className="h-3.5 w-3.5" />Create Notice
          </Button>
        </div>
      </div>

      {/* Result count */}
      {hasFilter(filters) && (
        <p className="text-[11px] text-muted-foreground">
          Showing {filtered} of {total} notices
        </p>
      )}
    </div>
  );
}
