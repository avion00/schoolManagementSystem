import { AlertTriangle, Info, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { smartAlerts, type SmartAlert } from "@/data/teacherDashboardData";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<SmartAlert["type"], { icon: typeof AlertTriangle; cls: string }> = {
  danger:  { icon: AlertTriangle, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  warning: { icon: AlertTriangle, cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  info:    { icon: Info,          cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
};

export function TeacherSmartAlerts() {
  const navigate = useNavigate();

  return (
    <PremiumCard className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[13.5px] font-semibold text-foreground">Smart Alerts</h2>
      </div>
      <div className="space-y-2">
        {smartAlerts.map((alert) => {
          const { icon: Icon, cls } = TYPE_STYLES[alert.type];
          return (
            <div key={alert.id} className="flex items-center gap-3 rounded-xl border border-border/50 p-2.5">
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cls)}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="min-w-0 flex-1 truncate text-[12.5px] text-foreground">{alert.message}</p>
              {alert.actionLabel && alert.actionRoute && (
                <button
                  type="button"
                  onClick={() => navigate(alert.actionRoute!)}
                  className="shrink-0 text-[11.5px] font-medium text-primary hover:underline"
                >
                  {alert.actionLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </PremiumCard>
  );
}
