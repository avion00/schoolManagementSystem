import { PlayCircle } from "lucide-react";

import { Reveal } from "@/components/motion";
import { TeacherActionBar } from "@/components/teacher/TeacherActionBar";
import { TeacherSmartAlerts } from "@/components/teacher/TeacherSmartAlerts";
import { TeacherSmartSuggestions } from "@/components/teacher/TeacherSmartSuggestions";
import { TodayTaskCard } from "@/components/teacher/TodayTaskCard";
import {
  homeworkList,
  teacherMessages,
  teacherProfile,
  todayTimetable,
  teacherSummary,
} from "@/data/teacherDashboardData";
import { useAuth } from "@/lib/auth";

const TODAY = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

export function TeacherToday() {
  const { user } = useAuth();
  const firstName = (user?.full_name || teacherProfile.name).split(" ")[0];
  const current = todayTimetable.find((t) => t.status === "Ongoing");
  const next = todayTimetable.find((t) => t.status === "Upcoming");
  const unreadMessages = teacherMessages.filter((m) => m.unread).length;
  const homeworkPendingReview = homeworkList.filter((h) => h.submissionsReceived > 0 && h.submissionsReceived < h.totalStudents).length;

  return (
    <div className="space-y-4">
      {/* A. Today header */}
      <Reveal>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Good morning, {firstName}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{TODAY}</p>
          {(current || next) && (
            <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-primary">
              <PlayCircle className="h-3.5 w-3.5" />
              {current ? `Now: ${current.subject} — ${current.className}-${current.section} (${current.time})` : `Next: ${next!.subject} — ${next!.className}-${next!.section} (${next!.time})`}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-muted-foreground">
            <span>{teacherSummary.todaysClasses} classes today</span>
            <span>{teacherSummary.pendingAttendance} attendance pending</span>
            <span>{homeworkPendingReview} homework pending review</span>
            <span>{unreadMessages} parent messages unread</span>
          </div>
        </div>
      </Reveal>

      {/* B. One-click quick actions */}
      <Reveal delay={40}>
        <TeacherActionBar />
      </Reveal>

      {/* C. Today timeline */}
      <Reveal delay={80}>
        <p className="mb-2 text-[13.5px] font-semibold text-foreground">Today's Timeline</p>
        <div className="space-y-2.5">
          {todayTimetable.map((entry, i) => <TodayTaskCard key={entry.id} entry={entry} index={i} />)}
        </div>
      </Reveal>

      {/* D. Urgent teacher tasks */}
      <Reveal delay={120}>
        <TeacherSmartAlerts />
      </Reveal>

      {/* E. Smart suggestions */}
      <Reveal delay={160}>
        <TeacherSmartSuggestions />
      </Reveal>
    </div>
  );
}
