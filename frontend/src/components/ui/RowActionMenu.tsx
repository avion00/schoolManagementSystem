import {
  Download, Eye, MessageSquare, MoreHorizontal, Pencil, Printer, Trash2,
} from "lucide-react";

import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";

/**
 * The single three-dot row action menu — used by any table (Students,
 * Teachers, Parents, Billing…) instead of a row full of bare icon buttons.
 * Pass only the handlers a given row supports; omitted ones are hidden.
 * `entityLabel` customizes menu text (e.g. "teacher", "parent") and
 * `messageLabel` overrides just the message action's target noun (e.g.
 * "Message guardian" for a student row vs. "Message teacher" elsewhere).
 */
export function RowActionMenu({
  onView,
  onEdit,
  onPrint,
  onDownload,
  onMessage,
  onDelete,
  entityLabel = "record",
  messageLabel,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
  onDownload?: () => void;
  onMessage?: () => void;
  onDelete?: () => void;
  entityLabel?: string;
  messageLabel?: string;
}) {
  return (
    <PremiumDropdownMenu
      align="end"
      width="w-48"
      trigger={
        <button
          type="button"
          aria-label="Row actions"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      }
      items={[
        ...(onView ? [{ label: `View ${entityLabel}`, icon: Eye, onClick: onView }] : []),
        ...(onEdit ? [{ label: `Edit ${entityLabel}`, icon: Pencil, onClick: onEdit }] : []),
        "separator" as const,
        ...(onPrint ? [{ label: "Print profile", icon: Printer, onClick: onPrint }] : []),
        ...(onDownload ? [{ label: "Download record", icon: Download, onClick: onDownload }] : []),
        ...(onMessage ? [{ label: messageLabel ?? `Message ${entityLabel}`, icon: MessageSquare, onClick: onMessage }] : []),
        ...(onDelete ? (["separator" as const, { label: `Delete ${entityLabel}`, icon: Trash2, danger: true, onClick: onDelete }]) : []),
      ]}
    />
  );
}
