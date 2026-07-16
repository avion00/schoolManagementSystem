import { Flame, Plus } from "lucide-react";
import { useState } from "react";

import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumSelect } from "@/components/ui/PremiumSelect";
import {
  addStudyTask, exams, studyPlannerTasks as initialTasks, studyStreak, subjects, toggleStudyTask,
} from "@/data/studentDashboardData";

export function StudentStudyPlanner() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");

  function refresh() { setTasks([...initialTasks]); }

  function toggle(id: string) { toggleStudyTask(id); refresh(); }

  function addTask() {
    if (!newTitle.trim()) return;
    addStudyTask(newTitle.trim(), newSubject || null);
    setNewTitle("");
    setNewSubject("");
    refresh();
  }

  const weakestSubject = [...subjects].sort((a, b) => a.latestMarks - b.latestMarks)[0];
  const upcomingExam = exams.find((e) => e.status === "Upcoming");
  const done = tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Study Planner</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{done}/{tasks.length} tasks completed today</p>
      </Reveal>

      <Reveal delay={40} className="grid gap-3 sm:grid-cols-3">
        <PremiumCard className="flex items-center gap-3 p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <Flame className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-foreground">{studyStreak.currentStreakDays} days</p>
            <p className="text-[11px] text-muted-foreground">Current study streak</p>
          </div>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="text-[11.5px] font-medium text-muted-foreground">Focus subject</p>
          <p className="mt-1 text-[14px] font-semibold text-foreground">{weakestSubject.name}</p>
          <p className="text-[11.5px] text-muted-foreground">Lowest recent marks — {weakestSubject.latestMarks}/{weakestSubject.latestFullMarks}</p>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="text-[11.5px] font-medium text-muted-foreground">Next exam</p>
          <p className="mt-1 text-[14px] font-semibold text-foreground">{upcomingExam ? `${upcomingExam.subject} — ${upcomingExam.date}` : "None scheduled"}</p>
        </PremiumCard>
      </Reveal>

      <Reveal delay={80}>
        <PremiumCard className="p-5">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Today's study plan</p>
          <div className="space-y-2">
            {tasks.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5 hover:bg-accent/30">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} className="h-4 w-4 accent-primary" />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[13px] ${t.done ? "text-muted-foreground line-through" : "text-foreground"}`}>{t.title}</p>
                  {t.subject && <p className="text-[11px] text-muted-foreground">{t.subject}{t.suggested ? " · Suggested" : ""}</p>}
                </div>
              </label>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-border/60 pt-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-[12px] font-medium text-foreground">Add a personal task</label>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Review notes for tomorrow"
                className="h-9 w-full rounded-xl border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="w-40">
              <PremiumSelect value={newSubject} onChange={setNewSubject} placeholder="Subject (optional)" options={subjects.map((s) => ({ value: s.name, label: s.name }))} />
            </div>
            <Button size="sm" className="h-9 gap-1.5 text-[12px]" onClick={addTask}><Plus className="h-3.5 w-3.5" /> Add</Button>
          </div>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
