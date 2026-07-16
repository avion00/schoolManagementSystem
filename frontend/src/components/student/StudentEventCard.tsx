import { CalendarDays, MapPin } from "lucide-react";

import { PremiumBadge, type PremiumBadgeTone } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Button } from "@/components/ui/button";
import type { SchoolEvent } from "@/data/studentDashboardData";

const STATUS_TONE: Record<SchoolEvent["registrationStatus"], PremiumBadgeTone> = {
  "Not Registered": "neutral", Registered: "success", Closed: "danger",
};

export function StudentEventCard({ event, onRegister }: { event: SchoolEvent; onRegister: () => void }) {
  return (
    <PremiumCard className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="text-[13.5px] font-semibold text-foreground">{event.title}</p>
            <PremiumBadge label={event.category} tone="info" />
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11.5px] text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> {event.date}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[11.5px] text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {event.location}</p>
        </div>
        <PremiumBadge label={event.registrationStatus} tone={STATUS_TONE[event.registrationStatus]} />
      </div>
      <div className="mt-3 flex gap-2 border-t border-border/60 pt-3">
        {event.registrationStatus === "Not Registered" && (
          <Button size="sm" className="h-8 text-[12px]" onClick={onRegister}>Register interest</Button>
        )}
        <Button size="sm" variant="outline" className="h-8 text-[12px]">Add to calendar</Button>
      </div>
    </PremiumCard>
  );
}
