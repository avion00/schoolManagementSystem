import {
  Bell, CheckCircle2, ClipboardList, FolderOpen, ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { todayTasks, type TodayTask } from "@/data/studentDashboardData";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<TodayTask["type"], LucideIcon> = {
  homework: ClipboardList, assignment: ClipboardList, exam: ScrollText, material: FolderOpen, notice: Bell,
};
const TYPE_ROUTE: Record<TodayTask["type"], string> = {
  homework: "/student/assignments", assignment: "/student/assignments", exam: "/student/exams",
  material: "/student/materials", notice: "/student/notices",
};
const TYPE_TONE: Record<TodayTask["type"], string> = {
  homework: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  assignment: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  exam: "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  material: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  notice: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function StudentTodayTasks() {
  const navigate = useNavigate();

  if (todayTasks.length === 0) {
    return <PremiumEmptyState icon={CheckCircle2} title="Nothing due today" description="You're all caught up." />;
  }

  return (
    <div className="space-y-2">
      {todayTasks.map((task) => {
        const Icon = TYPE_ICON[task.type];
        return (
          <PremiumCard
            key={task.id}
            hoverable
            className="flex cursor-pointer items-center gap-3 p-3"
            onClick={() => navigate(TYPE_ROUTE[task.type])}
          >
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", TYPE_TONE[task.type])}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">{task.title}</p>
              <p className="truncate text-[11.5px] text-muted-foreground">{task.subject ? `${task.subject} · ` : ""}{task.dueLabel}</p>
            </div>
          </PremiumCard>
        );
      })}
    </div>
  );
}
