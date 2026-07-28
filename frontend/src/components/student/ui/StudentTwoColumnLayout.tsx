import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The 12-column student page layout: an ~8-col main working area and an
 * ~4-col info/context column that goes sticky on desktop. Stacks naturally
 * on tablet/mobile. Shared by every student page so the "work left, context
 * right" rule stays consistent app-wide.
 */
export function StudentTwoColumnLayout({ main, sidebar }: { main: ReactNode; sidebar: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
      <div className="min-w-0 space-y-4 lg:col-span-8">{main}</div>
      <div className={cn("space-y-4 lg:col-span-4", "lg:sticky lg:top-20")}>{sidebar}</div>
    </div>
  );
}
