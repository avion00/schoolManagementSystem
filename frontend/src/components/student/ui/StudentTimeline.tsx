import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StudentTimelineStatus = "completed" | "ongoing" | "upcoming";

/** Vertical connecting line wrapper — place StudentTimelineItem children inside. */
export function StudentTimeline({ children }: { children: ReactNode }) {
  return <div className="relative">{children}</div>;
}

export function StudentTimelineItem({
  index,
  status,
  title,
  meta,
  time,
  isLast = false,
}: {
  index: number | string;
  status: StudentTimelineStatus;
  title: string;
  meta?: string;
  time: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">
      {!isLast && (
        <span
          className={cn(
            "absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px",
            status === "ongoing" ? "bg-gradient-to-b from-primary/40 to-border" : "bg-border",
          )}
          aria-hidden="true"
        />
      )}
      <span
        className={cn(
          "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-all",
          status === "ongoing" && "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-[0_0_0_4px_rgb(79_70_229/0.15),0_4px_10px_-2px_rgb(79_70_229/0.5)]",
          status === "completed" && "bg-muted text-muted-foreground",
          status === "upcoming" && "border border-border bg-card text-muted-foreground",
        )}
      >
        {index}
      </span>

      <div
        className={cn(
          "flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-colors",
          status === "ongoing" && "border border-primary/25 bg-gradient-to-r from-primary/[0.07] to-transparent",
          status === "completed" && "bg-transparent",
          status === "upcoming" && "border border-transparent",
        )}
      >
        <div className="min-w-0">
          <p className={cn("truncate text-[13px] font-medium", status === "completed" ? "text-muted-foreground" : "text-foreground")}>
            {title}
          </p>
          {meta && <p className="truncate text-[11.5px] text-muted-foreground">{meta}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-muted-foreground">{time}</p>
          <p className="mt-0.5 flex items-center justify-end gap-1 text-[10.5px]">
            {status === "ongoing" && (
              <>
                <PlayCircle className="h-3 w-3 text-primary" />
                <span className="font-medium text-primary">Ongoing</span>
              </>
            )}
            {status === "completed" && (
              <>
                <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Completed</span>
              </>
            )}
            {status === "upcoming" && (
              <>
                <Circle className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-muted-foreground">Upcoming</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
