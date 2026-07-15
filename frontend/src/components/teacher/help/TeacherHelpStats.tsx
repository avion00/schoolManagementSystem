import {
  CheckCircle2, ClipboardList, Hourglass, ListTodo, MessageCircleQuestion, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PopNumber, Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import type { TeacherHelpStats as TeacherHelpStatsType } from "@/data/teacherHelpData";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  blue:   "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  amber:  "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300",
  green:  "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  rose:   "bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300",
  neutral:"bg-muted text-foreground",
} as const;

interface StatDef {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: keyof typeof TONE_STYLES;
}

export function TeacherHelpStats({ stats }: { stats: TeacherHelpStatsType }) {
  const items: StatDef[] = [
    { label: "My Open Requests",     value: stats.myOpenRequests,      icon: ListTodo,               tone: "blue" },
    { label: "Assigned to Me",        value: stats.assignedToMe,        icon: ClipboardList,          tone: "purple" },
    { label: "Waiting Reply",         value: stats.waitingReply,        icon: Hourglass,              tone: "amber" },
    { label: "Resolved This Month",   value: stats.resolvedThisMonth,   icon: CheckCircle2,           tone: "green" },
    { label: "Student Support Cases", value: stats.studentSupportCases, icon: Users,                  tone: "rose" },
    { label: "Parent Concerns",       value: stats.parentConcerns,      icon: MessageCircleQuestion,  tone: "neutral" },
  ];

  return (
    <Reveal delay={40} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((stat) => {
        const Icon = stat.icon;
        return (
          <PremiumCard key={stat.label} className="p-4">
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
