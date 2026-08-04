import {
  Award, BookMarked, BookOpen, CalendarDays, ChevronDown, ChevronRight, CheckCircle2, Clock,
  Coffee, Dumbbell, Flag, FlaskConical, Globe, LayoutGrid, Download, MessageSquare, Monitor, Palette,
  Printer, Sigma,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { IconTile, type IconTileTone } from "@/components/student/ui/IconTile";
import { RightInfoCard } from "@/components/student/ui/RightInfoCard";
import { StudentPageHeader } from "@/components/student/ui/StudentPageHeader";
import { StudentPageShell } from "@/components/student/ui/StudentPageShell";
import { StudentPrimaryButton } from "@/components/student/ui/StudentPrimaryButton";
import { StudentProfileMiniCard } from "@/components/student/ui/StudentProfileMiniCard";
import { StudentSecondaryButton } from "@/components/student/ui/StudentSecondaryButton";
import { StudentSectionHeader } from "@/components/student/ui/StudentSectionHeader";
import { StudentStatusPill } from "@/components/student/ui/StudentStatusPill";
import { SummaryMiniCard } from "@/components/student/ui/SummaryMiniCard";
import { TimetablePeriodRow, type TimetablePeriodRowData } from "@/components/student/ui/TimetablePeriodRow";
import { WeeklyDayCard } from "@/components/student/ui/WeeklyDayCard";
import { studentProfile, timetable, todaySchedule, type TimetablePeriod } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const DAYS: TimetablePeriod["day"][] = ["Mon", "Tue", "Wed", "Thu", "Fri"];
// Mirrors todaySchedule — the demo's "today" always lands on Thursday.
const TODAY_DAY: TimetablePeriod["day"] = "Thu";

const SUBJECT_STYLE: Record<string, { icon: LucideIcon; tone: IconTileTone }> = {
  Mathematics: { icon: Sigma, tone: "violet" },
  Science: { icon: FlaskConical, tone: "emerald" },
  English: { icon: BookOpen, tone: "blue" },
  "Social Studies": { icon: Globe, tone: "rose" },
  "Computer Science": { icon: Monitor, tone: "teal" },
  Nepali: { icon: Flag, tone: "violet" },
  "Physical Education": { icon: Dumbbell, tone: "amber" },
  Art: { icon: Palette, tone: "rose" },
  Library: { icon: BookMarked, tone: "slate" },
};
const BREAK_STYLE = { icon: Coffee, tone: "amber" as IconTileTone };

function subjectStyle(subject: string, isBreak?: boolean) {
  if (isBreak) return BREAK_STYLE;
  return SUBJECT_STYLE[subject] ?? { icon: BookOpen, tone: "slate" as IconTileTone };
}

// The current real week's Mon–Fri calendar dates, purely for display — the
// mock schedule content itself stays pinned to TODAY_DAY regardless.
function currentWeekDates() {
  const now = new Date();
  const dow = now.getDay(); // 0 Sun .. 6 Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function StudentTimetable() {
  const navigate = useNavigate();
  const [view, setView] = useState<"today" | "week">("today");
  const periodsPerDay = Math.max(...timetable.map((t) => t.period));
  const weekDates = useMemo(() => currentWeekDates(), []);

  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const weekRangeLabel = `${weekDates[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${weekDates[4].toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;

  const rows: TimetablePeriodRowData[] = todaySchedule.map((p) => {
    const style = subjectStyle(p.subject, p.isBreak);
    return { id: p.id, period: p.period, subject: p.subject, teacher: p.teacher, room: p.room, time: p.time, status: p.status, isBreak: p.isBreak, icon: style.icon, tone: style.tone };
  });

  const ongoingIdx = todaySchedule.findIndex((p) => p.status === "Ongoing");
  const current = ongoingIdx >= 0 ? todaySchedule[ongoingIdx] : undefined;
  const next = ongoingIdx >= 0 ? todaySchedule[ongoingIdx + 1] : undefined;

  const totalPeriods = todaySchedule.length;
  const completedCount = todaySchedule.filter((p) => p.status === "Completed" && !p.isBreak).length;
  const breaksCount = todaySchedule.filter((p) => p.isBreak).length;
  const upcomingCount = todaySchedule.filter((p) => (p.status === "Upcoming" || p.status === "Ongoing") && !p.isBreak).length;

  // Weekly overview — real per-day class counts (breaks excluded) from `timetable`.
  const weeklyCounts = DAYS.map((day) => timetable.filter((t) => t.day === day && !t.isBreak).length);
  const totalPeriodsThisWeek = weeklyCounts.reduce((a, b) => a + b, 0);
  const totalSubjectsThisWeek = new Set(timetable.filter((t) => !t.isBreak).map((t) => t.subject)).size;

  return (
    <StudentPageShell>
      <StudentPageHeader
        title="My Timetable"
        description="Grade 8-A weekly class schedule"
      />

      <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-elevated">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => setView("today")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12.5px] font-medium transition-all active:scale-95",
                  view === "today" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" /> Today
              </button>
              <button
                type="button"
                onClick={() => setView("week")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12.5px] font-medium transition-all active:scale-95",
                  view === "week" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Week
              </button>
            </div>
            <span className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-card px-3 py-1.5 text-[12.5px] font-medium text-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" /> {weekRangeLabel}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <StudentSecondaryButton className="w-auto px-3.5" onClick={() => toast.success("Downloading timetable…")}>
              <Download className="h-3.5 w-3.5" /> Download
            </StudentSecondaryButton>
            <StudentSecondaryButton className="w-auto px-3.5" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> Print
            </StudentSecondaryButton>
            <StudentPrimaryButton className="w-auto px-3.5" onClick={() => navigate("/student/messages")}>
              <MessageSquare className="h-3.5 w-3.5" /> Message Teacher
            </StudentPrimaryButton>
          </div>
        </div>
      </div>

      <div className={cn("grid grid-cols-1 gap-4 xl:items-start", view === "today" && "xl:grid-cols-[minmax(0,1fr)_420px]")}>
        <div className="min-w-0 space-y-4">
          {view === "today" ? (
            <>
              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
                <StudentSectionHeader icon={CalendarDays} title={`Today's Classes · ${todayLabel}`} />
                <div className="mt-1">
                  {rows.map((r, i) => (
                    <TimetablePeriodRow key={r.id} data={r} isLast={i === rows.length - 1} />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
                <StudentSectionHeader
                  title="Weekly Overview"
                  action={
                    <button type="button" onClick={() => setView("week")} className="flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
                      View full week <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  }
                />
                <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {DAYS.map((day, i) => (
                      <WeeklyDayCard
                        key={day}
                        day={day}
                        date={weekDates[i].getDate()}
                        count={weeklyCounts[i]}
                        active={day === TODAY_DAY}
                        onClick={() => setView("week")}
                      />
                    ))}
                  </div>
                  <div className="flex gap-4 border-t border-border/60 pt-3 lg:border-t-0 lg:border-l lg:pl-4 lg:pt-0">
                    <div className="min-w-[132px]">
                      <p className="font-display text-xl font-bold text-foreground">{totalPeriodsThisWeek}</p>
                      <p className="text-[11px] text-muted-foreground">Total Periods This Week</p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full w-full rounded-full bg-blue-500" /></div>
                    </div>
                    <div className="min-w-[132px]">
                      <p className="font-display text-xl font-bold text-foreground">{totalSubjectsThisWeek}</p>
                      <p className="text-[11px] text-muted-foreground">Total Subjects This Week</p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className="h-full w-full rounded-full bg-emerald-500" /></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
              <StudentSectionHeader icon={LayoutGrid} title="Weekly Timetable" />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-separate border-spacing-1.5">
                  <thead>
                    <tr>
                      <th className="w-16 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Period</th>
                      {DAYS.map((d) => (
                        <th key={d} className={cn("text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground", d === TODAY_DAY && "text-primary")}>
                          {d}{d === TODAY_DAY && " · Today"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map((period) => (
                      <tr key={period}>
                        <td className="text-[11px] text-muted-foreground">{timetable.find((t) => t.period === period)?.time}</td>
                        {DAYS.map((day) => {
                          const cell = timetable.find((t) => t.day === day && t.period === period);
                          if (!cell) return <td key={day} />;
                          const style = subjectStyle(cell.subject, cell.isBreak);
                          return (
                            <td key={day}>
                              <div className={cn(
                                "flex items-center gap-2 rounded-xl border border-border/60 p-2 transition-colors hover:border-primary/30",
                                day === TODAY_DAY && "border-primary/40 bg-primary/5",
                                cell.isBreak && "bg-muted/40",
                              )}>
                                <IconTile icon={style.icon} tone={style.tone} size="sm" />
                                <div className="min-w-0">
                                  <p className="truncate text-[12px] font-medium text-foreground">{cell.subject}</p>
                                  {!cell.isBreak && <p className="truncate text-[10.5px] text-muted-foreground">{cell.teacher} · {cell.room}</p>}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {view === "today" && (
        <div className="space-y-4">
          <StudentProfileMiniCard
            name={studentProfile.name}
            className={studentProfile.className}
            section={studentProfile.section}
            roll={studentProfile.roll}
            admissionNo={studentProfile.admissionNo}
            status={studentProfile.status}
          />

          {current && (
            <RightInfoCard
              accentCls="border-l-primary"
              title="Current Class"
              badge={<StudentStatusPill label="Ongoing" tone="info" />}
            >
              <div className="flex items-center gap-3">
                <IconTile icon={BookOpen} tone="blue" size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-foreground">{current.subject}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{current.teacher} · {current.room}</p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {current.time} · 45 min left
              </p>
              <button
                type="button"
                onClick={() => navigate("/student/materials")}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-primary transition-colors hover:bg-primary/15 active:scale-[0.98]"
              >
                <BookOpen className="h-3.5 w-3.5" /> Open Materials <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </RightInfoCard>
          )}

          {next && (
            <RightInfoCard
              accentCls="border-l-amber-500"
              title="Next Class"
              badge={<StudentStatusPill label="Upcoming" tone="warning" />}
            >
              <div className="flex items-center gap-3">
                <IconTile icon={subjectStyle(next.subject).icon} tone={subjectStyle(next.subject).tone} size="lg" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-foreground">{next.subject}</p>
                  <p className="truncate text-[12px] text-muted-foreground">{next.teacher} · {next.room}</p>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> {next.time} · In 45 min
              </p>
            </RightInfoCard>
          )}

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
            <StudentSectionHeader title="Today's Summary" />
            <div className="grid grid-cols-4 gap-2">
              <SummaryMiniCard icon={BookOpen} tone="blue" value={totalPeriods} label="Total Periods" />
              <SummaryMiniCard icon={CheckCircle2} tone="emerald" value={completedCount} label="Completed" />
              <SummaryMiniCard icon={Clock} tone="amber" value={upcomingCount} label="Upcoming" />
              <SummaryMiniCard icon={Coffee} tone="violet" value={breaksCount} label="Breaks" />
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-elevated sm:p-5">
            <StudentSectionHeader title="Quick Links" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Homework", icon: BookOpen, tone: "blue" as IconTileTone, to: "/student/assignments" },
                { label: "Attendance", icon: CalendarDays, tone: "emerald" as IconTileTone, to: "/student/attendance" },
                { label: "Results", icon: Award, tone: "amber" as IconTileTone, to: "/student/results" },
                { label: "Ask for Help", icon: MessageSquare, tone: "rose" as IconTileTone, to: "/student/help" },
              ].map((l) => (
                <button
                  key={l.label}
                  type="button"
                  onClick={() => navigate(l.to)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card p-3 text-center transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-elevated active:scale-95"
                >
                  <IconTile icon={l.icon} tone={l.tone} size="sm" />
                  <span className="text-[11.5px] font-medium text-foreground">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </StudentPageShell>
  );
}
