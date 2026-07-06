import { BookOpen, Calendar, DollarSign, GraduationCap, PartyPopper, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ParentNotice } from "@/data/parentDetailsData";

const CATEGORY_CFG: Record<ParentNotice["category"], { cls: string; icon: typeof BookOpen }> = {
  Academic: { cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",     icon: BookOpen    },
  Fee:      { cls: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",  icon: DollarSign  },
  Event:    { cls: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400", icon: PartyPopper },
  Exam:     { cls: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",      icon: GraduationCap },
  Holiday:  { cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400", icon: Calendar },
  Meeting:  { cls: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400", icon: Users    },
};

export function ParentNoticeBoard({ notices }: { notices: ParentNotice[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Notice Board</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notices.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No notices available.</p>
        )}
        {notices.map((notice) => {
          const cfg = CATEGORY_CFG[notice.category];
          const Icon = cfg.icon;
          return (
            <div key={notice.id} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              {/* Top row */}
              <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.cls}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-semibold text-foreground">{notice.title}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.cls}`}>
                      {notice.category}
                    </span>
                  </div>
                  <div className="mt-0.5 flex gap-2 text-[11px] text-muted-foreground">
                    <span>{notice.author}</span>
                    <span>·</span>
                    <span>{notice.timeAgo}</span>
                  </div>
                </div>
              </div>
              {/* Body */}
              <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">{notice.text}</p>
              {/* Date */}
              <p className="mt-2 text-[11px] text-muted-foreground/60">
                {new Date(notice.date).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
