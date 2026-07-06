import { cn } from "@/lib/utils";
import type { MessageStatus } from "@/data/messagesData";

const STATUS_CFG: Record<MessageStatus, { label: string; cls: string }> = {
  unread:    { label: "Unread",    cls: "bg-amber-50  text-amber-700  ring-1 ring-amber-400/40 dark:bg-amber-950/40 dark:text-amber-300" },
  read:      { label: "Read",     cls: "bg-blue-50   text-blue-700   ring-1 ring-blue-400/40  dark:bg-blue-950/40  dark:text-blue-300"  },
  replied:   { label: "Replied",  cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-400/40 dark:bg-emerald-950/40 dark:text-emerald-300" },
  archived:  { label: "Archived", cls: "bg-slate-100 text-slate-500  ring-1 ring-slate-300/50 dark:bg-slate-800/60  dark:text-slate-400"  },
  draft:     { label: "Draft",    cls: "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-300/50 dark:bg-neutral-800 dark:text-neutral-400" },
  scheduled: { label: "Scheduled",cls: "bg-violet-50 text-violet-700 ring-1 ring-violet-400/40 dark:bg-violet-950/40 dark:text-violet-300" },
  sent:      { label: "Sent",     cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-400/40 dark:bg-emerald-950/40 dark:text-emerald-300" },
  failed:    { label: "Failed",   cls: "bg-rose-50   text-rose-700   ring-1 ring-rose-400/40   dark:bg-rose-950/40   dark:text-rose-300"   },
};

interface Props {
  status: MessageStatus;
  className?: string;
}

export function MessageStatusBadge({ status, className }: Props) {
  const { label, cls } = STATUS_CFG[status] ?? STATUS_CFG.draft;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold", cls, className)}>
      {label}
    </span>
  );
}
