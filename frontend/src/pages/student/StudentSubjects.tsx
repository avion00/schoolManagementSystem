import {
  BookOpen, ClipboardList, Download, FlaskConical, Flag, FolderOpen, Globe, Monitor, Search,
  Sigma, TrendingUp, MessageSquare, Printer,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { MiniSparkline } from "@/components/charts/MiniSparkline";
import { type IconTileTone } from "@/components/student/ui/IconTile";
import { RightInfoCard } from "@/components/student/ui/RightInfoCard";
import { StudentDashboardMetricCard } from "@/components/student/ui/StudentDashboardMetricCard";
import { StudentPageHeader } from "@/components/student/ui/StudentPageHeader";
import { StudentPageShell } from "@/components/student/ui/StudentPageShell";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import { SubjectCard, type SubjectCardData } from "@/components/student/ui/SubjectCard";
import { SubjectProgressBar } from "@/components/student/ui/SubjectProgressBar";
import { TeacherMiniRow } from "@/components/student/ui/TeacherMiniRow";
import { UpcomingTaskItem } from "@/components/student/ui/UpcomingTaskItem";
import {
  createStudentHelpTicket, subjects, teachers, timetable, todaySchedule, todayTasks,
  type TimetablePeriod,
} from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const SUBJECT_STYLE: Record<string, { icon: LucideIcon; tone: IconTileTone }> = {
  Mathematics: { icon: Sigma, tone: "violet" },
  Science: { icon: FlaskConical, tone: "emerald" },
  English: { icon: BookOpen, tone: "blue" },
  "Social Studies": { icon: Globe, tone: "amber" },
  Nepali: { icon: Flag, tone: "rose" },
  "Computer Science": { icon: Monitor, tone: "teal" },
};

const FILTERS = ["All Subjects", "Strong", "Needs Focus", "Pending Work"] as const;
type Filter = (typeof FILTERS)[number];

function scoreBadge(marks: number): { label: string; tone: StudentPillTone } {
  if (marks >= 87) return { label: "Excellent", tone: "success" };
  if (marks >= 80) return { label: "Very Good", tone: "info" };
  if (marks >= 72) return { label: "Good", tone: "info" };
  return { label: "Needs Focus", tone: "danger" };
}

// Real forward-looking "next class" lookup — checks today's remaining schedule first, then
// scans the week (starting tomorrow) for this subject's next occurrence.
const FORWARD_DAYS: TimetablePeriod["day"][] = ["Fri", "Mon", "Tue", "Wed", "Thu"];
function nextClassInfo(subjectName: string): { isOngoing: boolean; label: string } {
  const todayEntry = todaySchedule.find((p) => p.subject === subjectName);
  if (todayEntry?.status === "Ongoing") return { isOngoing: true, label: "" };
  if (todayEntry?.status === "Upcoming") return { isOngoing: false, label: `Today · ${todayEntry.time}` };
  for (const day of FORWARD_DAYS) {
    const match = timetable.find((t) => t.day === day && t.subject === subjectName);
    if (match) return { isOngoing: false, label: `${day === "Fri" ? "Tomorrow" : day} · ${match.time}` };
  }
  return { isOngoing: false, label: "—" };
}

function dueTone(label: string): StudentPillTone {
  const l = label.toLowerCase();
  if (l.includes("today")) return "danger";
  if (l.includes("tomorrow")) return "warning";
  return "info";
}

export function StudentSubjects() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>("All Subjects");
  const [query, setQuery] = useState("");

  const avgScore = subjects.reduce((s, x) => s + x.latestMarks, 0) / subjects.length;
  const syllCompleted = subjects.reduce((s, x) => s + x.syllabusCompleted, 0);
  const syllTotal = subjects.reduce((s, x) => s + x.syllabusTotal, 0);
  const syllPct = Math.round((syllCompleted / syllTotal) * 100);
  const pendingHomeworkTotal = subjects.reduce((s, x) => s + x.homeworkPending, 0);
  const materialsTotal = subjects.reduce((s, x) => s + x.materialsCount, 0);

  const cards: (SubjectCardData & { syllabusPct: number })[] = subjects.map((s) => {
    const style = SUBJECT_STYLE[s.name] ?? { icon: BookOpen, tone: "slate" as IconTileTone };
    const badge = scoreBadge(s.latestMarks);
    const next = nextClassInfo(s.name);
    const syllabusPct = Math.round((s.syllabusCompleted / s.syllabusTotal) * 100);
    return {
      id: s.id, name: s.name, teacher: s.teacher, weeklyClasses: s.weeklyClasses,
      latestMarks: s.latestMarks, latestFullMarks: s.latestFullMarks,
      syllabusCompleted: s.syllabusCompleted, syllabusTotal: s.syllabusTotal,
      homeworkPending: s.homeworkPending, materialsCount: s.materialsCount,
      icon: style.icon, tone: style.tone,
      badgeLabel: badge.label, badgeTone: badge.tone,
      isOngoing: next.isOngoing, nextClassLabel: next.label, syllabusPct,
    };
  });

  const filtered = useMemo(() => {
    return cards.filter((c) => {
      const matchesQuery = !query.trim()
        || c.name.toLowerCase().includes(query.toLowerCase())
        || c.teacher.toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (filter === "Strong") return c.latestMarks >= 80;
      if (filter === "Needs Focus") return c.latestMarks < 72 || c.syllabusPct < 60;
      if (filter === "Pending Work") return c.homeworkPending > 0;
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query]);

  const needsFocus = subjects
    .map((s) => {
      const pct = Math.round((s.syllabusCompleted / s.syllabusTotal) * 100);
      if (s.latestMarks < 72) return { id: s.id, name: s.name, label: `${s.latestMarks}/100`, percent: s.latestMarks, reason: "score" as const };
      if (pct < 60) return { id: s.id, name: s.name, label: `${pct}% Syllabus`, percent: pct, reason: "syllabus" as const };
      return null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subjectTasks = todayTasks.filter((t) => t.subject);

  function askQuestion(subjectName: string) {
    createStudentHelpTicket({
      category: "Academic", title: `Question about ${subjectName}`,
      description: `I have a question about my ${subjectName} coursework.`, sentTo: "Class Teacher",
    });
    toast.success("Your question was sent to the subject teacher.");
  }

  const englishTeacher = teachers.find((t) => t.subject === "English");
  const current = subjects.find((s) => nextClassInfo(s.name).isOngoing);

  return (
    <StudentPageShell>
      <StudentPageHeader
        title="My Subjects"
        description={`${subjects.length} subjects this term · Track progress, teachers, materials, homework, and performance.`}
        actions={
          <>
            <StudentSecondaryButton className="w-auto px-3.5" onClick={() => toast.success("Downloading subjects report…")}>
              <Download className="h-3.5 w-3.5" /> Download report
            </StudentSecondaryButton>
            <StudentSecondaryButton className="w-auto px-3.5" onClick={() => navigate("/student/messages")}>
              <MessageSquare className="h-3.5 w-3.5" /> Message teacher
            </StudentSecondaryButton>
            <StudentSecondaryButton className="w-auto px-3.5" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> Print
            </StudentSecondaryButton>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StudentDashboardMetricCard
          label="Average Score" value={`${avgScore.toFixed(1)}%`} supporting="Across 6 subjects"
          icon={TrendingUp} tone="blue" trendData={subjects.map((s) => ({ value: s.latestMarks }))}
        />
        <StudentDashboardMetricCard
          label="Syllabus Completed" value={`${syllPct}%`} supporting={`${syllCompleted} / ${syllTotal} lessons`}
          icon={BookOpen} tone="emerald" percent={syllPct}
        />
        <StudentDashboardMetricCard
          label="Pending Homework" value={pendingHomeworkTotal} supporting="Due this week"
          icon={ClipboardList} tone="amber" percent={Math.min(100, pendingHomeworkTotal * 25)}
        />
        <StudentDashboardMetricCard
          label="Learning Materials" value={materialsTotal} supporting="Files available"
          icon={FolderOpen} tone="violet" percent={Math.min(100, materialsTotal * 3)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_390px] xl:items-start">
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
            <StudentSectionHeader title="Subject Overview" />
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all active:scale-95",
                      filter === f ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search subjects, teachers, or materials…"
                  className="h-9 w-full rounded-xl border border-border/60 bg-card pl-8 pr-3 text-[12.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-muted-foreground">No subjects match your filters.</p>
              ) : (
                filtered.map((c, i) => (
                  <SubjectCard
                    key={c.id}
                    data={c}
                    delay={i * 40}
                    onViewDetails={() => navigate(`/student/subjects/${c.id}`)}
                    onOpenMaterials={() => navigate("/student/materials")}
                    onViewSyllabus={() => navigate(`/student/subjects/${c.id}`)}
                    onViewHomework={() => navigate("/student/assignments")}
                    onMessageTeacher={() => navigate("/student/messages")}
                    onAskQuestion={() => askQuestion(c.name)}
                    onViewTeacherProfile={() => navigate("/student/teachers")}
                  />
                ))
              )}
            </div>
            <p className="mt-3 text-[11.5px] text-muted-foreground">Showing {filtered.length} of {subjects.length} subjects</p>
          </div>
        </div>

        <div className="space-y-4">
          {current && englishTeacher && (
            <RightInfoCard
              accentCls="border-l-primary bg-gradient-to-br from-primary/[0.06] to-transparent"
              title="Current Class"
              badge={<StudentStatusPill label="Ongoing" tone="info" />}
            >
              <p className="text-[15px] font-bold text-foreground">{current.name}</p>
              <p className="text-[12px] text-muted-foreground">
                {current.teacher} · {todaySchedule.find((p) => p.subject === current.name)?.room}
              </p>
              <p className="mt-1 text-[12px] text-muted-foreground">{todaySchedule.find((p) => p.subject === current.name)?.time}</p>
              <button
                type="button"
                onClick={() => navigate("/student/materials")}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-[12.5px] font-semibold text-primary-foreground transition-all hover:shadow-md active:scale-[0.98]"
              >
                Open Materials
              </button>
            </RightInfoCard>
          )}

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
            <StudentSectionHeader title="Needs Focus" />
            <div className="space-y-3">
              {needsFocus.map((n) => (
                <div key={n.id}>
                  <div className="mb-1 flex items-center justify-between text-[12.5px]">
                    <span className="font-medium text-foreground">{n.name}</span>
                    <span className="text-muted-foreground">{n.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SubjectProgressBar percent={n.percent} colorCls={n.reason === "score" ? "bg-rose-500" : "bg-amber-500"} />
                    <button
                      type="button"
                      onClick={() => navigate(`/student/subjects/${n.id}`)}
                      className="shrink-0 rounded-lg border border-border/60 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
            <StudentSectionHeader
              title="My Teachers"
              action={<button type="button" onClick={() => navigate("/student/teachers")} className="text-[12px] font-medium text-primary hover:underline">View all</button>}
            />
            <div className="space-y-1">
              {teachers.slice(0, 3).map((t) => (
                <TeacherMiniRow key={t.id} name={t.name} subject={t.subject} onMessage={() => navigate("/student/messages")} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
            <StudentSectionHeader title="Upcoming Subject Tasks" />
            <div className="space-y-2">
              {subjectTasks.map((t) => (
                <UpcomingTaskItem key={t.id} title={`${t.subject} — ${t.title}`} chipLabel={t.dueLabel} chipTone={dueTone(t.dueLabel)} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
            <StudentSectionHeader title="Performance Trend" action={<span className="text-[11px] text-muted-foreground">This Term</span>} />
            <MiniSparkline data={subjects.map((s) => ({ value: s.latestMarks }))} color="#3b82f6" width="100%" height={70} />
            <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
              {subjects.map((s) => <span key={s.id}>{s.name.split(" ")[0]}</span>)}
            </div>
          </div>
        </div>
      </div>
    </StudentPageShell>
  );
}
