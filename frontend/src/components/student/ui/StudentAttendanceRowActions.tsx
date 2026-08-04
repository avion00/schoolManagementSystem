import { Download, Eye, MoreHorizontal, Pencil } from "lucide-react";

import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";

/** The three-dot row menu for an attendance history row — View details / Request correction / optional Download proof. */
export function StudentAttendanceRowActions({
  onViewDetails,
  onRequestCorrection,
  onDownloadProof,
}: {
  onViewDetails: () => void;
  onRequestCorrection: () => void;
  onDownloadProof?: () => void;
}) {
  return (
    <PremiumDropdownMenu
      align="end"
      width="w-52"
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
        { label: "View details", icon: Eye, onClick: onViewDetails },
        { label: "Request correction", icon: Pencil, onClick: onRequestCorrection },
        ...(onDownloadProof ? [{ label: "Download proof", icon: Download, onClick: onDownloadProof }] : []),
      ]}
    />
  );
}
