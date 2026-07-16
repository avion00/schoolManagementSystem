import { useState } from "react";
import { toast } from "sonner";

import { Reveal } from "@/components/motion";
import { PremiumBadge } from "@/components/ui/PremiumBadge";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Button } from "@/components/ui/button";
import { clubs as initialClubs, toggleClubMembership } from "@/data/studentDashboardData";

export function StudentActivities() {
  const [clubs, setClubs] = useState(initialClubs);

  function toggle(id: string, name: string, joined: boolean) {
    toggleClubMembership(id);
    setClubs([...initialClubs]);
    toast.success(joined ? `Left ${name}.` : `Joined ${name}!`);
  }

  const joinedCount = clubs.filter((c) => c.joined).length;

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">Clubs & Activities</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">You're part of {joinedCount} club{joinedCount === 1 ? "" : "s"}.</p>
      </Reveal>

      <Reveal delay={60} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((c) => (
          <PremiumCard key={c.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-semibold text-foreground">{c.name}</p>
              {c.joined && <PremiumBadge label="Joined" tone="success" />}
            </div>
            <p className="text-[11.5px] text-muted-foreground">{c.teacherInCharge} · {c.schedule}</p>
            <p className="text-[11.5px] text-muted-foreground">{c.membersCount} members</p>
            <Button
              size="sm"
              variant={c.joined ? "outline" : "default"}
              className="mt-auto h-8 text-[12px]"
              onClick={() => toggle(c.id, c.name, c.joined)}
            >
              {c.joined ? "Leave club" : "Join / Request"}
            </Button>
          </PremiumCard>
        ))}
      </Reveal>
    </div>
  );
}
