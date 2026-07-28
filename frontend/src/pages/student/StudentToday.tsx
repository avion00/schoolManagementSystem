import {
  Bell, BookOpen, Calendar, CheckCircle2, ClipboardList, CreditCard, Flame,
  FolderOpen, LifeBuoy, ListChecks, MessageCircle, ScrollText, Timer, TrendingUp, Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Reveal } from "@/components/motion";
import { StudentHeroCard } from "@/components/student/ui/StudentHeroCard";
import { StudentInfoSidebar } from "@/components/student/ui/StudentInfoSidebar";
import { StudentInsightCard } from "@/components/student/ui/StudentInsightCard";
import { StudentMaterialsGrid } from "@/components/student/ui/StudentMaterialsGrid";
import { StudentNoticeCard } from "@/components/student/ui/StudentNoticeCard";
import { StudentPageShell } from "@/components/student/ui/StudentPageShell";
import { StudentPrimaryButton } from "@/components/student/ui/StudentPrimaryButton";
import { StudentProfileMiniCard } from "@/components/student/ui/StudentProfileMiniCard";
import { StudentProgressCard, StudentRingStat } from "@/components/student/ui/StudentProgressCard";
import { StudentReminderCard, type StudentReminder } from "@/components/student/ui/StudentReminderCard";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { StudentStatusPill } from "@/components/student/ui/StudentStatusPill";
import { StudentTaskCard } from "@/components/student/ui/StudentTaskCard";
import { StudentTimeline, StudentTimelineItem } from "@/components/student/ui/StudentTimeline";
import { StudentTwoColumnLayout } from "@/components/student/ui/StudentTwoColumnLayout";
import {
  computeAttendanceSummary, feeSummary, homeworkAssignments, learningMaterials,
  notices, results, studentProfile, studyStreak, todaySchedule, todayTasks,
} from "@/data/studentDashboardData";
import type { TodayTask } from "@/data/studentDashboardData";

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

const TASK_META: Record<TodayTask["type"], {
  icon: typeof ClipboardList; iconCls: string; pillTone: "warning" | "purple" | "danger" | "info";
  actionLabel: string; to: string;
}> = {
  homework: { icon: ClipboardList, iconCls: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300", pillTone: "warning", actionLabel: "Submit", to: "/student/assignments" },
  assignment: { icon: ClipboardList, iconCls: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300", pillTone: "purple", actionLabel: "View", to: "/student/assignments" },
  exam: { icon: ScrollText, iconCls: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300", pillTone: "danger", actionLabel: "Start revising", to: "/student/exams" },
  material: { icon: FolderOpen, iconCls: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300", pillTone: "info", actionLabel: "Open materials", to: "/student/materials" },
  notice: { icon: Bell, iconCls: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300", pillTone: "danger", actionLabel: "Read notice", to: "/student/notices" },
};

export function StudentToday() {
  const navigate = useNavigate();
  const attendance = computeAttendanceSummary();

  const firstName = studentProfile.name.split(" ")[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const current = todaySchedule.find((p) => p.status === "Ongoing" && !p.isBreak);
  const next = todaySchedule.find((p) => p.status === "Upcoming" && !p.isBreak);
  const completedPeriods = todaySchedule.filter((p) => p.status === "Completed" && !p.isBreak).length;
  const totalPeriods = todaySchedule.filter((p) => !p.isBreak).length;
  const pendingTasks = todayTasks.filter((t) => !t.done).length;

  const homeworkDone = homeworkAssignments.filter((h) => h.status === "Submitted" || h.status === "Graded").length;
  const homeworkPct = Math.round((homeworkDone / homeworkAssignments.length) * 100);
  const latestResult = results[results.length - 1];
  const newMaterials = learningMaterials.filter((m) => m.date === "2026-07-15").length;
  const feeDueDays = daysUntil(feeSummary.nextDueDate);

  const reminders: StudentReminder[] = [
    { id: "r1", text: "Math homework due today — don't forget to submit!", icon: ClipboardList, tone: "warning" },
    { id: "r2", text: "Science unit test on Friday — start revising.", icon: ScrollText, tone: "danger" },
    { id: "r3", text: `${newMaterials} new materials uploaded this week.`, icon: FolderOpen, tone: "info" },
    { id: "r4", text: `Attendance this month: ${attendance.presentPct}%.`, icon: Calendar, tone: "success" },
    { id: "r5", text: feeDueDays > 0 ? `Fee payment due in ${feeDueDays} days.` : "Fee payment is due — please pay soon.", icon: CreditCard, tone: "purple" },
  ];

  const recentMaterials = learningMaterials.slice(0, 4).map((m) => ({ id: m.id, title: m.title, subject: m.subject, teacher: m.teacher, date: m.date, type: m.type }));
  const recentNotices = notices.slice(0, 2);

  return (
    <StudentPageShell>
      <StudentHeroCard
        greeting={`${greetingWord()}, ${firstName}`}
        meta={`${studentProfile.className} ${studentProfile.section} · Roll ${studentProfile.roll} · ${today}`}
        statusLine={current ? `Now: ${current.subject} (${current.time})` : next ? `Next: ${next.subject} (${next.time})` : undefined}
        statusPill={<StudentStatusPill label={studentProfile.status} tone="success" />}
        metrics={[
          { label: "Periods completed today", value: `${completedPeriods}/${totalPeriods}`, icon: CheckCircle2, iconCls: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" },
          { label: "Pending tasks", value: pendingTasks, icon: ClipboardList, iconCls: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
          { label: "Attendance this month", value: `${attendance.presentPct}%`, icon: Calendar, iconCls: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300" },
        ]}
        actions={[
          { label: "View Homework", icon: ClipboardList, to: "/student/assignments" },
          { label: "Submit Assignment", icon: Video, to: "/student/assignments" },
          { label: "View Timetable", icon: Timer, to: "/student/timetable" },
          { label: "Check Result", icon: ScrollText, to: "/student/results" },
          { label: "Message Teacher", icon: MessageCircle, to: "/student/messages" },
          { label: "Ask for Help", icon: LifeBuoy, to: "/student/help" },
        ]}
      />

      <StudentTwoColumnLayout
        main={
          <>
            {/* ── Today's Schedule (spotlight — the main "what's happening" surface) ── */}
            <StudentInsightCard tier="spotlight" className="p-4 sm:p-5">
              <StudentSectionHeader
                icon={Timer}
                title="Today's Schedule"
                action={<p className="text-[11.5px] font-medium text-muted-foreground">{completedPeriods} of {totalPeriods} periods completed</p>}
              />
              <StudentTimeline>
                {todaySchedule.map((p, i) => (
                  <StudentTimelineItem
                    key={p.id}
                    index={p.isBreak ? "•" : p.period}
                    status={p.status === "Ongoing" ? "ongoing" : p.status === "Completed" ? "completed" : "upcoming"}
                    title={p.subject}
                    meta={p.isBreak ? undefined : `${p.teacher} · ${p.room}`}
                    time={p.time}
                    isLast={i === todaySchedule.length - 1}
                  />
                ))}
              </StudentTimeline>
            </StudentInsightCard>

            {/* ── Today's Tasks ─────────────────────────────────────────── */}
            <Reveal delay={120}>
              <div>
                <StudentSectionHeader icon={ListChecks} title="Today's Tasks" />
                <div className="space-y-2">
                  {todayTasks.map((task) => {
                    const meta = TASK_META[task.type];
                    return (
                      <StudentTaskCard
                        key={task.id}
                        icon={meta.icon}
                        iconCls={meta.iconCls}
                        title={task.title}
                        meta={task.subject}
                        pillLabel={task.dueLabel}
                        pillTone={meta.pillTone}
                        actionLabel={meta.actionLabel}
                        onAction={() => navigate(meta.to)}
                        onClick={() => navigate(meta.to)}
                      />
                    );
                  })}
                </div>
              </div>
            </Reveal>

            {/* ── Learning Progress ─────────────────────────────────────── */}
            <StudentProgressCard
              title="Learning Progress"
              icon={<TrendingUp className="h-4 w-4 text-primary" />}
              trendData={[{ value: 62 }, { value: 68 }, { value: 65 }, { value: 71 }, { value: 76 }, { value: 74 }, { value: 78 }]}
              trendColor="#8b5cf6"
              bars={[
                { label: "Homework completion", value: homeworkPct },
                { label: "Attendance", value: attendance.presentPct, colorCls: "bg-emerald-500" },
                { label: "Latest result", value: Math.round(latestResult.percentage), colorCls: "bg-violet-500" },
              ]}
              footer={
                <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent px-3 py-2.5 text-[12.5px] text-foreground ring-1 ring-amber-500/15">
                  <Flame className="h-4 w-4 shrink-0 text-amber-500" />
                  <span><span className="font-semibold">{studyStreak.currentStreakDays}-day</span> study streak — best is {studyStreak.bestStreakDays} days.</span>
                </div>
              }
            />

            {/* ── Recent learning materials ─────────────────────────────── */}
            <Reveal delay={160}>
              <div>
                <StudentSectionHeader
                  icon={BookOpen}
                  title="Recent Learning Materials"
                  action={
                    <button type="button" onClick={() => navigate("/student/materials")} className="text-[12px] font-medium text-primary hover:underline">
                      View All
                    </button>
                  }
                />
                <StudentMaterialsGrid materials={recentMaterials} />
              </div>
            </Reveal>
          </>
        }
        sidebar={
          <StudentInfoSidebar>
            <StudentProfileMiniCard
              name={studentProfile.name}
              className={studentProfile.className}
              section={studentProfile.section}
              roll={studentProfile.roll}
              admissionNo={studentProfile.admissionNo}
              status={studentProfile.status}
            />

            {(current || next) && (
              <StudentInsightCard tier="spotlight" className="p-4">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  {current ? "Current Class" : "Next Class"}
                </p>
                <p className="text-[15px] font-semibold text-foreground">{(current ?? next)!.subject}</p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {(current ?? next)!.teacher} · {(current ?? next)!.room}
                </p>
                <p className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-primary">
                  {current ? `${current.subject} starts now` : `Next: ${next!.subject} (${next!.time})`}
                </p>
              </StudentInsightCard>
            )}

            <StudentReminderCard reminders={reminders} />

            <StudentProgressCard
              title="Attendance Summary"
              icon={<Calendar className="h-4 w-4 text-primary" />}
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
                <CreditCard className="h-4 w-4 text-primary" />
                <p className="font-display text-[14px] font-semibold text-foreground">Fees</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[12.5px]">
                <div className="rounded-xl bg-rose-500/10 px-3 py-2 ring-1 ring-rose-500/15">
                  <p className="text-[10.5px] text-muted-foreground">Outstanding</p>
                  <p className="font-display text-[16px] font-bold text-rose-600 dark:text-rose-400">${feeSummary.due}</p>
                </div>
                <div className="rounded-xl bg-emerald-500/10 px-3 py-2 ring-1 ring-emerald-500/15">
                  <p className="text-[10.5px] text-muted-foreground">Paid</p>
                  <p className="font-display text-[16px] font-bold text-emerald-600 dark:text-emerald-400">${feeSummary.paid}</p>
                </div>
              </div>
              <p className="mt-2.5 text-[11.5px] text-muted-foreground">
                Next due <span className="font-medium text-foreground">{feeSummary.nextDueDate}</span>
              </p>
              <StudentPrimaryButton className="mt-2.5" onClick={() => navigate("/student/fees")}>
                Pay / View Fees
              </StudentPrimaryButton>
            </StudentInsightCard>

            <StudentNoticeCard
              notices={recentNotices.map((n) => ({ id: n.id, title: n.title, category: n.category, date: n.date, unread: n.unread }))}
            />
          </StudentInfoSidebar>
        }
      />
    </StudentPageShell>
  );
}
