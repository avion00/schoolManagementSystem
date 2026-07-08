import { Download, Lock, UserPlus, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ASSIGNEE_DIRECTORY,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  type TicketPriority,
  type TicketStatus,
} from "@/data/helpDeskData";

export function BulkTicketActions({
  selectedIds,
  onClear,
  onBulkAssign,
  onBulkPriority,
  onBulkStatus,
  onBulkClose,
}: {
  selectedIds: number[];
  onClear: () => void;
  onBulkAssign: (assigneeName: string) => void;
  onBulkPriority: (priority: TicketPriority) => void;
  onBulkStatus: (status: TicketStatus) => void;
  onBulkClose: () => void;
}) {
  if (selectedIds.length === 0) return null;
  const count = selectedIds.length;

  return (
    <div className="t-content-in flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/[0.05] px-3.5 py-2.5">
      <span className="text-[12.5px] font-medium text-foreground">
        {count} ticket{count === 1 ? "" : "s"} selected
      </span>

      <div className="ml-auto flex flex-wrap items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
              <UserPlus className="h-3.5 w-3.5" />
              Assign Selected
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {ASSIGNEE_DIRECTORY.map((a) => (
              <DropdownMenuItem key={a.id} onClick={() => onBulkAssign(a.name)}>
                {a.name} <span className="ml-auto text-[11px] text-muted-foreground">{a.department}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-[12px]">Change Priority</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {PRIORITY_OPTIONS.map((p) => (
              <DropdownMenuItem key={p} onClick={() => onBulkPriority(p)}>{p}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-[12px]">Change Status</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map((s) => (
              <DropdownMenuItem key={s} onClick={() => onBulkStatus(s)}>{s}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={onBulkClose}>
          <Lock className="h-3.5 w-3.5" />
          Close Selected
        </Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
          onClick={() => { console.log("Export selected tickets:", selectedIds); toast.success(`Exported ${count} ticket${count === 1 ? "" : "s"}.`); }}>
          <Download className="h-3.5 w-3.5" />
          Export Selected
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClear} aria-label="Clear selection">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
