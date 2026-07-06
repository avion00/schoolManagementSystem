import { Send, CheckCheck, Eye, CornerUpRight, XCircle, Clock, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageActivityRecord } from "@/data/messagesData";

const ICON_MAP: Record<MessageActivityRecord["action"], { Icon: React.ElementType; bg: string; color: string }> = {
  sent:        { Icon: Send,          bg: "bg-blue-100 dark:bg-blue-950/60",     color: "text-blue-600 dark:text-blue-400"     },
  delivered:   { Icon: CheckCheck,    bg: "bg-emerald-100 dark:bg-emerald-950/60", color: "text-emerald-600 dark:text-emerald-400" },
  read:        { Icon: Eye,           bg: "bg-violet-100 dark:bg-violet-950/60", color: "text-violet-600 dark:text-violet-400" },
  replied:     { Icon: CornerUpRight, bg: "bg-amber-100 dark:bg-amber-950/60",   color: "text-amber-600 dark:text-amber-400"   },
  failed:      { Icon: XCircle,       bg: "bg-rose-100 dark:bg-rose-950/60",     color: "text-rose-600 dark:text-rose-400"     },
  scheduled:   { Icon: Clock,         bg: "bg-violet-100 dark:bg-violet-950/60", color: "text-violet-600 dark:text-violet-400" },
  draft_saved: { Icon: Save,          bg: "bg-neutral-100 dark:bg-neutral-800",  color: "text-neutral-500 dark:text-neutral-400" },
};

interface Props {
  activities: MessageActivityRecord[];
}

export function MessageActivityTimeline({ activities }: Props) {
  if (!activities.length) {
    return <p className="text-[13px] text-muted-foreground">No activity recorded.</p>;
  }

  return (
    <ol className="space-y-4">
      {activities.map((a, i) => {
        const { Icon, bg, color } = ICON_MAP[a.action] ?? ICON_MAP.sent;
        const isLast = i === activities.length - 1;
        return (
          <li key={a.id} className="relative flex gap-3">
            {!isLast && (
              <span className="absolute left-[15px] top-8 h-[calc(100%+4px)] w-px bg-border" />
            )}
            <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", bg)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[13px] font-medium text-foreground capitalize">
                {a.action.replace("_", " ")}
              </p>
              <p className="text-[11px] text-muted-foreground">{a.actor}</p>
              {a.note && <p className="mt-0.5 text-[11px] text-muted-foreground">{a.note}</p>}
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">{a.timestamp}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
