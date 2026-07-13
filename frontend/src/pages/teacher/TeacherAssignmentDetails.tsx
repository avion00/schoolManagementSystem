import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { assignedStudents, assignments, homeworkList } from "@/data/teacherDashboardData";

export function TeacherAssignmentDetails() {
  const { id } = useParams<{ id: string }>();
  const [grades, setGrades] = useState<Record<number, string>>({});

  const homework = homeworkList.find((h) => h.id === id);
  const assignment = assignments.find((a) => a.id === id);
  const entry = homework ?? assignment;
  if (!entry) return <Navigate to="/teacher/assignments" replace />;

  const maxMarks = assignment?.maxMarks;
  const students = assignedStudents.filter((s) => s.classId === entry.classId);
  const submitted = students.filter((s) => (s.id + entry.id.length) % 3 !== 0);
  const pending = students.filter((s) => !submitted.includes(s));
  const graded = submitted.filter((s) => s.id % 2 === 0);

  function submitTime(studentId: number) {
    const hour = 7 + (studentId % 4);
    return `${entry!.dueDate} · ${hour}:${(studentId % 6) * 10 || "00"} PM`;
  }

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{entry.title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {entry.className}-{entry.section} · {entry.subject} · Due {entry.dueDate}
            {maxMarks ? ` · Out of ${maxMarks}` : ""}
          </p>
        </div>
        <PremiumBadge label={entry.status} tone={entry.status === "Active" ? "success" : "neutral"} />
      </Reveal>

      {assignment?.instructions && (
        <Reveal delay={40} className="grid gap-4 lg:grid-cols-2">
          <PremiumCard className="p-4 text-[13px] text-foreground">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Instructions</p>
            {assignment.instructions}
          </PremiumCard>
          {assignment.rubric && (
            <PremiumCard className="p-4 text-[13px] text-foreground">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Grading Rubric</p>
              {assignment.rubric}
            </PremiumCard>
          )}
        </Reveal>
      )}

      <Reveal delay={80} className="grid grid-cols-3 gap-3">
        <PremiumCard className="p-4 text-center">
          <p className="text-xl font-bold tabular-nums text-foreground">{submitted.length}/{students.length}</p>
          <p className="text-[11.5px] text-muted-foreground">Submitted</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="text-xl font-bold tabular-nums text-foreground">{graded.length}</p>
          <p className="text-[11.5px] text-muted-foreground">Reviewed</p>
        </PremiumCard>
        <PremiumCard className="p-4 text-center">
          <p className="text-xl font-bold tabular-nums text-foreground">{pending.length}</p>
          <p className="text-[11.5px] text-muted-foreground">Pending</p>
        </PremiumCard>
      </Reveal>

      <Reveal delay={120}>
        <PremiumCard className="overflow-x-auto p-0">
          <p className="border-b border-border/60 p-4 text-[13.5px] font-semibold text-foreground">Submissions</p>
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-semibold">Student</th>
                <th className="px-4 py-2.5 font-semibold">Submitted</th>
                <th className="px-4 py-2.5 font-semibold">File</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                {maxMarks && <th className="px-4 py-2.5 font-semibold">Marks</th>}
                <th className="px-4 py-2.5 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {submitted.map((s) => {
                const isGraded = graded.includes(s);
                return (
                  <tr key={s.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar name={s.name} />
                        <span className="font-medium text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{submitTime(s.id)}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">submission.pdf</td>
                    <td className="px-4 py-2.5"><PremiumBadge label={isGraded ? "Reviewed" : "Ungraded"} tone={isGraded ? "success" : "warning"} /></td>
                    {maxMarks && (
                      <td className="px-4 py-2.5">
                        <input
                          value={grades[s.id] ?? ""}
                          onChange={(e) => setGrades((g) => ({ ...g, [s.id]: e.target.value }))}
                          placeholder={`/ ${maxMarks}`}
                          className="h-8 w-20 rounded-lg border border-neutral-200 bg-white px-2 text-center text-[12.5px] shadow-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-neutral-800 dark:bg-neutral-950"
                        />
                      </td>
                    )}
                    <td className="px-4 py-2.5">
                      <Button variant="ghost" size="sm" className="h-7 text-[11.5px]" onClick={() => toast.success(`Feedback saved for ${s.name} (demo)`)}>Save</Button>
                    </td>
                  </tr>
                );
              })}
              {pending.map((s) => (
                <tr key={s.id} className="border-b border-border/40 bg-muted/20 last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <StudentAvatar name={s.name} />
                      <span className="font-medium text-foreground">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">—</td>
                  <td className="px-4 py-2.5 text-muted-foreground">—</td>
                  <td className="px-4 py-2.5"><PremiumBadge label="Not submitted" tone="danger" /></td>
                  {maxMarks && <td className="px-4 py-2.5 text-muted-foreground">—</td>}
                  <td className="px-4 py-2.5">
                    <Button variant="ghost" size="sm" className="h-7 text-[11.5px]" onClick={() => toast.info(`Message sent to ${s.guardian} — coming soon`)}>Remind</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pending.length > 0 && (
            <div className="flex justify-end border-t border-border/60 p-3">
              <Button variant="outline" size="sm" onClick={() => toast.info(`Reminder sent to ${pending.length} students/parents`)}>
                Message all pending
              </Button>
            </div>
          )}
        </PremiumCard>
      </Reveal>
    </div>
  );
}
