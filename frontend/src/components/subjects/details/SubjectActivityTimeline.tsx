import {
  BookOpen, ClipboardList, FileText, Layers, PenLine, Users, RefreshCw, Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SubjectActivity, SubjectActivityType } from "@/data/subjectDetailData";

const TYPE_CFG: Record<SubjectActivityType, { icon: React.ElementType; bg: string; text: string }> = {
  create:   { icon: PenLine,      bg: "bg-violet-100 dark:bg-violet-900/40",  text: "text-violet-600 dark:text-violet-400" },
  teacher:  { icon: Users,        bg: "bg-blue-100 dark:bg-blue-900/40",      text: "text-blue-600 dark:text-blue-400"    },
  syllabus: { icon: BookOpen,     bg: "bg-emerald-100 dark:bg-emerald-900/40",text: "text-emerald-600 dark:text-emerald-400" },
  exam:     { icon: ClipboardList,bg: "bg-amber-100 dark:bg-amber-900/40",    text: "text-amber-600 dark:text-amber-400"  },
  document: { icon: FileText,     bg: "bg-teal-100 dark:bg-teal-900/40",      text: "text-teal-600 dark:text-teal-400"    },
  marks:    { icon: Award,        bg: "bg-rose-100 dark:bg-rose-900/40",      text: "text-rose-600 dark:text-rose-400"    },
  update:   { icon: RefreshCw,    bg: "bg-muted",                             text: "text-muted-foreground"               },
  mapping:  { icon: Layers,       bg: "bg-indigo-100 dark:bg-indigo-900/40",  text: "text-indigo-600 dark:text-indigo-400"},
};

function timeLabel(ts: string) {
  const [date, time] = ts.split(" ");
  return `${date}${time ? " · " + time : ""}`;
}

export function SubjectActivityTimeline({ activities }: { activities: SubjectActivity[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-[14px] font-semibold">Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {activities.map((act, i) => {
            const cfg = TYPE_CFG[act.type];
            const Icon = cfg.icon;
            const isLast = i === activities.length - 1;
            return (
              <div key={act.id} className="flex gap-3">
                {/* icon + stem */}
                <div className="flex flex-col items-center">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cfg.bg}`}>
                    <Icon className={`h-3.5 w-3.5 ${cfg.text}`} />
                  </div>
                  {!isLast && <div className="w-px flex-1 bg-border/50 my-1" />}
                </div>
                {/* content */}
                <div className={`pb-4 ${isLast ? "" : ""}`}>
                  <p className="text-[12.5px] text-foreground leading-snug">{act.message}</p>
                  <p className="mt-0.5 text-[10.5px] text-muted-foreground">
                    {act.user} · {timeLabel(act.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {activities.length === 0 && (
          <p className="py-8 text-center text-[13px] text-muted-foreground">No activity yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
