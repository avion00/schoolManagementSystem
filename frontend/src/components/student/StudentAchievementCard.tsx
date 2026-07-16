import { Award, Medal, Trophy, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PremiumCard } from "@/components/ui/PremiumCard";
import type { Achievement, AchievementCategory } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const ICON: Record<AchievementCategory, LucideIcon> = {
  Academic: Award, Attendance: Medal, Activity: Users, Sports: Trophy,
};
const TONE: Record<AchievementCategory, string> = {
  Academic: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  Attendance: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  Activity: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  Sports: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
};

export function StudentAchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = ICON[achievement.category];
  return (
    <PremiumCard className="flex items-center gap-3 p-4">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", TONE[achievement.category])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-foreground">{achievement.title}</p>
        <p className="text-[11.5px] text-muted-foreground">{achievement.category} · {achievement.date}</p>
      </div>
    </PremiumCard>
  );
}
