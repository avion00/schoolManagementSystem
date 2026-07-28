import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Outer wrapper every student page starts with — consistent vertical rhythm. */
export function StudentPageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-4 pb-6", className)}>{children}</div>;
}
