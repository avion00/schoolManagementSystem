import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

/** Titled card wrapper for grouping a set of FormField rows. */
export function FormSection({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground">{title}</p>
            {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </Card>
  );
}
