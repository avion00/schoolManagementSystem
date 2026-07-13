import { useState } from "react";
import { CalendarClock, CheckSquare, ClipboardCheck, FileUp, Printer, Square } from "lucide-react";

import { Reveal } from "@/components/motion";
import { ExamTimeline } from "@/components/teacher/ExamTimeline";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  examPrepChecklist as SEED_CHECKLIST,
  invigilationDuties,
  upcomingExams,
} from "@/data/teacherDashboardData";
import { cn } from "@/lib/utils";

export function TeacherExams() {
  const [checklist, setChecklist] = useState(SEED_CHECKLIST);

  function toggleItem(id: string) {
    setChecklist((items) => items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
  }

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Exams</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Upcoming exams, invigilation duties, marks deadlines, and prep for your assigned classes.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5" /> Print schedule
        </Button>
      </Reveal>

      <Reveal delay={60} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Upcoming Exams", value: upcomingExams.length, icon: CalendarClock },
          { label: "Invigilation Duties", value: invigilationDuties.length, icon: ClipboardCheck },
          { label: "Marks Deadlines", value: upcomingExams.filter((e) => e.marksDeadline).length, icon: FileUp },
          { label: "Revision Materials", value: checklist.filter((c) => c.label.toLowerCase().includes("upload") || c.label.toLowerCase().includes("share")).length, icon: FileUp },
        ].map((tile) => {
          const Icon = tile.icon;
          return (
            <PremiumCard key={tile.label} className="flex flex-col gap-2 p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10"><Icon className="h-4 w-4 text-primary" /></span>
              <p className="text-xl font-bold tabular-nums text-foreground">{tile.value}</p>
              <p className="text-[11.5px] text-muted-foreground">{tile.label}</p>
            </PremiumCard>
          );
        })}
      </Reveal>

      <Reveal delay={100} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="mb-2 text-[13.5px] font-semibold text-foreground">Upcoming Exams</p>
          <ExamTimeline exams={upcomingExams} />
        </div>

        <div className="flex flex-col gap-4">
          <PremiumCard className="p-5">
            <p className="mb-3 text-[13.5px] font-semibold text-foreground">Invigilation Duties</p>
            <div className="space-y-2">
              {invigilationDuties.map((d) => (
                <div key={d.id} className="rounded-xl border border-border/50 p-2.5">
                  <p className="text-[12.5px] font-medium text-foreground">{d.exam}</p>
                  <p className="text-[11.5px] text-muted-foreground">{d.className} · {d.date} · {d.time} · {d.room}</p>
                </div>
              ))}
            </div>
          </PremiumCard>

          <PremiumCard className="p-5">
            <p className="mb-3 text-[13.5px] font-semibold text-foreground">Exam Prep Checklist</p>
            <div className="space-y-1.5">
              {checklist.map((item) => (
                <button key={item.id} type="button" onClick={() => toggleItem(item.id)} className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left hover:bg-accent/40">
                  {item.done ? <CheckSquare className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <Square className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  <span className={cn("text-[12.5px]", item.done ? "text-muted-foreground line-through" : "text-foreground")}>{item.label}</span>
                </button>
              ))}
            </div>
          </PremiumCard>
        </div>
      </Reveal>
    </div>
  );
}
