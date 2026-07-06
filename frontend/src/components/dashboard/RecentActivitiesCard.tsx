import { activities } from "@/data/dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function RecentActivitiesCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {activities.map((act, idx) => {
            const Icon = act.icon;
            const isLast = idx === activities.length - 1;
            return (
              <li key={act.id} className="relative flex gap-3">
                {/* Vertical connector rail */}
                {!isLast && (
                  <span className="absolute left-4 top-8 h-full w-px -translate-x-1/2 bg-border" />
                )}

                <span
                  className={cn(
                    "relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    act.iconCls,
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>

                <div className={cn("min-w-0", !isLast && "pb-4")}>
                  <p className="text-sm font-medium text-foreground">{act.action}</p>
                  <p className="text-xs text-muted-foreground">{act.description}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground/60">{act.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
