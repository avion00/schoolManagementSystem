import { CheckCircle2, Circle, PlayCircle } from "lucide-react";

import { Reveal } from "@/components/motion";
import { StudentTodayTasks } from "@/components/student/StudentTodayTasks";
import { StudentWelcomeHero } from "@/components/student/StudentWelcomeHero";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { computeAttendanceSummary, feeSummary, learningMaterials, todaySchedule } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

export function StudentToday() {
  const attendance = computeAttendanceSummary();
  const newMaterials = learningMaterials.filter((m) => m.date === "2026-07-15").length;
  const feeDueDays = daysUntil(feeSummary.nextDueDate);

  const reminders = [
    "Math homework due today — don't forget to submit!",
    "Science unit test on Friday — start revising.",
    `${newMaterials} new materials uploaded this week.`,
    `Attendance this month: ${attendance.presentPct}%.`,
    feeDueDays > 0 ? `Fee payment due in ${feeDueDays} days.` : "Fee payment is due — please pay soon.",
  ];

  return (
    <div className="space-y-4">
      <StudentWelcomeHero />

      <Reveal delay={80}>
        <p className="mb-2 text-[13.5px] font-semibold text-foreground">Today's Schedule</p>
        <div className="space-y-2">
          {todaySchedule.map((p) => (
            <PremiumCard
              key={p.id}
              className={cn(
                "flex items-center gap-3 p-3",
                p.status === "Ongoing" && "border-primary/40 bg-primary/5",
                p.status === "Completed" && "opacity-60",
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[11px] font-semibold text-muted-foreground">
                {p.period}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{p.subject}</p>
                {!p.isBreak && <p className="truncate text-[11.5px] text-muted-foreground">{p.teacher} · {p.room}</p>}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11.5px] text-muted-foreground">{p.time}</p>
                <p className="mt-0.5 flex items-center justify-end gap-1 text-[10.5px]">
                  {p.status === "Ongoing" && <><PlayCircle className="h-3 w-3 text-primary" /> <span className="font-medium text-primary">Ongoing</span></>}
                  {p.status === "Completed" && <><CheckCircle2 className="h-3 w-3 text-muted-foreground" /> <span className="text-muted-foreground">Completed</span></>}
                  {p.status === "Upcoming" && <><Circle className="h-3 w-3 text-muted-foreground/50" /> <span className="text-muted-foreground">Upcoming</span></>}
                </p>
              </div>
            </PremiumCard>
          ))}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p className="mb-2 text-[13.5px] font-semibold text-foreground">Today's Tasks</p>
        <StudentTodayTasks />
      </Reveal>

      <Reveal delay={160}>
        <p className="mb-2 text-[13.5px] font-semibold text-foreground">Smart Reminders</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {reminders.map((r, i) => (
            <PremiumCard key={i} className="p-3 text-[12.5px] text-foreground">
              {r}
            </PremiumCard>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
