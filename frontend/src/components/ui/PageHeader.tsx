import type { ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";

/**
 * Content-level page header — title + description + actions row, shared by
 * every list page (Students, Teachers, Parents, Billing, …) so heading style
 * stays consistent in one place instead of being hand-rolled per page.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {title && (
          <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
        )}
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </Reveal>
  );
}
