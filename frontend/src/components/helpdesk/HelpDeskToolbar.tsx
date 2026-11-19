import { Download, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import { PremiumTableToolbar } from "@/components/ui/PremiumTableToolbar";
import {
  CATEGORY_OPTIONS,
  DEPARTMENT_OPTIONS,
  ROLE_OPTIONS,
  SLA_STATUS_OPTIONS,
  SOURCE_OPTIONS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
} from "@/api/types/helpdesk";
import { useAgents } from "@/api/helpdesk";

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
  const agents = useAgents().data ?? [];
  function set<K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  const isDefault = search === "" && JSON.stringify(filters) === JSON.stringify(DEFAULT_TICKET_FILTERS);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-elevated">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="ml-auto h-8 gap-1.5 text-[12px]" disabled={isDefault}
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

      <PremiumTableToolbar
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by ticket ID, requester, subject, category..."
        filters={
          <>
            <PremiumSelect value={filters.status} onChange={(v) => set("status", v)} className="w-40"
              options={[{ value: "all", label: "All Statuses" }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]} />
            <PremiumSelect value={filters.priority} onChange={(v) => set("priority", v)} className="w-36"
              options={[{ value: "all", label: "All Priorities" }, ...PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))]} />
            <PremiumSelect value={filters.role} onChange={(v) => set("role", v)} className="w-36"
              options={[{ value: "all", label: "All Roles" }, ...ROLE_OPTIONS.map((r) => ({ value: r, label: r }))]} />
            <PremiumSelect value={filters.category} onChange={(v) => set("category", v)} className="w-44"
              options={[{ value: "all", label: "All Categories" }, ...CATEGORY_OPTIONS.map((c) => ({ value: c, label: c }))]} />
            <PremiumSelect value={filters.assignedTo} onChange={(v) => set("assignedTo", v)} className="w-48"
              options={[{ value: "all", label: "Assigned To — Anyone" }, { value: "unassigned", label: "Unassigned" }, ...agents.map((a) => ({ value: a.name, label: a.name }))]} />
            <PremiumSelect value={filters.slaStatus} onChange={(v) => set("slaStatus", v)} className="w-36"
              options={[{ value: "all", label: "Any SLA Status" }, ...SLA_STATUS_OPTIONS.map((s) => ({ value: s, label: s }))]} />
            <PremiumSelect value={filters.department} onChange={(v) => set("department", v)} className="w-40"
              options={[{ value: "all", label: "All Departments" }, ...DEPARTMENT_OPTIONS.map((d) => ({ value: d, label: d }))]} />
            <PremiumSelect value={filters.source} onChange={(v) => set("source", v)} className="w-36"
              options={[{ value: "all", label: "All Sources" }, ...SOURCE_OPTIONS.map((s) => ({ value: s, label: s }))]} />
            <PremiumSelect value={filters.dateRange} onChange={(v) => set("dateRange", v as DateRangeFilter)} className="w-36"
              options={[
                { value: "all", label: "Any Date" },
                { value: "today", label: "Today" },
                { value: "7d", label: "Last 7 days" },
                { value: "30d", label: "Last 30 days" },
              ]} />
          </>
        }
        trailing={
          <span className="text-[11.5px] text-muted-foreground">
            {resultCount} ticket{resultCount === 1 ? "" : "s"}
          </span>
        }
      />
    </div>
  );
}
