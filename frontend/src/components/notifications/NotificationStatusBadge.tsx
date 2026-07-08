import type { NotificationStatus } from "@/data/notificationsData";
import { cn } from "@/lib/utils";

const STYLES: Record<NotificationStatus, string> = {
  unread:   "bg-primary/10 text-primary",
  read:     "bg-muted text-muted-foreground",
  archived: "bg-slate-200 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300",
};

const DOT: Record<NotificationStatus, string> = {
  unread: "bg-primary",
  read: "bg-muted-foreground/40",
  archived: "bg-slate-400",
};

export function NotificationStatusBadge({ status, className }: { status: NotificationStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", STYLES[status], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", DOT[status])} />
      {status}
    </span>
  );
}
