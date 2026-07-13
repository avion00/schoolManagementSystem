import { Download, Eye, FileText, Image, MoreHorizontal, Pencil, Share2, Trash2, Video } from "lucide-react";
import { toast } from "sonner";

import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumDropdownMenu } from "@/components/ui/PremiumDropdownMenu";
import type { MaterialType, TeachingMaterial } from "@/data/teacherDashboardData";

const TYPE_ICON: Record<MaterialType, typeof FileText> = {
  PDF: FileText,
  Doc: FileText,
  Image,
  Video,
};

export function MaterialCard({
  material,
  index,
  onToggleShare,
  onDelete,
}: {
  material: TeachingMaterial;
  index: number;
  onToggleShare: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = TYPE_ICON[material.type];
  return (
    <PremiumCard hoverable className="t-row-in flex flex-col gap-3 p-4" style={{ "--row-index": index } as React.CSSProperties}>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">{material.title}</p>
          <p className="text-[11px] text-muted-foreground">{material.className}-{material.section} · {material.subject}</p>
        </div>
        <PremiumDropdownMenu
          align="end"
          trigger={<button type="button" aria-label="Material actions" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/70 hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>}
          items={[
            { label: "Preview", icon: Eye, onClick: () => toast.info("Preview not available in this demo") },
            { label: "Share", icon: Share2, onClick: () => onToggleShare(material.id) },
            { label: "Download", icon: Download, onClick: () => toast.info("Download not available in this demo") },
            { label: "Edit", icon: Pencil, onClick: () => toast.info("Editing — coming soon") },
            { label: "Delete", icon: Trash2, danger: true, onClick: () => onDelete(material.id) },
          ]}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{material.type} · {material.sizeLabel}</span>
        <span>{material.uploadedDate}</span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {material.views}</span>
        <span className="flex items-center gap-1"><Download className="h-3 w-3" /> {material.downloads}</span>
      </div>

      <button type="button" onClick={() => onToggleShare(material.id)} className="border-t border-border/60 pt-3 text-left">
        <PremiumBadge label={material.sharedWithClass ? "Shared with class" : "Not shared"} tone={material.sharedWithClass ? "success" : "neutral"} />
      </button>
    </PremiumCard>
  );
}
