import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("t-content-in flex flex-col items-center justify-center gap-2 py-12 text-center", className)}>
      {Icon && (
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground/70">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="text-[13.5px] font-medium text-foreground">{title}</p>
      {description && <p className="max-w-xs text-[12px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
