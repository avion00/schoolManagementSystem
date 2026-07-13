import { Printer } from "lucide-react";

import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { assignedClasses } from "@/data/teacherDashboardData";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;
const PERIODS = ["1st · 8:00 AM", "2nd · 8:50 AM", "3rd · 9:40 AM", "4th · 10:30 AM", "5th · 11:45 AM"] as const;

/** Deterministic weekly slot pattern built from the teacher's real assigned classes
 *  (not random-per-render) — cycles through her classes across the week's grid. */
function slotFor(dayIndex: number, periodIndex: number) {
  const idx = (dayIndex * PERIODS.length + periodIndex) % assignedClasses.length;
  return assignedClasses[idx];
}

export function TeacherTimetable() {
  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">My Timetable</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Weekly class schedule across your assigned sections.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
      </Reveal>

      <Reveal delay={60}>
        <PremiumCard className="overflow-x-auto p-4">
          <table className="w-full min-w-[720px] border-separate border-spacing-2 text-left text-[12.5px]">
            <thead>
              <tr>
                <th className="w-32 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Period</th>
                {DAYS.map((d) => (
                  <th key={d} className="pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period, pIdx) => (
                <tr key={period}>
                  <td className="align-top text-[11.5px] font-medium text-muted-foreground">{period}</td>
                  {DAYS.map((day, dIdx) => {
                    const cls = slotFor(dIdx, pIdx);
                    return (
                      <td key={day}>
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-2.5">
                          <p className="truncate text-[12.5px] font-medium text-foreground">{cls.subject}</p>
                          <p className="truncate text-[11px] text-muted-foreground">{cls.className}-{cls.section} · {cls.room}</p>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
