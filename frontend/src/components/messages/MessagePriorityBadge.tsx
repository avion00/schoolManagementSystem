import { cn } from "@/lib/utils";
import type { MessagePriority } from "@/data/messagesData";

const PRIORITY_CFG: Record<MessagePriority, { dot: string; label: string }> = {
  Low:    { dot: "bg-slate-400",  label: "Low"    },
  Normal: { dot: "bg-blue-500",   label: "Normal" },
  High:   { dot: "bg-amber-500",  label: "High"   },
  Urgent: { dot: "bg-rose-500",   label: "Urgent" },
};

interface Props {
  priority: MessagePriority;
  className?: string;
}

export function MessagePriorityBadge({ priority, className }: Props) {
  const { dot, label } = PRIORITY_CFG[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground", className)}>
      <span className={cn("h-2 w-2 rounded-full shrink-0", dot)} />
      {label}
    </span>
  );
}
