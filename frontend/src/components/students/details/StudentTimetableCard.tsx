import { Clock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimetableEntry } from "@/data/studentDetailsData";
import { cn } from "@/lib/utils";

const COLOR_MAP: Record<string, string> = {
  blue:    "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  emerald: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  violet:  "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  amber:   "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  sky:     "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  rose:    "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
};

const DOT_MAP: Record<string, string> = {
  blue: "bg-blue-500", emerald: "bg-emerald-500", violet: "bg-violet-500",
  amber: "bg-amber-500", sky: "bg-sky-500", rose: "bg-rose-500",
};

export function StudentTimetableCard({ timetable }: { timetable: TimetableEntry[] }) {
  const now = new Date();

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-primary" />
          Today's Timetable
          <span className="ml-auto text-[11px] font-normal text-muted-foreground">
            {now.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {timetable.map((entry) => {
            const isBreak = entry.teacher === "—";
            return (
              <div
                key={entry.period}
                className={cn(
                  "flex items-center gap-4 rounded-xl border p-3",
                  isBreak ? "border-border/40 bg-muted/30" : cn("border", COLOR_MAP[entry.color] ?? "bg-muted/30"),
                )}
              >
                {/* Period bullet */}
                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", isBreak ? "bg-muted text-muted-foreground" : cn(DOT_MAP[entry.color] ?? "bg-muted", "text-white"))}>
                  {entry.period}
                </div>

                {/* Time */}
                <span className="w-[120px] shrink-0 text-xs font-medium text-muted-foreground">
                  {entry.time}
                </span>

                {/* Subject */}
                <span className={cn("flex-1 text-sm font-semibold", isBreak && "text-muted-foreground")}>
                  {entry.subject}
                </span>

                {!isBreak && (
                  <>
                    <span className="hidden text-xs text-muted-foreground sm:block">{entry.teacher}</span>
                    <span className="shrink-0 rounded-md bg-background/70 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {entry.room}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
