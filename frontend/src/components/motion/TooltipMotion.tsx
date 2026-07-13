import type { ReactNode } from "react";

import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Drop-in tooltip: wrap any trigger element, pass a label. Bundles provider +
 * trigger + content so call sites don't need to import four separate pieces.
 * Use for action buttons, icon buttons, table row actions.
 */
export function TooltipMotion({
  label,
  children,
  side = "top",
  delay = 300,
  className,
}: {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delay?: number;
  className?: string;
}) {
  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={cn("t-tooltip t-menu-surface text-foreground", className)}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
