import { useState } from "react";
import { CalendarCheck, MessageSquare, Phone, PenLine } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { AssignmentCard } from "@/components/teacher/AssignmentCard";
import { MaterialCard } from "@/components/teacher/MaterialCard";
import { StudentRiskBadge } from "@/components/teacher/StudentRiskBadge";
import { Button } from "@/components/ui/button";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import {
  assignedClasses,
  assignedStudents,
  assignments,
  computeRiskLevel,
  homeworkList,
  lessonPlans,
  marksForStudent,
  marksPending,
  teachingMaterials,
  upcomingExams,
} from "@/data/teacherDashboardData";

type Tab = "overview" | "students" | "attendance" | "assignments" | "marks" | "materials" | "notes" | "parents";
const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "students", label: "Students" },
  { value: "attendance", label: "Attendance" },
  { value: "assignments", label: "Assignments" },
  { value: "marks", label: "Marks" },
  { value: "materials", label: "Materials" },
  { value: "notes", label: "Notes" },
  { value: "parents", label: "Parents" },
];

export function TeacherClassDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const cls = assignedClasses.find((c) => c.id === id);

  if (!cls) return <Navigate to="/teacher/classes" replace />;

  const students = assignedStudents.filter((s) => s.classId === cls.id);
  const materials = teachingMaterials.filter((m) => m.classId === cls.id);
  const exams = upcomingExams.filter((e) => e.classId === cls.id);
  const notes = lessonPlans.filter((l) => l.classId === cls.id);
  const homeworkDone = students.filter((s) => s.pendingHomework === 0).length;
  const atRisk = students.filter((s) => computeRiskLevel(s) !== "Low Risk");
  const avgMarks = students.length ? Math.round(students.reduce((sum, s) => sum + marksForStudent(s), 0) / students.length) : 0;
  const classAssignments = [
    ...homeworkList.filter((h) => h.classId === cls.id).map((h) => ({ ...h, kind: "Homework" as const })),
    ...assignments.filter((a) => a.classId === cls.id).map((a) => ({ ...a, kind: "Assignment" as const })),
  ];
  const classMarks = marksPending.filter((m) => m.classId === cls.id);

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{cls.className} · {cls.section}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{cls.subject} · {cls.room}{cls.isClassTeacher && " · You are the class teacher"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/teacher/attendance?class=${cls.id}`)}>
            <CalendarCheck className="h-3.5 w-3.5" /> Mark Attendance
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/teacher/marks?class=${cls.id}`)}>
            <PenLine className="h-3.5 w-3.5" /> Enter Marks
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => toast.info(`Message composer for ${cls.className}-${cls.section} — coming soon`)}>
            <MessageSquare className="h-3.5 w-3.5" /> Message Parents
          </Button>
        </div>
      </Reveal>

      <Reveal delay={40}>
        <PremiumTabs value={tab} onValueChange={(v) => setTab(v as Tab)} options={TABS} />
      </Reveal>

      {tab === "overview" && (
        <Reveal delay={80} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Students", value: cls.students },
              { label: "Attendance rate", value: `${cls.attendanceRate}%` },
              { label: "Avg. performance", value: avgMarks },
              { label: "Homework done", value: `${homeworkDone}/${students.length}` },
            ].map((stat) => (
              <PremiumCard key={stat.label} className="p-4">
                <p className="text-xl font-bold tabular-nums text-foreground">{stat.value}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{stat.label}</p>
              </PremiumCard>
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <PremiumCard className="p-5">
              <p className="mb-3 text-[13.5px] font-semibold text-foreground">Students Needing Attention</p>
              {atRisk.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No students flagged in this class.</p> : (
                <div className="space-y-1.5">
                  {atRisk.map((s) => (
                    <button key={s.id} type="button" onClick={() => navigate(`/teacher/students/${s.id}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-accent/40">
                      <StudentAvatar name={s.name} />
                      <p className="min-w-0 flex-1 truncate text-[13px] text-foreground">{s.name}</p>
                      <StudentRiskBadge level={computeRiskLevel(s)} />
                    </button>
                  ))}
                </div>
              )}
            </PremiumCard>
            <PremiumCard className="p-5">
              <p className="mb-3 text-[13.5px] font-semibold text-foreground">Upcoming Exams</p>
              {exams.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No exams scheduled.</p> : (
                <ul className="space-y-1.5 text-[12.5px]">
                  {exams.map((e) => <li key={e.id} className="text-foreground">{e.type} <span className="text-muted-foreground">· {e.date}</span></li>)}
                </ul>
              )}
            </PremiumCard>
          </div>
        </Reveal>
      )}

      {tab === "students" && (
        <Reveal delay={80}>
          <PremiumCard className="p-5">
            <div className="space-y-1.5">
              {students.map((s) => (
                <button key={s.id} type="button" onClick={() => navigate(`/teacher/students/${s.id}`)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-accent/40">
                  <StudentAvatar name={s.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-foreground">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">Roll {s.roll} · {s.attendancePercentage.toFixed(0)}% attendance</p>
                  </div>
                  <PremiumBadge label={s.performance} tone={s.performance === "Excellent" ? "success" : s.performance === "Needs Improvement" ? "danger" : "info"} />
                </button>
              ))}
            </div>
          </PremiumCard>
        </Reveal>
      )}

      {tab === "attendance" && (
        <Reveal delay={80}>
          <PremiumCard className="p-5">
            <p className="mb-3 text-[13.5px] font-semibold text-foreground">Attendance rate: {cls.attendanceRate}%</p>
            <Button onClick={() => navigate(`/teacher/attendance?class=${cls.id}`)}>Mark today's attendance</Button>
          </PremiumCard>
        </Reveal>
      )}

      {tab === "assignments" && (
        <Reveal delay={80} className="grid gap-3 sm:grid-cols-2">
          {classAssignments.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No homework or assignments yet.</p> : (
            classAssignments.map((a, i) => <AssignmentCard key={a.id} entry={a} index={i} />)
          )}
        </Reveal>
      )}

      {tab === "marks" && (
        <Reveal delay={80}>
          <PremiumCard className="p-5">
            {classMarks.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No exams recorded yet.</p> : (
              <div className="space-y-1.5">
                {classMarks.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl border border-border/50 p-2.5">
                    <span className="text-[12.5px] text-foreground">{m.exam}</span>
                    <PremiumBadge label={m.status} tone={m.status === "Approved" ? "success" : m.status === "Submitted" ? "info" : "neutral"} />
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate(`/teacher/marks?class=${cls.id}`)}>Open Marks Entry</Button>
          </PremiumCard>
        </Reveal>
      )}

      {tab === "materials" && (
        <Reveal delay={80} className="grid gap-3 sm:grid-cols-2">
          {materials.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No materials shared yet.</p> : (
            materials.map((m, i) => <MaterialCard key={m.id} material={m} index={i} onToggleShare={() => toast.info("Manage sharing from Materials")} onDelete={() => toast.info("Manage materials from Materials")} />)
          )}
        </Reveal>
      )}

      {tab === "notes" && (
        <Reveal delay={80}>
          <PremiumCard className="p-5">
            {notes.length === 0 ? <p className="text-[12.5px] text-muted-foreground">No lesson notes yet.</p> : (
              <ul className="space-y-1.5 text-[12.5px]">
                {notes.map((n) => <li key={n.id} className="text-foreground">{n.topic} <span className="text-muted-foreground">· {n.week}</span></li>)}
              </ul>
            )}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/teacher/lesson-plans")}>Open Lesson Plans</Button>
          </PremiumCard>
        </Reveal>
      )}

      {tab === "parents" && (
        <Reveal delay={80} className="grid gap-3 sm:grid-cols-2">
          {students.map((s) => (
            <PremiumCard key={s.id} className="flex items-center gap-3 p-4">
              <StudentAvatar name={s.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{s.guardian}</p>
                <p className="text-[11px] text-muted-foreground">Guardian of {s.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground"><Phone className="h-3 w-3" /> {s.guardianPhone}</p>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-[11.5px]" onClick={() => toast.info(`Opening a message to ${s.guardian} — coming soon`)}>Message</Button>
            </PremiumCard>
          ))}
        </Reveal>
      )}
    </div>
  );
}
