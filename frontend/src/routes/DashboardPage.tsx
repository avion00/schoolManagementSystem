import { BookOpen } from "lucide-react";

import { EventCalendarCard } from "@/components/dashboard/EventCalendarCard";
import { FeeCollectionCard } from "@/components/dashboard/FeeCollectionCard";
import { NoticeBoardCard } from "@/components/dashboard/NoticeBoardCard";
import { QuickActionsCard } from "@/components/dashboard/QuickActionsCard";
import { RecentActivitiesCard } from "@/components/dashboard/RecentActivitiesCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Reveal } from "@/components/motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stats, summaryCards, upcomingExams } from "@/data/dashboardData";
import { useAuth } from "@/lib/auth";
import { AccountantDashboardPage } from "@/routes/AccountantDashboardPage";
import { TeacherDashboardPage } from "@/routes/TeacherDashboardPage";

export function DashboardPage() {
  const { user } = useAuth();
  const roles = user?.roles ?? [];

  // Route to role-specific dashboard — only superusers/platform admins/Principals
  // see the full admin view.
  if (roles.includes("Teacher")) return <TeacherDashboardPage />;
  if (roles.includes("Accountant")) return <AccountantDashboardPage />;

  // Principal / superuser / platform admin → full admin dashboard below
  return (
    <div className="space-y-4">
      {/* Row 1 – KPI stat cards */}
      <Reveal delay={60} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </Reveal>

      {/* Row 2 – Fee chart (left 7/12) + 2×2 summary cards (right 5/12) */}
      <Reveal delay={120} className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <FeeCollectionCard />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:col-span-5">
          {summaryCards.map((item) => (
            <SummaryCard key={item.id} item={item} />
          ))}
        </div>
      </Reveal>

      {/* Row 3 – Event calendar + Notice board */}
      <Reveal delay={180} className="grid gap-4 lg:grid-cols-2">
        <EventCalendarCard />
        <NoticeBoardCard />
      </Reveal>

      {/* Row 4 – Recent activities + Quick actions + Upcoming exams */}
      <Reveal delay={240} className="grid gap-4 lg:grid-cols-3">
        <RecentActivitiesCard />
        <QuickActionsCard />

        {/* Upcoming exams — inline card, no separate component needed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center gap-3 rounded-lg border border-border/50 p-2.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{exam.subject}</p>
                  <p className="text-xs text-muted-foreground">{exam.grade}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-foreground">{exam.date}</p>
                  <p className="text-[11px] text-muted-foreground">{exam.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
