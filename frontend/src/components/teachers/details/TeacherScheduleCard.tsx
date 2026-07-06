import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScheduleEntry } from "@/data/teacherDetailsData";

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics:    "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
  Physics:        "bg-violet-100 text-violet-800 border-violet-300 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
  Chemistry:      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  Biology:        "bg-green-100 text-green-800 border-green-300 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800",
  English:        "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  Nepali:         "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
  "Social Studies": "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
  "Computer Science": "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
  Economics:      "bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800",
  Accounts:       "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
};

const BREAK_COLOR = "bg-muted/60 text-muted-foreground border-border/40";

function getColor(entry: ScheduleEntry) {
  if (entry.isBreak) return BREAK_COLOR;
  return SUBJECT_COLORS[entry.subject] ?? "bg-primary/10 text-primary border-primary/30";
}

export function TeacherScheduleCard({ schedule }: { schedule: ScheduleEntry[] }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[14px] font-semibold">Today's Schedule</CardTitle>
          <span className="text-[12px] text-muted-foreground">
            {schedule.filter((e) => !e.isBreak).length} classes
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {schedule.map((entry, i) => {
            const color = getColor(entry);
            return (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${color}`}
              >
                <div className="w-[90px] shrink-0">
                  <p className="text-[11px] font-medium leading-tight">{entry.time}</p>
                </div>
                {entry.isBreak ? (
                  <p className="flex-1 text-[12.5px] font-medium italic">{entry.subject}</p>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold leading-tight">{entry.subject}</p>
                      <p className="text-[11px] opacity-75">{entry.className}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium opacity-75">{entry.room}</span>
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
