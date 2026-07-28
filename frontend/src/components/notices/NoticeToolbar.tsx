import { useNavigate }  from "react-router-dom";
import { Plus } from "lucide-react";
import { Button }  from "@/components/ui/button";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import {
  NOTICE_CATEGORY_OPTIONS, NOTICE_PRIORITY_OPTIONS,
  NOTICE_STATUS_OPTIONS, NOTICE_AUDIENCE_OPTIONS,
} from "@/data/noticesData";

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

function hasFilter(f: NoticeFilters) {
  return f.search || f.category || f.audience || f.priority || f.status || f.dateFrom || f.dateTo;
}

export function NoticeToolbar({ filters, onChange, onClear, total, filtered }: Props) {
  const navigate = useNavigate();
  const set = (k: keyof NoticeFilters, v: string) => onChange({ ...filters, [k]: v });

  return (
    <div className="space-y-3">
      <PremiumTableToolbar
        search={filters.search}
        onSearchChange={(v) => set("search", v)}
        searchPlaceholder="Search notices…"
        hasActiveFilter={!!hasFilter(filters)}
        onReset={onClear}
        filters={
          <>
            <PremiumSelect
              value={filters.category}
              onChange={(v) => set("category", v)}
              className="w-40"
              placeholder="Category"
              options={[{ value: "", label: "All categories" }, ...NOTICE_CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))]}
            />
            <PremiumSelect
              value={filters.audience}
              onChange={(v) => set("audience", v)}
              className="w-40"
              placeholder="Audience"
              options={[{ value: "", label: "All audiences" }, ...NOTICE_AUDIENCE_OPTIONS.map((a) => ({ value: a, label: a }))]}
            />
            <PremiumSelect
              value={filters.priority}
              onChange={(v) => set("priority", v)}
              className="w-36"
              placeholder="Priority"
              options={[{ value: "", label: "All priorities" }, ...NOTICE_PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))]}
            />
            <PremiumSelect
              value={filters.status}
              onChange={(v) => set("status", v)}
              className="w-36"
              placeholder="Status"
              options={[{ value: "", label: "All statuses" }, ...NOTICE_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]}
            />

            {/* Date range */}
            <input type="date" value={filters.dateFrom} onChange={(e) => set("dateFrom", e.target.value)}
              title="Published from"
              className="h-11 rounded-xl border border-neutral-200 bg-white px-2.5 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-neutral-800 dark:bg-neutral-950" />
            <span className="text-[11px] text-muted-foreground">to</span>
            <input type="date" value={filters.dateTo} onChange={(e) => set("dateTo", e.target.value)}
              title="Published to"
              className="h-11 rounded-xl border border-neutral-200 bg-white px-2.5 text-[12px] text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-neutral-800 dark:bg-neutral-950" />
          </>
        }
        trailing={
          <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={() => navigate("/notices/new")}>
            <Plus className="h-3.5 w-3.5" />Create Notice
          </Button>
        }
      />

      {/* Result count */}
      {hasFilter(filters) && (
        <p className="text-[11px] text-muted-foreground">
          Showing {filtered} of {total} notices
        </p>
      )}
    </div>
  );
}
