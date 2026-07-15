import { useNavigate } from "react-router-dom";

import { Reveal } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { studentProfile } from "@/data/studentDashboardData";

export function StudentAccount() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Reveal>
        <h1 className="text-lg font-semibold tracking-tight text-foreground">My Account</h1>
        <p className="mt-0.5 text-[13px] text-muted-foreground">Your account summary and quick links.</p>
      </Reveal>

      <Reveal delay={40}>
        <PremiumCard className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
              {studentProfile.name.split(" ").map((n) => n[0]).join("")}
            </span>
            <div>
              <p className="text-[14.5px] font-semibold text-foreground">{studentProfile.name}</p>
              <p className="text-[12.5px] text-muted-foreground">{studentProfile.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/student/profile")}>View full profile</Button>
        </PremiumCard>
      </Reveal>

      <Reveal delay={80} className="grid gap-4 sm:grid-cols-2">
        <PremiumCard className="p-5">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Password & security</p>
          <p className="mb-3 text-[12.5px] text-muted-foreground">Manage your password and active sessions.</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Change password</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/student/settings")}>View sessions</Button>
          </div>
        </PremiumCard>

        <PremiumCard className="p-5">
          <p className="mb-3 text-[13px] font-semibold text-foreground">Preferences</p>
          <p className="mb-3 text-[12.5px] text-muted-foreground">Notifications, theme, and language.</p>
          <Button variant="outline" size="sm" onClick={() => navigate("/student/settings")}>Open Settings</Button>
        </PremiumCard>
      </Reveal>
    </div>
  );
}
