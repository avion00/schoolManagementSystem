import { Download, Plus, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  ASSIGNEE_DIRECTORY,
  CATEGORY_OPTIONS,
  DEPARTMENT_OPTIONS,
  ROLE_OPTIONS,
  SLA_STATUS_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from "@/data/helpDeskData";
import { cn } from "@/lib/utils";

export type DateRangeFilter = "all" | "today" | "7d" | "30d";

export interface TicketFilters {
  status: string;
  priority: string;
  role: string;
  category: string;
  assignedTo: string;
  slaStatus: string;
  department: string;
  source: string;
  dateRange: DateRangeFilter;
}

export const DEFAULT_TICKET_FILTERS: TicketFilters = {
  status: "all", priority: "all", role: "all", category: "all",
  assignedTo: "all", slaStatus: "all", department: "all", source: "all", dateRange: "all",
};

const selectClass = "h-8 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function FilterSelect({
  value, onChange, options, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectClass)}>
      <option value="all">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function HelpDeskToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  resultCount,
  onNewTicket,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  filters: TicketFilters;
  onFiltersChange: (f: TicketFilters) => void;
  resultCount: number;
  onNewTicket: () => void;
}) {
  function set<K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  const isDefault = search === "" && JSON.stringify(filters) === JSON.stringify(DEFAULT_TICKET_FILTERS);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ticket ID, requester, subject, category..."
            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" disabled={isDefault}
          onClick={() => { onSearchChange(""); onFiltersChange(DEFAULT_TICKET_FILTERS); }}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
          onClick={() => toast.success(`Exported ${resultCount} ticket${resultCount === 1 ? "" : "s"} (CSV).`)}>
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Button size="sm" className="h-8 gap-1.5 text-[12px]" onClick={onNewTicket}>
          <Plus className="h-3.5 w-3.5" />
          New Ticket
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect value={filters.status} onChange={(v) => set("status", v)} placeholder="All Statuses"
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} />
        <FilterSelect value={filters.priority} onChange={(v) => set("priority", v)} placeholder="All Priorities"
          options={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))} />
        <FilterSelect value={filters.role} onChange={(v) => set("role", v)} placeholder="All Roles"
          options={ROLE_OPTIONS.map((r) => ({ value: r, label: r }))} />
        <FilterSelect value={filters.category} onChange={(v) => set("category", v)} placeholder="All Categories"
          options={CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))} />
        <FilterSelect value={filters.assignedTo} onChange={(v) => set("assignedTo", v)} placeholder="Assigned To — Anyone"
          options={[{ value: "unassigned", label: "Unassigned" }, ...ASSIGNEE_DIRECTORY.map((a) => ({ value: a.name, label: a.name }))]} />
        <FilterSelect value={filters.slaStatus} onChange={(v) => set("slaStatus", v)} placeholder="Any SLA Status"
          options={SLA_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))} />
        <FilterSelect value={filters.department} onChange={(v) => set("department", v)} placeholder="All Departments"
          options={DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))} />
        <FilterSelect value={filters.source} onChange={(v) => set("source", v)} placeholder="All Sources"
          options={SOURCE_OPTIONS.map((s) => ({ value: s, label: s }))} />
        <FilterSelect value={filters.dateRange} onChange={(v) => set("dateRange", v as DateRangeFilter)} placeholder="Any Date"
          options={[
            { value: "today", label: "Today" },
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
          ]} />

        <span className="ml-auto text-[11.5px] text-muted-foreground">
          {resultCount} ticket{resultCount === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
