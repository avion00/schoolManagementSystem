import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MESSAGE_TYPE_OPTIONS, MESSAGE_PRIORITY_OPTIONS } from "@/data/messagesData";

export interface MessageFilters {
  search:   string;
  type:     string;
  priority: string;
  status:   string;
}

export const EMPTY_MSG_FILTERS: MessageFilters = {
  search: "", type: "", priority: "", status: "",
};

const STATUS_OPTS = ["unread","read","replied","archived","draft","scheduled","sent","failed"];

interface Props {
  filters:  MessageFilters;
  onChange: (f: MessageFilters) => void;
  onClear:  () => void;
  total:    number;
  filtered: number;
}

export function MessageToolbar({ filters, onChange, onClear, total, filtered }: Props) {
  function set(key: keyof MessageFilters, val: string) {
    onChange({ ...filters, [key]: val });
  }
  const isDirty = JSON.stringify(filters) !== JSON.stringify(EMPTY_MSG_FILTERS);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search messages…"
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          className="pl-9 h-9 text-[13px]"
        />
      </div>

      {[
        { key: "type" as const,     label: "All Types",      opts: MESSAGE_TYPE_OPTIONS     as readonly string[] },
        { key: "priority" as const, label: "All Priorities", opts: MESSAGE_PRIORITY_OPTIONS as readonly string[] },
        { key: "status" as const,   label: "All Statuses",   opts: STATUS_OPTS              as readonly string[] },
      ].map(({ key, label, opts }) => (
        <select
          key={key}
          value={filters[key]}
          onChange={(e) => set(key, e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-ring capitalize"
        >
          <option value="">{label}</option>
          {opts.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
        </select>
      ))}

      {isDirty && (
        <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-[13px]" onClick={onClear}>
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}

      <p className="ml-auto text-[12px] text-muted-foreground whitespace-nowrap">
        {filtered} / {total} messages
      </p>
    </div>
  );
}
