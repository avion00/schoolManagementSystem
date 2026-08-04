import type { ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

/** Sidebar info card with a colored left accent border, a title row with an optional badge, and free-form content. */
export function RightInfoCard({
  accentCls,
  title,
  badge,
  children,
}: {
  accentCls: string;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Reveal>
      <div className={cn("rounded-2xl border border-l-4 border-border/60 bg-card p-4 shadow-elevated sm:p-5", accentCls)}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-display text-[13px] font-semibold text-foreground">{title}</p>
          {badge}
        </div>
        {children}
      </div>
    </Reveal>
  );
}
