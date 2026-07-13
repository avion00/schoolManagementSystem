import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Scale-from-origin morph + guaranteed-solid surface for dropdown/popover-style
 * content. Fixes the classic "translucent menu over busy background" bug —
 * .t-menu-surface always paints an opaque background in both themes.
 *
 * Wrap the inner content of a Radix DropdownMenu.Content / Popover.Content /
 * Select.Content with this, or use it standalone for a custom popover.
 */
export function DropdownMorph({
  children,
  origin = "top center",
  className,
}: {
  children: ReactNode;
  origin?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("t-menu t-menu-surface rounded-xl p-1.5", className)}
      style={{ "--menu-origin": origin } as CSSProperties}
    >
      {children}
    </div>
  );
}
