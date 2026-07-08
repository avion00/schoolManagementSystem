import { Archive, CheckCheck, RefreshCw, Search, Settings, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CATEGORY_OPTIONS, CHANNEL_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS,
} from "@/data/notificationsData";
import { cn } from "@/lib/utils";

export interface NotificationFilters {
  category: string;
  priority: string;
  status: string;
  type: string;
  channel: string;
  dateRange: "all" | "today" | "7d" | "30d";
}

export const DEFAULT_NOTIFICATION_FILTERS: NotificationFilters = {
  category: "all", priority: "all", status: "all", type: "all", channel: "all", dateRange: "all",
};

const selectClass = "h-8 rounded-lg border border-input bg-background px-2.5 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

function FilterSelect({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectClass, "capitalize")}>
      <option value="all">{placeholder}</option>
      {options.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
    </select>
  );
}

export function NotificationToolbar({
  search, onSearchChange, filters, onFiltersChange, selectedCount,
  onMarkAllRead, onArchiveSelected, onDeleteSelected, onRefresh, onOpenSettings,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  filters: NotificationFilters;
  onFiltersChange: (f: NotificationFilters) => void;
  selectedCount: number;
  onMarkAllRead: () => void;
  onArchiveSelected: () => void;
  onDeleteSelected: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
}) {
  function set<K extends keyof NotificationFilters>(key: K, value: NotificationFilters[K]) {
    onFiltersChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notifications, module, user, ID..."
            className="h-8 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={onMarkAllRead}>
            <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" disabled={selectedCount === 0} onClick={onArchiveSelected}>
            <Archive className="h-3.5 w-3.5" /> Archive{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px] text-destructive hover:text-destructive" disabled={selectedCount === 0} onClick={onDeleteSelected}>
            <Trash2 className="h-3.5 w-3.5" /> Delete{selectedCount > 0 ? ` (${selectedCount})` : ""}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onRefresh} title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onOpenSettings} title="Notification settings">
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect value={filters.category} onChange={(v) => set("category", v)} placeholder="All Categories" options={CATEGORY_OPTIONS} />
        <FilterSelect value={filters.priority} onChange={(v) => set("priority", v)} placeholder="All Priorities" options={PRIORITY_OPTIONS} />
        <FilterSelect value={filters.status} onChange={(v) => set("status", v)} placeholder="All Statuses" options={STATUS_OPTIONS} />
        <FilterSelect value={filters.type} onChange={(v) => set("type", v)} placeholder="All Types" options={TYPE_OPTIONS} />
        <FilterSelect value={filters.channel} onChange={(v) => set("channel", v)} placeholder="All Channels" options={CHANNEL_OPTIONS} />
        <select value={filters.dateRange} onChange={(e) => set("dateRange", e.target.value as NotificationFilters["dateRange"])} className={selectClass}>
          <option value="all">Any Date</option>
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
    </div>
  );
}
