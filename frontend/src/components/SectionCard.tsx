import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { PopNumber, TiltCard } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface Trend {
  value: string;
  up: boolean;
}

export function SectionCard({
  label,
  value,
  trend,
  footer,
  sub,
}: {
  label: string;
  value: string;
  trend?: Trend | null;
  footer: string;
  sub: string;
  /** kept for call-site compatibility; not rendered (matches dashboard-01) */
  icon?: LucideIcon;
}) {
  return (
    <TiltCard className="h-full">
      <Card className="h-full hover:shadow-md">
      <CardHeader className="relative">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums lg:text-3xl">
          <PopNumber value={value} />
        </CardTitle>
        {trend && (
          <div className="absolute right-4 top-5">
            <Badge variant="outline" className="gap-1 rounded-md px-2 py-0.5 text-xs">
              {trend.up ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex items-center gap-1.5 font-medium">
          {footer}
          {trend &&
            (trend.up ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            ))}
        </div>
        <div className="text-muted-foreground">{sub}</div>
      </CardFooter>
      </Card>
    </TiltCard>
  );
}
