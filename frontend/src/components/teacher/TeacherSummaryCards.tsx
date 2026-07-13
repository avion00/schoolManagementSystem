import {
  AlertTriangle,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  Layers,
  Mail,
  PenLine,
  School,
  type LucideIcon,
} from "lucide-react";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { teacherSummary, weakStudents } from "@/data/teacherDashboardData";
import { cn } from "@/lib/utils";

interface Tile {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  cls: string;
}

const TILES: Tile[] = [
  { id: "classes",     label: "My Classes",           value: teacherSummary.myClasses,       icon: Layers,         cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { id: "students",    label: "My Students",          value: teacherSummary.myStudents,      icon: GraduationCap,  cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { id: "today",       label: "Today's Classes",      value: teacherSummary.todaysClasses,   icon: School,         cls: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { id: "pending-att", label: "Attendance Pending",   value: teacherSummary.pendingAttendance, icon: CalendarCheck, cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  { id: "homework",    label: "Homework Pending",     value: teacherSummary.assignmentsDue,  icon: ClipboardList,  cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  { id: "marks",       label: "Marks Pending",        value: teacherSummary.marksPending,    icon: PenLine,        cls: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  { id: "messages",    label: "Unread Messages",      value: teacherSummary.unreadMessages,  icon: Mail,           cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  { id: "attention",   label: "Students Needing Attention", value: weakStudents.length,       icon: AlertTriangle,  cls: "bg-pink-500/10 text-pink-600 dark:text-pink-400" },
];

export function TeacherSummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
      {TILES.map((tile, i) => {
        const Icon = tile.icon;
        return (
          <PremiumCard
            key={tile.id}
            hoverable
            className="t-row-in flex flex-col gap-2.5 p-4"
            style={{ "--row-index": i } as React.CSSProperties}
          >
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tile.cls)}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xl font-bold tabular-nums text-foreground">
                <AnimatedNumber value={tile.value} />
              </p>
              <p className="mt-0.5 text-[11.5px] font-medium leading-tight text-muted-foreground">{tile.label}</p>
            </div>
          </PremiumCard>
        );
      })}
    </div>
  );
}
