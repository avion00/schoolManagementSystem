import type { LucideIcon } from "lucide-react";

import { ModalMotion } from "@/components/motion/ModalMotion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Confirm/destructive-action dialog built on ModalMotion. */
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}) {
  return (
    <ModalMotion open={open} onOpenChange={onOpenChange} className="max-w-sm">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", danger ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-foreground">{title}</p>
          {description && <p className="mt-1 text-[12.5px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
        <Button
          size="sm"
          variant={danger ? "destructive" : "default"}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalMotion>
  );
}
