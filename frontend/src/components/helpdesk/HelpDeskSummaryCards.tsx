import { useMemo } from "react";
import {
  AlertTriangle, CheckCircle2, Clock, Hourglass, Inbox, Loader, Timer, TrendingUp,
} from "lucide-react";

import { PopNumber, Reveal } from "@/components/motion";
import { Card, CardContent } from "@/components/ui/card";
import type { SupportTicket } from "@/data/helpDeskData";
import { cn } from "@/lib/utils";

function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / 60_000));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

const TONE_STYLES = {
  neutral: "bg-muted text-foreground",
  blue:    "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  amber:   "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  purple:  "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  red:     "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  green:   "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
} as const;

interface StatDef {
  label: string;
  value: string;
  icon: typeof Inbox;
  tone: keyof typeof TONE_STYLES;
}

export function HelpDeskSummaryCards({ tickets }: { tickets: SupportTicket[] }) {
  const stats = useMemo<StatDef[]>(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "Open").length;
    const pendingResponse = tickets.filter((t) => t.status === "New" || t.status === "Waiting for Department").length;
    const inProgress = tickets.filter((t) => t.status === "In Progress").length;
    const escalated = tickets.filter((t) => t.status === "Escalated").length;
    const resolvedToday = tickets.filter(
      (t) => (t.status === "Resolved" || t.status === "Closed") && Date.now() - new Date(t.updatedAt).getTime() < 24 * 3600_000,
    ).length;
    const overdueSla = tickets.filter((t) => t.sla.status === "Overdue").length;

    const firstResponseDurations = tickets
      .filter((t) => t.messages.length > 1)
      .map((t) => new Date(t.messages[1].timestamp).getTime() - new Date(t.createdAt).getTime());
    const avgResponseMs = firstResponseDurations.length
      ? firstResponseDurations.reduce((a, b) => a + b, 0) / firstResponseDurations.length
      : 0;

    return [
      { label: "Total Tickets",        value: String(total),           icon: Inbox,          tone: "neutral" },
      { label: "Open Tickets",         value: String(open),            icon: Loader,         tone: "blue" },
      { label: "Pending Response",     value: String(pendingResponse), icon: Hourglass,      tone: "amber" },
      { label: "In Progress",          value: String(inProgress),      icon: TrendingUp,     tone: "purple" },
      { label: "Escalated",            value: String(escalated),       icon: AlertTriangle,  tone: "red" },
      { label: "Resolved Today",       value: String(resolvedToday),   icon: CheckCircle2,   tone: "green" },
      { label: "Overdue SLA",          value: String(overdueSla),      icon: Clock,          tone: "red" },
      { label: "Avg. Response Time",   value: formatDuration(avgResponseMs), icon: Timer,     tone: "neutral" },
    ];
  }, [tickets]);

  return (
    <Reveal className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
