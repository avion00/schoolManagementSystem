import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SYSTEM_SERVICES, type ServiceStatus } from "@/data/helpData";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<ServiceStatus, string> = {
  Operational: "bg-emerald-500",
  Degraded:    "bg-amber-500",
  Down:        "bg-rose-500",
};

const STATUS_TEXT: Record<ServiceStatus, string> = {
  Operational: "text-emerald-600 dark:text-emerald-400",
  Degraded:    "text-amber-600 dark:text-amber-400",
  Down:        "text-rose-600 dark:text-rose-400",
};

export function SystemStatusCard() {
  const allOperational = SYSTEM_SERVICES.every((s) => s.status === "Operational");

  return (
    <Card id="system-status" className="scroll-mt-6 rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">System Status</CardTitle>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            allOperational
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
          )}
        >
          {allOperational ? "All systems normal" : "Partial disruption"}
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {SYSTEM_SERVICES.map((service) => (
          <div key={service.id} className="flex items-center justify-between">
            <span className="text-[12.5px] text-foreground">{service.name}</span>
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", STATUS_DOT[service.status])} />
              <span className={cn("text-[12px] font-medium", STATUS_TEXT[service.status])}>
                {service.status}
              </span>
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
