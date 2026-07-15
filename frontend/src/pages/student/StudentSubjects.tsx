import { useState } from "react";

import { Reveal } from "@/components/motion";
import { StudentSubjectCard } from "@/components/student/StudentSubjectCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { homeworkAssignments, learningMaterials, subjects, type StudentSubject } from "@/data/studentDashboardData";

export function StudentSubjects() {
  const [active, setActive] = useState<StudentSubject | null>(null);

  const activeHomework = active ? homeworkAssignments.filter((h) => h.subject === active.name) : [];
  const activeMaterials = active ? learningMaterials.filter((m) => m.subject === active.name) : [];

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">My Subjects</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{subjects.length} subjects this term</p>
      </Reveal>

      <Reveal delay={60} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => <StudentSubjectCard key={s.id} subject={s} onClick={() => setActive(s)} />)}
      </Reveal>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-[13px]">
                <p className="text-muted-foreground">Taught by <span className="text-foreground">{active.teacher}</span> · {active.weeklyClasses} classes/week</p>

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Syllabus topics</p>
                  <ul className="list-disc space-y-1 pl-5 text-foreground">
                    {active.syllabusTopics.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Homework ({activeHomework.length})</p>
                  {activeHomework.length === 0 ? <p className="text-muted-foreground">No homework for this subject.</p> : (
                    <ul className="space-y-1 text-foreground">
                      {activeHomework.map((h) => <li key={h.id}>{h.title} — <span className="text-muted-foreground">{h.status}</span></li>)}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Materials ({activeMaterials.length})</p>
                  {activeMaterials.length === 0 ? <p className="text-muted-foreground">No materials shared yet.</p> : (
                    <ul className="space-y-1 text-foreground">
                      {activeMaterials.map((m) => <li key={m.id}>{m.title}</li>)}
                    </ul>
                  )}
                </div>

                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Latest result</p>
                  <p className="text-foreground">{active.latestMarks}/{active.latestFullMarks} marks</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
