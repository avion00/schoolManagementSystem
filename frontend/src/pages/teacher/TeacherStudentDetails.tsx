import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { StudentAvatar } from "@/components/students/StudentAvatar";
import { StudentRiskBadge } from "@/components/teacher/StudentRiskBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumTabs } from "@/components/ui/PremiumTabs";
import {
  assignedStudents,
  computeRiskLevel,
  getMonthlyAttendanceGrid,
  homeworkList,
  marksForStudent,
  teacherMessages,
} from "@/data/teacherDashboardData";

type Tab = "overview" | "attendance" | "marks" | "homework" | "remarks" | "parents";
const TABS: { value: Tab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "attendance", label: "Attendance" },
  { value: "marks", label: "Marks" },
  { value: "homework", label: "Homework" },
  { value: "remarks", label: "Notes" },
  { value: "parents", label: "Parent Contact" },
];

export function TeacherStudentDetails() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("overview");
  const [remarks, setRemarks] = useState<string[]>([]);
  const [remarkText, setRemarkText] = useState("");

  const student = assignedStudents.find((s) => String(s.id) === id);
  if (!student) return <Navigate to="/teacher/students" replace />;

  const risk = computeRiskLevel(student);
  const grid = getMonthlyAttendanceGrid(student.classId);
  const myAttendance = grid.find((g) => g.studentId === student.id);
  const homeworkHistory = homeworkList.filter((h) => h.classId === student.classId);
  const parentThread = teacherMessages.filter((m) => m.context.includes(student.name));

  function addRemark() {
    if (!remarkText.trim()) return;
    setRemarks((r) => [remarkText.trim(), ...r]);
    setRemarkText("");
    toast.success("Remark added (demo — not saved)");
  }

  return (
    <div className="space-y-4">
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StudentAvatar name={student.name} size="md" />
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{student.registrationNo} · {student.className}-{student.section} · Roll {student.roll}</p>
          </div>
        </div>
        <StudentRiskBadge level={risk} />
      </Reveal>

      <Reveal delay={40}>
        <PremiumTabs value={tab} onValueChange={(v) => setTab(v as Tab)} options={TABS} />
      </Reveal>

      <Reveal delay={80}>
        {tab === "overview" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <PremiumCard className="space-y-2.5 p-5">
              <p className="text-[13.5px] font-semibold text-foreground">Profile</p>
              {[
                ["Class", `${student.className}-${student.section}`],
                ["Roll", String(student.roll)],
                ["Registration No", student.registrationNo],
                ["Admission No", student.admissionNo],
                ["Status", student.status],
                ["Attendance", `${student.attendancePercentage.toFixed(1)}%`],
                ["Average marks", String(marksForStudent(student))],
                ["Pending homework", String(student.pendingHomework)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </PremiumCard>
            <PremiumCard className="space-y-2.5 p-5">
              <p className="text-[13.5px] font-semibold text-foreground">Guardian Contact</p>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{student.guardian}</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">{student.guardianPhone}</span>
              </div>
              <div className="flex items-center justify-between text-[12.5px]">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium text-foreground">{student.guardianEmail}</span>
              </div>
              <div className="mt-2 rounded-xl bg-muted/40 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Fee status</p>
                <p className="mt-1 text-[12.5px] text-muted-foreground">{student.feeStatusNote}</p>
              </div>
            </PremiumCard>
          </div>
        )}

        {tab === "attendance" && (
          <PremiumCard className="p-5">
            <p className="mb-3 text-[13.5px] font-semibold text-foreground">Attendance Summary</p>
            {myAttendance ? (
              <>
                <div className="mb-4 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-emerald-500/10 py-2"><p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{myAttendance.present}</p><p className="text-[11px] text-muted-foreground">Present</p></div>
                  <div className="rounded-xl bg-rose-500/10 py-2"><p className="text-lg font-bold text-rose-600 dark:text-rose-400">{myAttendance.absent}</p><p className="text-[11px] text-muted-foreground">Absent</p></div>
                  <div className="rounded-xl bg-amber-500/10 py-2"><p className="text-lg font-bold text-amber-600 dark:text-amber-400">{myAttendance.late}</p><p className="text-[11px] text-muted-foreground">Late</p></div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {myAttendance.days.map((d, i) => (
                    <span
                      key={i}
                      title={`Day ${i + 1}: ${d}`}
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-medium ${
                        d === "Present" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                        d === "Late" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" :
                        "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {i + 1}
                    </span>
                  ))}
                </div>
              </>
            ) : <p className="text-[12.5px] text-muted-foreground">No attendance records.</p>}
          </PremiumCard>
        )}

        {tab === "marks" && (
          <PremiumCard className="p-5">
            <p className="mb-3 text-[13.5px] font-semibold text-foreground">Marks — your subject</p>
            <div className="flex items-center justify-between rounded-xl border border-border/50 p-3">
              <span className="text-[13px] text-foreground">Average performance</span>
              <span className="text-[15px] font-bold tabular-nums text-foreground">{marksForStudent(student)} / 100</span>
            </div>
            <p className="mt-3 text-[12px] text-muted-foreground">Full exam-by-exam breakdown is available from Marks Entry / Gradebook for this class.</p>
          </PremiumCard>
        )}

        {tab === "homework" && (
          <PremiumCard className="p-5">
            <p className="mb-3 text-[13.5px] font-semibold text-foreground">Homework History</p>
            <div className="space-y-2">
              {homeworkHistory.map((h) => {
                const submitted = (student.id + h.id.length) % 3 !== 0;
                return (
                  <div key={h.id} className="flex items-center justify-between rounded-xl border border-border/50 p-2.5">
                    <div>
                      <p className="text-[12.5px] font-medium text-foreground">{h.title}</p>
                      <p className="text-[11px] text-muted-foreground">Due {h.dueDate}</p>
                    </div>
                    <PremiumBadge label={submitted ? "Submitted" : "Pending"} tone={submitted ? "success" : "warning"} />
                  </div>
                );
              })}
            </div>
          </PremiumCard>
        )}

        {tab === "remarks" && (
          <PremiumCard className="p-5">
            <p className="mb-3 text-[13.5px] font-semibold text-foreground">Teacher Notes</p>
            <div className="mb-3 flex gap-2">
              <Input value={remarkText} onChange={(e) => setRemarkText(e.target.value)} placeholder="Add a note or behavior observation…" />
              <Button onClick={addRemark} disabled={!remarkText.trim()}>Add</Button>
            </div>
            {remarks.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {remarks.map((r, i) => (
                  <li key={i} className="rounded-xl border border-border/50 p-2.5 text-[12.5px] text-foreground">{r}</li>
                ))}
              </ul>
            )}
            {risk !== "Low Risk" && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => toast.success(`Improvement plan started for ${student.name} (demo)`)}>
                Create improvement plan
              </Button>
            )}
          </PremiumCard>
        )}

        {tab === "parents" && (
          <PremiumCard className="p-5">
            <p className="mb-3 text-[13.5px] font-semibold text-foreground">Communication History</p>
            {parentThread.length === 0 ? (
              <p className="text-[12.5px] text-muted-foreground">No messages with this student's guardian yet.</p>
            ) : (
              <div className="space-y-2">
                {parentThread.map((m) => (
                  <div key={m.id} className="rounded-xl border border-border/50 p-2.5">
                    <p className="text-[12.5px] font-medium text-foreground">{m.from}</p>
                    <p className="text-[12px] text-muted-foreground">{m.preview}</p>
                    <p className="mt-1 text-[10.5px] text-muted-foreground/60">{m.time}</p>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => toast.info(`Opening a message to ${student.guardian} — coming soon`)}>
              Message guardian
            </Button>
          </PremiumCard>
        )}
      </Reveal>
    </div>
  );
}
