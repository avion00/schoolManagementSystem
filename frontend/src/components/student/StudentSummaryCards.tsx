import {
  Award, CalendarCheck, ClipboardList, FolderOpen, ScrollText, Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PopNumber, Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import {
  computeAttendanceSummary, exams, feeSummary, homeworkAssignments, learningMaterials, results,
} from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  neutral: "bg-muted text-foreground",
} as const;

interface StatDef {
  label: string; value: string; icon: LucideIcon; tone: keyof typeof TONE_STYLES; to: string;
}

export function StudentSummaryCards() {
  const navigate = useNavigate();
  const attendance = computeAttendanceSummary();
  const pendingHomework = homeworkAssignments.filter((h) => h.status === "To Do" || h.status === "Missing").length;
  const upcomingExams = exams.filter((e) => e.status === "Upcoming").length;
  const latestResult = results[0];

  const items: StatDef[] = [
    { label: "Attendance", value: `${attendance.presentPct}%`, icon: CalendarCheck, tone: "green", to: "/student/attendance" },
    { label: "Pending Homework", value: String(pendingHomework), icon: ClipboardList, tone: "amber", to: "/student/assignments" },
    { label: "Upcoming Exams", value: String(upcomingExams), icon: ScrollText, tone: "purple", to: "/student/exams" },
    { label: "Latest Result", value: `${latestResult.percentage}%`, icon: Award, tone: "blue", to: "/student/results" },
    { label: "Materials", value: String(learningMaterials.length), icon: FolderOpen, tone: "neutral", to: "/student/materials" },
    { label: "Fee Status", value: feeSummary.status, icon: Wallet, tone: feeSummary.status === "Paid" ? "green" : "rose", to: "/student/fees" },
  ];

  return (
    <Reveal delay={40} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((stat) => {
        const Icon = stat.icon;
        return (
          <PremiumCard key={stat.label} hoverable className="cursor-pointer p-4" onClick={() => navigate(stat.to)}>
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", TONE_STYLES[stat.tone])}>
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-2.5 text-xl font-semibold tabular-nums text-foreground">
              <PopNumber value={stat.value} />
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium text-muted-foreground">{stat.label}</p>
          </PremiumCard>
        );
      })}
    </Reveal>
  );
}
