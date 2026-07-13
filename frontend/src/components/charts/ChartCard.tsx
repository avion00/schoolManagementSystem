import type { ReactNode } from "react";

import { Reveal } from "@/components/motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Standard Card shell for any chart — title, optional subtitle/action, reveal-on-mount. */
export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Reveal className={cn("h-full", className)}>
      <Card className="h-full rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-[13px] font-semibold">{title}</CardTitle>
            {subtitle && <CardDescription className="text-[11.5px]">{subtitle}</CardDescription>}
          </div>
          {action}
        </CardHeader>
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    </Reveal>
  );
}
