import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Apple-like card surface: rounded-2xl, soft border, floating two-layer shadow, gentle hover lift. */
export function PremiumCard({ className, hoverable = false, ...props }: HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-white shadow-elevated dark:border-neutral-800 dark:bg-neutral-950",
        hoverable && "t-lift transition-shadow hover:shadow-lg",
        className,
      )}
      {...props}
    />
  );
}
