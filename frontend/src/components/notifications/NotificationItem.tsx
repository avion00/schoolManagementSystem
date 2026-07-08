import {
  Archive, Check, CheckCircle2, Eye, MoreVertical, Trash2, X, XCircle,
} from "lucide-react";

import { NotificationPriorityBadge } from "@/components/notifications/NotificationPriorityBadge";
import { iconFor } from "@/components/notifications/notificationIcons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AppNotification } from "@/data/notificationsData";
import { cn } from "@/lib/utils";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function NotificationItem({
  notification, selected, onToggleSelect, onOpen, onToggleRead, onArchive, onDelete, onApprove, onReject,
}: {
  notification: AppNotification;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onToggleRead: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const n = notification;
  const Icon = iconFor(n.category, n.type);
  const isUnread = n.status === "unread";
  const isArchived = n.status === "archived";
  const showApprovalActions = n.isApproval && !n.approvalDecision && !isArchived;

  return (
    <div
      className={cn(
        "t-content-in group flex gap-3 rounded-xl border p-3.5 transition-colors duration-150",
        isUnread ? "border-primary/20 bg-primary/[0.04]" : "border-border/60 bg-card",
        isArchived && "opacity-70",
        "hover:border-primary/30",
      )}
    >
      <div className="flex shrink-0 items-start pt-0.5">
        <Checkbox checked={selected} onCheckedChange={onToggleSelect} aria-label={`Select ${n.title}`} />
      </div>

      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-3 text-left">
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-[18px] w-[18px] text-primary" />
          {isUnread && <span className="t-badge-dot absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />}
        </span>

        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-[13px] leading-snug", isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80")}>
            {n.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">{n.description}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="rounded-md bg-muted px-1.5 py-0.5">{n.category}</span>
            <NotificationPriorityBadge priority={n.priority} />
            <span>· {n.relatedModule}</span>
            <span>· {timeAgo(n.createdAt)}</span>
            <span>· by {n.createdBy}</span>
          </div>
        </div>
      </button>

      <div className="flex shrink-0 items-start gap-1.5">
        {showApprovalActions ? (
          <>
            <Button size="sm" variant="outline" className="h-7 gap-1 border-emerald-300 text-[11.5px] text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400" onClick={onApprove}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" className="h-7 gap-1 border-rose-300 text-[11.5px] text-rose-700 hover:bg-rose-50 dark:text-rose-400" onClick={onReject}>
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="h-7 gap-1 text-[11.5px]" onClick={onOpen}>
            <Eye className="h-3.5 w-3.5" /> View
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={onOpen}><Eye className="h-3.5 w-3.5" /> View</DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleRead}>
              {isUnread ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              Mark as {isUnread ? "read" : "unread"}
            </DropdownMenuItem>
            {!isArchived && (
              <DropdownMenuItem onClick={onArchive}><Archive className="h-3.5 w-3.5" /> Archive</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
