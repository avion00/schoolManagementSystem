import { Bus, Clock, MapPin, Phone } from "lucide-react";

import { Reveal } from "@/components/motion";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { transportInfo } from "@/data/studentDashboardData";

export function StudentTransport() {
  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Transport</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{transportInfo.route}</p>
      </Reveal>

      <Reveal delay={40} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <PremiumCard className="p-4">
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Pickup point</p>
          <p className="mt-1 text-[14px] font-semibold text-foreground">{transportInfo.pickupPoint}</p>
          <p className="text-[11.5px] text-muted-foreground">{transportInfo.pickupTime}</p>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> Drop point</p>
          <p className="mt-1 text-[14px] font-semibold text-foreground">{transportInfo.dropPoint}</p>
          <p className="text-[11.5px] text-muted-foreground">{transportInfo.dropTime}</p>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><Bus className="h-3.5 w-3.5" /> Driver</p>
          <p className="mt-1 text-[14px] font-semibold text-foreground">{transportInfo.driverName}</p>
          <p className="flex items-center gap-1 text-[11.5px] text-muted-foreground"><Phone className="h-3 w-3" /> {transportInfo.driverPhoneMasked}</p>
        </PremiumCard>
        <PremiumCard className="p-4">
          <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Timing</p>
          <p className="mt-1 text-[13px] text-foreground">{transportInfo.pickupTime} – {transportInfo.dropTime}</p>
        </PremiumCard>
      </Reveal>

      {transportInfo.notices.length > 0 && (
        <Reveal delay={80}>
          <PremiumCard className="p-4">
            <p className="mb-2 text-[13px] font-semibold text-foreground">Transport notices</p>
            <ul className="list-disc space-y-1 pl-5 text-[12.5px] text-foreground">
              {transportInfo.notices.map((n) => <li key={n}>{n}</li>)}
            </ul>
          </PremiumCard>
        </Reveal>
      )}
    </div>
  );
}
