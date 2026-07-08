import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Archive, Check, CheckCircle2, ExternalLink, Trash2, X, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { NotificationPriorityBadge } from "@/components/notifications/NotificationPriorityBadge";
import { NotificationStatusBadge } from "@/components/notifications/NotificationStatusBadge";
import { iconFor } from "@/components/notifications/notificationIcons";
import { Button } from "@/components/ui/button";
import type { AppNotification } from "@/data/notificationsData";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[12.5px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function NotificationDetailsPanel({
  notification, open, onOpenChange, onToggleRead, onArchive, onDelete, onApprove, onReject,
}: {
  notification: AppNotification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleRead: (n: AppNotification) => void;
  onArchive: (n: AppNotification) => void;
  onDelete: (n: AppNotification) => void;
  onApprove: (n: AppNotification) => void;
  onReject: (n: AppNotification) => void;
}) {
  const navigate = useNavigate();
  if (!notification) return null;
  const n = notification;
  const Icon = iconFor(n.category, n.type);
  const showApprovalActions = n.isApproval && !n.approvalDecision && n.status !== "archived";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border/60 bg-card shadow-2xl focus:outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=open]:duration-300 data-[state=closed]:duration-200",
          )}
        >
          <div className="shrink-0 border-b border-border/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-[18px] w-[18px] text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-muted-foreground">{n.notificationId}</p>
                  <DialogPrimitive.Title className="mt-0.5 text-[14.5px] font-semibold leading-snug text-foreground">
                    {n.title}
                  </DialogPrimitive.Title>
                </div>
              </div>
              <DialogPrimitive.Close asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><X className="h-4 w-4" /></Button>
              </DialogPrimitive.Close>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-foreground">{n.category}</span>
              <NotificationPriorityBadge priority={n.priority} />
              <NotificationStatusBadge status={n.status} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="rounded-xl border border-border/60 p-3.5">
              <p className="text-[12.5px] font-semibold text-foreground">Description</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-foreground">{n.description}</p>
            </div>

            <div className="mt-4 rounded-xl border border-border/60 p-3.5">
              <p className="mb-1 text-[12.5px] font-semibold text-foreground">Details</p>
              <Row label="Type" value={n.type} />
              <Row label="Channel" value={n.channel} />
              <Row label="Created By" value={n.createdBy} />
              <Row label="Created At" value={formatDateTime(n.createdAt)} />
              <Row label="Read At" value={n.readAt ? formatDateTime(n.readAt) : "Not read yet"} />
              <Row label="Related Module" value={n.relatedModule} />
              <Row label="Related ID" value={n.relatedId} />
              <Row label="Target Role" value={n.targetRole} />
              {n.approvalDecision && <Row label="Decision" value={n.approvalDecision} />}
            </div>

            <div className="mt-4 rounded-xl border border-border/60 p-3.5">
              <p className="mb-2 text-[12.5px] font-semibold text-foreground">Activity History</p>
              <ol className="relative space-y-3 pl-4">
                <div className="absolute bottom-1 left-[3px] top-1 w-px bg-border" aria-hidden="true" />
                {n.activity.map((a) => (
                  <li key={a.id} className="relative pl-4">
                    <span className="absolute -left-[1px] top-1 h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-primary ring-2 ring-card" />
                    <p className="text-[12px] font-medium text-foreground">{a.action}</p>
                    <p className="text-[11px] text-muted-foreground">{formatDateTime(a.at)}</p>
                  </li>
                ))}
              </ol>
            </div>

            {showApprovalActions && (
              <div className="mt-4 flex gap-2">
                <Button size="sm" className="h-9 flex-1 gap-1.5 bg-emerald-600 text-[12px] hover:bg-emerald-700" onClick={() => onApprove(n)}>
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="h-9 flex-1 gap-1.5 border-rose-300 text-[12px] text-rose-700 hover:bg-rose-50 dark:text-rose-400" onClick={() => onReject(n)}>
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-border/60 p-4">
            <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={() => navigate(n.actionUrl)}>
              <ExternalLink className="h-3.5 w-3.5" /> Open Related Page
            </Button>
            <Button size="sm" variant="outline" className="h-9 gap-1.5 text-[12px]" onClick={() => onToggleRead(n)}>
              {n.status === "unread" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              Mark as {n.status === "unread" ? "Read" : "Unread"}
            </Button>
            {n.status !== "archived" && (
              <Button size="sm" variant="outline" className="h-9 gap-1.5 text-[12px]" onClick={() => onArchive(n)}>
                <Archive className="h-3.5 w-3.5" /> Archive
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-9 gap-1.5 text-[12px] text-destructive hover:text-destructive" onClick={() => onDelete(n)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
