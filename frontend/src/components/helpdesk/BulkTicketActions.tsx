import { Download, Lock, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";
import {
  ASSIGNEE_DIRECTORY,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  type TicketPriority,
  type TicketStatus,
} from "@/data/helpDeskData";

/**
 * Bulk-action controls rendered inside PremiumDataTable's built-in
 * `bulkActions` bar (which already shows the "N selected" label and a
 * clear/deselect affordance) — no longer a standalone hand-rolled bar.
 */
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
  const count = selectedIds.length;

  return (
    <>
      <PremiumDropdownMenu
        align="start"
        width="w-52"
        trigger={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            <UserPlus className="h-3.5 w-3.5" />
            Assign Selected
          </Button>
        }
        items={ASSIGNEE_DIRECTORY.map((a) => ({
          label: `${a.name} — ${a.department}`,
          onClick: () => onBulkAssign(a.name),
        }))}
      />

      <PremiumDropdownMenu
        align="start"
        trigger={<Button variant="outline" size="sm" className="h-8 text-[12px]">Change Priority</Button>}
        items={PRIORITY_OPTIONS.map((p) => ({ label: p, onClick: () => onBulkPriority(p) }))}
      />

      <PremiumDropdownMenu
        align="start"
        trigger={<Button variant="outline" size="sm" className="h-8 text-[12px]">Change Status</Button>}
        items={STATUS_OPTIONS.map((s) => ({ label: s, onClick: () => onBulkStatus(s) }))}
      />

      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={onBulkClose}>
        <Lock className="h-3.5 w-3.5" />
        Close Selected
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]"
        onClick={() => { console.log("Export selected tickets:", selectedIds); toast.success(`Exported ${count} ticket${count === 1 ? "" : "s"}.`); }}>
        <Download className="h-3.5 w-3.5" />
        Export Selected
      </Button>
      <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground" onClick={onClear}>
        Deselect all
      </Button>
    </>
  );
}
