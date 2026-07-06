import type { NoticeStatus } from "@/data/noticesData";
import { cn } from "@/lib/utils";

const STATUS_CFG: Record<NoticeStatus, { label: string; cls: string }> = {
  Draft:     { label: "Draft",     cls: "bg-neutral-100 text-neutral-600 ring-neutral-300/50 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-600/50" },
  Scheduled: { label: "Scheduled", cls: "bg-violet-50 text-violet-700 ring-violet-400/40 dark:bg-violet-950/30 dark:text-violet-300 dark:ring-violet-500/30" },
  Published: { label: "Published", cls: "bg-emerald-50 text-emerald-700 ring-emerald-400/40 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-500/30" },
  Archived:  { label: "Archived",  cls: "bg-slate-100 text-slate-500 ring-slate-300/50 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-600/40" },
};

export function NoticeStatusBadge({ status, className }: { status: NoticeStatus; className?: string }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap",
      cfg.cls, className,
    )}>
      {cfg.label}
    </span>
  );
}
