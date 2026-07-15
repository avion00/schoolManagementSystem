import { Download, MessageSquare, Printer } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Reveal, SlidingTabs } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { todaySchedule, timetable, type TimetablePeriod } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const DAYS: TimetablePeriod["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
// Mirrors todaySchedule — the demo's "today" always lands on Thursday.
const TODAY_DAY: TimetablePeriod["day"] = "Thu";
const VIEW_TABS = [{ value: "today", label: "Today" }, { value: "week", label: "Week" }];

export function StudentTimetable() {
  const navigate = useNavigate();
  const [view, setView] = useState("today");
  const periodsPerDay = Math.max(...timetable.map((t) => t.period));

  return (
    <div className="space-y-4">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">My Timetable</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">Grade 8-A weekly class schedule</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => toast.success("Downloading timetable…")}>
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]" onClick={() => navigate("/student/messages")}>
              <MessageSquare className="h-3.5 w-3.5" /> Message teacher
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <SlidingTabs value={view} onValueChange={setView} options={VIEW_TABS} className="w-max" />
      </Reveal>

      {view === "today" ? (
        <Reveal delay={80} className="space-y-2">
          {todaySchedule.map((p) => (
            <PremiumCard
              key={p.id}
              className={cn(
                "flex items-center gap-3 p-3",
                p.status === "Ongoing" && "border-primary/40 bg-primary/5",
                p.status === "Completed" && "opacity-60",
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground">{p.period}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{p.subject}</p>
                {!p.isBreak && <p className="truncate text-[11.5px] text-muted-foreground">{p.teacher} · {p.room}</p>}
              </div>
              <span className="shrink-0 text-[11.5px] text-muted-foreground">{p.time}</span>
            </PremiumCard>
          ))}
        </Reveal>
      ) : (
        <Reveal delay={80} className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-1.5">
            <thead>
              <tr>
                <th className="w-16 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Period</th>
                {DAYS.map((d) => (
                  <th key={d} className={cn("text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", d === TODAY_DAY && "text-primary")}>
                    {d}{d === TODAY_DAY && " · Today"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((period) => (
                <tr key={period}>
                  <td className="text-[11px] text-muted-foreground">{timetable.find((t) => t.period === period)?.time}</td>
                  {DAYS.map((day) => {
                    const cell = timetable.find((t) => t.day === day && t.period === period);
                    if (!cell) return <td key={day} />;
                    return (
                      <td key={day}>
                        <div className={cn("rounded-xl border border-border/60 p-2", day === TODAY_DAY && "border-primary/40 bg-primary/5", cell.isBreak && "bg-muted/40 text-center")}>
                          <p className="truncate text-[12px] font-medium text-foreground">{cell.subject}</p>
                          {!cell.isBreak && <p className="truncate text-[10.5px] text-muted-foreground">{cell.teacher} · {cell.room}</p>}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      )}
    </div>
  );
}
