import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Single expand/collapse section with a smooth height transition and a
 * rotating chevron. Compose several side-by-side for an accordion group —
 * each instance manages its own open state independently.
 */
export function AccordionMotion({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <CollapsiblePrimitive.Root open={open} onOpenChange={setOpen} className={cn("rounded-xl border border-border/60", className)}>
      <CollapsiblePrimitive.Trigger className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {title}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </CollapsiblePrimitive.Trigger>
      <CollapsiblePrimitive.Content className="t-accordion-content">
        <div className="px-4 pb-4 text-[13px] text-muted-foreground">{children}</div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
