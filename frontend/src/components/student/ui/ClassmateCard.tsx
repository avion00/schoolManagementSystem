import { BookOpen, MessageSquare, UserRound, UsersRound } from "lucide-react";

import { Reveal } from "@/components/motion";
import { TooltipMotion } from "@/components/motion/TooltipMotion";
import { StudentStatusPill, type StudentPillTone } from "@/components/student/ui/StudentStatusPill";
import { cn } from "@/lib/utils";

export interface ClassmateCardData {
  id: number;
  name: string;
  roll: string;
  house: string;
  initials: string;
  subjects: string;
  club: string;
  isCurrentUser: boolean;
}

const HOUSE_STYLE: Record<string, { badge: StudentPillTone; avatarCls: string }> = {
  "Blue House": { badge: "info", avatarCls: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" },
  "Red House": { badge: "danger", avatarCls: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" },
  "Green House": { badge: "success", avatarCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  "Yellow House": { badge: "warning", avatarCls: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" },
};
const DEFAULT_STYLE = { badge: "neutral" as StudentPillTone, avatarCls: "bg-muted text-muted-foreground" };

function ActionIcon({ label, onClick, icon: Icon }: { label: string; onClick: () => void; icon: typeof UserRound }) {
  return (
    <TooltipMotion label={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="flex w-full items-center justify-center rounded-xl bg-muted/50 py-2 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
      >
        <Icon className="h-4 w-4" />
      </button>
    </TooltipMotion>
  );
}

export function ClassmateCard({
  data,
  delay = 0,
  variant = "grid",
  onViewProfile,
  onMessage,
  onStudyGroup,
}: {
  data: ClassmateCardData;
  delay?: number;
  variant?: "grid" | "list";
  onViewProfile: () => void;
  onMessage: () => void;
  onStudyGroup: () => void;
}) {
  const house = HOUSE_STYLE[data.house] ?? DEFAULT_STYLE;

  const avatar = (
    <div className="relative shrink-0">
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-full text-[14px] font-bold", house.avatarCls)}>
        {data.initials}
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" aria-hidden="true" title="Online" />
    </div>
  );

  if (variant === "list") {
    return (
      <Reveal delay={delay}>
        <div
          className={cn(
            "t-lift flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-3.5 shadow-elevated transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
            data.isCurrentUser ? "border-primary/50 bg-primary/[0.03]" : "border-border/60",
          )}
        >
          {avatar}
          <div className="min-w-[140px] flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-[14px] font-semibold text-foreground">{data.name}</p>
              {data.isCurrentUser && <StudentStatusPill label="You" tone="purple" />}
            </div>
            <p className="text-[11.5px] text-muted-foreground">Roll {data.roll}</p>
          </div>
          <StudentStatusPill label={data.house} tone={house.badge} className="shrink-0" />
          <p className="hidden min-w-[140px] flex-1 truncate text-[11.5px] text-muted-foreground sm:block">{data.subjects}</p>
          <p className="hidden min-w-[110px] flex-1 truncate text-[11.5px] text-muted-foreground md:block">{data.club}</p>
          <div className="flex shrink-0 gap-1.5">
            <ActionIcon label="View profile" icon={UserRound} onClick={onViewProfile} />
            <ActionIcon label="Message" icon={MessageSquare} onClick={onMessage} />
            <ActionIcon label="Study group" icon={UsersRound} onClick={onStudyGroup} />
          </div>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal delay={delay}>
      <div
        className={cn(
          "t-lift relative rounded-[20px] border bg-card p-4 shadow-elevated transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md",
          data.isCurrentUser ? "border-primary/50 bg-primary/[0.03]" : "border-border/60",
        )}
      >
        {data.isCurrentUser && (
          <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">You</span>
        )}
        <div className="flex items-center gap-3">
          {avatar}
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-foreground">{data.name}</p>
            <p className="text-[11.5px] text-muted-foreground">Roll {data.roll}</p>
          </div>
        </div>
        <StudentStatusPill label={data.house} tone={house.badge} className="mt-2.5" />
        <div className="mt-3 space-y-1 border-t border-border/60 pt-2.5 text-[11.5px] text-muted-foreground">
          <p className="flex items-center gap-1.5 truncate"><BookOpen className="h-3.5 w-3.5 shrink-0" /> {data.subjects}</p>
          <p className="flex items-center gap-1.5 truncate"><UsersRound className="h-3.5 w-3.5 shrink-0" /> {data.club}</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          <ActionIcon label="View profile" icon={UserRound} onClick={onViewProfile} />
          <ActionIcon label="Message" icon={MessageSquare} onClick={onMessage} />
          <ActionIcon label="Study group" icon={UsersRound} onClick={onStudyGroup} />
        </div>
      </div>
    </Reveal>
  );
}
