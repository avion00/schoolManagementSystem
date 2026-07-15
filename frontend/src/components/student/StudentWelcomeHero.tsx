import {
  ClipboardList, LifeBuoy, MessageCircle, PlayCircle, ScrollText, Timer, Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Reveal } from "@/components/motion";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { studentProfile, todaySchedule } from "@/data/studentDashboardData";

interface QuickAction { label: string; icon: LucideIcon; to: string; }
const QUICK_ACTIONS: QuickAction[] = [
  { label: "View Homework", icon: ClipboardList, to: "/student/assignments" },
  { label: "Submit Assignment", icon: Video, to: "/student/assignments" },
  { label: "View Timetable", icon: Timer, to: "/student/timetable" },
  { label: "Check Result", icon: ScrollText, to: "/student/results" },
  { label: "Message Teacher", icon: MessageCircle, to: "/student/messages" },
  { label: "Ask for Help", icon: LifeBuoy, to: "/student/help" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function StudentWelcomeHero() {
  const navigate = useNavigate();
  const firstName = studentProfile.name.split(" ")[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const current = todaySchedule.find((p) => p.status === "Ongoing" && !p.isBreak);
  const next = todaySchedule.find((p) => p.status === "Upcoming" && !p.isBreak);

  return (
    <Reveal>
      <PremiumCard className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{greeting()}, {firstName}</h1>
            <p className="mt-0.5 text-[13px] text-muted-foreground">
              {studentProfile.className} {studentProfile.section} · Roll {studentProfile.roll} · {today}
            </p>
            {(current || next) && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium text-primary">
                <PlayCircle className="h-3.5 w-3.5" />
                {current ? `Now: ${current.subject} (${current.time})` : `Next: ${next!.subject} (${next!.time})`}
              </p>
            )}
          </div>
          <PremiumBadge label={studentProfile.status} tone="success" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => navigate(action.to)}
                className="t-lift flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-3 py-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="text-[12px] font-medium leading-tight text-foreground">{action.label}</span>
              </button>
            );
          })}
        </div>
      </PremiumCard>
    </Reveal>
  );
}
