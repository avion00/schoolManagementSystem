import {
  CALENDAR_DAYS,
  CALENDAR_FIRST_DAY,
  CALENDAR_MONTH,
  CALENDAR_TODAY,
  calendarEvents,
  type CalendarEvent,
} from "@/data/dashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const DAYS_HEADER = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const eventMap = new Map<number, CalendarEvent>();
calendarEvents.forEach((e) => eventMap.set(e.date, e));

export function EventCalendarCard() {
  // Build grid cells: null for leading empty slots, then day numbers 1–31
  const cells: Array<number | null> = [
    ...Array<null>(CALENDAR_FIRST_DAY).fill(null),
    ...Array.from({ length: CALENDAR_DAYS }, (_, i) => i + 1),
  ];

  const upcoming = calendarEvents.filter((e) => e.date >= CALENDAR_TODAY).slice(0, 4);

  return (
    <Card className="h-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-base">{CALENDAR_MONTH}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Column headers */}
        <div className="grid grid-cols-7 text-center">
          {DAYS_HEADER.map((d) => (
            <div key={d} className="py-1 text-[11px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 text-center">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="py-0.5" />;
            const event = eventMap.get(day);
            const isToday = day === CALENDAR_TODAY;
            return (
              <div key={day} className="flex flex-col items-center py-0.5">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs",
                    isToday && "bg-primary font-semibold text-primary-foreground",
                    !isToday && event && "font-medium text-foreground",
                    !isToday && !event && "text-muted-foreground",
                  )}
                >
                  {day}
                </span>
                {event ? (
                  <span className={cn("mt-0.5 h-1 w-1 rounded-full", event.color)} />
                ) : (
                  <span className="mt-0.5 h-1 w-1" />
                )}
              </div>
            );
          })}
        </div>

        {/* Upcoming event list */}
        {upcoming.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t pt-3">
            {upcoming.map((e) => (
              <div key={`${e.date}-${e.title}`} className="flex items-center gap-2.5 text-xs">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", e.color)} />
                <span className="w-10 shrink-0 font-semibold text-foreground">Jul {e.date}</span>
                <span className="truncate text-muted-foreground">{e.title}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
