import {
  Download, Eye, FileText, Image as ImageIcon, Link as LinkIcon, Star, Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { toggleSaveMaterial, type LearningMaterial } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<LearningMaterial["type"], LucideIcon> = {
  PDF: FileText, Doc: FileText, Video, Image: ImageIcon, Link: LinkIcon,
};

export function StudentMaterialCard({ material, onChange }: { material: LearningMaterial; onChange: () => void }) {
  const Icon = TYPE_ICON[material.type];

  function save() {
    toggleSaveMaterial(material.id);
    onChange();
  }

  return (
    <PremiumCard className="flex flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">{material.title}</p>
          <p className="truncate text-[11.5px] text-muted-foreground">{material.subject} · {material.teacher}</p>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{material.type} · {material.size} · {material.date}</p>
      <div className="flex gap-2 border-t border-border/60 pt-3">
        <Button size="sm" variant="outline" className="h-8 flex-1 gap-1 text-[12px]" onClick={() => toast.success(`Opening ${material.title}`)}>
          <Eye className="h-3.5 w-3.5" /> View
        </Button>
        <Button size="sm" variant="outline" className="h-8 flex-1 gap-1 text-[12px]" onClick={() => toast.success(`Downloading ${material.title}`)}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
        <Button size="sm" variant="ghost" className="h-8 gap-1 px-2 text-[12px]" onClick={save} aria-label="Save material">
          <Star className={cn("h-3.5 w-3.5", material.saved && "fill-amber-400 text-amber-400")} />
        </Button>
      </div>
    </PremiumCard>
  );
}
