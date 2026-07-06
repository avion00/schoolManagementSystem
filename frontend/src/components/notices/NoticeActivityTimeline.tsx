import { FilePlus, Pencil, CheckCircle2, Archive, Eye, ThumbsUp } from "lucide-react";
import type { ActivityRecord } from "@/data/noticesData";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  create:  { Icon: FilePlus,     bg: "bg-blue-100 dark:bg-blue-950/30",    color: "text-blue-600"    },
  edit:    { Icon: Pencil,       bg: "bg-amber-100 dark:bg-amber-950/30",  color: "text-amber-600"   },
  publish: { Icon: CheckCircle2, bg: "bg-emerald-100 dark:bg-emerald-950/30", color: "text-emerald-600" },
  archive: { Icon: Archive,      bg: "bg-slate-100 dark:bg-slate-800",     color: "text-slate-500"   },
  read:    { Icon: Eye,          bg: "bg-indigo-100 dark:bg-indigo-950/30",color: "text-indigo-600"  },
  approve: { Icon: ThumbsUp,     bg: "bg-violet-100 dark:bg-violet-950/30",color: "text-violet-600"  },
} as const;

export function NoticeActivityTimeline({ activities }: { activities: ActivityRecord[] }) {
  if (activities.length === 0) {
    return <p className="text-[12px] text-muted-foreground text-center py-6">No activity recorded.</p>;
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-border/60" />

      <div className="space-y-4">
        {activities.map((act, idx) => {
          const cfg = ICON_MAP[act.icon] ?? ICON_MAP.create;
          const { Icon } = cfg;
          return (
            <div key={act.id} className={cn("flex items-start gap-3", idx === 0 && "")}>
              {/* Icon */}
              <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", cfg.bg)}>
                <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
              </div>
              {/* Content */}
              <div className="flex-1 pt-1">
                <p className="text-[12px] font-medium text-foreground leading-snug">{act.action}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                  <span className="font-medium">{act.by}</span>
                  <span>·</span>
                  <span>{act.at}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
