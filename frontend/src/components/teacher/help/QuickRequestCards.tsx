import {
  Award, CalendarClock, CalendarCheck, ClipboardList, FolderUp, Laptop,
  Lock, MessageCircleWarning, ShieldCheck, UserCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { quickRequestTypes, type QuickRequestType } from "@/data/teacherHelpData";

const ICONS: Record<QuickRequestType["iconKey"], LucideIcon> = {
  lock: Lock,
  "calendar-check": CalendarCheck,
  "user-cog": UserCog,
  "calendar-clock": CalendarClock,
  award: Award,
  "clipboard-list": ClipboardList,
  "folder-up": FolderUp,
  "message-warning": MessageCircleWarning,
  laptop: Laptop,
  "shield-check": ShieldCheck,
};

export function QuickRequestCards({ onCreate }: { onCreate: (type: QuickRequestType) => void }) {
  return (
    <Reveal delay={80}>
      <h2 className="mb-3 text-[14px] font-semibold text-foreground">Common requests</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {quickRequestTypes.map((type, i) => {
          const Icon = ICONS[type.iconKey];
          return (
            <PremiumCard key={type.id} hoverable className="t-row-in flex flex-col gap-3 p-4" style={{ "--row-index": i } as React.CSSProperties}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground">{type.label}</p>
                <p className="mt-0.5 text-[11.5px] text-muted-foreground">{type.description}</p>
              </div>
              <Button size="sm" variant="outline" className="h-8 w-full text-[12px]" onClick={() => onCreate(type)}>
                Create request
              </Button>
            </PremiumCard>
          );
        })}
      </div>
    </Reveal>
  );
}
