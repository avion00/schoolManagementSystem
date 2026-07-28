import { notices } from "@/data/dashboardData";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { cn } from "@/lib/utils";

export function NoticeBoardCard() {
  return (
    <PremiumCard className="flex h-full flex-col p-5">
      <p className="font-display mb-3 text-base font-semibold tracking-tight text-foreground">Notice Board</p>
      <div className="flex-1 space-y-2 overflow-y-auto">
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="space-y-1 rounded-lg border border-neutral-200/80 p-3 transition-colors hover:bg-muted/40 dark:border-neutral-800"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-medium",
                  notice.categoryColor,
                )}
              >
                {notice.category}
              </span>
              {notice.isNew && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  New
                </span>
              )}
            </div>
            <p className="text-sm font-medium leading-snug text-foreground">{notice.title}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">{notice.description}</p>
            <p className="text-[11px] text-muted-foreground/70">
              {notice.author} · {notice.date}
            </p>
          </div>
        ))}
      </div>
    </PremiumCard>
  );
}
