import { BookOpen, CalendarCheck, ClipboardList, FilePlus, GraduationCap, LayoutGrid, Settings, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassActivity } from "@/data/classDetailData";

const TYPE_CFG: Record<ClassActivity["type"], { icon: typeof BookOpen; bg: string; text: string }> = {
  create:     { icon: LayoutGrid,    bg: "bg-violet-100 dark:bg-violet-950/50",  text: "text-violet-600 dark:text-violet-400" },
  section:    { icon: LayoutGrid,    bg: "bg-blue-100 dark:bg-blue-950/50",      text: "text-blue-600 dark:text-blue-400" },
  student:    { icon: Users,         bg: "bg-emerald-100 dark:bg-emerald-950/50",text: "text-emerald-600 dark:text-emerald-400" },
  timetable:  { icon: CalendarCheck, bg: "bg-amber-100 dark:bg-amber-950/50",    text: "text-amber-600 dark:text-amber-400" },
  attendance: { icon: ClipboardList, bg: "bg-sky-100 dark:bg-sky-950/50",        text: "text-sky-600 dark:text-sky-400" },
  exam:       { icon: FilePlus,      bg: "bg-orange-100 dark:bg-orange-950/50",  text: "text-orange-600 dark:text-orange-400" },
  result:     { icon: GraduationCap, bg: "bg-rose-100 dark:bg-rose-950/50",      text: "text-rose-600 dark:text-rose-400" },
  update:     { icon: Settings,      bg: "bg-slate-100 dark:bg-slate-800/50",    text: "text-slate-600 dark:text-slate-400" },
};

function timeLabel(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function ClassActivityTimeline({ activities }: { activities: ClassActivity[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-0">
          {activities.map((act, i) => {
            const cfg = TYPE_CFG[act.type];
            const Icon = cfg.icon;
            const isLast = i === activities.length - 1;
            return (
              <li key={act.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cfg.bg} ${cfg.text}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isLast && <div className="mt-1 w-px flex-1 bg-border/50 mb-1" />}
                </div>
                <div className={`min-w-0 flex-1 ${isLast ? "" : "pb-5"}`}>
                  <p className="text-[13px] text-foreground leading-snug">{act.message}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{timeLabel(act.timestamp)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
