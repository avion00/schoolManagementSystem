import { Home } from "lucide-react";

import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { PremiumEmptyState } from "@/components/ui/PremiumEmptyState";
import { hostelInfo } from "@/data/studentDashboardData";

export function StudentHostel() {
  if (!hostelInfo.enrolled) {
    return (
      <div className="space-y-4">
        <Reveal>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">Hostel</h1>
        </Reveal>
        <Reveal delay={40}>
          <PremiumEmptyState
            icon={Home}
            title="Not enrolled in hostel"
            description="You're registered as a Day Scholar. Contact the admin office if you'd like to apply for hostel accommodation."
          />
        </Reveal>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Hostel</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Room {hostelInfo.room} · Warden: {hostelInfo.warden}</p>
      </Reveal>
      <Reveal delay={40}>
        <PremiumCard className="p-5">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Roommates</p>
          <p className="text-[12.5px] text-foreground">{hostelInfo.roommates.join(", ") || "—"}</p>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
