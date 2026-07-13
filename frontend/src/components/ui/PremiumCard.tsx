import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/** Apple-like card surface: rounded-2xl, soft border, subtle shadow, gentle hover lift. */
export function PremiumCard({ className, hoverable = false, ...props }: HTMLAttributes<HTMLDivElement> & { hoverable?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950",
        hoverable && "t-lift transition-shadow hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}
