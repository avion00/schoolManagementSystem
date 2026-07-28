import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Consistent icon + title + trailing meta/action row used at the top of every section/card. */
export function StudentSectionHeader({
  icon: Icon,
  iconCls,
  title,
  action,
  className,
}: {
  icon?: LucideIcon;
  iconCls?: string;
  title: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary", iconCls)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <p className="font-display text-[14px] font-semibold tracking-tight text-foreground">{title}</p>
      </div>
      {action}
    </div>
  );
}
