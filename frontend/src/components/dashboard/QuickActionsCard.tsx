import { useNavigate } from "react-router-dom";

import { quickActions } from "@/data/dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={300}>
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const isActive = Boolean(action.to);
              return (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => isActive && navigate(action.to!)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border border-border/60 p-3 text-center",
                        "transition-colors hover:bg-muted/60 hover:border-border",
                        !isActive && "cursor-not-allowed opacity-60 hover:bg-transparent",
                        isActive && "cursor-pointer",
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <Icon className={cn("h-4 w-4", action.iconCls)} />
                      </span>
                      <span className="text-[11px] font-medium leading-tight text-foreground">
                        {action.label}
                      </span>
                    </button>
                  </TooltipTrigger>
                  {!isActive && (
                    <TooltipContent side="top">
                      <p>Coming soon</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
