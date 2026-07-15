import { CalendarClock } from "lucide-react";

import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { feeSummary } from "@/data/studentDashboardData";

const STATUS_TONE: Record<typeof feeSummary.status, PremiumBadgeTone> = {
  Paid: "success", Partial: "warning", Overdue: "danger",
};

export function StudentFeeSummary() {
  const pct = Math.round((feeSummary.paid / feeSummary.total) * 100);

  return (
    <PremiumCard className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-foreground">Fee Status</p>
        <PremiumBadge label={feeSummary.status} tone={STATUS_TONE[feeSummary.status]} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[15px] font-semibold text-foreground">{feeSummary.total}</p>
          <p className="text-[10.5px] text-muted-foreground">Total</p>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-emerald-600 dark:text-emerald-400">{feeSummary.paid}</p>
          <p className="text-[10.5px] text-muted-foreground">Paid</p>
        </div>
        <div>
          <p className="text-[15px] font-semibold text-rose-600 dark:text-rose-400">{feeSummary.due}</p>
          <p className="text-[10.5px] text-muted-foreground">Due</p>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/60">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {feeSummary.due > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" /> Next due date: {feeSummary.nextDueDate}
        </p>
      )}
    </PremiumCard>
  );
}
