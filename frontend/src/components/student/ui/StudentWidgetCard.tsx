import type { ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

/** Generic sidebar info-widget shell — icon/title row with an optional trailing action, then free-form content. */
export function StudentWidgetCard({
  icon,
  title,
  action,
  children,
  className,
}: {
  icon?: ReactNode;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Reveal>
      <div className={cn("rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5", className)}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 font-display text-[14px] font-semibold text-foreground">
            {icon}
            {title}
          </p>
          {action}
        </div>
        {children}
      </div>
    </Reveal>
  );
}
