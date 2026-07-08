import { useMemo } from "react";
import { AlertTriangle, Bell, ClipboardCheck, CreditCard, MailWarning, ServerCog } from "lucide-react";

import { PopNumber, Reveal } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import type { AppNotification } from "@/data/notificationsData";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  neutral: "bg-muted text-foreground",
  blue:    "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  red:     "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  amber:   "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  purple:  "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
} as const;

export function NotificationSummaryCards({ notifications }: { notifications: AppNotification[] }) {
  const stats = useMemo(() => {
    const nonArchived = notifications.filter((n) => n.status !== "archived");
    return [
      { label: "Total Notifications", value: String(notifications.length), icon: Bell,           tone: "neutral" as const },
      { label: "Unread",               value: String(notifications.filter((n) => n.status === "unread").length), icon: MailWarning, tone: "blue" as const },
      { label: "Urgent",               value: String(nonArchived.filter((n) => n.priority === "urgent").length), icon: AlertTriangle, tone: "red" as const },
      { label: "Pending Approvals",    value: String(notifications.filter((n) => n.isApproval && !n.approvalDecision).length), icon: ClipboardCheck, tone: "amber" as const },
      { label: "Billing Alerts",       value: String(nonArchived.filter((n) => n.category === "Fees" || n.category === "Billing" || n.category === "Payroll").length), icon: CreditCard, tone: "purple" as const },
      { label: "System Alerts",        value: String(nonArchived.filter((n) => n.category === "System" || n.category === "Security").length), icon: ServerCog, tone: "red" as const },
    ];
  }, [notifications]);

  return (
    <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="flex items-start gap-3 p-4">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", TONE_STYLES[stat.tone])}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
                  <PopNumber value={stat.value} />
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </Reveal>
  );
}
