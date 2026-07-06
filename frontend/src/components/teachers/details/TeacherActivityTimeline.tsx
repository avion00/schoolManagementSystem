import {
  BookOpen,
  CalendarCheck,
  CreditCard,
  FileText,
  Trophy,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeacherActivity } from "@/data/teacherDetailsData";

const ICON_MAP: Record<TeacherActivity["type"], { Icon: typeof UserPlus; color: string; bg: string }> = {
  join:       { Icon: UserPlus,      color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-100 dark:bg-violet-950/50" },
  attendance: { Icon: CalendarCheck, color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-950/50"     },
  leave:      { Icon: CalendarCheck, color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-100 dark:bg-amber-950/50"   },
  salary:     { Icon: CreditCard,    color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-950/50" },
  award:      { Icon: Trophy,        color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-950/50" },
  class:      { Icon: BookOpen,      color: "text-primary",                          bg: "bg-primary/10"                       },
  exam:       { Icon: FileText,      color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-950/50" },
  update:     { Icon: RefreshCw,     color: "text-gray-600 dark:text-gray-400",     bg: "bg-gray-100 dark:bg-gray-950/50"     },
};

function fmtTs(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

export function TeacherActivityTimeline({ activities }: { activities: TeacherActivity[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-4 top-2 h-[calc(100%-16px)] w-px bg-border/50" />

          {activities.map((act, i) => {
            const { Icon, color, bg } = ICON_MAP[act.type] ?? ICON_MAP.update;
            return (
              <div key={act.id} className={`relative flex gap-3 ${i < activities.length - 1 ? "pb-5" : ""}`}>
                <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-[13px] text-foreground">{act.message}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{fmtTs(act.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
