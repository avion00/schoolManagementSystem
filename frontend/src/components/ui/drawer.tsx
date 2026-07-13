import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Right-side sliding drawer shell — the canonical way to build a detail/edit
 * panel (ticket details, record inspector, filter panel) instead of a
 * one-off DialogPrimitive assembly per page.
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  children,
  widthClassName = "max-w-xl",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
  widthClassName?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "t-menu-surface fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l shadow-2xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=open]:duration-300 data-[state=closed]:duration-200",
            widthClassName,
          )}
        >
          {title && (
            <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-4 py-3.5">
              <DialogPrimitive.Title className="text-[14px] font-semibold text-foreground">{title}</DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
