import { Download, Eye, File, FileSpreadsheet, FileText, Image as ImageIcon, Music, Video, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { MessageAttachment } from "@/data/messagesData";
import { cn } from "@/lib/utils";

const KIND_ICON: Record<MessageAttachment["kind"], typeof File> = {
  image: ImageIcon, pdf: FileText, doc: FileText, sheet: FileSpreadsheet, audio: Music, video: Video, other: File,
};

const KIND_COLOR: Record<MessageAttachment["kind"], string> = {
  image: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  pdf: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  doc: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  sheet: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  audio: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  video: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300",
  other: "bg-muted text-muted-foreground",
};

export function AttachmentPreview({
  attachment,
  onRemove,
  onDownload,
  dense = false,
}: {
  attachment: MessageAttachment;
  onRemove?: () => void;
  onDownload?: () => void;
  dense?: boolean;
}) {
  const Icon = KIND_ICON[attachment.kind];

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/60 pr-2",
        dense ? "p-1.5" : "p-2.5",
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", KIND_COLOR[attachment.kind])}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-medium text-foreground">{attachment.name}</p>
        <p className="text-[11px] text-muted-foreground">{attachment.size}</p>
      </div>
      {onRemove && (
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={onRemove} aria-label="Remove attachment">
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
      {onDownload && !onRemove && (
        <div className="flex shrink-0 items-center gap-0.5">
          {attachment.kind === "image" && (
            <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Preview">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDownload} aria-label="Download">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
