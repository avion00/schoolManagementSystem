import type { LucideIcon } from "lucide-react";

import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import { cn } from "@/lib/utils";

const ACCENT_BAR: Record<StudentPillTone, string> = {
  success: "before:bg-emerald-400",
  warning: "before:bg-amber-400",
  danger: "before:bg-rose-400",
  info: "before:bg-blue-400",
  purple: "before:bg-violet-400",
  neutral: "before:bg-border",
};

/** One row in the "Today's Tasks" action panel — icon, title, meta, status pill, quick action. */
export function StudentTaskCard({
  icon: Icon,
  iconCls,
  title,
  meta,
  pillLabel,
  pillTone = "neutral",
  actionLabel,
  onAction,
  onClick,
}: {
  icon: LucideIcon;
  iconCls?: string;
  title: string;
  meta?: string;
  pillLabel?: string;
  pillTone?: StudentPillTone;
  actionLabel?: string;
  onAction?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "t-lift group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card p-3.5 shadow-elevated transition-shadow hover:shadow-md",
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px]",
        ACCENT_BAR[pillTone],
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110", iconCls)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-foreground">{title}</p>
        {meta && <p className="truncate text-[11.5px] text-muted-foreground">{meta}</p>}
      </div>
      {pillLabel && <StudentStatusPill label={pillLabel} tone={pillTone} className="shrink-0" />}
      {actionLabel && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction?.();
          }}
          className="shrink-0 rounded-lg border border-border/60 px-2.5 py-1.5 text-[11.5px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
