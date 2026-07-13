import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shimmering loading label. Use sparingly — for transient in-progress states
 * only ("Generating report…", "Processing payment…"), never for static text.
 */
export function ShimmerText({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("t-shimmer font-medium", className)}>{children}</span>;
}
