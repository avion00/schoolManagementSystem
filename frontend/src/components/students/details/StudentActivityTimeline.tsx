import {
  BookOpen,
  CheckCircle,
  CreditCard,
  FileText,
  Trophy,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityItem } from "@/data/studentDetailsData";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  CheckCircle,
  CreditCard,
  Trophy,
  FileText,
  BookOpen,
  Users,
};

const COLOR_MAP: Record<ActivityItem["color"], string> = {
  emerald: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  blue:    "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  amber:   "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  violet:  "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  sky:     "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  rose:    "bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

export function StudentActivityTimeline({ activities }: { activities: ActivityItem[] }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <CheckCircle className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4">
          {/* Connector rail */}
          <div className="absolute left-4 top-8 h-[calc(100%-44px)] w-px bg-border/50" aria-hidden="true" />

          {activities.map((a) => {
            const Icon = ICON_MAP[a.icon] ?? CheckCircle;
            const colorCls = COLOR_MAP[a.color] ?? "bg-muted text-muted-foreground";
            return (
              <div key={a.id} className="relative flex gap-3.5">
                {/* Icon circle */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background",
                    colorCls,
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="text-sm font-semibold text-foreground">{a.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                  <p className="mt-1 text-[11px] font-medium text-muted-foreground/60">{fmt(a.date)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
