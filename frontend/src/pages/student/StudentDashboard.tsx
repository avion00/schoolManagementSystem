import {
  Award, CalendarCheck, ClipboardList, FolderOpen, GraduationCap, Info, ScrollText,
  TrendingUp, Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StudentAcademicPerformanceCard } from "@/components/student/ui/StudentAcademicPerformanceCard";
import { StudentDashboardMetricCard } from "@/components/student/ui/StudentDashboardMetricCard";
import { StudentInfoCard } from "@/components/student/ui/StudentInfoCard";
import { StudentInsightCard } from "@/components/student/ui/StudentInsightCard";
import { StudentLearningOverviewCard } from "@/components/student/ui/StudentLearningOverviewCard";
import { StudentMaterialsGrid } from "@/components/student/ui/StudentMaterialsGrid";
import { StudentNoticeCard } from "@/components/student/ui/StudentNoticeCard";
import { StudentPageHeader } from "@/components/student/ui/StudentPageHeader";
import { StudentPageShell } from "@/components/student/ui/StudentPageShell";
import { StudentPrimaryButton } from "@/components/student/ui/StudentPrimaryButton";
import { StudentProfileMiniCard } from "@/components/student/ui/StudentProfileMiniCard";
import { StudentProgressCard, StudentRingStat } from "@/components/student/ui/StudentProgressCard";
import { StudentReminderCard, type StudentReminder } from "@/components/student/ui/StudentReminderCard";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentTwoColumnLayout } from "@/components/student/ui/StudentTwoColumnLayout";
import { StudentUpcomingTaskTable, type StudentUpcomingTaskRow } from "@/components/student/ui/StudentUpcomingTaskTable";
import {
  attendanceTrend, computeAttendanceSummary, exams, feeSummary, homeworkAssignments,
  learningMaterials, notices, progressInsights, results, studentProfile, studyStreak, teachers,
} from "@/data/studentDashboardData";

const INSIGHT_META = {
  positive: { icon: TrendingUp, tone: "success" as const },
  warning: { icon: Info, tone: "warning" as const },
  info: { icon: Info, tone: "info" as const },
};

export function StudentDashboard() {
  const navigate = useNavigate();
  const attendance = computeAttendanceSummary();

  const pendingHomework = homeworkAssignments.filter((h) => h.status === "To Do" || h.status === "Missing");
  const upcomingExams = exams.filter((e) => e.status === "Upcoming").sort((a, b) => a.date.localeCompare(b.date));
  const latestResult = results[results.length - 1];
  const newMaterialsThisWeek = learningMaterials.filter((m) => m.date >= "2026-07-10").length;
  const classTeacher = teachers.find((t) => t.isClassTeacher);

  const homeworkDone = homeworkAssignments.filter((h) => h.status === "Submitted" || h.status === "Graded").length;
  const homeworkPct = Math.round((homeworkDone / homeworkAssignments.length) * 100);

  const taskRows: StudentUpcomingTaskRow[] = [
    ...pendingHomework.map((h) => ({
      id: `hw-${h.id}`, title: h.title, subject: h.subject, type: "Homework", typeIcon: ClipboardList,
      typeIconCls: "text-amber-500", due: h.dueDate,
      statusLabel: h.status, statusTone: (h.status === "Missing" ? "danger" : "info") as "danger" | "info",
      actionLabel: "Submit", onAction: () => navigate("/student/assignments"),
    })),
    ...upcomingExams.map((e) => ({
      id: `ex-${e.id}`, title: `${e.examType} — ${e.subject}`, subject: e.subject, type: "Exam", typeIcon: ScrollText,
      typeIconCls: "text-rose-500", due: e.date,
      statusLabel: "Upcoming", statusTone: "warning" as const,
      actionLabel: "View", onAction: () => navigate("/student/exams"),
    })),
  ].sort((a, b) => a.due.localeCompare(b.due)).slice(0, 6);

  const recentMaterials = [...learningMaterials].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
    .map((m) => ({ id: m.id, title: m.title, subject: m.subject, teacher: m.teacher, date: m.date, type: m.type }));

  const recentNotices = [...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned)).slice(0, 3)
    .map((n) => ({ id: n.id, title: n.title, category: n.category, date: n.date, unread: n.unread }));

  const alerts: StudentReminder[] = progressInsights.map((p) => ({
    id: p.id, text: p.text, icon: INSIGHT_META[p.type].icon, tone: INSIGHT_META[p.type].tone,
  }));

  return (
    <StudentPageShell>
      <StudentPageHeader
        title="Student Dashboard"
        description="Academic overview, learning progress, attendance, results, and upcoming tasks."
      />

      {/* ── Top KPI row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StudentDashboardMetricCard
          label="Attendance" value={`${attendance.presentPct}%`} supporting={`${attendance.presentDays} of ${attendance.totalDays} days`}
          icon={CalendarCheck} tone="emerald" trendData={attendanceTrend.map((t) => ({ value: t.pct }))}
          onClick={() => navigate("/student/attendance")}
        />
        <StudentDashboardMetricCard
          label="Pending Homework" value={pendingHomework.length} supporting={pendingHomework.length ? `${pendingHomework.filter((h) => h.dueDate <= "2026-07-16").length} due this week` : "All caught up"}
          icon={ClipboardList} tone="amber" percent={100 - homeworkPct}
          onClick={() => navigate("/student/assignments")}
        />
        <StudentDashboardMetricCard
          label="Upcoming Exams" value={upcomingExams.length} supporting={upcomingExams[0] ? `Next: ${upcomingExams[0].date}` : "None scheduled"}
          icon={ScrollText} tone="violet" percent={60}
          onClick={() => navigate("/student/exams")}
        />
        <StudentDashboardMetricCard
          label="Latest Result" value={`${latestResult.percentage}%`} supporting={`GPA ${latestResult.gpa} · ${latestResult.term}`}
          icon={Award} tone="blue" percent={latestResult.percentage}
          onClick={() => navigate("/student/results")}
        />
        <StudentDashboardMetricCard
          label="Materials" value={learningMaterials.length} supporting={`${newMaterialsThisWeek} new this week`}
          icon={FolderOpen} tone="slate" percent={Math.min(100, newMaterialsThisWeek * 20)}
          onClick={() => navigate("/student/materials")}
        />
        <StudentDashboardMetricCard
          label="Fee Status" value={feeSummary.status} supporting={feeSummary.due > 0 ? `$${feeSummary.due} outstanding` : "Fully paid"}
          icon={Wallet} tone={feeSummary.status === "Paid" ? "emerald" : "rose"} percent={Math.round((feeSummary.paid / feeSummary.total) * 100)}
          onClick={() => navigate("/student/fees")}
        />
      </div>

      <StudentTwoColumnLayout
        main={
          <>
            <StudentLearningOverviewCard
              attendancePct={attendance.presentPct}
              bars={[
                { label: "Homework completion", value: homeworkPct, colorCls: "bg-amber-500" },
                { label: "Latest result", value: Math.round(latestResult.percentage), colorCls: "bg-violet-500" },
              ]}
              trendData={attendanceTrend.map((t) => ({ value: t.pct }))}
              currentStreakDays={studyStreak.currentStreakDays}
              bestStreakDays={studyStreak.bestStreakDays}
            />

            <StudentAcademicPerformanceCard
              term={latestResult.term}
              percentage={latestResult.percentage}
              gpa={latestResult.gpa}
              subjects={latestResult.subjects}
            />

            <StudentUpcomingTaskTable rows={taskRows} />

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 font-display text-[14px] font-semibold text-foreground">
                  <FolderOpen className="h-4 w-4 text-primary" /> Recent Learning Materials
                </p>
                <button type="button" onClick={() => navigate("/student/materials")} className="text-[12px] font-medium text-primary hover:underline">
                  View All
                </button>
              </div>
              <StudentMaterialsGrid materials={recentMaterials} />
            </div>
          </>
        }
        sidebar={
          <>
            <StudentProfileMiniCard
              name={studentProfile.name}
              className={studentProfile.className}
              section={studentProfile.section}
              roll={studentProfile.roll}
              admissionNo={studentProfile.admissionNo}
              status={studentProfile.status}
            />

            <StudentInfoCard
              title="Current Academic Status"
              icon={GraduationCap}
              rows={[
                { label: "Current term", value: latestResult.term },
                { label: "Academic year", value: studentProfile.academicYear },
                { label: "Class teacher", value: classTeacher?.name ?? "—" },
                { label: "Section", value: studentProfile.section },
                { label: "House", value: studentProfile.house },
                { label: "Student type", value: studentProfile.studentType },
              ]}
            />

            <StudentProgressCard
              title="Attendance Summary"
              icon={<CalendarCheck className="h-4 w-4 text-primary" />}
              footer={
                <>
                  <div className="flex items-center gap-4">
                    <StudentRingStat percent={attendance.presentPct} label="Present" strokeCls="stroke-emerald-500" />
                    <div className="flex-1 space-y-1.5 text-[12px]">
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Present</span><span className="font-medium text-foreground">{attendance.presentDays} days</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Absent</span><span className="font-medium text-foreground">{attendance.absentDays} days</span></div>
                      <div className="flex items-center justify-between"><span className="text-muted-foreground">Late</span><span className="font-medium text-foreground">{attendance.lateDays} days</span></div>
                    </div>
                  </div>
                  <StudentSecondaryButton className="mt-3" onClick={() => navigate("/student/attendance")}>
                    View Attendance
                  </StudentSecondaryButton>
                </>
              }
            />

            <StudentInsightCard tier="spotlight" className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-primary" />
                <p className="font-display text-[14px] font-semibold text-foreground">Fee Summary</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[12.5px]">
                <div className="rounded-xl bg-emerald-500/10 px-3 py-2 ring-1 ring-emerald-500/15">
                  <p className="text-[10.5px] text-muted-foreground">Paid</p>
                  <p className="font-display text-[16px] font-bold text-emerald-600 dark:text-emerald-400">${feeSummary.paid}</p>
                </div>
                <div className="rounded-xl bg-rose-500/10 px-3 py-2 ring-1 ring-rose-500/15">
                  <p className="text-[10.5px] text-muted-foreground">Outstanding</p>
                  <p className="font-display text-[16px] font-bold text-rose-600 dark:text-rose-400">${feeSummary.due}</p>
                </div>
              </div>
              <p className="mt-2.5 text-[11.5px] text-muted-foreground">
                Status <span className="font-medium text-foreground">{feeSummary.status}</span> · Next due <span className="font-medium text-foreground">{feeSummary.nextDueDate}</span>
              </p>
              <StudentPrimaryButton className="mt-2.5" onClick={() => navigate("/student/fees")}>
                Pay / View Fees
              </StudentPrimaryButton>
            </StudentInsightCard>

            <StudentNoticeCard notices={recentNotices} />

            <StudentReminderCard title="Smart Alerts" reminders={alerts} />
          </>
        }
      />
    </StudentPageShell>
  );
}
